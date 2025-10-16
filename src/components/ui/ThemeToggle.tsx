import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme, type Theme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
  variant?: 'button' | 'dropdown' | 'switch'
  size?: 'sm' | 'md' | 'lg'
}

export function ThemeToggle({ 
  className, 
  showLabel = false, 
  variant = 'button',
  size = 'md'
}: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme()

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  if (variant === 'switch') {
    return (
      <div className={cn('flex items-center space-x-3', className)}>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDark ? 'Modo Oscuro' : 'Modo Claro'}
          </span>
        )}
        <button
          onClick={toggleTheme}
          className={cn(
            'relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
            isDark ? 'bg-blue-600' : 'bg-gray-200',
            sizeClasses[size]
          )}
          aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
          role="switch"
          aria-checked={isDark}
        >
          <span
            className={cn(
              'inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200',
              isDark ? 'translate-x-5' : 'translate-x-1',
              size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
            )}
          >
            {isDark ? (
              <Moon className={cn(iconSizes[size], 'text-blue-600 p-0.5')} />
            ) : (
              <Sun className={cn(iconSizes[size], 'text-yellow-500 p-0.5')} />
            )}
          </span>
        </button>
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        <select
          value={theme}
          onChange={(e) => {
            const newTheme = e.target.value as Theme
            if (newTheme !== theme) {
              toggleTheme()
            }
          }}
          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Seleccionar tema"
        >
          <option value="light">🌞 Claro</option>
          <option value="dark">🌙 Oscuro</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    )
  }

  // Variant: button (default)
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-md',
        sizeClasses[size],
        className
      )}
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      title={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
    >
      {isDark ? (
        <Sun className={cn(iconSizes[size], 'text-yellow-500')} />
      ) : (
        <Moon className={cn(iconSizes[size], 'text-blue-600')} />
      )}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {isDark ? 'Claro' : 'Oscuro'}
        </span>
      )}
    </button>
  )
}

// Componente más simple para casos específicos
export function SimpleThemeToggle({ className }: { className?: string }) {
  const { toggleTheme, isDark } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200',
        className
      )}
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-blue-600" />
      )}
    </button>
  )
}

// Hook para componentes que necesitan saber el tema actual
export function useThemeAware() {
  const { theme, isDark } = useTheme()
  
  return {
    theme,
    isDark,
    // Clases CSS condicionales
    bgClass: isDark ? 'bg-gray-900' : 'bg-white',
    textClass: isDark ? 'text-white' : 'text-gray-900',
    borderClass: isDark ? 'border-gray-700' : 'border-gray-200',
    cardClass: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  }
}
