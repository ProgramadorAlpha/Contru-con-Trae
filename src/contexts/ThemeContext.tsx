import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  isDarkMode: boolean
  theme: ThemeMode
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'app-theme-mode'

/**
 * Hook to access theme context
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeMode
}

/**
 * ThemeProvider component that manages theme state and persistence
 * Supports light, dark, and system preference modes
 */
export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  // Get initial theme from localStorage or use default
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        return stored as ThemeMode
      }
    } catch (error) {
      console.error('Error loading theme preference:', error)
    }
    return defaultTheme
  })

  // Determine if dark mode should be active
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme === 'dark'
  })

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    
    if (isDarkMode) {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
  }, [isDarkMode])

  // Listen to system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } 
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [theme])

  // Update isDarkMode when theme changes
  useEffect(() => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(prefersDark)
    } else {
      setIsDarkMode(theme === 'dark')
    }
  }, [theme])

  // Persist theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch (error) {
      console.error('Error saving theme preference:', error)
    }
  }, [theme])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode)
  }, [])

  const toggleDarkMode = useCallback(() => {
    setThemeState(prev => {
      // If currently in system mode, switch to explicit mode
      if (prev === 'system') {
        return isDarkMode ? 'light' : 'dark'
      }
      // Toggle between light and dark
      return prev === 'dark' ? 'light' : 'dark'
    })
  }, [isDarkMode])

  const setDarkMode = useCallback((value: boolean) => {
    setThemeState(value ? 'dark' : 'light')
  }, [])

  const value = useMemo(
    () => ({
      isDarkMode,
      theme,
      toggleDarkMode,
      setDarkMode,
      setTheme
    }),
    [isDarkMode, theme, toggleDarkMode, setDarkMode, setTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
