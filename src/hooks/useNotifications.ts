import { useState, useEffect, useCallback } from 'react'
import type { Notification, NotificationType, NotificationConfig } from '@/types/notifications'
import { 
  createNotification, 
  generateSampleNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getUnreadCount,
  shouldShowNotification,
  playNotificationSound,
  showDesktopNotification,
  requestNotificationPermission
} from '@/lib/notificationUtils'
import { safeLocalStorage } from '@/lib/utils'
import { useDebouncedCallback } from './useDebounce'

interface UseNotificationsOptions {
  enableRealTime?: boolean
  enableSound?: boolean
  enableDesktop?: boolean
  maxNotifications?: number
  autoCleanupDays?: number
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  addNotification: (type: NotificationType, title: string, message: string, actionUrl?: string) => void
  config: NotificationConfig
  updateConfig: (config: Partial<NotificationConfig>) => void
}

const DEFAULT_CONFIG: NotificationConfig = {
  enabled: true,
  types: {
    info: true,
    warning: true,
    success: true,
    error: true
  },
  sound: false,
  desktop: false
}

const STORAGE_KEY = 'dashboard_notifications'
const CONFIG_STORAGE_KEY = 'notification_config'

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    enableRealTime = true,
    enableSound = false,
    enableDesktop = false,
    maxNotifications = 50,
    autoCleanupDays = 7
  } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<NotificationConfig>(DEFAULT_CONFIG)

  // Load notifications and config from localStorage on mount
  useEffect(() => {
    const savedNotifications = safeLocalStorage.getItem(STORAGE_KEY)
    const savedConfig = safeLocalStorage.getItem(CONFIG_STORAGE_KEY)

    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications)
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
        setNotifications(notificationsWithDates)
      } catch (error) {
        console.error('Error loading notifications:', error)
        // Generate sample notifications if loading fails
        setNotifications(generateSampleNotifications())
      }
    } else {
      // Generate initial sample notifications
      setNotifications(generateSampleNotifications())
    }

    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig({ ...DEFAULT_CONFIG, ...parsedConfig })
      } catch (error) {
        console.error('Error loading notification config:', error)
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    }
  }, [notifications])

  // Save config to localStorage whenever it changes
  useEffect(() => {
    safeLocalStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config))
  }, [config])

  // Auto-cleanup old notifications with debounced callback
  const debouncedCleanup = useDebouncedCallback(() => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - autoCleanupDays)
    
    setNotifications(prev => 
      prev.filter(notification => notification.timestamp > cutoffDate)
    )
  }, 1000, [autoCleanupDays])

  useEffect(() => {
    // Run cleanup daily
    const interval = setInterval(debouncedCleanup, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [debouncedCleanup])

  // Request desktop notification permission if enabled
  useEffect(() => {
    if (config.desktop) {
      requestNotificationPermission()
    }
  }, [config.desktop])

  // Debounced notification addition to batch multiple notifications
  const debouncedAddNotification = useDebouncedCallback((newNotification: Notification) => {
    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications)
      
      // Play sound if enabled
      if (config.sound && enableSound) {
        playNotificationSound()
      }
      
      // Show desktop notification if enabled
      if (config.desktop && enableDesktop) {
        showDesktopNotification(newNotification)
      }
      
      return updated
    })
  }, 500, [config, enableSound, enableDesktop, maxNotifications])

  // Simulate real-time notifications
  useEffect(() => {
    if (!enableRealTime || !config.enabled) return

    const generateRandomNotification = () => {
      const messages = [
        {
          type: 'warning' as const,
          title: 'Presupuesto Excedido',
          message: 'El proyecto "Edificio Aurora" ha superado el 90% del presupuesto asignado.',
          actionUrl: '/projects/edificio-aurora'
        },
        {
          type: 'info' as const,
          title: 'Nueva Tarea Asignada',
          message: 'Se ha asignado una nueva tarea de revisión estructural.',
          actionUrl: '/tasks/structural-review'
        },
        {
          type: 'success' as const,
          title: 'Proyecto Completado',
          message: 'El proyecto "Casa Verde" se ha completado exitosamente.',
          actionUrl: '/projects/casa-verde'
        },
        {
          type: 'error' as const,
          title: 'Equipo en Mantenimiento',
          message: 'La excavadora CAT 320D requiere mantenimiento urgente.',
          actionUrl: '/equipment/cat-320d'
        },
        {
          type: 'info' as const,
          title: 'Reunión Programada',
          message: 'Reunión de seguimiento programada para mañana a las 10:00 AM.',
          actionUrl: '/meetings/followup'
        }
      ]

      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      return createNotification(
        randomMessage.type,
        randomMessage.title,
        randomMessage.message,
        randomMessage.actionUrl
      )
    }

    // Generate notifications every 30-60 seconds with 30% probability
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newNotification = generateRandomNotification()
        
        if (shouldShowNotification(newNotification, config)) {
          debouncedAddNotification(newNotification)
        }
      }
    }, 30000 + Math.random() * 30000) // 30-60 seconds

    return () => clearInterval(interval)
  }, [enableRealTime, config, debouncedAddNotification])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => markNotificationAsRead(prev, id))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => markAllNotificationsAsRead(prev))
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    safeLocalStorage.removeItem(STORAGE_KEY)
  }, [])

  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string
  ) => {
    const notification = createNotification(type, title, message, actionUrl)
    
    if (shouldShowNotification(notification, config)) {
      debouncedAddNotification(notification)
    }
  }, [config, debouncedAddNotification])

  const updateConfig = useCallback((newConfig: Partial<NotificationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  const unreadCount = getUnreadCount(notifications)

  return {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    addNotification,
    config,
    updateConfig
  }
}

// Hook for simple notification display (read-only)
export function useNotificationDisplay() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotifications = () => {
      const saved = safeLocalStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const notificationsWithDates = parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }))
          setNotifications(notificationsWithDates)
        } catch (error) {
          console.error('Error loading notifications for display:', error)
        }
      }
      setLoading(false)
    }

    loadNotifications()

    // Listen for storage changes to update in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadNotifications()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const unreadCount = getUnreadCount(notifications)

  return {
    notifications: notifications.slice(0, 5), // Only show latest 5 for display
    unreadCount,
    loading
  }
}