import { useState, useCallback, useEffect } from 'react'
import { Calendar, TrendingUp, Users, AlertCircle, Wrench } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useNotifications } from '@/hooks/useNotifications'
import { useDashboardSettings } from '@/hooks/useDashboardSettings'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { DashboardStats, StatCardData } from '@/components/dashboard/DashboardStats'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { NotificationCenter } from '@/components/dashboard/NotificationCenter'
import { DashboardSettingsLazy } from '@/components/dashboard/DashboardSettingsLazy'
import { ChartErrorBoundary } from '@/components/dashboard/ChartErrorBoundary'
import { TimeFilter, DateRange } from '@/types/dashboard'
import { cn } from '@/lib/utils'

/**
 * UnifiedDashboard - Main dashboard component combining best features from both dashboards
 * 
 * Features:
 * - Dark mode support
 * - Real-time notifications
 * - Configurable widgets
 * - Auto-refresh
 * - Data export
 * - Responsive design
 * - Skeleton loaders
 * - Error boundaries
 */
export function UnifiedDashboard() {
  const { isDarkMode } = useDarkMode()
  
  // Local state
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month')
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [isExporting, setIsExporting] = useState(false)

  // Custom hooks
  const { data, loading, error, exportData } = useDashboardData(timeFilter, dateRange, {
    autoRefresh: true,
    refreshInterval: 30000
  })

  const {
    notifications,
    unreadCount,
    isOpen: notificationsOpen,
    setIsOpen: setNotificationsOpen,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addNotification,
    config: notificationConfig,
    updateConfig: updateNotificationConfig
  } = useNotifications({
    enableRealTime: true,
    enableSound: false,
    enableDesktop: false,
    maxNotifications: 50
  })

  const {
    widgets,
    isOpen: settingsOpen,
    setIsOpen: setSettingsOpen,
    saveSettings,
    resetToDefault
  } = useDashboardSettings()

  // Check for alerts and generate notifications
  useEffect(() => {
    if (!data) return

    // Budget alert
    if (data.stats.budgetUtilization > 90) {
      addNotification(
        'warning',
        'Presupuesto Alto',
        `Utilización del presupuesto: ${data.stats.budgetUtilization.toFixed(1)}%`,
        '/budget'
      )
    }

    // Deadline alerts
    const urgentDeadlines = data.upcomingDeadlines?.filter(d => {
      const daysLeft = Math.ceil((new Date(d.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysLeft <= 3 && daysLeft >= 0
    })

    if (urgentDeadlines && urgentDeadlines.length > 0) {
      addNotification(
        'error',
        'Vencimientos Próximos',
        `Hay ${urgentDeadlines.length} proyecto(s) que vencen en los próximos 3 días`,
        '/projects'
      )
    }
  }, [data, addNotification])

  // Handlers
  const handleExport = useCallback(async () => {
    if (!data) return

    setIsExporting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      await exportData('json')
      
      addNotification(
        'success',
        'Exportación Completada',
        'Los datos del dashboard se han exportado exitosamente.',
        undefined
      )
    } catch (error) {
      console.error('Export failed:', error)
      
      addNotification(
        'error',
        'Error en Exportación',
        'No se pudieron exportar los datos. Por favor, inténtalo de nuevo.',
        undefined
      )
    } finally {
      setIsExporting(false)
    }
  }, [data, exportData, addNotification])

  const handleToggleNotifications = useCallback(() => {
    setNotificationsOpen(true)
  }, [setNotificationsOpen])

  const handleChartInteraction = useCallback((interactionData: any) => {
    console.log('Chart interaction:', interactionData)
    // Future: Implement navigation or specific actions
  }, [])

  // Prepare stats data
  const statsData: StatCardData[] = data ? [
    {
      title: 'Proyectos Activos',
      value: data.stats.activeProjects,
      icon: Calendar,
      trend: data.stats.projectsGrowth,
      color: 'blue',
      format: 'number'
    },
    {
      title: 'Presupuesto Total',
      value: data.stats.totalBudget,
      icon: TrendingUp,
      trend: data.stats.budgetGrowth,
      color: 'green',
      format: 'currency'
    },
    {
      title: 'Miembros del Equipo',
      value: data.stats.teamMembers,
      icon: Users,
      trend: data.stats.teamGrowth,
      color: 'purple',
      format: 'number'
    },
    {
      title: 'Tareas Pendientes',
      value: data.stats.pendingTasks,
      icon: AlertCircle,
      trend: data.stats.tasksGrowth,
      color: 'orange',
      format: 'number'
    }
  ] : []

  // Check widget visibility
  const isWidgetVisible = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId)
    return widget?.enabled ?? true
  }

  // Error state
  if (error) {
    return (
      <div className={cn(
        'min-h-screen flex items-center justify-center',
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      )}>
        <div className="text-center py-12">
          <AlertCircle className={cn(
            'w-12 h-12 mx-auto mb-4',
            isDarkMode ? 'text-red-400' : 'text-red-500'
          )} />
          <h3 className={cn(
            'text-lg font-medium mb-2',
            isDarkMode ? 'text-white' : 'text-gray-900'
          )}>
            Error al cargar el dashboard
          </h3>
          <p className={cn(
            'mb-4',
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          )}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const enabledWidgets = widgets
    .filter(widget => widget.enabled)
    .sort((a, b) => a.position - b.position)

  return (
    <ChartErrorBoundary 
      chartType="unified-dashboard"
      onError={(error, errorInfo) => {
        console.error('Dashboard Error:', error, errorInfo)
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <DashboardHeader
          title="Dashboard Unificado"
          subtitle="Análisis completo con visualizaciones interactivas y notificaciones en tiempo real"
          onExport={handleExport}
          onOpenSettings={() => setSettingsOpen(true)}
          onToggleNotifications={handleToggleNotifications}
          isExporting={isExporting}
          notificationsEnabled={notificationConfig.enabled}
          unreadCount={unreadCount}
        />

        {/* Filters */}
        <DashboardFilters
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onExport={handleExport}
          onToggleNotifications={handleToggleNotifications}
          onOpenSettings={() => setSettingsOpen(true)}
          notificationsEnabled={notificationConfig.enabled}
          isExporting={isExporting}
        />

        {/* Stats Cards */}
        {isWidgetVisible('stats') && (
          <DashboardStats
            stats={statsData}
            loading={loading}
            isVisible={true}
          />
        )}

        {/* Charts */}
        {isWidgetVisible('charts') && data && (
          <DashboardCharts
            budgetData={data.budgetData}
            projectProgressData={data.projectProgressData}
            teamPerformanceData={data.teamPerformanceData}
            expensesByCategory={data.expensesByCategory}
            timeFilter={timeFilter}
            onChartInteraction={handleChartInteraction}
            loading={loading}
          />
        )}

        {/* Additional widgets can be added here based on configuration */}
        {enabledWidgets.length === 0 && !loading && (
          <div className={cn(
            'text-center py-12 rounded-lg border',
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          )}>
            <Wrench className={cn(
              'w-12 h-12 mx-auto mb-4',
              isDarkMode ? 'text-gray-600' : 'text-gray-300'
            )} />
            <h3 className={cn(
              'text-lg font-medium mb-2',
              isDarkMode ? 'text-white' : 'text-gray-900'
            )}>
              No hay widgets configurados
            </h3>
            <p className={cn(
              'mb-4',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )}>
              Configura tu dashboard para mostrar la información que necesitas
            </p>
            <button
              onClick={() => setSettingsOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Configurar Dashboard
            </button>
          </div>
        )}

        {/* Modals */}
        <NotificationCenter
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onRemoveNotification={removeNotification}
        />

        <DashboardSettingsLazy
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          widgets={widgets}
          onSaveSettings={saveSettings}
          onResetToDefault={resetToDefault}
        />
      </div>
    </ChartErrorBoundary>
  )
}
