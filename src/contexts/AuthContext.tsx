/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '@/services/authService'
import type { User, LoginCredentials, RegisterData, UpdateProfileData, ChangePasswordData } from '@/types/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
  changePassword: (data: ChangePasswordData) => Promise<void>
  clearError: () => void
  hasPermission: (permission: keyof User['permissions']) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        console.error('Failed to initialize auth:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setLoading(true)
    setError(null)
    try {
      const user = await authService.login(credentials)
      setUser(user)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setLoading(true)
    setError(null)
    try {
      const user = await authService.register(data)
      setUser(user)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    setError(null)
    try {
      await authService.logout()
      setUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: UpdateProfileData) => {
    if (!user) throw new Error('No user logged in')
    
    setLoading(true)
    setError(null)
    try {
      const updatedUser = await authService.updateProfile(user.id, data)
      setUser(updatedUser)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile update failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('No user logged in')
    
    setLoading(true)
    setError(null)
    try {
      const avatarUrl = await authService.uploadAvatar(user.id, file)
      const updatedUser = authService.getCurrentUser()
      if (updatedUser) {
        setUser(updatedUser)
      }
      return avatarUrl
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Avatar upload failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (data: ChangePasswordData) => {
    if (!user) throw new Error('No user logged in')
    
    setLoading(true)
    setError(null)
    try {
      await authService.changePassword(user.id, data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password change failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const hasPermission = (permission: keyof User['permissions']): boolean => {
    return authService.hasPermission(user, permission)
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    uploadAvatar,
    changePassword,
    clearError,
    hasPermission
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
