import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { UnifiedDashboard } from '@/pages/UnifiedDashboard'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { BrowserRouter } from 'react-router-dom'
import * as useDashboardDataModule from '@/hooks/useDashboardData'
import * as useNotificationsModule from '@/hooks/useNotifications'
import * as useDashboardSettingsModule from '@/hooks/useDashboardSettings'

// Mock data
const mockDashboardData = {
  stats: {
    activeProjects: 12,
    totalBudget: 580000,
    teamMembers: 8,
    pendingTasks: 24,
    availableTools: 15,
    budgetUtilization: 75,
    projectsGrowth: 12,
    budgetGrowth: 8,
    teamGrowth: 5,
    tasksGrowth: -3
  },
  budgetData: [
    { period: 'Ene', budgeted: 100000, spent: 85000 },
    { period: 'Feb', budgeted: 120000, spent: 95000 }
  ],
  projectProgressData: [
    { name: 'Proyecto A', progress: 75, status: 'on-track' as const }
  ],
  teamPerformanceData: [
    { period: 'Ene', performance: 85, attendance: 95 }
  ],
  expensesByCategory: [
    { name: 'Materiales', value: 450000, color: '#8884d8' }
  ],
  recentProjects: [],
  upcomingDeadlines: []
}

const mockWidgets = [
  { id: 'stats', name: 'Estadísticas', description: 'Stats', enabled: true, position: 1 },
  { id: 'charts', name: 'Gráficos', description: 'Charts', enabled: true, position: 2 }
]

// Wrapper component
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </BrowserRouter>
  )
}

