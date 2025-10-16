import React from 'react'
import { Bell, Download, Settings } from 'lucide-react'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  onExport?: () => void
  onOpenSettings?: () => void
  onToggleNotifications?: () => void
  isExporting?: boolean
  notificationsEnabled?: boolean
  unreadCount?: number
}

/**
 * DashboardHeader component with theme support
 * 
 * Features:
 * - Title and subtitle with theme-aware styling
 * - Export button with loading state
 * - Settings button
 * - Notifications button with badge counter
 * - Dark mode toggle (compact)
 * - Responsive layout (stacks on mobile)
 * - Smooth transitions
 * 
 * @example
 * ```tsx
 * <DashboardHeader
 *   title="Dashboard Unificado"
 *   subtitle="Análisis completo con visualizaciones interactivas"
 *   onExport={handleExport}
 *   onOpenSettings={() => setSettingsOpen(true)}
 *   onToggleNotifications={() => setNotificationsOpen(true)}
 *   isExporting={false}
 *   unreadCount={5}
 * />
 * ```
 */
export function DashboardHeader({
  title = 'Dashboard',
  subtitle,
  onExport,
  onOpenSettings,
  onToggleNotifications,
  isExporting = false,
  notificationsEnabled = true,
  unreadCount = 0
}: DashboardHeaderProps) {
  const { isDarkMode } = useDarkMode()

  return (
    <div className="flex items-center justify-between sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-4 mb-6">
      {/* Title Section */}
      <div className="sm:text-left text-center sm:w-auto w-full">
        <h1 
          className={cn(
            'text-3xl font-bold sm:text-3xl text-2xl transition-colors duration-200',
            isDarkMode ? 'text-white' : 'text-gray-900'
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p 
            className={cn(
              'mt-1 sm:text-base text-sm transition-colors duration-200',
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Actions Section */}
      <div className="flex items-center space-x-3 sm:w-auto w-full sm:justify-end justify-center">
        {/* Export Button */}
        {onExport && (
          <button
            onClick={onExport}
            disabled={isExporting}
            className={cn(
              'inline-flex items-center px-4 py-2 rounded-lg',
              'text-sm font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'min-h-[44px]', // Accessibility: minimum touch target
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            )}
            aria-label={isExporting ? 'Exportando...' : 'Exportar datos'}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </>
            )}
          </button>
        )}

        {/* Dark Mode Toggle */}
        <DarkModeToggle variant="compact" />
        
        {/* Notifications Button */}
        {onToggleNotifications && (
          <button
            onClick={onToggleNotifications}
            className={cn(
              'relative p-2 rounded-full transition-all duration-200',
              'min-h-[44px] min-w-[44px] flex items-center justify-center',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              isDarkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            )}
            aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                aria-label={`${unreadCount} notificaciones sin leer`}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}
        
        {/* Settings Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className={cn(
              'p-2 rounded-full transition-all duration-200',
              'min-h-[44px] min-w-[44px] flex items-center justify-center',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              isDarkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            )}
            aria-label="Configuración del dashboard"
          >
            <Settings className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  )
}
