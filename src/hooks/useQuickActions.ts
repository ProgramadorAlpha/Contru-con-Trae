/**
 * useQuickActions Hook
 * 
 * Centralizes logic for all quick actions (income, expense, visit)
 * Manages loading states, errors, and dashboard refresh
 */

import { useState, useCallback } from 'react'
import { incomeService } from '@/services/incomeService'
import { expenseService } from '@/services/expenseService'
import { visitService } from '@/services/visitService'
import type { CreateIncomeDTO } from '@/types/income'
import type { CreateExpenseDTO } from '@/types/expenses'
import type { CreateVisitDTO } from '@/types/visit'

interface UseQuickActionsReturn {
  // Loading states
  isLoading: boolean
  isAddingIncome: boolean
  isRegisteringExpense: boolean
  isSchedulingVisit: boolean
  
  // Error handling
  error: string | null
  clearError: () => void
  
  // Actions
  addIncome: (data: CreateIncomeDTO) => Promise<void>
  registerExpense: (data: CreateExpenseDTO) => Promise<void>
  scheduleVisit: (data: CreateVisitDTO) => Promise<void>
  refreshDashboard: () => Promise<void>
}

interface UseQuickActionsOptions {
  onSuccess?: (action: 'income' | 'expense' | 'visit') => void
  onError?: (error: Error, action: 'income' | 'expense' | 'visit') => void
}

export function useQuickActions(options: UseQuickActionsOptions = {}): UseQuickActionsReturn {
  const { onSuccess, onError } = options
  
  const [isAddingIncome, setIsAddingIncome] = useState(false)
  const [isRegisteringExpense, setIsRegisteringExpense] = useState(false)
  const [isSchedulingVisit, setIsSchedulingVisit] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLoading = isAddingIncome || isRegisteringExpense || isSchedulingVisit

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const addIncome = useCallback(async (data: CreateIncomeDTO) => {
    setIsAddingIncome(true)
    setError(null)
    
    try {
      await incomeService.createIncome(data)
      onSuccess?.('income')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al añadir ingreso'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage), 'income')
      throw err
    } finally {
      setIsAddingIncome(false)
    }
  }, [onSuccess, onError])

  const registerExpense = useCallback(async (data: CreateExpenseDTO) => {
    setIsRegisteringExpense(true)
    setError(null)
    
    try {
      await expenseService.createExpenseQuick(data)
      onSuccess?.('expense')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar gasto'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage), 'expense')
      throw err
    } finally {
      setIsRegisteringExpense(false)
    }
  }, [onSuccess, onError])

  const scheduleVisit = useCallback(async (data: CreateVisitDTO) => {
    setIsSchedulingVisit(true)
    setError(null)
    
    try {
      await visitService.createVisit(data)
      onSuccess?.('visit')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agendar visita'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage), 'visit')
      throw err
    } finally {
      setIsSchedulingVisit(false)
    }
  }, [onSuccess, onError])

  const refreshDashboard = useCallback(async () => {
    // This would trigger a refresh of dashboard data
    // In a real implementation, this might call multiple services
    // or trigger a context/state update
    try {
      // Placeholder for dashboard refresh logic
      await Promise.all([
        // Could fetch updated stats, recent activities, etc.
      ])
    } catch (err) {
      console.error('Error refreshing dashboard:', err)
    }
  }, [])

  return {
    isLoading,
    isAddingIncome,
    isRegisteringExpense,
    isSchedulingVisit,
    error,
    clearError,
    addIncome,
    registerExpense,
    scheduleVisit,
    refreshDashboard
  }
}
