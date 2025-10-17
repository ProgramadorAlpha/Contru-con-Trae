/**
 * CommittedCostWidget Component
 * 
 * Displays committed costs from active subcontracts.
 */

import React from 'react'
import { FileText, DollarSign } from 'lucide-react'
import type { ProjectFinancials } from '@/types/projectFinancials'
import { formatCurrency } from '@/lib/chartUtils'

interface CommittedCostWidgetProps {
  financials: ProjectFinancials
}

export function CommittedCostWidget({ financials }: CommittedCostWidgetProps) {
  const committedPercentage = financials.totalBudget > 0
    ? (financials.totalCommitted / financials.totalBudget) * 100
    : 0

  const remainingBudget = financials.totalBudget - financials.totalCommitted - financials.totalActual

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Committed Costs</h3>
        <FileText className="w-5 h-5 text-gray-400" />
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-orange-600 mb-1">
          {formatCurrency(financials.totalCommitted)}
        </div>
        <div className="text-sm text-gray-600">
          {committedPercentage.toFixed(1)}% of budget
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>Budget Allocation</span>
          <span>{committedPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(committedPercentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Active Subcontracts</span>
          <span className="font-semibold">{financials.activeSubcontracts}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Actual Spent</span>
          <span className="font-semibold text-blue-600">
            {formatCurrency(financials.totalActual)}
          </span>
        </div>

        <div className="pt-3 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Remaining Budget</span>
            <span className={`font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(remainingBudget)}
            </span>
          </div>
        </div>
      </div>

      {/* Top Subcontracts */}
      {financials.subcontractDetails && financials.subcontractDetails.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm font-medium text-gray-700 mb-2">Top Subcontracts</div>
          <div className="space-y-2">
            {financials.subcontractDetails.slice(0, 3).map((sc) => (
              <div key={sc.subcontractId} className="flex justify-between items-center text-xs">
                <span className="text-gray-600 truncate">{sc.subcontractorName}</span>
                <span className="font-medium">{formatCurrency(sc.totalAmount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
