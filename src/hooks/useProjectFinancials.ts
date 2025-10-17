/**
 * useProjectFinancials Hook
 * 
 * Custom hook for managing project financials with real-time updates and refresh methods.
 */

import { useState, useEffect, useCallback } from 'react'
import { projectFinancialsService } from '@/services/projectFinancialsService'
import type { ProjectFinancials } from '@/types/projectFinancials'

interface UseProjectFinancialsOptions {
  projectId: string
  autoLoad?: boolean
  realtime?: boolean
  refreshInterval?: number // in milliseconds
}

interface UseProjectFinancialsReturn {
  financials: ProjectFinancials | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
  recalculate: () => Promise<void>
}

export function useProjectFinancials(
  options: UseProjectFinancialsOptions
): UseProjectFinancialsReturn {
  const { projectId, autoLoad = true, realtime = false, refreshInterval = 60000 } = options

  const [financials, setFinancials] = useState<ProjectFinancials | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Load project financials
   */
  const loadFinancials = useCallback(async () => {
    if (!projectId) return

    setLoading(true)
    setError(null)

    try {
      const data = await projectFinancialsService.getProjectFinancials(projectId)
      setFinancials(data)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading project financials:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  /**
   * Refresh financials (use cached if available)
   */
  const refresh = useCallback(async () => {
    await loadFinancials()
  }, [loadFinancials])

  /**
   * Force recalculation of financials
   */
  const recalculate = useCallback(async () => {
    if (!projectId) return

    setLoading(true)
    setError(null)

    try {
      const data = await projectFinancialsService.refreshProjectFinancials(projectId)
      setFinancials(data)
    } catch (err) {
      setError(err as Error)
      console.error('Error recalculating project financials:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad && projectId) {
      loadFinancials()
    }
  }, [autoLoad, projectId, loadFinancials])

  // Real-time updates via subscription
  useEffect(() => {
    if (realtime && projectId) {
      const unsubscribe = projectFinancialsService.subscribeToFinancialUpdates(
        projectId,
        (updatedFinancials) => {
          setFinancials(updatedFinancials)
        }
      )

      return () => {
        unsubscribe()
      }
    }
  }, [realtime, projectId])

  // Polling for updates if realtime is enabled but no subscription
  useEffect(() => {
    if (realtime && projectId && !loading) {
      const interval = setInterval(() => {
        loadFinancials()
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [realtime, projectId, loading, refreshInterval, loadFinancials])

  return {
    financials,
    loading,
    error,
    refresh,
    recalculate
  }
}
