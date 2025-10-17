/**
 * useExpenseApprovals Hook
 * 
 * Custom hook for managing expense approvals with pending queue and bulk actions.
 */

import { useState, useEffect, useCallback } from 'react'
import { expenseService } from '@/services/expenseService'
import type {
  Expense,
  ApproveExpenseDTO,
  RejectExpenseDTO,
  BulkApproveExpensesDTO,
  BulkRejectExpensesDTO
} from '@/types/expenses'

interface UseExpenseApprovalsOptions {
  autoLoad?: boolean
  includeNeedsReview?: boolean
}

interface UseExpenseApprovalsReturn {
  pendingExpenses: Expense[]
  needsReviewExpenses: Expense[]
  loading: boolean
  error: Error | null
  approveExpense: (data: ApproveExpenseDTO) => Promise<Expense>
  rejectExpense: (data: RejectExpenseDTO) => Promise<Expense>
  bulkApprove: (data: BulkApproveExpensesDTO) => Promise<Expense[]>
  bulkReject: (data: BulkRejectExpensesDTO) => Promise<Expense[]>
  refresh: () => Promise<void>
  getExpense: (id: string) => Expense | undefined
}

export function useExpenseApprovals(
  options: UseExpenseApprovalsOptions = {}
): UseExpenseApprovalsReturn {
  const { autoLoad = true, includeNeedsReview = true } = options

  const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([])
  const [needsReviewExpenses, setNeedsReviewExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Load pending approvals and expenses needing review
   */
  const loadApprovals = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const pending = await expenseService.getPendingApprovals()
      setPendingExpenses(pending)

      if (includeNeedsReview) {
        const needsReview = await expenseService.getExpensesNeedingReview()
        setNeedsReviewExpenses(needsReview)
      }
    } catch (err) {
      setError(err as Error)
      console.error('Error loading expense approvals:', err)
    } finally {
      setLoading(false)
    }
  }, [includeNeedsReview])

  /**
   * Approve an expense
   */
  const approveExpense = useCallback(async (data: ApproveExpenseDTO): Promise<Expense> => {
    setError(null)
    try {
      const approved = await expenseService.approveExpense(data)
      
      // Remove from pending list
      setPendingExpenses(prev => prev.filter(exp => exp.id !== data.expenseId))
      setNeedsReviewExpenses(prev => prev.filter(exp => exp.id !== data.expenseId))
      
      return approved
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Reject an expense
   */
  const rejectExpense = useCallback(async (data: RejectExpenseDTO): Promise<Expense> => {
    setError(null)
    try {
      const rejected = await expenseService.rejectExpense(data)
      
      // Remove from pending list
      setPendingExpenses(prev => prev.filter(exp => exp.id !== data.expenseId))
      setNeedsReviewExpenses(prev => prev.filter(exp => exp.id !== data.expenseId))
      
      return rejected
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Bulk approve expenses
   */
  const bulkApprove = useCallback(async (data: BulkApproveExpensesDTO): Promise<Expense[]> => {
    setError(null)
    try {
      const approved = await expenseService.bulkApproveExpenses(data)
      
      // Remove approved expenses from pending lists
      const approvedIds = new Set(approved.map(exp => exp.id))
      setPendingExpenses(prev => prev.filter(exp => !approvedIds.has(exp.id)))
      setNeedsReviewExpenses(prev => prev.filter(exp => !approvedIds.has(exp.id)))
      
      return approved
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Bulk reject expenses
   */
  const bulkReject = useCallback(async (data: BulkRejectExpensesDTO): Promise<Expense[]> => {
    setError(null)
    try {
      const rejected = await expenseService.bulkRejectExpenses(data)
      
      // Remove rejected expenses from pending lists
      const rejectedIds = new Set(rejected.map(exp => exp.id))
      setPendingExpenses(prev => prev.filter(exp => !rejectedIds.has(exp.id)))
      setNeedsReviewExpenses(prev => prev.filter(exp => !rejectedIds.has(exp.id)))
      
      return rejected
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  /**
   * Refresh approvals
   */
  const refresh = useCallback(async () => {
    await loadApprovals()
  }, [loadApprovals])

  /**
   * Get a specific expense by ID
   */
  const getExpense = useCallback((id: string): Expense | undefined => {
    return pendingExpenses.find(exp => exp.id === id) || 
           needsReviewExpenses.find(exp => exp.id === id)
  }, [pendingExpenses, needsReviewExpenses])

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadApprovals()
    }
  }, [autoLoad, loadApprovals])

  return {
    pendingExpenses,
    needsReviewExpenses,
    loading,
    error,
    approveExpense,
    rejectExpense,
    bulkApprove,
    bulkReject,
    refresh,
    getExpense
  }
}
