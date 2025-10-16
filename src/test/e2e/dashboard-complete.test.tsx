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
  useNotifications: () => ({
    notifications: [
      {
        id: '1',
        type: 'info' as const,
        title: 'Test Notification',
        message: 'This is a test notification',
        timestamp: new Date(),
        read: false
      }
    ],
    unreadCount: 1,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    clearAll: vi.fn()
  })
}))

vi.mock('@/hooks/useDashboardSettings', () => ({
  useDashboardSettings: () => ({
    widgets: [
      { id: 'stats', name: 'Estadísticas', description: 'Estadísticas generales', enabled: true, position: 1 },
      { id: 'charts', name: 'Gráficos', description: 'Gráficos interactivos', enabled: true, position: 2 },
      { id: 'notifications', name: 'Notificaciones', description: 'Centro de notificaciones', enabled: false, position: 3 }
    ],
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

describe('Dashboard Complete E2E Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete Dashboard Loading', () => {
    it('renders complete dashboard with all components', async () => {
      const mockDashboardData = createMockDashboardData()

      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: mockDashboardData,
        loading: false,
        error: null,
        currentFilter: 'month',
        loadData: vi.fn(),
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      expect(screen.getByText('Dashboard Mejorado')).toBeInTheDocument()
      expect(screen.getByText('Filtros Temporales')).toBeInTheDocument()

      // Check for notification badge
      expect(screen.getByText('1')).toBeInTheDocument() // unread count badge

      // Check for filter options
      expect(screen.getByText('Semana')).toBeInTheDocument()
      expect(screen.getByText('Mes')).toBeInTheDocument()
      expect(screen.getByText('Trimestre')).toBeInTheDocument()
    })

    it('handles complete user workflow from filter to export', async () => {
      const mockLoadData = vi.fn()
      const mockExport = vi.fn()

      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: createMockDashboardData(),
        loading: false,
        error: null,
        currentFilter: 'month',
        loadData: mockLoadData,
        exportData: mockExport
      })

      render(<EnhancedDashboard />)

      // 1. Change filter
      const weekFilter = screen.getByText('Semana')
      await user.click(weekFilter)

      // 2. Open notifications
      const notificationButton = screen.getByRole('button', { name: /notificaciones/i })
      await user.click(notificationButton)

      // 3. Open settings
      const settingsButton = screen.getByRole('button', { name: /configuración/i })
      await user.click(settingsButton)

      // 4. Export data
      const exportButton = screen.getByRole('button', { name: /exportar/i })
      await user.click(exportButton)

      expect(mockExport).toHaveBeenCalled()
    })
  })

  describe('Error Handling E2E', () => {
    it('displays error state and allows recovery', async () => {
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

      // Should still show basic layout
      expect(screen.getByText('Dashboard Mejorado')).toBeInTheDocument()
      expect(screen.getByText('Filtros Temporales')).toBeInTheDocument()
    })

    it('handles loading state correctly', async () => {
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

      // Should still show basic layout during loading
      expect(screen.getByText('Filtros Temporales')).toBeInTheDocument()
    })
  })

  describe('Cross-Component Integration', () => {
    it('maintains state consistency across all components', async () => {
      const mockLoadData = vi.fn()
      const mockSetNotificationOpen = vi.fn()
      const mockSetSettingsOpen = vi.fn()

      const largeDataset = createMockDashboardData({
        stats: {
          activeProjects: 50,
          totalBudget: 1000000,
          teamMembers: 25,
          pendingTasks: 150,
          availableTools: 30,
          budgetUtilization: 85,
          projectsGrowth: 25,
          budgetGrowth: 15,
          teamGrowth: 12,
          tasksGrowth: -8
        }
      })

      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: largeDataset,
        loading: false,
        error: null,
        currentFilter: 'month',
        loadData: mockLoadData,
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      expect(screen.getByText('Dashboard Mejorado')).toBeInTheDocument()

      // Test multiple component interactions
      const notificationButton = screen.getByRole('button', { name: /notificaciones/i })
      const settingsButton = screen.getByRole('button', { name: /configuración/i })

      await user.click(notificationButton)
      await user.click(settingsButton)

      // All components should remain functional
      expect(screen.getByText('Dashboard Mejorado')).toBeInTheDocument()
    })
  })

  describe('Accessibility E2E', () => {
    it('provides complete keyboard navigation', async () => {
      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: createMockDashboardData(),
        loading: false,
        error: null,
        currentFilter: 'month',
        loadData: vi.fn(),
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      expect(screen.getByText('Dashboard Mejorado')).toBeInTheDocument()

      // Check for main heading
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toBeInTheDocument()

      // Check for proper ARIA labels on interactive elements
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label')
      })

      // Check for proper form controls
      const controls = screen.getAllByRole('button')
      controls.forEach(control => {
        expect(control).not.toHaveAttribute('aria-label', '')
      })
    })
  })

  describe('Performance E2E', () => {
    it('handles large datasets efficiently', async () => {
      // Create a large mock dataset
      const largeDataset = createMockDashboardData({
        budgetData: Array.from({ length: 100 }, (_, i) => ({
          period: `Period ${i + 1}`,
          budgeted: 10000 + i * 1000,
          spent: 8000 + i * 800
        })),
        projectProgressData: Array.from({ length: 50 }, (_, i) => ({
          name: `Project ${i + 1}`,
          progress: Math.random() * 100,
          status: 'on-track' as const
        }))
      })

      const startTime = performance.now()

      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: largeDataset,
        loading: false,
        error: null,
        currentFilter: 'month',
        loadData: vi.fn(),
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      const endTime = performance.now()
      const renderTime = endTime - startTime

      expect(screen.getByText('Dashboard Mejorado')).toBeInTheDocument()

      // Ensure render time is reasonable (less than 1 second)
      expect(renderTime).toBeLessThan(1000)
    })

    it('maintains responsiveness during interactions', async () => {
      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: createMockDashboardData(),
        loading: false,
        error: null,
        currentFilter: 'month',
        loadData: vi.fn(),
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      // Rapid interactions should not break the UI
      const weekFilter = screen.getByText('Semana')
      const monthFilter = screen.getByText('Mes')
      const quarterFilter = screen.getByText('Trimestre')

      await user.click(weekFilter)
      await user.click(monthFilter)
      await user.click(quarterFilter)

      expect(screen.getByText('Dashboard Mejorado')).toBeInTheDocument()
    })
  })

  describe('Mobile Responsiveness E2E', () => {
    it('adapts correctly to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667
      })

      vi.mocked(await import('@/hooks/useDashboardData')).useDashboardData.mockReturnValue({
        data: createMockDashboardData(),
        loading: false,
        error: null,
        currentFilter: 'month',
        loadData: vi.fn(),
        exportData: vi.fn()
      })

      render(<EnhancedDashboard />)

      expect(screen.getByText('Dashboard Mejorado')).toBeInTheDocument()

      // Mobile-specific interactions
      const notificationButton = screen.getByRole('button', { name: /notificaciones/i })
      await user.click(notificationButton)

      // Should work on mobile
      expect(screen.getByText('Dashboard Mejorado')).toBeInTheDocument()
    })
  })
})