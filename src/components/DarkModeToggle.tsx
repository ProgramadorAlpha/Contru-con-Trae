import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@/lib/utils'

interface DarkModeToggleProps {
  className?: string
  variant?: 'full' | 'compact'
}

/**
 * DarkModeToggle component with two variants:
 * - 'full': Icon + label (for settings panels)
 * - 'compact': Icon only (for headers)
 * 
 * Features:
 * - Smooth transitions (200ms)
 * - Full keyboard navigation
 * - ARIA labels for accessibility
 * - Animated icon transitions
 * 
 * @example
 * ```tsx
 * // Full variant with label
 * <DarkModeToggle variant="full" />
 * 
 * // Compact variant for header
 * <DarkModeToggle variant="compact" />
 * ```
 */
export function DarkModeToggle({ className, variant = 'compact' }: DarkModeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Support Enter and Space for keyboard navigation
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleDarkMode()
    }
  }

  if (variant === 'full') {
    return (
      <button
        onClick={toggleDarkMode}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative inline-flex items-center justify-center',
          'rounded-lg px-4 py-2.5',
          'transition-all duration-200 ease-in-out',
          'hover:scale-105 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'min-h-[44px]', // Minimum touch target size for accessibility
          isDarkMode
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 focus:ring-yellow-500 dark:bg-gray-700 dark:hover:bg-gray-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-blue-500',
          className
        )}
        aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        aria-pressed={isDarkMode}
        role="switch"
        title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        <div className="relative w-6 h-6 mr-2">
          {/* Icono de Luna (Modo Oscuro) */}
          <Moon
            className={cn(
              'absolute inset-0 w-6 h-6 transition-all duration-200',
              isDarkMode
                ? 'opacity-100 rotate-0 scale-100'
                : 'opacity-0 -rotate-90 scale-0'
            )}
            aria-hidden="true"
          />
          
          {/* Icono de Sol (Modo Claro) */}
          <Sun
            className={cn(
              'absolute inset-0 w-6 h-6 transition-all duration-200',
              isDarkMode
                ? 'opacity-0 rotate-90 scale-0'
                : 'opacity-100 rotate-0 scale-100'
            )}
            aria-hidden="true"
          />
        </div>

        <span className="text-sm font-medium">
          {isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}
        </span>
      </button>
    )
  }

  // Compact variant
  return (
    <button
      onClick={toggleDarkMode}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative inline-flex items-center justify-center',
        'w-10 h-10 rounded-full',
        'transition-all duration-200',
        'hover:scale-110 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'min-h-[44px] min-w-[44px]', // Minimum touch target size
        isDarkMode
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 focus:ring-yellow-500 dark:bg-gray-700 dark:hover:bg-gray-600'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-blue-500',
        className
      )}
      aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={isDarkMode}
      role="switch"
      title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div className="relative w-5 h-5">
        <Moon
          className={cn(
            'absolute inset-0 w-5 h-5 transition-all duration-200',
            isDarkMode
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-0'
          )}
          aria-hidden="true"
        />
        <Sun
          className={cn(
            'absolute inset-0 w-5 h-5 transition-all duration-200',
            isDarkMode
              ? 'opacity-0 rotate-90 scale-0'
              : 'opacity-100 rotate-0 scale-100'
          )}
          aria-hidden="true"
        />
      </div>
    </button>
  )
}

/**
 * Compact version of DarkModeToggle for backwards compatibility
 * @deprecated Use <DarkModeToggle variant="compact" /> instead
 */
export function DarkModeToggleCompact({ className }: { className?: string }) {
  return <DarkModeToggle variant="compact" className={className} />
}
