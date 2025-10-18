import React, { useState, useCallback } from 'react'
import { AlertCircle, TrendingUp, Users, Calendar, Wrench, DollarSign } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useNotifications } from '@/hooks/useNotifications'
import { useDashboardSettings } from '@/hooks/useDashboardSettings'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { NotificationCenter } from '@/components/dashboard/NotificationCenter'
import { DashboardSettingsLazy } from '@/components/dashboard/DashboardSettingsLazy'
import { ChartErrorBoundary } from '@/components/dashboard/ChartErrorBoundary'
import { ProfitabilityWidget } from '@/components/financials/ProfitabilityWidget'
import { CommittedCostWidget } from '@/components/financials/CommittedCostWidget'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { 
  StatsCardSkeleton, 
  ChartSkeleton, 
  ListItemSkeleton
} from '@/components/dashboard/LoadingSkeletons'
import { TimeFilter, DateRange } from '@/types/dashboard'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/chartUtils'

export function EnhancedDashboard() {
  // Hook de modo oscuro (activado por defecto)
  const { isDarkMode } = useDarkMode()
  
  // Estados para filtros temporales
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month')
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [isExporting, setIsExporting] = useState(false)

  // Hooks personalizados
  const { data, loading, error, exportData } = useDashboardData(timeFilter, dateRange, {
    autoRefresh: false, // Disabled to prevent automatic page refreshes
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

  // Handlers
  const handleExport = useCallback(async () => {
    if (!data) return

    setIsExporting(true)
    try {
      // Simulate export progress for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      await exportData('json')
      
      // Add success notification
      addNotification(
        'success',
        'Exportación Completada',
        'Los datos del dashboard se han exportado exitosamente.',
        undefined
      )
    } catch (error) {
      console.error('Export failed:', error)
      
      // Add error notification
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
    const newEnabled = !notificationConfig.enabled
    updateNotificationConfig({ enabled: newEnabled })
    
    if (newEnabled) {
      setNotificationsOpen(true)
    }
  }, [notificationConfig.enabled, updateNotificationConfig, setNotificationsOpen])

  const handleChartInteraction = useCallback((interactionData: any) => {
    console.log('Chart interaction:', interactionData)
    // Aquí se podría implementar navegación o acciones específicas
  }, [])

  // Función para renderizar widgets según configuración
  const renderWidget = (widgetId: string) => {
    if (!data) return null

    switch (widgetId) {
      case 'stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loading || !data ? (
              Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))
            ) : (
              <>
                <StatsCard
                  title="Proyectos Activos"
                  value={data.stats.activeProjects}
                  icon={<Calendar className="w-6 h-6" />}
                  trend={data.stats.projectsGrowth}
                  color="blue"
                />
                <StatsCard
                  title="Presupuesto Total"
                  value={data.stats.totalBudget}
                  icon={<TrendingUp className="w-6 h-6" />}
                  trend={data.stats.budgetGrowth}
                  color="green"
                  format="currency"
                />
                <StatsCard
                  title="Miembros del Equipo"
                  value={data.stats.teamMembers}
                  icon={<Users className="w-6 h-6" />}
                  trend={data.stats.teamGrowth}
                  color="purple"
                />
                <StatsCard
                  title="Tareas Pendientes"
                  value={data.stats.pendingTasks}
                  icon={<AlertCircle className="w-6 h-6" />}
                  trend={data.stats.tasksGrowth}
                  color="orange"
                />
              </>
            )}
          </div>
        )
      
      case 'charts':
        return (
          <div className="mb-8">
            {loading || !data ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ChartSkeleton key={i} />
                ))}
              </div>
            ) : (
              <DashboardCharts
                budgetData={data.budgetData}
                projectProgressData={data.projectProgressData}
                teamPerformanceData={data.teamPerformanceData}
                expensesByCategory={data.expensesByCategory}
                timeFilter={timeFilter}
                onChartInteraction={handleChartInteraction}
              />
            )}
          </div>
        )
      
      case 'recent-projects':
        return (
          <div className="mb-8">
            <RecentProjects projects={data?.recentProjects || []} loading={loading || !data} />
          </div>
        )
      
      case 'upcoming-deadlines':
        return (
          <div className="mb-8">
            <UpcomingDeadlines deadlines={data?.upcomingDeadlines || []} loading={loading || !data} />
          </div>
        )
      
      case 'quick-actions':
        // Quick actions are now always visible at the top, skip rendering here
        return null
      
      case 'team-performance':
        if (!data) return null
        return (
          <div className="mb-8">
            <TeamPerformanceWidget data={data.teamPerformanceData} stats={data.stats} />
          </div>
        )
      
      case 'job-costing':
        return (
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProfitabilityWidget
                totalBudget={data?.stats?.totalBudget || 0}
                actualCost={data?.stats?.totalBudget ? data.stats.totalBudget * 0.65 : 0}
                forecastedFinalCost={data?.stats?.totalBudget ? data.stats.totalBudget * 0.85 : 0}
              />
              <CommittedCostWidget
                committedCost={data?.stats?.totalBudget ? data.stats.totalBudget * 0.45 : 0}
                totalBudget={data?.stats?.totalBudget || 0}
                subcontracts={[]}
              />
            </div>
          </div>
        )
      
      case 'budget-alerts':
        return (
          <div className="mb-8">
            <BudgetAlerts />
          </div>
        )
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <main role="main" className="animate-fade-in">
        <DashboardSkeleton />
      </main>
    )
  }

  if (error) {
    return <main role="main"><DashboardError error={error} onRetry={() => window.location.reload()} /></main>
  }

  if (!data) {
    return (
      <main role="main" className="animate-fade-in">
        <DashboardSkeleton />
      </main>
    )
  }

  const enabledWidgets = widgets
    .filter(widget => widget.enabled)
    .sort((a, b) => a.position - b.position)

  return (
    <main role="main">
    <ChartErrorBoundary 
      chartType="enhanced-dashboard"
      onError={(error, errorInfo) => {
        // Log dashboard-level errors
        console.error('Dashboard Error:', error, errorInfo)
        // In production, send to error monitoring service
      }}
    >
      <main role="main" className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-4">
          <div className="sm:text-left text-center sm:w-auto w-full">
            <h1 className={cn(
              "text-3xl font-bold sm:text-3xl text-2xl",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              Dashboard
            </h1>
            <p className={cn(
              "mt-1 sm:text-base text-sm",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>
              Análisis completo con visualizaciones interactivas y notificaciones en tiempo real
            </p>
          </div>
          
          {/* 
            Nota: Los botones de modo oscuro y notificaciones están disponibles 
            en el header principal de la aplicación. No se duplican aquí para 
            mantener una interfaz limpia y evitar confusión.
          */}
        </div>

        {/* Acciones Rápidas - Siempre visible en la parte superior */}
        <QuickActions 
          onActionComplete={(action) => {
            console.log('Quick action completed:', action)
            // Future: Refresh dashboard data based on action
          }}
        />

        {/* Filtros y controles */}
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

        {/* Widgets configurables */}
        <div>
          {enabledWidgets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay widgets configurados
              </h3>
              <p className="text-gray-500 mb-4">
                Configura tu dashboard para mostrar la información que necesitas
              </p>
              <button
                onClick={() => setSettingsOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Configurar Dashboard
              </button>
            </div>
          ) : (
            enabledWidgets.map(widget => (
              <div key={widget.id}>
                {renderWidget(widget.id)}
              </div>
            ))
          )}
        </div>

        {/* Modales */}
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
      </main>
    </ChartErrorBoundary>
    </main>
  )
}

// Componentes auxiliares
function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  color, 
  format 
}: {
  title: string
  value: number
  icon: React.ReactNode
  trend?: number
  color: 'blue' | 'green' | 'purple' | 'orange'
  format?: 'currency' | 'number'
}) {
  const formatValue = (val: number) => {
    if (format === 'currency') {
      return formatCurrency(val)
    }
    return val.toLocaleString()
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600'
      case 'green': return 'bg-green-100 text-green-600'
      case 'purple': return 'bg-purple-100 text-purple-600'
      case 'orange': return 'bg-orange-100 text-orange-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatValue(value)}</p>
          {trend !== undefined && (
            <p className={cn(
              'text-sm mt-1 flex items-center',
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              <span className="mr-1">{trend >= 0 ? '↗' : '↘'}</span>
              {Math.abs(trend)}% vs mes anterior
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-3', getColorClasses(color))}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function RecentProjects({ projects, loading = false }: { projects: any[], loading?: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Proyectos Recientes</h3>
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <ListItemSkeleton key={i} showProgress />
          ))
        ) : (
          projects?.slice(0, 5).map((project, index) => (
            <div key={index} className="flex items-center justify-between animate-fade-in">
              <div>
                <h4 className="font-medium text-gray-900">{project.name}</h4>
                <p className="text-sm text-gray-500">{project.client}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{project.progress}%</div>
                <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function UpcomingDeadlines({ deadlines, loading = false }: { deadlines: any[], loading?: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Vencimientos</h3>
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
              </div>
            </div>
          ))
        ) : (
          deadlines?.slice(0, 5).map((deadline, index) => (
            <div key={index} className="flex items-center space-x-3 animate-fade-in">
              <div className={cn(
                'w-2 h-2 rounded-full',
                deadline.priority === 'high' ? 'bg-red-500' :
                deadline.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              )} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                <p className="text-xs text-gray-500">{deadline.date}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}



function TeamPerformanceWidget({ data, stats }: { data: any[], stats: any }) {
  const latestPerformance = data[data.length - 1]
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Métricas del Equipo
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {latestPerformance?.performance || 0}%
          </div>
          <div className="text-sm text-gray-500">Rendimiento Actual</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {latestPerformance?.attendance || 0}%
          </div>
          <div className="text-sm text-gray-500">Asistencia</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {stats.teamMembers}
          </div>
          <div className="text-sm text-gray-500">Miembros Activos</div>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      </div>
      
      <div className="bg-gray-200 rounded-lg h-20"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
        ))}
      </div>
    </div>
  )
}

function DashboardError({ error, onRetry }: { error: string, onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Error al cargar el dashboard
      </h3>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Reintentar
      </button>
    </div>
  )
}

function
 BudgetAlerts() {
  // Mock alerts - in real app would come from financial service
  const alerts = [
    {
      id: '1',
      type: 'warning',
      title: 'Proyecto cerca del límite presupuestario',
      message: 'El Proyecto Demo 1 ha utilizado el 92% de su presupuesto',
      project: 'Proyecto Demo 1'
    },
    {
      id: '2',
      type: 'info',
      title: 'Certificado pendiente de aprobación',
      message: '3 certificados de progreso esperan aprobación',
      project: 'Varios'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Alertas Presupuestarias</h3>
        <AlertCircle className="w-5 h-5 text-yellow-600" />
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'p-4 rounded-lg border',
              alert.type === 'warning'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200'
            )}
          >
            <div className="flex items-start gap-3">
              {alert.type === 'warning' ? (
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              ) : (
                <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={cn(
                  'text-sm font-semibold mb-1',
                  alert.type === 'warning' ? 'text-yellow-900' : 'text-blue-900'
                )}>
                  {alert.title}
                </h4>
                <p className={cn(
                  'text-sm',
                  alert.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'
                )}>
                  {alert.message}
                </p>
                <p className="text-xs text-gray-600 mt-1">Proyecto: {alert.project}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
