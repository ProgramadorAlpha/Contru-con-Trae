import type { DashboardData, DashboardWidget } from '@/types/dashboard'

export const mockDashboardData: DashboardData = {
  stats: {
    activeProjects: 12,
    totalBudget: 100000,
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
    { period: 'Enero', budgeted: 10000, spent: 8500 },
    { period: 'Febrero', budgeted: 12000, spent: 9200 },
    { period: 'Marzo', budgeted: 11000, spent: 10100 }
  ],
  projectProgressData: [
    { name: 'Proyecto A', progress: 85, status: 'on-track' as const },
    { name: 'Proyecto B', progress: 60, status: 'delayed' as const },
    { name: 'Proyecto C', progress: 40, status: 'on-track' as const }
  ],
  teamPerformanceData: [
    { period: 'Enero', performance: 85, attendance: 95 },
    { period: 'Febrero', performance: 89, attendance: 92 },
    { period: 'Marzo', performance: 92, attendance: 98 }
  ],
  expensesByCategory: [
    { name: 'Personal', value: 45000, color: '#8884d8' },
    { name: 'Tecnología', value: 18000, color: '#82ca9d' },
    { name: 'Marketing', value: 12000, color: '#ffc658' }
  ],
  recentProjects: [
    {
      id: '1',
      name: 'Proyecto Alpha',
      client: 'Cliente A',
      progress: 75,
      status: 'En progreso',
      deadline: '2024-12-31',
      budget: 50000
    }
  ],
  upcomingDeadlines: [
    {
      id: '1',
      title: 'Entrega Proyecto Alpha',
      date: '2024-12-31',
      type: 'project' as const,
      priority: 'high' as const
    }
  ]
}

export const mockWidgets: DashboardWidget[] = [
  { id: 'stats', name: 'Estadísticas', description: 'Estadísticas generales', enabled: true, position: 1 },
  { id: 'charts', name: 'Gráficos', description: 'Gráficos interactivos', enabled: true, position: 2 },
  { id: 'notifications', name: 'Notificaciones', description: 'Centro de notificaciones', enabled: false, position: 3 }
]

export const mockSettings = {
  widgets: mockWidgets,
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
}