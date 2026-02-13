import { supabase } from '../lib/supabase'
import { DatabaseUser, UserProfile, Role } from '../types'

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const AuthService = {
  /**
   * Sign up a new user with email and password (sin Supabase Auth)
   */
  async signUp(email: string, password: string, userData: Omit<DatabaseUser, 'id' | 'created_at' | 'password_hash'>) {
    try {
      const password_hash = await hashPassword(password)
      const { data, error } = await supabase
        .from('users')
        .insert([{
          cedula: userData.cedula,
          name: userData.name,
          email: userData.email,
          phone_number: userData.phone_number,
          role: userData.role,
          credit_limit: userData.credit_limit,
          password_hash
        }])
        .select()
        .single()

      if (error) throw error
      return { profile: data }
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  },

  /**
   * Sign in with email and password (sin Supabase Auth)
   */
  async signIn(email: string, password: string) {
    try {
      const password_hash = await hashPassword(password)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password_hash)
        .single()

      if (error) throw error
      if (!data) throw new Error('Usuario o contraseña inválidos')

      return { user: { id: data.id, email: data.email, user_metadata: data } }
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  },

  /**
   * Sign out current user (local)
   */
  async signOut() {
    return
  },

  /**
   * Request password reset: generates token and returns it (email sending not handled here)
   */
  async requestPasswordReset(email: string, cedula?: string) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id,email,cedula')
      .eq('email', email)
      .single()
    if (userError || !user) throw new Error('Correo no encontrado')

    // Paso 1: solo email, pedimos cédula
    if (!cedula) {
      return { requiresCedula: true }
    }

    // Paso 2: validar cédula
    if (user.cedula !== cedula) throw new Error('La cédula no coincide con el correo')

    const token = crypto.randomUUID()
    const expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    const { error: insertError } = await supabase
      .from('password_resets')
      .insert([{ token, user_id: user.id, expires_at }])
    if (insertError) throw insertError

    return { token }
  },

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string) {
    const { data: resetRow, error: resetError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single()
    if (resetError || !resetRow) throw new Error('Token inválido o expirado')

    const password_hash = await hashPassword(newPassword)
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ password_hash })
      .eq('id', resetRow.user_id)
    if (updateUserError) throw updateUserError

    await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('token', token)

    return true
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
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError && userError.code === 'PGRST116') {
        console.warn('[AuthService] Perfil no encontrado, intentando crearlo desde metadata');
        const { data: userSession } = await supabase.auth.getUser();
        const meta = userSession?.user?.user_metadata || {};
        const { error: insertError } = await supabase.from('users').insert([{
          id: userId,
          cedula: meta.cedula || userSession?.user?.email || userId,
          name: meta.name || userSession?.user?.email || 'Usuario',
          email: userSession?.user?.email || '',
          phone_number: meta.phone_number || '',
          role: meta.role || 'USER',
          credit_limit: meta.credit_limit || 0
        }]);
        if (insertError) throw insertError;
        const reselect = await supabase.from('users').select('*').eq('id', userId).single();
        userData = reselect.data;
        userError = reselect.error;
      }

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

      const historyBalance = historyData.reduce((sum, h) => {
        return sum + (h.type === 'WITHDRAWAL' ? -h.amount : h.amount)
      }, 0)

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
          balance: historyData.length > 0 ? historyBalance : savingsData.balance,
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
    // Auth local: no events, return dummy unsubscribe
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
}
