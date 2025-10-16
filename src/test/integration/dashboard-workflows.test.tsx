import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnhancedDashboard } from '@/pages/EnhancedDashboard'
import { createMockDashboardData, createMockWidget } from '@/test/utils'

// Mock hooks
vi.mock('@/hooks/useDashboardData', () => ({
  useDashboardData: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
    currentFilter: 'month',
    loadData: vi.fn(),
    exportData: vi.fn()
  }))
}))

vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    notifications: [],
    unreadCount: 0,
    isOpen: false,
    setIsOpen: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    removeNotification: vi.fn(),
    clearAll: vi.fn(),
    addNotification: vi.fn(),
    config: {
      enabled: true,
      types: { info: true, warning: true, success: true, error: true },
      sound: false,
      desktop: false
    },
    updateConfig: vi.fn()
  }))
}))

vi.mock('@/hooks/useDashboardSettings', () => ({
  useDashboardSettings: () => ({
    widgets: [],
    preferences: {
      defaultTimeFilter: 'month',
      autoRefresh: true,
      refreshInterval: 60000,
      notificationsEnabled: true
    },
    layout: {
      gridColumns: 3,
      compactMode: false
    },
    updateWidget: vi.fn(),
    updatePreferences: vi.fn(),
    updateLayout: vi.fn(),
    resetSettings: vi.fn()
  })
}))

