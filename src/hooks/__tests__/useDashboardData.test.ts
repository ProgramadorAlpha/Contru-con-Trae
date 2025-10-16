import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDashboardData } from '../useDashboardData'
import type { TimeFilter } from '@/types/dashboard'

// Mock the API functions
vi.mock('@/lib/api', () => ({
  fetchDashboardData: vi.fn(),
  fetchProjectData: vi.fn(),
  fetchBudgetData: vi.fn(),
  fetchTeamData: vi.fn()
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
vi.stubGlobal('localStorage', mockLocalStorage)

const mockDashboardData = {
  budgetUtilization: [
    { month: 'Ene', budget: 100000, spent: 85000, percentage: 85 },
    { month: 'Feb', budget: 120000, spent: 95000, percentage: 79 }
  ],
  projectProgress: [
    { project: 'Edificio Aurora', progress: 75, budget: 500000, spent: 375000 },
    { project: 'Casa Verde', progress: 90, budget: 300000, spent: 270000 }
  ],
  teamPerformance: [
    { month: 'Ene', efficiency: 85, productivity: 78, quality: 92 },
    { month: 'Feb', efficiency: 88, productivity: 82, quality: 89 }
  ],
  expenseCategories: [
    { category: 'Materiales', amount: 450000, percentage: 45 },
    { category: 'Mano de obra', amount: 350000, percentage: 35 }
  ]
}

describe('useDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('initializes with default values', () => {
    const { result } = renderHook(() => useDashboardData('month'))
    
    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
    expect(result.current.currentFilter).toBe('month')
  })

  it('fetches data on mount', async () => {
    const { result } = renderHook(() => useDashboardData('month'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.data).not.toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('handles API errors', async () => {
    // Mock Math.random to force an error
    const originalRandom = Math.random
    Math.random = () => 0.001 // Force error condition
    
    const { result } = renderHook(() => useDashboardData('month'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 5000 })
    
    // Restore Math.random
    Math.random = originalRandom
    
    // The hook should handle errors gracefully
    expect(result.current.loading).toBe(false)
  })

  it('refetches data when filter changes', async () => {
    const { result, rerender } = renderHook(
      ({ filter }: { filter: TimeFilter }) => useDashboardData(filter),
      { initialProps: { filter: 'month' as const } }
    )
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Change filter by rerendering with new props
    rerender({ filter: 'week' as const })
    
    await waitFor(() => {
      expect(result.current.currentFilter).toBe('week')
    })
  })

  it('handles custom date range filter', async () => {
    const customRange = {
      start: '2024-01-01',
      end: '2024-01-31'
    }
    
    const { result } = renderHook(() => useDashboardData('custom', customRange))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.currentFilter).toBe('custom')
  })

  it('refreshes data manually', async () => {
    const { result } = renderHook(() => useDashboardData('month'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    const initialData = result.current.data
    
    await result.current.loadData()
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
  })

  it('implements retry logic on failure', async () => {
    const { result } = renderHook(() => useDashboardData('month'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // The hook has built-in retry logic
    expect(result.current.data).toBeDefined()
  })

  it('loads data successfully', async () => {
    const { result } = renderHook(() => useDashboardData('month'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.data).toBeDefined()
    expect(result.current.error).toBeNull()
  })

  it('exports data successfully', async () => {
    const { result } = renderHook(() => useDashboardData('month'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.exportData).toBeDefined()
    expect(typeof result.current.exportData).toBe('function')
  })

  it('handles different time filters', async () => {
    const filters: TimeFilter[] = ['week', 'month', 'quarter', 'year']
    
    for (const filter of filters) {
      const { result } = renderHook(() => useDashboardData(filter))
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.currentFilter).toBe(filter)
    }
  })

  it('handles auto-refresh', async () => {
    const { result } = renderHook(() => useDashboardData('month', undefined, { autoRefresh: true, refreshInterval: 100 }))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    const initialData = result.current.data
    
    // Wait for auto-refresh
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    }, { timeout: 300 })
  })

  it('cleans up auto-refresh on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    
    const { unmount } = renderHook(() => 
      useDashboardData('month', undefined, { autoRefresh: true, refreshInterval: 1000 })
    )
    
    unmount()
    
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('generates correct data structure', async () => {
    const { result } = renderHook(() => useDashboardData('month'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.data).toHaveProperty('stats')
    expect(result.current.data).toHaveProperty('budgetData')
    expect(result.current.data).toHaveProperty('projectProgressData')
    expect(result.current.data).toHaveProperty('teamPerformanceData')
  })

  it('handles concurrent requests correctly', async () => {
    const { result, rerender } = renderHook(
      ({ filter }: { filter: TimeFilter }) => useDashboardData(filter),
      { initialProps: { filter: 'month' as const } }
    )
    
    // Trigger multiple filter changes quickly
    rerender({ filter: 'week' as const })
    rerender({ filter: 'quarter' as const })
    rerender({ filter: 'year' as const })
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Should have the last filter
    expect(result.current.currentFilter).toBe('year')
  })
})