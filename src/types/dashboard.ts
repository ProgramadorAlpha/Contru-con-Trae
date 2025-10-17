export interface DashboardData {
  stats: {
    activeProjects: number
    totalBudget: number
    teamMembers: number
    pendingTasks: number
    availableTools: number
    budgetUtilization: number
    projectsGrowth: number
    budgetGrowth: number
    teamGrowth: number
    tasksGrowth: number
  }
  budgetData: BudgetDataPoint[]
  projectProgressData: ProjectProgressData[]
  teamPerformanceData: TeamPerformanceData[]
  expensesByCategory: ExpenseCategory[]
  recentProjects: Project[]
  upcomingDeadlines: Deadline[]
}

export interface BudgetDataPoint {
  period: string
  budgeted: number
  spent: number
}

export interface ProjectProgressData {
  name: string
  progress: number
  status: 'on-track' | 'delayed' | 'completed'
}

export interface TeamPerformanceData {
  period: string
  performance: number
  attendance: number
}

export interface ExpenseCategory {
  name: string
  value: number
  color?: string
}

export interface Project {
  id: string
  name: string
  client: string
  progress: number
  status: string
  deadline: string
  budget: number
  
  // Financial Fields (Job Costing)
  totalBudget?: number // Total project budget
  committedCost?: number // Total committed through subcontracts
  actualCost?: number // Total actual costs (expenses + payments)
  marginPercentage?: number // Current profit margin percentage
  financialHealth?: 'excellent' | 'good' | 'warning' | 'critical' // Financial status indicator
  
  // Cost Code Budgets
  costCodeBudgets?: string[] // Array of cost code budget IDs
}

export interface Deadline {
  id: string
  title: string
  date: string
  type: 'project' | 'task' | 'meeting'
  priority: 'low' | 'medium' | 'high'
}

export interface DashboardWidget {
  id: string
  name: string
  description: string
  enabled: boolean
  position: number
}

export interface DashboardSettings {
  widgets: DashboardWidget[]
  preferences: {
    defaultTimeFilter: string
    autoRefresh: boolean
    refreshInterval: number
    notificationsEnabled: boolean
  }
  layout: {
    gridColumns: number
    compactMode: boolean
  }
}

export type TimeFilter = 'week' | 'month' | 'quarter' | 'year' | 'custom'

export interface DateRange {
  start: string
  end: string
}