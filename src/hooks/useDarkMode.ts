import { useTheme } from '@/contexts/ThemeContext'
import type { ThemeMode } from '@/contexts/ThemeContext'

interface UseDarkModeReturn {
  isDarkMode: boolean
  theme: ThemeMode
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
  setTheme: (mode: ThemeMode) => void
}

/**
 * Hook to access dark mode functionality
 * This is a convenience wrapper around useTheme from ThemeContext
 * 
 * @throws Error if used outside ThemeProvider
 * @returns Object with isDarkMode state and control functions
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isDarkMode, toggleDarkMode } = useDarkMode()
 *   
 *   return (
 *     <button onClick={toggleDarkMode}>
 *       {isDarkMode ? 'Light Mode' : 'Dark Mode'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useDarkMode(): UseDarkModeReturn {
  const { isDarkMode, theme, toggleDarkMode, setDarkMode, setTheme } = useTheme()

  return {
    isDarkMode,
    theme,
    toggleDarkMode,
    setDarkMode,
    setTheme
  }
}
