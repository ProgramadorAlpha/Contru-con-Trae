import React from 'react'
import { Search, User, Settings, LogOut } from 'lucide-react'
import { NotificationCenter } from './NotificationCenter'
import { DarkModeToggle } from './DarkModeToggle'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@/lib/utils'

/**
 * Header component with theme support
 * 
 * Features:
 * - Search bar with theme-aware styling
 * - Dark mode toggle (compact variant)
 * - Notification center
 * - User profile section
 * - Settings and logout buttons
 * - Responsive design for mobile
 * - Smooth color transitions
 */
export function Header() {
  const { isDarkMode } = useDarkMode()

  return (
    <header 
      className={cn(
        'shadow-sm border-b transition-colors duration-200',
        isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      )}
    >
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        {/* Search Bar */}
        <div className="flex items-center flex-1 max-w-2xl">
          <div className="relative w-full">
            <Search 
              className={cn(
                'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4',
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              )} 
            />
            <input
              type="text"
              placeholder="Buscar proyectos, documentos..."
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-lg transition-colors duration-200',
                'focus:ring-2 focus:ring-blue-500 focus:outline-none',
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600'
                  : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-transparent'
              )}
            />
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Dark Mode Toggle */}
          <DarkModeToggle variant="compact" />
          
          {/* Notification Center */}
          <NotificationCenter />
          
          {/* User Profile - Hidden on small screens */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <p className={cn(
                'font-medium transition-colors duration-200',
                isDarkMode ? 'text-white' : 'text-gray-900'
              )}>
                Administrador
              </p>
              <p className={cn(
                'transition-colors duration-200',
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              )}>
                admin@constructpro.com
              </p>
            </div>
          </div>
          
          {/* Settings Button */}
          <button 
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              'hover:scale-110 active:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              isDarkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            )}
            aria-label="Configuración"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          {/* Logout Button */}
          <button 
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              'hover:scale-110 active:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-red-500',
              isDarkMode
                ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'
            )}
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}