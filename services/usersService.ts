import { supabase } from '../lib/supabase'
import { DatabaseUser, UserProfile, Role, DatabaseSavingsGoal } from '../types'

export const UsersService = {
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<DatabaseUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data
    } catch (error) {
      console.error('Error getting user by ID:', error)
      throw error
    }
  },

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data
    } catch (error) {
      console.error('Error getting user by email:', error)
      throw error
    }
  },

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<DatabaseUser[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error getting all users:', error)
      throw error
    }
  },

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: Partial<Omit<DatabaseUser, 'id' | 'created_at'>>): Promise<DatabaseUser> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: 'ADMIN' | 'USER'): Promise<DatabaseUser> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating user role:', error)
      throw error
    }
  },

  /**
   * Update credit limit
   */
  async updateCreditLimit(userId: string, creditLimit: number): Promise<DatabaseUser> {
    try {
      if (creditLimit < 0) {
        throw new Error('Credit limit cannot be negative')
      }

      const { data, error } = await supabase
        .from('users')
        .update({ credit_limit: creditLimit })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating credit limit:', error)
      throw error
    }
  },

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      // Also delete the auth user (requires admin privileges)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      if (authError) throw authError
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },

  /**
   * Get user statistics (admin only)
   */
  async getUserStatistics() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')

      if (error) throw error

      const stats = {
        total: data.length,
        admins: data.filter(user => user.role === 'ADMIN').length,
        regularUsers: data.filter(user => user.role === 'USER').length,
        totalCreditLimit: data.reduce((sum, user) => sum + user.credit_limit, 0),
        averageCreditLimit: data.length > 0 ? data.reduce((sum, user) => sum + user.credit_limit, 0) / data.length : 0
      }

      return stats
    } catch (error) {
      console.error('Error getting user statistics:', error)
      throw error
    }
  },

  /**
   * Search users by name or email
   */
  async searchUsers(query: string): Promise<DatabaseUser[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error searching users:', error)
      throw error
    }
  },

  /**
   * Set savings goal for user
   */
  async setSavingsGoal(userId: string, goalData: Omit<DatabaseSavingsGoal, 'id' | 'user_id' | 'created_at'>): Promise<DatabaseSavingsGoal> {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .upsert({
          user_id: userId,
          name: goalData.name,
          target_amount: goalData.target_amount
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error setting savings goal:', error)
      throw error
    }
  },

  /**
   * Get savings goal for user
   */
  async getSavingsGoal(userId: string): Promise<DatabaseSavingsGoal | null> {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data
    } catch (error) {
      console.error('Error getting savings goal:', error)
      throw error
    }
  },

  /**
   * Delete savings goal
   */
  async deleteSavingsGoal(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting savings goal:', error)
      throw error
    }
  }
}