import { LucideIcon } from 'lucide-react'

export interface WidgetConfig {
  id: string
  title: string
  description: string
  component?: string
  defaultVisible: boolean
  category: 'stats' | 'charts' | 'lists' | 'actions'
  icon?: LucideIcon
}

/**
 * Widget Registry - Central configuration for all dashboard widgets
 * 
 * Categories:
 * - stats: Statistical cards and KPIs
 * - charts: Data visualizations
 * - lists: List-based widgets (projects, deadlines, etc.)
 * - actions: Quick action buttons and forms
 */
export const WIDGET_REGISTRY: WidgetConfig[] = [
  // Stats Widgets
  {
    id: 'stats',
    title: 'Estadísticas Principales',
    description: 'Tarjetas con KPIs principales del negocio',
    component: 'DashboardStats',
    defaultVisible: true,
    category: 'stats'
  },
  {
    id: 'budget-utilization',
    title: 'Utilización del Presupuesto',
    description: 'Barra de progreso del presupuesto utilizado',
    component: 'BudgetUtilizationWidget',
    defaultVisible: true,
    category: 'stats'
  },
  {
    id: 'equipment-status',
    title: 'Estado de Equipos',
    description: 'Resumen de equipos disponibles y en mantenimiento',
    component: 'EquipmentWidget',
    defaultVisible: true,
    category: 'stats'
  },
  
  // Charts Widgets
  {
    id: 'charts',
    title: 'Gráficos Interactivos',
    description: 'Visualizaciones de datos con Recharts',
    component: 'DashboardCharts',
    defaultVisible: true,
    category: 'charts'
  },
  {
    id: 'budget-chart',
    title: 'Gráfico de Presupuesto',
    description: 'Tendencia de utilización del presupuesto',
    component: 'BudgetChart',
    defaultVisible: true,
    category: 'charts'
  },
  {
    id: 'progress-chart',
    title: 'Gráfico de Progreso',
    description: 'Progreso de proyectos activos',
    component: 'ProgressChart',
    defaultVisible: true,
    category: 'charts'
  },
  {
    id: 'team-performance-chart',
    title: 'Rendimiento del Equipo',
    description: 'Métricas de desempeño del personal',
    component: 'TeamPerformanceChart',
    defaultVisible: false,
    category: 'charts'
  },
  {
    id: 'expenses-chart',
    title: 'Gastos por Categoría',
    description: 'Distribución de gastos en gráfico circular',
    component: 'ExpensesChart',
    defaultVisible: true,
    category: 'charts'
  },
  
  // Lists Widgets
  {
    id: 'recent-projects',
    title: 'Proyectos Recientes',
    description: 'Lista de proyectos más recientes con progreso',
    component: 'RecentProjects',
    defaultVisible: true,
    category: 'lists'
  },
  {
    id: 'upcoming-deadlines',
    title: 'Próximos Vencimientos',
    description: 'Deadlines y fechas importantes próximas',
    component: 'UpcomingDeadlines',
    defaultVisible: true,
    category: 'lists'
  },
  {
    id: 'recent-activities',
    title: 'Actividades Recientes',
    description: 'Registro de actividades y cambios recientes',
    component: 'RecentActivities',
    defaultVisible: false,
    category: 'lists'
  },
  
  // Actions Widgets
  {
    id: 'quick-actions',
    title: 'Acciones Rápidas',
    description: 'Botones para operaciones frecuentes',
    component: 'QuickActions',
    defaultVisible: true,
    category: 'actions'
  },
  {
    id: 'financial-actions',
    title: 'Acciones Financieras',
    description: 'Registro rápido de ingresos y gastos',
    component: 'FinancialActions',
    defaultVisible: true,
    category: 'actions'
  }
]

/**
 * Get widget configuration by ID
 */
export function getWidgetConfig(widgetId: string): WidgetConfig | undefined {
  return WIDGET_REGISTRY.find(widget => widget.id === widgetId)
}

/**
 * Get all widgets by category
 */
export function getWidgetsByCategory(category: WidgetConfig['category']): WidgetConfig[] {
  return WIDGET_REGISTRY.filter(widget => widget.category === category)
}

/**
 * Get default visible widgets
 */
export function getDefaultVisibleWidgets(): WidgetConfig[] {
  return WIDGET_REGISTRY.filter(widget => widget.defaultVisible)
}

/**
 * Validate widget configuration
 */
export function isValidWidgetId(widgetId: string): boolean {
  return WIDGET_REGISTRY.some(widget => widget.id === widgetId)
}
