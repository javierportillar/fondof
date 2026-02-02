import { supabase } from '../lib/supabase'
import { Loan, DatabaseLoan, LoanStatus } from '../types'

export const LoansService = {
  /**
   * Create a new loan
   */
  async createLoan(userId: string, loanData: Omit<DatabaseLoan, 'id' | 'user_id' | 'created_at' | 'status' | 'payments_made'>) {
    try {
      const { data, error } = await supabase
        .from('loans')
        .insert([{
          user_id: userId,
          amount: loanData.amount,
          remaining_amount: loanData.amount,
          interest_rate: loanData.interest_rate,
          term_months: loanData.term_months,
          start_date: loanData.start_date,
          next_payment_date: loanData.next_payment_date,
          monthly_payment: loanData.monthly_payment,
          status: 'Pendiente' as LoanStatus,
          payments_made: 0
        }])
        .select()
        .single()

      if (error) throw error

      return this.transformDatabaseLoan(data)
    } catch (error) {
      console.error('Error creating loan:', error)
      throw error
    }
  },

  /**
   * Get all loans for a user
   */
  async getUserLoans(userId: string): Promise<Loan[]> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(loan => this.transformDatabaseLoan(loan))
    } catch (error) {
      console.error('Error getting user loans:', error)
      throw error
    }
  },

  /**
   * Get a specific loan by ID
   */
  async getLoan(loanId: string): Promise<Loan | null> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return this.transformDatabaseLoan(data)
    } catch (error) {
      console.error('Error getting loan:', error)
      throw error
    }
  },

  /**
   * Make a loan payment
   */
  async makePayment(loanId: string, paymentAmount: number) {
    try {
      // Get current loan
      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .single()

      if (loanError || !loan) {
        throw new Error('Loan not found')
      }

      if (loan.status === 'Pagado') {
        throw new Error('Loan already paid')
      }

      const newRemainingAmount = loan.remaining_amount - paymentAmount
      const newPaymentsMade = loan.payments_made + 1

      let newStatus = loan.status
      if (newRemainingAmount <= 0) {
        newStatus = 'Pagado' as LoanStatus
      }

      // Calculate next payment date (current date + 1 month)
      const nextPaymentDate = new Date(loan.next_payment_date)
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

      // Update loan
      const { data: updatedLoan, error: updateError } = await supabase
        .from('loans')
        .update({
          remaining_amount: Math.max(0, newRemainingAmount),
          payments_made: newPaymentsMade,
          status: newStatus,
          next_payment_date: nextPaymentDate.toISOString().split('T')[0]
        })
        .eq('id', loanId)
        .select()
        .single()

      if (updateError) throw updateError

      return this.transformDatabaseLoan(updatedLoan)
    } catch (error) {
      console.error('Error making payment:', error)
      throw error
    }
  },

  /**
   * Update loan status
   */
  async updateLoanStatus(loanId: string, status: LoanStatus) {
    try {
      const { data, error } = await supabase
        .from('loans')
        .update({ status })
        .eq('id', loanId)
        .select()
        .single()

      if (error) throw error

      return this.transformDatabaseLoan(data)
    } catch (error) {
      console.error('Error updating loan status:', error)
      throw error
    }
  },

  /**
   * Get all loans (admin only)
   */
  async getAllLoans(): Promise<Loan[]> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(loan => this.transformDatabaseLoan(loan))
    } catch (error) {
      console.error('Error getting all loans:', error)
      throw error
    }
  },

  /**
   * Get loans by status
   */
  async getLoansByStatus(status: LoanStatus): Promise<Loan[]> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(loan => this.transformDatabaseLoan(loan))
    } catch (error) {
      console.error('Error getting loans by status:', error)
      throw error
    }
  },

  /**
   * Calculate loan statistics
   */
  async getLoanStatistics(userId?: string) {
    try {
      let query = supabase.from('loans').select('*')

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error

      const stats = {
        total: data.length,
        active: data.filter(loan => loan.status === 'Activo').length,
        pending: data.filter(loan => loan.status === 'Pendiente').length,
        paid: data.filter(loan => loan.status === 'Pagado').length,
        totalAmount: data.reduce((sum, loan) => sum + loan.amount, 0),
        totalRemaining: data.reduce((sum, loan) => sum + loan.remaining_amount, 0),
        averageInterestRate: data.length > 0 ? data.reduce((sum, loan) => sum + loan.interest_rate, 0) / data.length : 0
      }

      return stats
    } catch (error) {
      console.error('Error getting loan statistics:', error)
      throw error
    }
  },

  /**
   * Transform database loan to frontend loan interface
   */
  transformDatabaseLoan(dbLoan: DatabaseLoan): Loan {
    return {
      id: dbLoan.id,
      amount: dbLoan.amount,
      remainingAmount: dbLoan.remaining_amount,
      interestRate: dbLoan.interest_rate,
      termMonths: dbLoan.term_months,
      startDate: dbLoan.start_date,
      nextPaymentDate: dbLoan.next_payment_date,
      monthlyPayment: dbLoan.monthly_payment,
      status: dbLoan.status,
      paymentsMade: dbLoan.payments_made
    }
  }
}