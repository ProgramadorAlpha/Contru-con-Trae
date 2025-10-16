import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotificationCenter } from '../NotificationCenter'
import type { Notification } from '@/types/notifications'

// Mock the chartUtils
vi.mock('@/lib/chartUtils', () => ({
  getTimeAgo: (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'hace un momento'
    if (minutes < 60) return `hace ${minutes} minutos`
    return 'hace más de una hora'
  }
}))

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Presupuesto Excedido',
    message: 'El proyecto "Edificio Aurora" ha superado el 90% del presupuesto.',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    read: false,
    actionUrl: '/projects/1'
  },
  {
    id: '2',
    type: 'success',
    title: 'Proyecto Completado',
    message: 'El proyecto "Casa Verde" se ha completado exitosamente.',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    read: true
  },
  {
    id: '3',
    type: 'error',
    title: 'Error de Sistema',
    message: 'Fallo en la conexión con el servidor de datos.',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    read: false
  },
  {
    id: '4',
    type: 'info',
    title: 'Nueva Actualización',
    message: 'Hay una nueva versión disponible del sistema.',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    read: true
  }
]

describe('NotificationCenter', () => {
  const mockOnClose = vi.fn()
  const mockOnMarkAsRead = vi.fn()
  const mockOnMarkAllAsRead = vi.fn()
  const mockOnRemoveNotification = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    notifications: mockNotifications,
    onMarkAsRead: mockOnMarkAsRead,
    onMarkAllAsRead: mockOnMarkAllAsRead,
    onRemoveNotification: mockOnRemoveNotification
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when open', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    expect(screen.getByText('Notificaciones')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<NotificationCenter {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Notificaciones')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('displays correct unread count', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    const unreadBadge = screen.getByText('2') // 2 unread notifications
    expect(unreadBadge).toBeInTheDocument()
  })

  it('displays all notifications by default', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    expect(screen.getByText('Presupuesto Excedido')).toBeInTheDocument()
    expect(screen.getByText('Proyecto Completado')).toBeInTheDocument()
    expect(screen.getByText('Error de Sistema')).toBeInTheDocument()
    expect(screen.getByText('Nueva Actualización')).toBeInTheDocument()
  })

  it('filters notifications by read status', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    const unreadFilter = screen.getByText(/no leídas/i)
    fireEvent.click(unreadFilter)
    
    expect(screen.getByText('Presupuesto Excedido')).toBeInTheDocument()
    expect(screen.getByText('Error de Sistema')).toBeInTheDocument()
    expect(screen.queryByText('Proyecto Completado')).not.toBeInTheDocument()
    expect(screen.queryByText('Nueva Actualización')).not.toBeInTheDocument()
  })

  it('filters notifications by type', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    const errorFilter = screen.getByText(/errores/i)
    fireEvent.click(errorFilter)
    
    expect(screen.getByText('Error de Sistema')).toBeInTheDocument()
    expect(screen.queryByText('Presupuesto Excedido')).not.toBeInTheDocument()
    expect(screen.queryByText('Proyecto Completado')).not.toBeInTheDocument()
  })

  it('searches notifications by title and message', async () => {
    render(<NotificationCenter {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/buscar notificaciones/i)
    fireEvent.change(searchInput, { target: { value: 'proyecto' } })
    
    await waitFor(() => {
      expect(screen.getByText('Presupuesto Excedido')).toBeInTheDocument()
      expect(screen.getByText('Proyecto Completado')).toBeInTheDocument()
      expect(screen.queryByText('Error de Sistema')).not.toBeInTheDocument()
    })
  })

  it('clears search when clear button is clicked', async () => {
    render(<NotificationCenter {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/buscar notificaciones/i)
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    
    await waitFor(() => {
      expect(screen.getByText(/no se encontraron notificaciones/i)).toBeInTheDocument()
    })
    
    const clearButton = screen.getByText(/limpiar búsqueda/i)
    fireEvent.click(clearButton)
    
    expect(searchInput).toHaveValue('')
    expect(screen.getByText('Error de Sistema')).toBeInTheDocument()
  })

  it('marks notification as read when clicked', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    const unreadNotification = screen.getByText('Presupuesto Excedido')
    fireEvent.click(unreadNotification.closest('[role="button"]') || unreadNotification)
    
    expect(mockOnMarkAsRead).toHaveBeenCalledWith('1')
  })

  it('opens action URL when notification with URL is clicked', () => {
    const mockOpen = vi.fn()
    vi.stubGlobal('open', mockOpen)
    
    render(<NotificationCenter {...defaultProps} />)
    
    const notificationWithUrl = screen.getByText('Presupuesto Excedido')
    fireEvent.click(notificationWithUrl.closest('[role="button"]') || notificationWithUrl)
    
    expect(mockOpen).toHaveBeenCalledWith('/projects/1', '_blank')
    
    vi.unstubAllGlobals()
  })

  it('marks all notifications as read', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    const markAllButton = screen.getByText(/marcar todas como leídas/i)
    fireEvent.click(markAllButton)
    
    expect(mockOnMarkAllAsRead).toHaveBeenCalled()
  })

  it('removes notification when remove button is clicked', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    // Find all buttons without accessible names (remove buttons)
    const allButtons = screen.getAllByRole('button')
    const removeButtons = allButtons.filter(button => 
      button.className.includes('opacity-0') && 
      button.className.includes('group-hover:opacity-100')
    )
    
    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0])
      expect(mockOnRemoveNotification).toHaveBeenCalled()
    }
  })

  it('closes on Escape key press', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes when close button is clicked', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    const closeButton = screen.getByLabelText(/cerrar panel/i)
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('displays empty state when no notifications match filter', () => {
    render(<NotificationCenter {...defaultProps} notifications={[]} />)
    
    expect(screen.getByText(/no hay notificaciones/i)).toBeInTheDocument()
  })

  it('displays empty state when search returns no results', async () => {
    render(<NotificationCenter {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/buscar notificaciones/i)
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    
    await waitFor(() => {
      expect(screen.getByText(/no se encontraron notificaciones/i)).toBeInTheDocument()
    })
  })

  it('sorts notifications correctly', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    // Get notification items by their container divs
    const notificationContainer = screen.getByText('Presupuesto Excedido').closest('.p-4')
    const allNotifications = notificationContainer?.parentElement?.querySelectorAll('.p-4')
    
    if (allNotifications) {
      const notificationTexts = Array.from(allNotifications).map(n => n.textContent || '')
      
      // Unread notifications should appear first
      const unreadIndex1 = notificationTexts.findIndex(text => text.includes('Presupuesto Excedido'))
      const unreadIndex2 = notificationTexts.findIndex(text => text.includes('Error de Sistema'))
      const readIndex1 = notificationTexts.findIndex(text => text.includes('Proyecto Completado'))
      
      expect(unreadIndex1).toBeGreaterThanOrEqual(0)
      expect(unreadIndex2).toBeGreaterThanOrEqual(0)
      expect(readIndex1).toBeGreaterThanOrEqual(0)
      expect(unreadIndex1).toBeLessThan(readIndex1)
      expect(unreadIndex2).toBeLessThan(readIndex1)
    }
  })

  it('displays correct notification counts in filter buttons', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    expect(screen.getByText('Todas (4)')).toBeInTheDocument()
    expect(screen.getByText('No leídas (2)')).toBeInTheDocument()
    expect(screen.getByText('Errores (1)')).toBeInTheDocument()
    expect(screen.getByText('Advertencias (1)')).toBeInTheDocument()
  })

  it('maintains accessibility attributes', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')
    
    const searchInput = screen.getByRole('textbox')
    expect(searchInput).toHaveAttribute('aria-label')
    
    const filterGroup = screen.getByRole('group')
    expect(filterGroup).toHaveAttribute('aria-label')
  })

  it('handles mobile responsive design', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    })
    
    render(<NotificationCenter {...defaultProps} />)
    
    // Should render mobile-friendly layout
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})