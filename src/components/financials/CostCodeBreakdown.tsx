/**
 * CostCodeBreakdown Component
 * 
 * Chart component showing cost breakdown by cost code.
 */

import React from 'react'
import { BarChart3 } from 'lucide-react'
import type { CostCodeBudget } from '@/types/costCodes'
import { formatCurrency } from '@/lib/chartUtils'

interface CostCodeBreakdownProps {
  budgets: CostCodeBudget[]
}

export function CostCodeBreakdown({ budgets }: CostCodeBreakdownProps) {
  const sortedBudgets = [...budgets].sort((a, b) => b.actualAmount - a.actualAmount).slice(0, 10)

  const maxAmount = Math.max(...sortedBudgets.map(b => b.budgetedAmount))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_budget':
        return 'bg-green-500'
      case 'on_budget':
        return 'bg-blue-500'
      case 'critical':
        return 'bg-yellow-500'
      case 'over_budget':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Cost Code Breakdown</h3>
        <BarChart3 className="w-5 h-5 text-gray-400" />
      </div>

      {sortedBudgets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No cost code data available
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBudgets.map((budget) => {
            const budgetPercentage = maxAmount > 0 ? (budget.budgetedAmount / maxAmount) * 100 : 0
            const actualPercentage = maxAmount > 0 ? (budget.actualAmount / maxAmount) * 100 : 0

            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(budget.status)}`} />
                    <span className="text-sm font-medium text-gray-900">
                      {budget.costCode.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {budget.percentageComplete.toFixed(0)}%
                  </span>
                </div>

                <div className="space-y-1">
                  {/* Budget Bar */}
                  <div className="relative">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gray-300 h-2 rounded-full"
                        style={{ width: `${budgetPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Actual Bar */}
                  <div className="relative">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getStatusColor(budget.status)}`}
                        style={{ width: `${actualPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-600">
                  <span>Budget: {formatCurrency(budget.budgetedAmount)}</span>
                  <span>Actual: {formatCurrency(budget.actualAmount)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Under Budget</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>On Budget</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Over Budget</span>
          </div>
        </div>
      </div>
    </div>
  )
}
