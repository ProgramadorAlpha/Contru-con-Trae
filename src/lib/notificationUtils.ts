import type { Notification, NotificationType } from '@/types/notifications'

export const createNotification = (
  type: NotificationType,
  title: string,
  message: string,
  actionUrl?: string
): Notification => {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    timestamp: new Date(),
    read: false,
    actionUrl
  }
}

export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'success':
      return '✅'
    case 'warning':
      return '⚠️'
    case 'error':
      return '❌'
    default:
      return 'ℹ️'
  }
}

export const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'success':
      return 'text-green-600 bg-green-100'
    case 'warning':
      return 'text-yellow-600 bg-yellow-100'
    case 'error':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-blue-600 bg-blue-100'
  }
}

export const generateSampleNotifications = (): Notification[] => {
  const notifications: Array<{
    type: NotificationType
    title: string
    message: string
    actionUrl?: string
  }> = [
    {
      type: 'warning',
      title: 'Presupuesto Excedido',
      message: 'El proyecto "Edificio Aurora" ha superado el 90% del presupuesto asignado.',
      actionUrl: '/projects/edificio-aurora'
    },
    {
      type: 'info',
      title: 'Nueva Tarea Asignada',
      message: 'Se ha asignado una nueva tarea de revisión estructural para el proyecto "Casa Verde".',
      actionUrl: '/tasks/structural-review'
    },
    {
      type: 'success',
      title: 'Proyecto Completado',
      message: 'El proyecto "Complejo Residencial Norte" se ha completado exitosamente.',
      actionUrl: '/projects/complejo-norte'
    },
    {
      type: 'error',
      title: 'Equipo en Mantenimiento',
      message: 'La excavadora CAT 320D requiere mantenimiento urgente. Programar revisión.',
      actionUrl: '/equipment/cat-320d'
    },
    {
      type: 'info',
      title: 'Reunión Programada',
      message: 'Reunión de seguimiento del proyecto "Torre Central" programada para mañana a las 10:00 AM.',
      actionUrl: '/meetings/torre-central-followup'
    },
    {
      type: 'warning',
      title: 'Retraso en Entrega',
      message: 'El suministro de materiales para "Proyecto Girassol" se ha retrasado 3 días.',
      actionUrl: '/projects/girassol/materials'
    },
    {
      type: 'success',
      title: 'Certificación Aprobada',
      message: 'La certificación de calidad para "Edificio Moderno" ha sido aprobada.',
      actionUrl: '/projects/edificio-moderno/certifications'
    }
  ]

  return notifications.map((notif, index) => ({
    ...createNotification(notif.type, notif.title, notif.message, notif.actionUrl),
    timestamp: new Date(Date.now() - (index * 30 * 60 * 1000)) // Espaciar por 30 minutos
  }))
}

export const filterNotifications = (
  notifications: Notification[],
  filters: { type?: NotificationType; read?: boolean }
): Notification[] => {
  return notifications.filter(notification => {
    if (filters.type && notification.type !== filters.type) {
      return false
    }
    if (filters.read !== undefined && notification.read !== filters.read) {
      return false
    }
    return true
  })
}

export const sortNotificationsByDate = (notifications: Notification[]): Notification[] => {
  return [...notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export const markNotificationAsRead = (
  notifications: Notification[],
  notificationId: string
): Notification[] => {
  return notifications.map(notification =>
    notification.id === notificationId
      ? { ...notification, read: true }
      : notification
  )
}

export const markAllNotificationsAsRead = (notifications: Notification[]): Notification[] => {
  return notifications.map(notification => ({ ...notification, read: true }))
}

export const getUnreadCount = (notifications: Notification[]): number => {
  return notifications.filter(notification => !notification.read).length
}

export const shouldShowNotification = (
  notification: Notification,
  config: { enabled: boolean; types: Record<NotificationType, boolean> }
): boolean => {
  if (!config.enabled) return false
  return config.types[notification.type] || false
}

export const playNotificationSound = (): void => {
  // En una implementación real, aquí se reproduciría un sonido
  // Por ahora, solo registramos en consola
  console.log('🔔 Notification sound played')
}

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export const showDesktopNotification = (notification: Notification): void => {
  if (Notification.permission === 'granted') {
    const desktopNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico', // Usar el favicon como icono
      tag: notification.id
    })

    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
      desktopNotification.close()
    }, 5000)

    // Manejar clic en la notificación
    desktopNotification.onclick = () => {
      window.focus()
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl
      }
      desktopNotification.close()
    }
  }
}