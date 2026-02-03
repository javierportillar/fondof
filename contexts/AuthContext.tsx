import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from '../services'
import { UserProfile, Role } from '../types'

interface AuthContextType {
  profile: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  requestPasswordReset: (email: string, cedula?: string) => Promise<{ token?: string; requiresCedula?: boolean }>
  resetPassword: (token: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedId = localStorage.getItem('session_user_id')
    if (!storedId) {
      setLoading(false)
      return
    }
    AuthService.getUserProfile(storedId).then(p => {
      setProfile(p)
    }).catch(err => {
      console.error('[AuthContext] Error loading stored session', err)
      setProfile(null)
      localStorage.removeItem('session_user_id')
    }).finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const loginTask = async () => {
      const data = await AuthService.signIn(email, password)
      
      const meta = data.user.user_metadata || {}
      const fallbackProfile = {
        id: data.user.id,
        cedula: meta.cedula || data.user.email || data.user.id,
        name: meta.name || data.user.email || 'Usuario',
        email: data.user.email || '',
        phoneNumber: meta.phone_number || '',
        createdAt: '',
        role: meta.role === 'ADMIN' ? Role.ADMIN : Role.USER,
        creditLimit: meta.credit_limit || 0,
        savings: { balance: 0, monthlyContribution: 0, interestEarned: 0, lastContributionDate: '', history: [] },
        loans: []
      }

      const profile = await Promise.race([
        AuthService.getUserProfile(data.user.id),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000))
      ])

      setProfile(profile ?? fallbackProfile)
      localStorage.setItem('session_user_id', data.user.id)
    }

    // Timeout de seguridad para no dejar la UI colgada
    const timeoutMs = 12000
    await Promise.race([
      loginTask(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera agotado al iniciar sesión')), timeoutMs))
    ])
  }

  const logout = async () => {
    await AuthService.signOut()
    localStorage.removeItem('session_user_id')
    setProfile(null)
  }

  const signUp = async (email: string, password: string, userData: any) => {
    const res = await AuthService.signUp(email, password, userData)
    if (res.profile?.id) {
      setProfile({
        id: res.profile.id,
        cedula: res.profile.cedula,
        name: res.profile.name,
        email: res.profile.email,
        phoneNumber: res.profile.phone_number,
        createdAt: res.profile.created_at,
        role: res.profile.role === 'ADMIN' ? Role.ADMIN : Role.USER,
        creditLimit: res.profile.credit_limit,
        savings: { balance: 0, monthlyContribution: 0, interestEarned: 0, lastContributionDate: '', history: [] },
        loans: []
      })
      localStorage.setItem('session_user_id', res.profile.id)
    }
  }

  return (
    <AuthContext.Provider value={{ profile, loading, login, logout, signUp,
      requestPasswordReset: async (email: string, cedula?: string) => {
        return await AuthService.requestPasswordReset(email, cedula)
      },
      resetPassword: async (token: string, newPassword: string) => {
        await AuthService.resetPassword(token, newPassword)
      }
    }}>
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
