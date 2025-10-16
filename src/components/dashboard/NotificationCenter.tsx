import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Bell, X, AlertTriangle, Info, CheckCircle, Clock, Filter, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types/notifications'
import { getTimeAgo } from '@/lib/chartUtils'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onRemoveNotification?: (id: string) => void
}

// Memoized utility functions to prevent recreation on every render
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'warning':
      return AlertTriangle
    case 'success':
      return CheckCircle
    case 'error':
      return AlertTriangle
    default:
      return Info
  }
}

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'warning':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200'
    case 'success':
      return 'text-green-600 bg-green-100 border-green-200'
    case 'error':
      return 'text-red-600 bg-red-100 border-red-200'
    default:
      return 'text-blue-600 bg-blue-100 border-blue-200'
  }
}

const getNotificationPriority = (type: NotificationType): number => {
  switch (type) {
    case 'error': return 4
    case 'warning': return 3
    case 'success': return 2
    default: return 1
  }
}

export const NotificationCenter = React.memo(function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemoveNotification
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationType>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Memoize filtered and sorted notifications to prevent recalculation on every render
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter(notification => {
        // Filter by read status or type
        if (filter === 'unread' && notification.read) return false
        if (filter !== 'all' && filter !== 'unread' && notification.type !== filter) return false
        
        // Filter by search term
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          return (
            notification.title.toLowerCase().includes(searchLower) ||
            notification.message.toLowerCase().includes(searchLower)
          )
        }
        
        return true
      })
      .sort((a, b) => {
        // Sort by read status first (unread first), then by priority, then by timestamp
        if (a.read !== b.read) return a.read ? 1 : -1
        
        const priorityDiff = getNotificationPriority(b.type) - getNotificationPriority(a.type)
        if (priorityDiff !== 0) return priorityDiff
        
        return b.timestamp.getTime() - a.timestamp.getTime()
      })
  }, [notifications, filter, searchTerm])

  // Memoize counts to prevent recalculation
  const { unreadCount, typeCounts } = useMemo(() => {
    const unread = notifications.filter(n => !n.read).length
    const counts = {
      error: notifications.filter(n => n.type === 'error').length,
      warning: notifications.filter(n => n.type === 'warning').length,
      success: notifications.filter(n => n.type === 'success').length,
      info: notifications.filter(n => n.type === 'info').length
    }
    return { unreadCount: unread, typeCounts: counts }
  }, [notifications])

  // Memoize event handlers to prevent child re-renders
  const handleNotificationClick = useCallback((notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
  }, [onMarkAsRead])

  const handleRemoveNotification = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (onRemoveNotification) {
      onRemoveNotification(id)
    }
  }, [onRemoveNotification])

  const handleFilterChange = useCallback((newFilter: 'all' | 'unread' | NotificationType) => {
    setFilter(newFilter)
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end pt-16 pr-4 z-50 sm:pt-16 sm:pr-4 pt-0 pr-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-center-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden animate-in slide-in-from-right duration-300 sm:rounded-lg rounded-none sm:max-h-[80vh] max-h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" aria-hidden="true" />
            <h3 id="notification-center-title" className="text-lg font-semibold text-gray-900">
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <span 
                className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-medium"
                aria-label={`${unreadCount} notificaciones sin leer`}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors focus-visible:focus-visible"
            aria-label="Cerrar panel de notificaciones"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar notificaciones..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              aria-label="Buscar en notificaciones"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-2 gap-1" role="group" aria-label="Filtros de notificaciones">
            <button
              onClick={() => handleFilterChange('all')}
              className={cn(
                'px-3 py-2 text-xs rounded-full transition-colors font-medium focus-visible:focus-visible min-h-[44px] min-w-[44px]',
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
              )}
              aria-pressed={filter === 'all'}
              aria-label={`Mostrar todas las notificaciones (${notifications.length})`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => handleFilterChange('unread')}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition-colors font-medium',
                filter === 'unread'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
              )}
            >
              No leídas ({unreadCount})
            </button>
            <button
              onClick={() => handleFilterChange('error')}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition-colors font-medium',
                filter === 'error'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
              )}
            >
              Errores ({typeCounts.error})
            </button>
            <button
              onClick={() => handleFilterChange('warning')}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition-colors font-medium',
                filter === 'warning'
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
              )}
            >
              Advertencias ({typeCounts.warning})
            </button>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={onMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Marcar todas como leídas
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {searchTerm 
                  ? 'No se encontraron notificaciones'
                  : filter === 'unread' 
                    ? 'No hay notificaciones sin leer' 
                    : 'No hay notificaciones'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200',
                      !notification.read && 'bg-blue-50 border-l-4 border-l-blue-500'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        'p-2 rounded-full border',
                        getNotificationColor(notification.type)
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={cn(
                            'text-sm font-medium',
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          )}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2 ml-2">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {getTimeAgo(notification.timestamp)}
                            </span>
                            {onRemoveNotification && (
                              <button
                                onClick={(e) => handleRemoveNotification(e, notification.id)}
                                className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <p className={cn(
                          'text-sm mt-1 line-clamp-2',
                          !notification.read ? 'text-gray-700' : 'text-gray-500'
                        )}>
                          {notification.message}
                        </p>
                        
                        {notification.actionUrl && (
                          <button className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium">
                            Ver detalles →
                          </button>
                        )}
                      </div>
                      
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
            <p className="text-xs text-gray-500">
              {filteredNotifications.length} de {notifications.length} notificaciones
            </p>
          </div>
        )}
      </div>
    </div>
  )
})