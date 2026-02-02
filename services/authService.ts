import { supabase } from '../lib/supabase'
import { DatabaseUser, UserProfile, Role, UserRole } from '../types'

export const AuthService = {
  /**
   * Sign up a new user with email and password
   */
  async signUp(email: string, password: string, userData: Omit<DatabaseUser, 'id' | 'created_at'>) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            cedula: userData.cedula,
            phone_number: userData.phone_number,
            role: userData.role
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile in users table
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            cedula: userData.cedula,
            name: userData.name,
            email: userData.email,
            phone_number: userData.phone_number,
            role: userData.role,
            credit_limit: userData.credit_limit
          }])
          .select()
          .single()

        if (profileError) throw profileError

        return { user: authData.user, profile: profileData }
      }

      throw new Error('User creation failed')
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      throw error
    }
  },

  /**
   * Get complete user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!userId) {
        console.warn('[AuthService] getUserProfile sin userId');
        throw new Error('User ID vacío');
      }
      console.log('[AuthService] getUserProfile userId:', userId);

      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      // Get savings account
      const { data: savingsData, error: savingsError } = await supabase
        .from('savings_accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (savingsError && savingsError.code !== 'PGRST116') throw savingsError

      // Get savings history
      const { data: historyData, error: historyError } = await supabase
        .from('savings_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (historyError) throw historyError

      // Get savings goal
      const { data: goalData, error: goalError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (goalError && goalError.code !== 'PGRST116') throw goalError

      // Get loans
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (loansError) throw loansError

      // Transform data to match UserProfile interface
      const profile: UserProfile = {
        id: userData.id,
        cedula: userData.cedula,
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phone_number,
        createdAt: userData.created_at,
        role: userData.role === 'ADMIN' ? Role.ADMIN : Role.USER,
        creditLimit: userData.credit_limit,
        savings: savingsData ? {
          balance: savingsData.balance,
          monthlyContribution: savingsData.monthly_contribution,
          lastContributionDate: savingsData.last_contribution_date || '',
          interestEarned: savingsData.interest_earned,
          history: historyData.map(h => ({
            id: h.id,
            date: h.date,
            amount: h.amount,
            type: h.type
          }))
        } : {
          balance: 0,
          monthlyContribution: 0,
          lastContributionDate: '',
          interestEarned: 0,
          history: []
        },
        loans: loansData.map(loan => ({
          id: loan.id,
          amount: loan.amount,
          remainingAmount: loan.remaining_amount,
          interestRate: loan.interest_rate,
          termMonths: loan.term_months,
          startDate: loan.start_date,
          nextPaymentDate: loan.next_payment_date,
          monthlyPayment: loan.monthly_payment,
          status: loan.status,
          paymentsMade: loan.payments_made
        })),
        savingsGoal: goalData ? {
          name: goalData.name,
          targetAmount: goalData.target_amount,
          createdAt: goalData.created_at
        } : undefined
      }

      return profile
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  },

  /**
   * Listen to auth changes
   */
  onAuthChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
