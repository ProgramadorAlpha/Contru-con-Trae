export interface Notification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isOpen: boolean
  filters: {
    type?: NotificationType
    read?: boolean
  }
}

export type NotificationType = 'info' | 'warning' | 'success' | 'error'

export interface NotificationConfig {
  enabled: boolean
  types: {
    info: boolean
    warning: boolean
    success: boolean
    error: boolean
  }
  sound: boolean
  desktop: boolean
}