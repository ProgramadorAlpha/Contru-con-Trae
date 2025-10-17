/**
 * useSubcontracts Hook
 * 
 * Custom hook for managing subcontract state with CRUD operations,
 * loading states, and real-time updates.
 */

import { useState, useEffect, useCallback } from 'react'
import { subcontractService } from '@/services/subcontractService'
import type {
  Subcontract,
  CreateSubcontractDTO,
  UpdateSubcontractDTO
} from '@/types/subcontracts'

interface UseSubcontractsOptions {
  projectId?: string
  subcontractorId?: string
  autoLoad?: boolean
  realtime?: boolean
}

interface UseSubcontractsReturn {
  subcontracts: Subcontract[]
  loading: boolean
  error: Error | null
  createSubcontract: (data: CreateSubcontractDTO) => Promise<Subcontract>
  updateSubcontract: (id: string, data: UpdateSubcontractDTO) => Promise<Subcontract>
  deleteSubcontract: (id: string) => Promise<void>
  approveSubcontract: (id: string, approverId: string) => Promise<Subcontract>
  completeSubcontract: (id: string, completionDate: string) => Promise<Subcontract>
  cancelSubcontract: (id: string, reason: string) => Promise<Subcontract>
  refresh: () => Promise<void>
  getSubcontract: (id: string) => Subcontract | undefined
  fetchSubcontractsByProject: (projectId: string) => Promise<void>
}

export function useSubcontracts(options: UseSubcontractsOptions = {}): UseSubcontractsReturn {
  const { projectId, subcontractorId, autoLoad = true, realtime = false } = options

  const [subcontracts, setSubcontracts] = useState<Subcontract[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Load subcontracts based on filters
   */
  const loadSubcontracts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let data: Subcontract[]

      if (projectId) {
        data = await subcontractService.getSubcontractsByProject(projectId)
      } else if (subcontractorId) {
        data = await subcontractService.getSubcontractsBySubcontractor(subcontractorId)
      } else {
        const response = await subcontractService.querySubcontracts({}, 1, 1000)
        data = response.data
      }

      setSubcontracts(data)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading subcontracts:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId, subcontractorId])

  /**
   * Create a new subcontract
   */
  const createSubcontract = useCallback(async (data: CreateSubcontractDTO): Promise<Subcontract> => {
    setError(null)
    try {
      const newSubcontract = await subcontractService.createSubcontract(data)
      setSubcontracts(prev => [...prev, newSubcontract])
      return newSubcontract
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Update an existing subcontract
   */
  const updateSubcontract = useCallback(async (
    id: string,
    data: UpdateSubcontractDTO
  ): Promise<Subcontract> => {
    setError(null)
    try {
      const updated = await subcontractService.updateSubcontract(id, data)
      setSubcontracts(prev => prev.map(sc => sc.id === id ? updated : sc))
      return updated
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Delete a subcontract
   */
  const deleteSubcontract = useCallback(async (id: string): Promise<void> => {
    setError(null)
    try {
      await subcontractService.deleteSubcontract(id)
      setSubcontracts(prev => prev.filter(sc => sc.id !== id))
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Approve a subcontract
   */
  const approveSubcontract = useCallback(async (
    id: string,
    approverId: string
  ): Promise<Subcontract> => {
    setError(null)
    try {
      const approved = await subcontractService.approveSubcontract(id, approverId)
      setSubcontracts(prev => prev.map(sc => sc.id === id ? approved : sc))
      return approved
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Complete a subcontract
   */
  const completeSubcontract = useCallback(async (
    id: string,
    completionDate: string
  ): Promise<Subcontract> => {
    setError(null)
    try {
      const completed = await subcontractService.completeSubcontract(id, completionDate)
      setSubcontracts(prev => prev.map(sc => sc.id === id ? completed : sc))
      return completed
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Cancel a subcontract
   */
  const cancelSubcontract = useCallback(async (
    id: string,
    reason: string
  ): Promise<Subcontract> => {
    setError(null)
    try {
      const cancelled = await subcontractService.cancelSubcontract(id, reason)
      setSubcontracts(prev => prev.map(sc => sc.id === id ? cancelled : sc))
      return cancelled
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Refresh subcontracts
   */
  const refresh = useCallback(async () => {
    await loadSubcontracts()
  }, [loadSubcontracts])

  /**
   * Get a specific subcontract by ID
   */
  const getSubcontract = useCallback((id: string): Subcontract | undefined => {
    return subcontracts.find(sc => sc.id === id)
  }, [subcontracts])

  /**
   * Fetch subcontracts by project ID
   */
  const fetchSubcontractsByProject = useCallback(async (projectId: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const data = await subcontractService.getSubcontractsByProject(projectId)
      setSubcontracts(data)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching subcontracts by project:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadSubcontracts()
    }
  }, [autoLoad, loadSubcontracts])

  // Real-time updates (polling simulation)
  useEffect(() => {
    if (realtime && autoLoad) {
      const interval = setInterval(() => {
        loadSubcontracts()
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [realtime, autoLoad, loadSubcontracts])

  return {
    subcontracts,
    loading,
    error,
    createSubcontract,
    updateSubcontract,
    deleteSubcontract,
    approveSubcontract,
    completeSubcontract,
    cancelSubcontract,
    refresh,
    getSubcontract,
    fetchSubcontractsByProject
  }
}