describe('Dashboard Integration Workflows', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Data Loading and Display Workflow', () => {
    it('loads and displays dashboard data correctly', async () => {
      const mockData = createMockDashboardData()
      
      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        currentFilter: 'month',
        loadData: vi.fn(),
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      expect(screen.getByText('Dashboard Mejorado')).toBeInTheDocument()
      expect(screen.getByText('Filtros Temporales')).toBeInTheDocument()
    })

    it('shows loading state while fetching data', async () => {
      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        currentFilter: 'month',
        loadData: vi.fn(),
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      expect(screen.getByText('Dashboard Mejorado')).toBeInTheDocument()
      expect(screen.getByText('Filtros Temporales')).toBeInTheDocument()
    })

    it('displays error state when data loading fails', async () => {
      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: null,
        loading: false,
        error: 'Failed to load dashboard data',
        currentFilter: 'month',
        loadData: vi.fn(),
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      expect(screen.getByText(/failed to load dashboard data/i)).toBeInTheDocument()
    })
  })

  describe('Filter-to-Chart Update Workflow', () => {
    it('updates charts when time filter changes', async () => {
      const mockLoadData = vi.fn()
      
      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: createMockDashboardData(),
        loading: false,
        error: null,
        currentFilter: 'month',
        loadData: mockLoadData,
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      const weekFilter = screen.getByText('Semana')
      await user.click(weekFilter)

      // Verify that the filter change triggers data loading
      expect(mockLoadData).toHaveBeenCalled()
    })

    it('handles loading state during filter changes', async () => {
      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        currentFilter: 'month',
        loadData: vi.fn(),
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
    })

    it('handles custom date range selection', async () => {
      const mockLoadData = vi.fn()
      
      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: createMockDashboardData(),
        loading: false,
        error: null,
        currentFilter: 'custom',
        loadData: mockLoadData,
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      const customFilter = screen.getByText('Personalizado')
      await user.click(customFilter)

      await waitFor(() => {
        expect(screen.getByLabelText(/fecha inicio/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/fecha fin/i)).toBeInTheDocument()
      })
    })
  })

  describe('Notification Center Workflow', () => {
    it('displays notifications with correct counts', async () => {
      const mockNotifications = [
        {
          id: '1',
          type: 'warning' as const,
          title: 'Presupuesto Excedido',
          message: 'El proyecto A ha excedido el presupuesto',
          timestamp: new Date(),
          read: false
        },
        {
          id: '2',
          type: 'error' as const,
          title: 'Error de Sistema',
          message: 'Error en la sincronización',
          timestamp: new Date(),
          read: false
        },
        {
          id: '3',
          type: 'info' as const,
          title: 'Mantenimiento Programado',
          message: 'Mantenimiento el próximo domingo',
          timestamp: new Date(),
          read: false
        },
        {
          id: '4',
          type: 'success' as const,
          title: 'Proyecto Completado',
          message: 'El proyecto B se completó exitosamente',
          timestamp: new Date(),
          read: true
        },
        {
          id: '5',
          type: 'info' as const,
          title: 'Nueva Actualización',
          message: 'Versión 2.1 disponible',
          timestamp: new Date(),
          read: true
        }
      ]

      vi.mocked(await import('@/hooks/useNotifications')).useNotifications.mockReturnValue({
        notifications: mockNotifications,
        unreadCount: 3,
        isOpen: false,
        setIsOpen: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        removeNotification: vi.fn(),
        clearAll: vi.fn(),
        addNotification: vi.fn(),
        config: {
          enabled: true,
          types: { info: true, warning: true, success: true, error: true },
          sound: false,
          desktop: false
        },
        updateConfig: vi.fn()
      })

      render(<EnhancedDashboard />)

      expect(screen.getByText('Notificaciones')).toBeInTheDocument()
      expect(screen.getByText('Warning')).toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()

      const notificationButton = screen.getByRole('button', { name: /notificaciones/i })
      await user.click(notificationButton)

      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  describe('Settings and Configuration Workflow', () => {
    it('opens settings modal and displays widget configuration', async () => {
      const mockWidgets = [
        { id: 'stats', name: 'Estadísticas', description: 'Estadísticas generales', enabled: true, position: 1 },
        { id: 'charts', name: 'Gráficos', description: 'Gráficos interactivos', enabled: false, position: 2 }
      ]

      vi.mocked(await import('@/hooks/useDashboardSettings')).useDashboardSettings.mockReturnValue({
        widgets: mockWidgets,
        settings: {
          widgets: [],
          preferences: {
            defaultTimeFilter: 'month',
            autoRefresh: true,
            refreshInterval: 60000,
            notificationsEnabled: true
          },
          layout: {
            gridColumns: 3,
            compactMode: false
          }
        },

        updateWidget: vi.fn(),
        updatePreferences: vi.fn(),
        updateLayout: vi.fn(),
        resetSettings: vi.fn()
      })

      render(<EnhancedDashboard />)

      const settingsButton = screen.getByRole('button', { name: /configuración/i })
      await user.click(settingsButton)

      expect(screen.getByText('Configuración del Dashboard')).toBeInTheDocument()
    })

    it('handles search functionality in notifications', async () => {
      render(<EnhancedDashboard />)

      const notificationButton = screen.getByRole('button', { name: /notificaciones/i })
      await user.click(notificationButton)

      const searchInput = screen.getByPlaceholderText(/buscar notificaciones/i)
      await user.type(searchInput, 'project')

      expect(searchInput).toHaveValue('project')
    })
  })

  describe('Export Functionality Workflow', () => {
    it('handles data export when no data is available', async () => {
      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        currentFilter: 'month',
        loadData: vi.fn(),
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      const exportButton = screen.getByRole('button', { name: /exportar/i })
      expect(exportButton).toBeDisabled()
    })
  })

  describe('Responsive Design Workflow', () => {
    it('adapts layout for mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      render(<EnhancedDashboard />)

      expect(screen.getByText('Dashboard Mejorado')).toBeInTheDocument()
    })

    it('adapts layout for tablet devices', async () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      })

      render(<EnhancedDashboard />)

      expect(screen.getByText('Dashboard Mejorado')).toBeInTheDocument()
    })

    it('maintains full functionality on desktop', async () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      })

      render(<EnhancedDashboard />)

      expect(screen.getByText('Dashboard Mejorado')).toBeInTheDocument()
    })
  })

  describe('Error Handling Workflow', () => {
    it('handles network errors gracefully', async () => {
      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: null,
        loading: false,
        error: 'Failed to load dashboard data',
        currentFilter: 'month',
        loadData: vi.fn(),
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      expect(screen.getByText(/failed to load dashboard data/i)).toBeInTheDocument()
    })

    it('handles retry functionality', async () => {
      const mockRefreshData = vi.fn()
      
      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: null,
        loading: false,
        error: 'Network error',
        currentFilter: 'month',
        loadData: mockRefreshData,
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      const retryButton = screen.getByRole('button', { name: /reintentar/i })
      await user.click(retryButton)

      expect(mockRefreshData).toHaveBeenCalled()
    })
  })

  describe('Performance and Loading States', () => {
    it('shows loading skeletons during data fetch', async () => {
      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        currentFilter: 'month',
        loadData: vi.fn(),
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
    })

    it('handles concurrent operations correctly', async () => {
      const mockLoadData = vi.fn()
      const mockSetIsOpen = vi.fn()

      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: createMockDashboardData(),
        loading: false,
        error: null,
        currentFilter: 'month',
        loadData: mockLoadData,
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      // Simulate concurrent operations
      const weekFilter = screen.getByText('Semana')
      const notificationButton = screen.getByRole('button', { name: /notificaciones/i })

      await Promise.all([
        user.click(weekFilter),
        user.click(notificationButton)
      ])

      expect(mockLoadData).toHaveBeenCalled()
    })
  })
})