/**
 * ProfitabilityWidget Component
 * 
 * Displays project profitability with traffic light indicator.
 */

import React from 'react'
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import type { ProjectFinancials } from '@/types/projectFinancials'
import { formatCurrency } from '@/lib/chartUtils'

interface ProfitabilityWidgetProps {
  financials: ProjectFinancials
}

export function ProfitabilityWidget({ financials }: ProfitabilityWidgetProps) {
  const getHealthColor = () => {
    switch (financials.financialHealth) {
      case 'excellent':
        return 'bg-green-500'
      case 'good':
        return 'bg-blue-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'critical':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getHealthIcon = () => {
    if (financials.projectedMargin >= 10) {
      return <TrendingUp className="w-6 h-6 text-green-600" />
    } else if (financials.projectedMargin < 0) {
      return <TrendingDown className="w-6 h-6 text-red-600" />
    } else {
      return <AlertTriangle className="w-6 h-6 text-yellow-600" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Profitability</h3>
        <div className={`w-4 h-4 rounded-full ${getHealthColor()}`} />
      </div>

      <div className="flex items-center gap-4 mb-6">
        {getHealthIcon()}
        <div>
          <div className="text-3xl font-bold text-gray-900">
            {financials.projectedMargin.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Projected Margin</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Budget</span>
          <span className="font-semibold">{formatCurrency(financials.totalBudget)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Committed</span>
          <span className="font-semibold text-orange-600">
            {formatCurrency(financials.totalCommitted)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Actual</span>
          <span className="font-semibold text-blue-600">
            {formatCurrency(financials.totalActual)}
          </span>
        </div>

        <div className="pt-3 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Projected Profit</span>
            <span className={`font-bold ${financials.projectedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(financials.projectedProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {financials.alerts && financials.alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm font-medium text-gray-700 mb-2">Alerts</div>
          <div className="space-y-2">
            {financials.alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={`p-2 rounded text-xs ${
                  alert.severity === 'critical' ? 'bg-red-50 text-red-800' :
                  alert.severity === 'high' ? 'bg-orange-50 text-orange-800' :
                  'bg-yellow-50 text-yellow-800'
                }`}
              >
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
