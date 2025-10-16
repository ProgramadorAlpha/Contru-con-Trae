import { useState, useEffect, useCallback, useMemo } from 'react'
import { DashboardData, TimeFilter, DateRange } from '@/types/dashboard'
import { generatePeriods, generateTimeSeriesData, calculateGrowthPercentage } from '@/lib/chartUtils'
import { retry } from '@/lib/utils'
import { useDebounce, useDebouncedCallback } from './useDebounce'

interface UseDashboardDataOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseDashboardDataReturn {
  data: DashboardData | null
  loading: boolean
  error: string | null
  currentFilter: TimeFilter
  loadData: () => Promise<void>
  exportData: (format?: 'json' | 'csv' | 'excel') => Promise<boolean>
}

export function useDashboardData(
  timeFilter: TimeFilter,
  dateRange?: DateRange,
  options: UseDashboardDataOptions = {}
): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { autoRefresh = false, refreshInterval = 30000 } = options

  // Debounce filter changes to prevent excessive API calls
  const debouncedTimeFilter = useDebounce(timeFilter, 300)
  const debouncedDateRange = useDebounce(dateRange, 500)

  // Memoize expensive data generation
  const generateMockData = useMemo(() => (filter: TimeFilter): DashboardData => {
    const periods = generatePeriods(filter)
    
    // Generate budget data
    const budgetData = periods.map((period, index) => {
      const baseAmount = 50000 + (index * 5000)
      const variation = Math.random() * 0.3 + 0.85 // 85% - 115%
      return {
        period,
        budgeted: baseAmount,
        spent: Math.round(baseAmount * variation)
      }
    })

    // Generate project progress data
    const projectNames = [
      'Proyecto Girassol',
      'Edificio Aurora', 
      'Complejo Verde',
      'Casa Moderna',
      'Torre Central',
      'Residencial Norte'
    ]
    
    const projectProgressData = projectNames.map(name => ({
      name,
      progress: Math.round(Math.random() * 100),
      status: Math.random() > 0.7 ? 'delayed' : Math.random() > 0.3 ? 'on-track' : 'completed'
    })) as any[]

    // Generate team performance data
    const teamPerformanceData = periods.map(period => ({
      period,
      performance: Math.round(75 + Math.random() * 20), // 75-95%
      attendance: Math.round(85 + Math.random() * 10)   // 85-95%
    }))

    // Generate expenses by category
    const expensesByCategory = [
      { name: 'Materiales', value: 45000, color: '#3B82F6' },
      { name: 'Mano de Obra', value: 32000, color: '#10B981' },
      { name: 'Equipos', value: 18000, color: '#F59E0B' },
      { name: 'Transporte', value: 8000, color: '#EF4444' },
      { name: 'Otros', value: 5000, color: '#8B5CF6' }
    ]

    // Generate recent projects
    const recentProjects = [
      {
        id: '1',
        name: 'Proyecto Girassol',
        client: 'Constructora ABC',
        progress: 75,
        status: 'En progreso',
        deadline: '2024-12-15',
        budget: 250000
      },
      {
        id: '2', 
        name: 'Edificio Aurora',
        client: 'Inmobiliaria XYZ',
        progress: 45,
        status: 'En progreso',
        deadline: '2025-03-20',
        budget: 180000
      },
      {
        id: '3',
        name: 'Casa Moderna',
        client: 'Cliente Privado',
        progress: 90,
        status: 'Finalizando',
        deadline: '2024-11-30',
        budget: 120000
      }
    ]

    // Generate upcoming deadlines
    const upcomingDeadlines = [
      {
        id: '1',
        title: 'Entrega Proyecto Girassol',
        date: '2024-12-15',
        type: 'project' as const,
        priority: 'high' as const
      },
      {
        id: '2',
        title: 'Revisión estructural Torre Central',
        date: '2024-11-25',
        type: 'task' as const,
        priority: 'medium' as const
      },
      {
        id: '3',
        title: 'Reunión con cliente Casa Moderna',
        date: '2024-11-20',
        type: 'meeting' as const,
        priority: 'low' as const
      }
    ]

    // Calculate stats
    const totalBudgeted = budgetData.reduce((sum, item) => sum + item.budgeted, 0)
    const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0)
    const budgetUtilization = Math.round((totalSpent / totalBudgeted) * 100)
    
    // Mock previous period data for growth calculations
    const previousStats = {
      activeProjects: 8,
      totalBudget: 450000,
      teamMembers: 22,
      pendingTasks: 35
    }

    const currentStats = {
      activeProjects: projectProgressData.length,
      totalBudget: totalBudgeted,
      teamMembers: 25,
      pendingTasks: 28,
      availableTools: 15,
      budgetUtilization,
      projectsGrowth: calculateGrowthPercentage(projectProgressData.length, previousStats.activeProjects),
      budgetGrowth: calculateGrowthPercentage(totalBudgeted, previousStats.totalBudget),
      teamGrowth: calculateGrowthPercentage(25, previousStats.teamMembers),
      tasksGrowth: calculateGrowthPercentage(28, previousStats.pendingTasks)
    }

    return {
      stats: currentStats,
      budgetData,
      projectProgressData,
      teamPerformanceData,
      expensesByCategory,
      recentProjects,
      upcomingDeadlines
    }
  }, [])

  // Debounced data loading to prevent excessive API calls
  const debouncedLoadData = useDebouncedCallback(async (filter: TimeFilter) => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call with retry logic
      await retry(async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Simulate occasional network errors (1% chance for development)
        if (Math.random() < 0.01) {
          throw new Error('Network error: Failed to fetch dashboard data')
        }
        
        const mockData = generateMockData(filter)
        setData(mockData)
      }, 3, 1000)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading dashboard data'
      setError(errorMessage)
      console.error('Dashboard data loading error:', err)
    } finally {
      setLoading(false)
    }
  }, 300, [generateMockData])

  const loadData = useCallback(async () => {
    await debouncedLoadData(debouncedTimeFilter)
  }, [debouncedLoadData, debouncedTimeFilter])

  const exportData = useCallback(async (format: 'json' | 'csv' | 'excel' = 'json'): Promise<boolean> => {
    if (!data) {
      throw new Error('No data available to export')
    }

    try {
      // Dynamic import to avoid loading export utilities unless needed
      const { prepareExportData, exportToJSON, exportToCSV, exportToExcel } = await import('@/lib/exportUtils')
      
      const exportData = prepareExportData(data, timeFilter)
      
      switch (format) {
        case 'csv':
          exportToCSV(exportData)
          break
        case 'excel':
          exportToExcel(exportData)
          break
        default:
          exportToJSON(exportData)
      }
      
      return true
    } catch (error) {
      console.error('Export error:', error)
      throw new Error('Error al exportar los datos')
    }
  }, [data, timeFilter])

  // Load data when debounced filters change
  useEffect(() => {
    loadData()
  }, [loadData])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      loadData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, loadData])

  // Handle custom date range with debouncing
  useEffect(() => {
    if (debouncedTimeFilter === 'custom' && debouncedDateRange) {
      // Validate date range
      const start = new Date(debouncedDateRange.start)
      const end = new Date(debouncedDateRange.end)
      
      if (start <= end) {
        loadData()
      }
    }
  }, [debouncedTimeFilter, debouncedDateRange, loadData])

  return {
    data,
    loading,
    error,
    currentFilter: debouncedTimeFilter,
    loadData,
    exportData
  }
}

// Hook for dashboard statistics only (lighter version)
export function useDashboardStats(timeFilter: TimeFilter) {
  const [stats, setStats] = useState<DashboardData['stats'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate lighter API call for just stats
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const mockStats = {
        activeProjects: 6,
        totalBudget: 580000,
        teamMembers: 25,
        pendingTasks: 28,
        availableTools: 15,
        budgetUtilization: 87,
        projectsGrowth: 12,
        budgetGrowth: 8,
        teamGrowth: 14,
        tasksGrowth: -20
      }
      
      setStats(mockStats)
    } catch (err) {
      setError('Error loading dashboard statistics')
    } finally {
      setLoading(false)
    }
  }, [timeFilter])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return { stats, loading, error, loadStats }
}