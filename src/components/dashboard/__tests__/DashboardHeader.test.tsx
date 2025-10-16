import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardHeader } from '../DashboardHeader'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Wrapper with ThemeProvider
const renderWithTheme = (ui: React.ReactElement, { isDark = false } = {}) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  return render(
    <ThemeProvider defaultTheme={isDark ? 'dark' : 'light'}>
      {ui}
    </ThemeProvider>
  )
}

describe('DashboardHeader', () => {
  const mockOnExport = vi.fn()
  const mockOnOpenSettings = vi.fn()
  const mockOnToggleNotifications = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render with default title', () => {
      renderWithTheme(<DashboardHeader />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should render with custom title and subtitle', () => {
      renderWithTheme(
        <DashboardHeader
          title="Dashboard Unificado"
          subtitle="Análisis completo"
        />
      )
      
      expect(screen.getByText('Dashboard Unificado')).toBeInTheDocument()
      expect(screen.getByText('Análisis completo')).toBeInTheDocument()
    })

    it('should not render subtitle when not provided', () => {
      renderWithTheme(<DashboardHeader title="Test Dashboard" />)
      
      expect(screen.getByText('Test Dashboard')).toBeInTheDocument()
      expect(screen.queryByText('Análisis completo')).not.toBeInTheDocument()
    })
  })

  describe('Export Button', () => {
    it('should render export button when onExport is provided', () => {
      renderWithTheme(<DashboardHeader onExport={mockOnExport} />)
      
      const exportButton = screen.getByRole('button', { name: /exportar datos/i })
      expect(exportButton).toBeInTheDocument()
    })

    it('should not render export button when onExport is not provided', () => {
      renderWithTheme(<DashboardHeader />)
      
      expect(screen.queryByRole('button', { name: /exportar/i })).not.toBeInTheDocument()
    })

    it('should call onExport when export button is clicked', () => {
      renderWithTheme(<DashboardHeader onExport={mockOnExport} />)
      
      const exportButton = screen.getByRole('button', { name: /exportar datos/i })
      fireEvent.click(exportButton)
      
      expect(mockOnExport).toHaveBeenCalledTimes(1)
    })

    it('should show loading state when isExporting is true', () => {
      renderWithTheme(
        <DashboardHeader onExport={mockOnExport} isExporting={true} />
      )
      
      expect(screen.getByText('Exportando...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /exportando/i })).toBeDisabled()
    })

    it('should disable export button during export', () => {
      renderWithTheme(
        <DashboardHeader onExport={mockOnExport} isExporting={true} />
      )
      
      const exportButton = screen.getByRole('button', { name: /exportando/i })
      fireEvent.click(exportButton)
      
      expect(mockOnExport).not.toHaveBeenCalled()
    })
  })

  describe('Notifications Button', () => {
    it('should render notifications button when onToggleNotifications is provided', () => {
      renderWithTheme(
        <DashboardHeader onToggleNotifications={mockOnToggleNotifications} />
      )
      
      const notifButton = screen.getByRole('button', { name: /notificaciones/i })
      expect(notifButton).toBeInTheDocument()
    })

    it('should call onToggleNotifications when clicked', () => {
      renderWithTheme(
        <DashboardHeader onToggleNotifications={mockOnToggleNotifications} />
      )
      
      const notifButton = screen.getByRole('button', { name: /notificaciones/i })
      fireEvent.click(notifButton)
      
      expect(mockOnToggleNotifications).toHaveBeenCalledTimes(1)
    })

    it('should show unread count badge when unreadCount > 0', () => {
      renderWithTheme(
        <DashboardHeader
          onToggleNotifications={mockOnToggleNotifications}
          unreadCount={5}
        />
      )
      
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByLabelText(/5 notificaciones sin leer/i)).toBeInTheDocument()
    })

    it('should show 9+ when unreadCount > 9', () => {
      renderWithTheme(
        <DashboardHeader
          onToggleNotifications={mockOnToggleNotifications}
          unreadCount={15}
        />
      )
      
      expect(screen.getByText('9+')).toBeInTheDocument()
    })

    it('should not show badge when unreadCount is 0', () => {
      renderWithTheme(
        <DashboardHeader
          onToggleNotifications={mockOnToggleNotifications}
          unreadCount={0}
        />
      )
      
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })
  })

  describe('Settings Button', () => {
    it('should render settings button when onOpenSettings is provided', () => {
      renderWithTheme(<DashboardHeader onOpenSettings={mockOnOpenSettings} />)
      
      const settingsButton = screen.getByRole('button', { name: /configuración del dashboard/i })
      expect(settingsButton).toBeInTheDocument()
    })

    it('should call onOpenSettings when clicked', () => {
      renderWithTheme(<DashboardHeader onOpenSettings={mockOnOpenSettings} />)
      
      const settingsButton = screen.getByRole('button', { name: /configuración del dashboard/i })
      fireEvent.click(settingsButton)
      
      expect(mockOnOpenSettings).toHaveBeenCalledTimes(1)
    })
  })

  describe('Theme Support', () => {
    it('should apply light theme classes by default', () => {
      renderWithTheme(<DashboardHeader title="Test" />)
      
      const title = screen.getByText('Test')
      expect(title).toHaveClass('text-gray-900')
    })

    it('should apply dark theme classes when dark mode is active', () => {
      renderWithTheme(<DashboardHeader title="Test" />, { isDark: true })
      
      const title = screen.getByText('Test')
      expect(title).toHaveClass('text-white')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for all buttons', () => {
      renderWithTheme(
        <DashboardHeader
          onExport={mockOnExport}
          onOpenSettings={mockOnOpenSettings}
          onToggleNotifications={mockOnToggleNotifications}
          unreadCount={3}
        />
      )
      
      expect(screen.getByRole('button', { name: /exportar datos/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /notificaciones \(3 sin leer\)/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /configuración del dashboard/i })).toBeInTheDocument()
    })

    it('should have minimum touch target size (44px)', () => {
      renderWithTheme(
        <DashboardHeader
          onExport={mockOnExport}
          onToggleNotifications={mockOnToggleNotifications}
        />
      )
      
      const exportButton = screen.getByRole('button', { name: /exportar datos/i })
      const notifButton = screen.getByRole('button', { name: /notificaciones/i })
      
      expect(exportButton).toHaveClass('min-h-[44px]')
      expect(notifButton).toHaveClass('min-h-[44px]')
    })
  })

  describe('Responsive Layout', () => {
    it('should have responsive classes for mobile layout', () => {
      const { container } = renderWithTheme(<DashboardHeader title="Test" />)
      
      const headerContainer = container.firstChild
      expect(headerContainer).toHaveClass('sm:flex-row', 'flex-col')
    })
  })
})
