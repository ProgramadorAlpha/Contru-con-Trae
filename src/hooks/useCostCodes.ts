/**
 * useCostCodes Hook
 * 
 * Custom hook for managing cost codes with caching, search, and hierarchy navigation.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { costCodeService } from '@/services/costCodeService'
import type {
  CostCode,
  CostCodeHierarchy,
  CostCodeFilters,
  CreateCostCodeDTO,
  UpdateCostCodeDTO
} from '@/types/costCodes'

interface UseCostCodesOptions {
  autoLoad?: boolean
  filters?: CostCodeFilters
  enableCache?: boolean
}

interface UseCostCodesReturn {
  costCodes: CostCode[]
  hierarchy: CostCodeHierarchy | null
  loading: boolean
  error: Error | null
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredCostCodes: CostCode[]
  createCostCode: (data: CreateCostCodeDTO) => Promise<CostCode>
  updateCostCode: (id: string, data: UpdateCostCodeDTO) => Promise<CostCode>
  deleteCostCode: (id: string) => Promise<void>
  getCostCode: (id: string) => CostCode | undefined
  getCostCodeByCode: (code: string) => CostCode | undefined
  suggestCostCodes: (description: string, limit?: number) => Promise<CostCode[]>
  searchCostCodes: (term: string) => CostCode[]
  refresh: () => Promise<void>
}

export function useCostCodes(options: UseCostCodesOptions = {}): UseCostCodesReturn {
  const { autoLoad = true, filters, enableCache = true } = options

  const [costCodes, setCostCodes] = useState<CostCode[]>([])
  const [hierarchy, setHierarchy] = useState<CostCodeHierarchy | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  /**
   * Load cost codes with filters
   */
  const loadCostCodes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await costCodeService.queryCostCodes(filters)
      setCostCodes(response.data)
      setHierarchy(response.hierarchy || null)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading cost codes:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  /**
   * Filtered cost codes based on search term
   */
  const filteredCostCodes = useMemo(() => {
    if (!searchTerm) return costCodes

    const searchLower = searchTerm.toLowerCase()
    return costCodes.filter(cc =>
      cc.code.toLowerCase().includes(searchLower) ||
      cc.name.toLowerCase().includes(searchLower) ||
      cc.description.toLowerCase().includes(searchLower) ||
      cc.division.toLowerCase().includes(searchLower) ||
      cc.category.toLowerCase().includes(searchLower)
    )
  }, [costCodes, searchTerm])

  /**
   * Create a new cost code
   */
  const createCostCode = useCallback(async (data: CreateCostCodeDTO): Promise<CostCode> => {
    setError(null)
    try {
      const newCostCode = await costCodeService.createCostCode(data)
      setCostCodes(prev => [...prev, newCostCode])
      // Refresh hierarchy
      const newHierarchy = await costCodeService.getCostCodeHierarchy()
      setHierarchy(newHierarchy)
      return newCostCode
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Update an existing cost code
   */
  const updateCostCode = useCallback(async (
    id: string,
    data: UpdateCostCodeDTO
  ): Promise<CostCode> => {
    setError(null)
    try {
      const updated = await costCodeService.updateCostCode(id, data)
      setCostCodes(prev => prev.map(cc => cc.id === id ? updated : cc))
      return updated
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Delete a cost code
   */
  const deleteCostCode = useCallback(async (id: string): Promise<void> => {
    setError(null)
    try {
      await costCodeService.deleteCostCode(id)
      setCostCodes(prev => prev.filter(cc => cc.id !== id))
      // Refresh hierarchy
      const newHierarchy = await costCodeService.getCostCodeHierarchy()
      setHierarchy(newHierarchy)
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Get a specific cost code by ID
   */
  const getCostCode = useCallback((id: string): CostCode | undefined => {
    return costCodes.find(cc => cc.id === id)
  }, [costCodes])

  /**
   * Get a cost code by code string
   */
  const getCostCodeByCode = useCallback((code: string): CostCode | undefined => {
    return costCodes.find(cc => cc.code === code)
  }, [costCodes])

  /**
   * Suggest cost codes based on description
   */
  const suggestCostCodes = useCallback(async (
    description: string,
    limit: number = 5
  ): Promise<CostCode[]> => {
    setError(null)
    try {
      return await costCodeService.suggestCostCodes(description, limit)
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Search cost codes by term
   */
  const searchCostCodes = useCallback((term: string): CostCode[] => {
    if (!term) return costCodes

    const searchLower = term.toLowerCase()
    return costCodes.filter(cc =>
      cc.code.toLowerCase().includes(searchLower) ||
      cc.name.toLowerCase().includes(searchLower) ||
      cc.description.toLowerCase().includes(searchLower) ||
      cc.division.toLowerCase().includes(searchLower) ||
      cc.category.toLowerCase().includes(searchLower)
    )
  }, [costCodes])

  /**
   * Refresh cost codes
   */
  const refresh = useCallback(async () => {
    await loadCostCodes()
  }, [loadCostCodes])

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadCostCodes()
    }
  }, [autoLoad, loadCostCodes])

  return {
    costCodes,
    hierarchy,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filteredCostCodes,
    createCostCode,
    updateCostCode,
    deleteCostCode,
    getCostCode,
    getCostCodeByCode,
    suggestCostCodes,
    searchCostCodes,
    refresh
  }
}
