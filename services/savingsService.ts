import { supabase } from '../lib/supabase'
import { UserProfile, SavingsTransactionType } from '../types'

export const SavingsService = {
  /**
   * Add a new contribution to the user's savings
   */
  async addContribution(userId: string, amount: number, date: string) {
    try {
      // Get current savings account
      const { data: savingsAccount, error: savingsError } = await supabase
        .from('savings_accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (savingsError && savingsError.code !== 'PGRST116') throw savingsError

      let newBalance = amount
      let accountId: string

      if (savingsAccount) {
        // Update existing account
        accountId = savingsAccount.id
        newBalance = savingsAccount.balance + amount

        const { error: updateError } = await supabase
          .from('savings_accounts')
          .update({
            balance: newBalance,
            last_contribution_date: date
          })
          .eq('id', accountId)

        if (updateError) throw updateError
      } else {
        // Create new savings account
        const { data: newAccount, error: createError } = await supabase
          .from('savings_accounts')
          .insert([{
            user_id: userId,
            balance: amount,
            monthly_contribution: 0,
            last_contribution_date: date,
            interest_earned: 0
          }])
          .select()
          .single()

        if (createError) throw createError
        accountId = newAccount.id
      }

      // Add transaction to history
      const { error: historyError } = await supabase
        .from('savings_history')
        .insert([{
          user_id: userId,
          date,
          amount,
          type: 'DEPOSIT' as SavingsTransactionType
        }])

      if (historyError) throw historyError

      return { success: true, balance: newBalance }
    } catch (error) {
      console.error('Error adding contribution:', error)
      throw error
    }
  },

  /**
   * Add a withdrawal from the user's savings
   */
  async addWithdrawal(userId: string, amount: number, date: string) {
    try {
      // Get current savings account
      const { data: savingsAccount, error: savingsError } = await supabase
        .from('savings_accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (savingsError || !savingsAccount) {
        throw new Error('Savings account not found')
      }

      const newBalance = savingsAccount.balance - amount

      if (newBalance < 0) {
        throw new Error('Insufficient funds')
      }

      // Update account balance
      const { error: updateError } = await supabase
        .from('savings_accounts')
        .update({
          balance: newBalance
        })
        .eq('id', savingsAccount.id)

      if (updateError) throw updateError

      // Add transaction to history
      const { error: historyError } = await supabase
        .from('savings_history')
        .insert([{
          user_id: userId,
          date,
          amount,
          type: 'WITHDRAWAL' as SavingsTransactionType
        }])

      if (historyError) throw historyError

      return { success: true, balance: newBalance }
    } catch (error) {
      console.error('Error adding withdrawal:', error)
      throw error
    }
  },

  /**
   * Update an existing transaction
   */
  async updateTransaction(transactionId: string, newAmount: number, newDate: string) {
    try {
      // Get current transaction
      const { data: transaction, error: txError } = await supabase
        .from('savings_history')
        .select('*')
        .eq('id', transactionId)
        .single()

      if (txError || !transaction) {
        throw new Error('Transaction not found')
      }

      // Calculate balance difference
      const diff = newAmount - transaction.amount

      // Get user's savings account
      const { data: savingsAccount, error: savingsError } = await supabase
        .from('savings_accounts')
        .select('*')
        .eq('user_id', transaction.user_id)
        .single()

      if (savingsError || !savingsAccount) {
        throw new Error('Savings account not found')
      }

      // Calculate new balance
      let newBalance: number
      if (transaction.type === 'DEPOSIT') {
        newBalance = savingsAccount.balance + diff
      } else if (transaction.type === 'WITHDRAWAL') {
        newBalance = savingsAccount.balance - diff
      } else {
        newBalance = savingsAccount.balance
      }

      // Update transaction
      const { error: updateTxError } = await supabase
        .from('savings_history')
        .update({
          amount: newAmount,
          date: newDate
        })
        .eq('id', transactionId)

      if (updateTxError) throw updateTxError

      // Update savings account balance
      const { error: updateSavingsError } = await supabase
        .from('savings_accounts')
        .update({
          balance: newBalance,
          last_contribution_date: transaction.type === 'DEPOSIT' ? newDate : savingsAccount.last_contribution_date
        })
        .eq('id', savingsAccount.id)

      if (updateSavingsError) throw updateSavingsError

      return { success: true, balance: newBalance }
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
  },

  /**
   * Get savings history for a user
   */
  async getSavingsHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('savings_history')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error getting savings history:', error)
      throw error
    }
  },

  /**
   * Get savings account for a user
   */
  async getSavingsAccount(userId: string) {
    try {
      const { data, error } = await supabase
        .from('savings_accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return data
    } catch (error) {
      console.error('Error getting savings account:', error)
      throw error
    }
  },

  /**
   * Update monthly contribution amount
   */
  async updateMonthlyContribution(userId: string, amount: number) {
    try {
      const { data, error } = await supabase
        .from('savings_accounts')
        .upsert({
          user_id: userId,
          monthly_contribution: amount
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating monthly contribution:', error)
      throw error
    }
  },

  /**
   * Add interest to savings account
   */
  async addInterest(userId: string, amount: number, date: string) {
    try {
      // Get current savings account
      const { data: savingsAccount, error: savingsError } = await supabase
        .from('savings_accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (savingsError || !savingsAccount) {
        throw new Error('Savings account not found')
      }

      const newBalance = savingsAccount.balance + amount
      const newInterestEarned = savingsAccount.interest_earned + amount

      // Update account
      const { error: updateError } = await supabase
        .from('savings_accounts')
        .update({
          balance: newBalance,
          interest_earned: newInterestEarned
        })
        .eq('id', savingsAccount.id)

      if (updateError) throw updateError

      // Add interest transaction
      const { error: historyError } = await supabase
        .from('savings_history')
        .insert([{
          user_id: userId,
          date,
          amount,
          type: 'INTEREST' as SavingsTransactionType
        }])

      if (historyError) throw historyError

      return { success: true, balance: newBalance, interestEarned: newInterestEarned }
    } catch (error) {
      console.error('Error adding interest:', error)
      throw error
    }
  },

  /**
   * Aggregates savings history by month for charting.
   * Returns array: [{ name: 'Ene', amount: 100000 }, ...]
   */
  getMonthlySavingsData: (history: { date: string; amount: number; type: SavingsTransactionType }[]) => {
    const monthMap = new Map<string, number>()

    // Sort history chronologically for processing
    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    sortedHistory.forEach(item => {
      // Only count deposits for "How much did they contribute" analysis
      if (item.type === 'DEPOSIT') {
        // Parse YYYY-MM-DD string directly to avoid timezone issues
        const [year, month] = item.date.split('-') // ["2023", "10", "01"]
        const key = `${year}-${month}` // "2023-10"

        monthMap.set(key, (monthMap.get(key) || 0) + item.amount)
      }
    })

    // Convert to array and take last 6-12 months
    const result = Array.from(monthMap.entries())
      .map(([key, value]) => {
        const [year, month] = key.split('-')
        // Create date for formatting using UTC to match the key
        const dateObj = new Date(Number(year), Number(month) - 1, 1)
        return {
          name: dateObj.toLocaleDateString('es-ES', { month: 'short' }), // "ene", "feb"
          fullName: dateObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          key, // for sorting if needed
          amount: value
        }
      })
      .sort((a, b) => a.key.localeCompare(b.key)) // Chronological order
      .slice(-12) // Last 12 recorded months

    return result
  }
}
