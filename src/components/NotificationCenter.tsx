import React, { useState } from 'react'
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import type { Notification } from '@/types/notifications'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle
      case 'error':
        return XCircle
      case 'warning':
        return AlertTriangle
      case 'info':
      default:
        return Info
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'info':
      default:
        return 'text-blue-600 bg-blue-100'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notificaciones
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-gray-500">({unreadCount} nuevas)</span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type)
                    
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 hover:bg-gray-50 cursor-pointer transition-colors',
                          !notification.read && 'bg-blue-50'
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={cn('p-2 rounded-full', getNotificationColor(notification.type))}>
                            <Icon className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={cn(
                                'text-sm font-medium truncate',
                                notification.read ? 'text-gray-700' : 'text-gray-900'
                              )}>
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {formatTime(notification.timestamp)}
                                </span>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            
                            <p className={cn(
                              'text-sm mt-1',
                              notification.read ? 'text-gray-500' : 'text-gray-700'
                            )}>
                              {notification.message}
                            </p>
                            
                            {notification.actionUrl && (
                              <Link
                                to={notification.actionUrl}
                                className="inline-flex items-center mt-2 text-xs text-blue-600 hover:text-blue-800"
                                onClick={() => setIsOpen(false)}
                              >
                                {notification.actionLabel || 'Ver más'}
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </Link>
                            )}
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpiar todas
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}