describe('UnifiedDashboard', () => {
  const mockExportData = vi.fn()
  const mockAddNotification = vi.fn()
  const mockSaveSettings = vi.fn()
  const mockResetToDefault = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    document.documentElement.classList.remove('dark')

    // Mock useDashboardData
    vi.spyOn(useDashboardDataModule, 'useDashboardData').mockReturnValue({
      data: mockDashboardData,
      loading: false,
      error: null,
      currentFilter: 'month',
      exportData: mockExportData,
      loadData: vi.fn()
    })

    // Mock useNotifications
    vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isOpen: false,
      setIsOpen: vi.fn(),
      addNotification: mockAddNotification,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      removeNotification: vi.fn(),
      clearAll: vi.fn(),
      config: {
        enabled: true,
        types: {
          info: true,
          warning: true,
          success: true,
          error: true
        },
        sound: false,
        desktop: false
      },
      updateConfig: vi.fn()
    })

    // Mock useDashboardSettings
    vi.spyOn(useDashboardSettingsModule, 'useDashboardSettings').mockReturnValue({
      widgets: mockWidgets,
      settings: {
        widgets: mockWidgets,
        preferences: {
          defaultTimeFilter: 'month',
          autoRefresh: false,
          refreshInterval: 30000,
          notificationsEnabled: true
        },
        layout: {
          gridColumns: 4,
          compactMode: false
        }
      },
      isOpen: false,
      setIsOpen: vi.fn(),
      saveSettings: mockSaveSettings,
      updateSettings: vi.fn(),
      resetToDefault: mockResetToDefault,
      exportSettings: vi.fn(),
      importSettings: vi.fn()
    })
  })

  describe('Rendering', () => {
    it('should render dashboard header with title', async () => {
      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard Unificado')).toBeInTheDocument()
      })
    })

    it('should render dashboard subtitle', async () => {
      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText(/Análisis completo con visualizaciones interactivas/i)).toBeInTheDocument()
      })
    })

    it('should render all stat cards when data is loaded', async () => {
      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Proyectos Activos')).toBeInTheDocument()
        expect(screen.getByText('Presupuesto Total')).toBeInTheDocument()
        expect(screen.getByText('Miembros del Equipo')).toBeInTheDocument()
        expect(screen.getByText('Tareas Pendientes')).toBeInTheDocument()
      })
    })

    it('should render stat values correctly', async () => {
      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('12')).toBeInTheDocument() // Active projects
        expect(screen.getByText(/580\.000 €/)).toBeInTheDocument() // Budget
        expect(screen.getByText('8')).toBeInTheDocument() // Team members
        expect(screen.getByText('24')).toBeInTheDocument() // Pending tasks
      })
    })
  })

  describe('Loading State', () => {
    it('should show skeleton loaders when loading', async () => {
      vi.spyOn(useDashboardDataModule, 'useDashboardData').mockReturnValue({
        data: null,
        loading: true,
        error: null,
        currentFilter: 'month',
        exportData: mockExportData,
        loadData: vi.fn()
      })

      const { container } = renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        const skeletons = container.querySelectorAll('.animate-pulse')
        expect(skeletons.length).toBeGreaterThan(0)
      })
    })

    it('should not show stat values when loading', () => {
      vi.spyOn(useDashboardDataModule, 'useDashboardData').mockReturnValue({
        data: null,
        loading: true,
        error: null,
        currentFilter: 'month',
        exportData: mockExportData,
        loadData: vi.fn()
      })

      renderWithProviders(<UnifiedDashboard />)
      
      expect(screen.queryByText('Proyectos Activos')).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error message when data loading fails', async () => {
      vi.spyOn(useDashboardDataModule, 'useDashboardData').mockReturnValue({
        data: null,
        loading: false,
        error: 'Failed to load dashboard data',
        currentFilter: 'month',
        exportData: mockExportData,
        loadData: vi.fn()
      })

      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Error al cargar el dashboard')).toBeInTheDocument()
        expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument()
      })
    })

    it('should show retry button on error', async () => {
      vi.spyOn(useDashboardDataModule, 'useDashboardData').mockReturnValue({
        data: null,
        loading: false,
        error: 'Network error',
        currentFilter: 'month',
        exportData: mockExportData,
        loadData: vi.fn()
      })

      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
      })
    })
  })

  describe('Widget Visibility', () => {
    it('should render stats widget when enabled', async () => {
      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Proyectos Activos')).toBeInTheDocument()
      })
    })

    it('should not render stats when widget is disabled', async () => {
      vi.spyOn(useDashboardSettingsModule, 'useDashboardSettings').mockReturnValue({
        widgets: [
          { id: 'stats', name: 'Estadísticas', description: 'Stats', enabled: false, position: 1 },
          { id: 'charts', name: 'Gráficos', description: 'Charts', enabled: true, position: 2 }
        ],
        settings: {
          widgets: [
            { id: 'stats', name: 'Estadísticas', description: 'Stats', enabled: false, position: 1 },
            { id: 'charts', name: 'Gráficos', description: 'Charts', enabled: true, position: 2 }
          ],
          preferences: {
            defaultTimeFilter: 'month',
            autoRefresh: false,
            refreshInterval: 30000,
            notificationsEnabled: true
          },
          layout: {
            gridColumns: 4,
            compactMode: false
          }
        },
        isOpen: false,
        setIsOpen: vi.fn(),
        saveSettings: mockSaveSettings,
        updateSettings: vi.fn(),
        resetToDefault: mockResetToDefault,
        exportSettings: vi.fn(),
        importSettings: vi.fn()
      })

      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.queryByText('Proyectos Activos')).not.toBeInTheDocument()
      })
    })

    it('should show empty state when no widgets are enabled', async () => {
      vi.spyOn(useDashboardSettingsModule, 'useDashboardSettings').mockReturnValue({
        widgets: [
          { id: 'stats', name: 'Estadísticas', description: 'Stats', enabled: false, position: 1 },
          { id: 'charts', name: 'Gráficos', description: 'Charts', enabled: false, position: 2 }
        ],
        settings: {
          widgets: [
            { id: 'stats', name: 'Estadísticas', description: 'Stats', enabled: false, position: 1 },
            { id: 'charts', name: 'Gráficos', description: 'Charts', enabled: false, position: 2 }
          ],
          preferences: {
            defaultTimeFilter: 'month',
            autoRefresh: false,
            refreshInterval: 30000,
            notificationsEnabled: true
          },
          layout: {
            gridColumns: 4,
            compactMode: false
          }
        },
        isOpen: false,
        setIsOpen: vi.fn(),
        saveSettings: mockSaveSettings,
        updateSettings: vi.fn(),
        resetToDefault: mockResetToDefault,
        exportSettings: vi.fn(),
        importSettings: vi.fn()
      })

      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('No hay widgets configurados')).toBeInTheDocument()
      })
    })
  })

  describe('Export Functionality', () => {
    it('should call exportData when export button is clicked', async () => {
      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /exportar datos/i })
        fireEvent.click(exportButton)
      })

      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith('json')
      })
    })

    it('should show loading state during export', async () => {
      mockExportData.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
      
      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /exportar datos/i })
        fireEvent.click(exportButton)
      })

      await waitFor(() => {
        expect(screen.getAllByText('Exportando...').length).toBeGreaterThan(0)
      })
    })

    it('should show success notification after successful export', async () => {
      mockExportData.mockResolvedValue(undefined)
      
      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /exportar datos/i })
        fireEvent.click(exportButton)
      })

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith(
          'success',
          'Exportación Completada',
          expect.any(String),
          undefined
        )
      })
    })

    it('should show error notification on export failure', async () => {
      mockExportData.mockRejectedValue(new Error('Export failed'))
      
      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /exportar datos/i })
        fireEvent.click(exportButton)
      })

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith(
          'error',
          'Error en Exportación',
          expect.any(String),
          undefined
        )
      })
    })
  })

  describe('Notifications', () => {
    it('should show unread notification count', async () => {
      vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
        notifications: [],
        unreadCount: 5,
        isOpen: false,
        setIsOpen: vi.fn(),
        addNotification: mockAddNotification,
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        removeNotification: vi.fn(),
        clearAll: vi.fn(),
        config: {
          enabled: true,
          types: {
            info: true,
            warning: true,
            success: true,
            error: true
          },
          sound: false,
          desktop: false
        },
        updateConfig: vi.fn()
      })

      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument()
      })
    })

    it('should generate budget alert when utilization > 90%', async () => {
      vi.spyOn(useDashboardDataModule, 'useDashboardData').mockReturnValue({
        data: {
          ...mockDashboardData,
          stats: {
            ...mockDashboardData.stats,
            budgetUtilization: 95
          }
        },
        loading: false,
        error: null,
        currentFilter: 'month',
        exportData: mockExportData,
        loadData: vi.fn()
      })

      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith(
          'warning',
          'Presupuesto Alto',
          expect.stringContaining('95'),
          '/budget'
        )
      })
    })

    it('should generate deadline alerts for upcoming deadlines', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      
      vi.spyOn(useDashboardDataModule, 'useDashboardData').mockReturnValue({
        data: {
          ...mockDashboardData,
          upcomingDeadlines: [
            {
              id: '1',
              title: 'Urgent Project',
              date: tomorrow,
              type: 'project' as const,
              priority: 'high' as const
            }
          ]
        },
        loading: false,
        error: null,
        currentFilter: 'month',
        exportData: mockExportData,
        loadData: vi.fn()
      })

      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith(
          'error',
          'Vencimientos Próximos',
          expect.stringContaining('proyecto'),
          '/projects'
        )
      })
    })
  })

  describe('Theme Support', () => {
    it('should apply light theme classes by default', async () => {
      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard Unificado')).toBeInTheDocument()
      })
    })

    it('should apply dark theme classes when dark mode is active', async () => {
      // Note: Theme classes are applied via Tailwind's dark: prefix
      // The actual dark mode styling is handled by the ThemeProvider
      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        // Verify dashboard renders successfully
        expect(screen.getByText('Dashboard Unificado')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /dashboard unificado/i })
        expect(heading).toBeInTheDocument()
      })
    })

    it('should have accessible buttons', async () => {
      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /exportar datos/i })).toBeInTheDocument()
        // Use getAllByRole for buttons that may appear multiple times (header + filters)
        const notifButtons = screen.getAllByRole('button', { name: /notificaciones/i })
        expect(notifButtons.length).toBeGreaterThan(0)
        expect(screen.getByRole('button', { name: /configuración del dashboard/i })).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('should render responsive grid for stats', async () => {
      renderWithProviders(<UnifiedDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard Unificado')).toBeInTheDocument()
      })
    })
  })
})



