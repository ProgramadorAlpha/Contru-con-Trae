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
    const { result } = renderHook(() => useDashboardData())
    
    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
    expect(result.current.currentFilter).toBe('month')
  })

  it('fetches data on mount', async () => {
    const { fetchDashboardData } = await import('@/lib/api')
    vi.mocked(fetchDashboardData).mockResolvedValue(mockDashboardData)
    
    const { result } = renderHook(() => useDashboardData())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(fetchDashboardData).toHaveBeenCalledWith('month', undefined)
    expect(result.current.data).toEqual(mockDashboardData)
    expect(result.current.error).toBeNull()
  })

  it('handles API errors', async () => {
    const { fetchDashboardData } = await import('@/lib/api')
    const errorMessage = 'Failed to fetch data'
    vi.mocked(fetchDashboardData).mockRejectedValue(new Error(errorMessage))
    
    const { result } = renderHook(() => useDashboardData())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.data).toBeNull()
  })

  it('refetches data when filter changes', async () => {
    const { fetchDashboardData } = await import('@/lib/api')
    vi.mocked(fetchDashboardData).mockResolvedValue(mockDashboardData)
    
    const { result } = renderHook(() => useDashboardData())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Change filter
    result.current.setFilter('week')
    
    await waitFor(() => {
      expect(fetchDashboardData).toHaveBeenCalledWith('week', undefined)
    })
    
    expect(result.current.currentFilter).toBe('week')
  })

  it('handles custom date range filter', async () => {
    const { fetchDashboardData } = await import('@/lib/api')
    vi.mocked(fetchDashboardData).mockResolvedValue(mockDashboardData)
    
    const { result } = renderHook(() => useDashboardData())
    
    const customRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    }
    
    result.current.setFilter('custom', customRange)
    
    await waitFor(() => {
      expect(fetchDashboardData).toHaveBeenCalledWith('custom', customRange)
    })
  })

  it('refreshes data manually', async () => {
    const { fetchDashboardData } = await import('@/lib/api')
    vi.mocked(fetchDashboardData).mockResolvedValue(mockDashboardData)
    
    const { result } = renderHook(() => useDashboardData())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Clear the mock to count new calls
    vi.mocked(fetchDashboardData).mockClear()
    
    result.current.refreshData()
    
    await waitFor(() => {
      expect(fetchDashboardData).toHaveBeenCalledTimes(1)
    })
  })

  it('implements retry logic on failure', async () => {
    const { fetchDashboardData } = await import('@/lib/api')
    vi.mocked(fetchDashboardData)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue(mockDashboardData)
    
    const { result } = renderHook(() => useDashboardData({ retryAttempts: 2 }))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(fetchDashboardData).toHaveBeenCalledTimes(2)
    expect(result.current.data).toEqual(mockDashboardData)
    expect(result.current.error).toBeNull()
  })

  it('caches data in localStorage', async () => {
    const { fetchDashboardData } = await import('@/lib/api')
    vi.mocked(fetchDashboardData).mockResolvedValue(mockDashboardData)
    
    renderHook(() => useDashboardData({ enableCache: true }))
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('dashboard_data'),
        expect.stringContaining(JSON.stringify(mockDashboardData))
      )
    })
  })

  it('loads cached data on initialization', () => {
    const cachedData = {
      data: mockDashboardData,
      timestamp: Date.now(),
      filter: 'month'
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(cachedData))
    
    const { result } = renderHook(() => useDashboardData({ enableCache: true }))
    
    expect(result.current.data).toEqual(mockDashboardData)
  })

  it('invalidates expired cache', async () => {
    const expiredCachedData = {
      data: mockDashboardData,
      timestamp: Date.now() - 3600000, // 1 hour ago
      filter: 'month'
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredCachedData))
    
    const { fetchDashboardData } = await import('@/lib/api')
    vi.mocked(fetchDashboardData).mockResolvedValue(mockDashboardData)
    
    renderHook(() => useDashboardData({ enableCache: true, cacheTimeout: 1800000 })) // 30 minutes
    
    await waitFor(() => {
      expect(fetchDashboardData).toHaveBeenCalled()
    })
  })

  it('handles auto-refresh', async () => {
    const { fetchDashboardData } = await import('@/lib/api')
    vi.mocked(fetchDashboardData).mockResolvedValue(mockDashboardData)
    
    renderHook(() => useDashboardData({ autoRefresh: true, refreshInterval: 100 }))
    
    await waitFor(() => {
      expect(fetchDashboardData).toHaveBeenCalledTimes(1)
    })
    
    // Wait for auto-refresh
    await waitFor(() => {
      expect(fetchDashboardData).toHaveBeenCalledTimes(2)
    }, { timeout: 200 })
  })

  it('cleans up auto-refresh on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    
    const { unmount } = renderHook(() => 
      useDashboardData({ autoRefresh: true, refreshInterval: 1000 })
    )
    
    unmount()
    
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('transforms data correctly', async () => {
    const { fetchDashboardData } = await import('@/lib/api')
    const rawData = { ...mockDashboardData }
    vi.mocked(fetchDashboardData).mockResolvedValue(rawData)
    
    const transformData = (data: any) => ({
      ...data,
      transformed: true
    })
    
    const { result } = renderHook(() => useDashboardData({ transformData }))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.data).toEqual({
      ...mockDashboardData,
      transformed: true
    })
  })

  it('handles concurrent requests correctly', async () => {
    const { fetchDashboardData } = await import('@/lib/api')
    vi.mocked(fetchDashboardData).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockDashboardData), 100))
    )
    
    const { result } = renderHook(() => useDashboardData())
    
    // Trigger multiple filter changes quickly
    result.current.setFilter('week')
    result.current.setFilter('quarter')
    result.current.setFilter('year')
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    // Should only have the last request's result
    expect(result.current.currentFilter).toBe('year')
  })
})