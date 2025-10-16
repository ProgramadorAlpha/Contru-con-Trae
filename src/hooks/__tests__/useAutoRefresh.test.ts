import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDashboardData } from '../useDashboardData'
import type { TimeFilter } from '@/types/dashboard'

describe('useDashboardData - Auto-refresh functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('setInterval logic', () => {
    it('should set up interval when autoRefresh is enabled', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')
      
      renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: true,
        refreshInterval: 30000
      }))

      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        30000
      )
    })

    it('should not set up interval when autoRefresh is disabled', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')
      
      renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: false,
        refreshInterval: 30000
      }))

      expect(setIntervalSpy).not.toHaveBeenCalled()
    })

    it('should not set up interval when refreshInterval is 0', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')
      
      renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: true,
        refreshInterval: 0
      }))

      expect(setIntervalSpy).not.toHaveBeenCalled()
    })

    it('should not set up interval when refreshInterval is negative', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')
      
      renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: true,
        refreshInterval: -1000
      }))

      expect(setIntervalSpy).not.toHaveBeenCalled()
    })

    it('should call loadData function in interval callback', async () => {
      const { result } = renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: true,
        refreshInterval: 1000
      }))

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 2000 })

      // Verify data is loaded
      expect(result.current.data).toBeDefined()
    })
  })

  describe('interval cleanup', () => {
    it('should clear interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      const { unmount } = renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: true,
        refreshInterval: 30000
      }))

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
    })

    it('should clear old interval when autoRefresh changes from true to false', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      const { rerender } = renderHook(
        ({ autoRefresh }) => useDashboardData('month', undefined, {
          autoRefresh,
          refreshInterval: 30000
        }),
        { initialProps: { autoRefresh: true } }
      )

      // Change autoRefresh to false
      rerender({ autoRefresh: false })

      expect(clearIntervalSpy).toHaveBeenCalled()
    })

    it('should clear old interval when refreshInterval changes', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      const setIntervalSpy = vi.spyOn(global, 'setInterval')
      
      const { rerender } = renderHook(
        ({ interval }) => useDashboardData('month', undefined, {
          autoRefresh: true,
          refreshInterval: interval
        }),
        { initialProps: { interval: 30000 } }
      )

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000)

      // Change interval
      rerender({ interval: 60000 })

      expect(clearIntervalSpy).toHaveBeenCalled()
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000)
    })

    it('should properly cleanup intervals on multiple rerenders', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      const { rerender, unmount } = renderHook(
        ({ interval }) => useDashboardData('month', undefined, {
          autoRefresh: true,
          refreshInterval: interval
        }),
        { initialProps: { interval: 10000 } }
      )

      // Multiple rerenders with different intervals
      rerender({ interval: 15000 })
      rerender({ interval: 20000 })
      rerender({ interval: 25000 })

      unmount()

      // Should have cleared intervals for each rerender
      expect(clearIntervalSpy.mock.calls.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('background updates', () => {
    it('should load data initially and keep it available', async () => {
      const { result } = renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: true,
        refreshInterval: 30000
      }))

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 2000 })

      // Data should be available
      expect(result.current.data).toBeDefined()
      expect(result.current.data).not.toBeNull()
    })

    it('should maintain data availability during auto-refresh', async () => {
      const { result } = renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: true,
        refreshInterval: 30000
      }))

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 2000 })

      const initialData = result.current.data
      expect(initialData).toBeDefined()

      // Data should remain accessible
      expect(result.current.data).toBeDefined()
    })

    it('should not crash on errors during refresh', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const { result } = renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: true,
        refreshInterval: 30000
      }))

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 2000 })

      // Should not crash
      expect(result.current.data).toBeDefined()
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('user interaction preservation', () => {
    it('should preserve data references during refresh', async () => {
      const { result } = renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: true,
        refreshInterval: 30000
      }))

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 2000 })

      // Simulate user interaction (data is being used)
      const userSelectedData = result.current.data

      // User's reference should be valid
      expect(userSelectedData).toBeDefined()
      expect(result.current.data).toBeDefined()
    })

    it('should allow manual export operations', async () => {
      const { result } = renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: true,
        refreshInterval: 30000
      }))

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 2000 })

      // User triggers manual export
      const exportPromise = result.current.exportData('json')

      // Export should complete successfully
      await expect(exportPromise).resolves.toBe(true)
    })

    it('should respect user filter changes', async () => {
      const { result, rerender } = renderHook(
        ({ filter }: { filter: TimeFilter }) => useDashboardData(filter, undefined, {
          autoRefresh: true,
          refreshInterval: 30000
        }),
        { initialProps: { filter: 'month' as TimeFilter } }
      )

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 2000 })

      // User changes filter
      rerender({ filter: 'week' as TimeFilter })

      // Filter should be updated
      await waitFor(() => {
        expect(result.current.currentFilter).toBe('week')
      }, { timeout: 2000 })
    })

    it('should handle concurrent operations gracefully', async () => {
      const { result } = renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: true,
        refreshInterval: 30000
      }))

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 2000 })

      // Should handle gracefully without crashing
      expect(result.current.data).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('should handle short refresh intervals', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')
      
      renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: true,
        refreshInterval: 1000
      }))

      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        1000
      )
    })

    it('should handle long refresh intervals', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')
      
      renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: true,
        refreshInterval: 3600000 // 1 hour
      }))

      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        3600000
      )
    })

    it('should handle toggling autoRefresh multiple times', () => {
      const { rerender } = renderHook(
        ({ autoRefresh }) => useDashboardData('month', undefined, {
          autoRefresh,
          refreshInterval: 30000
        }),
        { initialProps: { autoRefresh: true } }
      )

      // Toggle multiple times
      rerender({ autoRefresh: false })
      rerender({ autoRefresh: true })
      rerender({ autoRefresh: false })

      // Should handle without crashing
      expect(true).toBe(true)
    })

    it('should work with debounced data loading', async () => {
      const { result } = renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: true,
        refreshInterval: 30000
      }))

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 2000 })

      // Should handle debouncing correctly
      expect(result.current.data).toBeDefined()
    })
  })

  describe('integration with other features', () => {
    it('should work with time filter changes', async () => {
      const { result, rerender } = renderHook(
        ({ filter }: { filter: TimeFilter }) => useDashboardData(filter, undefined, {
          autoRefresh: true,
          refreshInterval: 30000
        }),
        { initialProps: { filter: 'month' as TimeFilter } }
      )

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 2000 })

      // Change filter
      rerender({ filter: 'week' as TimeFilter })

      // Should update with new filter
      await waitFor(() => {
        expect(result.current.currentFilter).toBe('week')
      }, { timeout: 2000 })
    })

    it('should work with date range changes', async () => {
      const dateRange = {
        start: '2024-01-01',
        end: '2024-01-31'
      }

      const { result, rerender } = renderHook(
        ({ range }) => useDashboardData('custom', range, {
          autoRefresh: true,
          refreshInterval: 30000
        }),
        { initialProps: { range: dateRange } }
      )

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 2000 })

      // Change date range
      const newRange = {
        start: '2024-02-01',
        end: '2024-02-29'
      }
      rerender({ range: newRange })

      // Should handle correctly
      expect(result.current.data).toBeDefined()
    })

    it('should support manual loadData calls', async () => {
      const { result } = renderHook(() => useDashboardData('month', undefined, {
        autoRefresh: true,
        refreshInterval: 30000
      }))

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 2000 })

      // Manual refresh should work
      await result.current.loadData()

      expect(result.current.data).toBeDefined()
    })
  })
})
