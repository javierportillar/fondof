import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthService } from '../services'
import { UserProfile } from '../types'

interface AuthContextType {
  user: any
  profile: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        const userProfile = await AuthService.getUserProfile(currentUser.id)
        setProfile(userProfile)
      }
      
      setLoading(false)
    }

    getSession()

    // Listen for auth changes (event, session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        const userProfile = await AuthService.getUserProfile(currentUser.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const data = await AuthService.signIn(email, password)
      setUser(data.user)
      
      if (data.user) {
        const userProfile = await AuthService.getUserProfile(data.user.id)
        setProfile(userProfile)
      }
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await AuthService.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const data = await AuthService.signUp(email, password, userData)
      setUser(data.user)
      
      if (data.user) {
        const userProfile = await AuthService.getUserProfile(data.user.id)
        setProfile(userProfile)
      }
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, signUp }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
