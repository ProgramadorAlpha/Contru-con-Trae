import React from 'react'
import { Download, TrendingUp, TrendingDown, AlertTriangle, DollarSign, FileText } from 'lucide-react'
import type { ProjectFinancials } from '@/types/projectFinancials'
import { formatCurrency, formatDate } from '@/lib/chartUtils'

interface JobCostingReportProps {
  projectId: string
  financials: ProjectFinancials
  onExport?: () => void
}

export function JobCostingReport({ projectId, financials, onExport }: JobCostingReportProps) {
  const profitMargin = financials.projectedMargin
  const budgetVariance = financials.budgetVariance
  const budgetVariancePercent = financials.budgetVariancePercentage

  const getMarginColor = (margin: number) => {
    if (margin >= 15) return 'text-green-600'
    if (margin >= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getVarianceColor = (variance: number) => {
    if (variance <= 0) return 'text-green-600'
    if (variance / financials.totalBudget <= 0.05) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reporte de Costeo de Obra</h2>
          <p className="text-sm text-gray-600 mt-1">
            Análisis financiero completo del proyecto
          </p>
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Reporte
          </button>
        )}
      </div>

      {/* Executive Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Ejecutivo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Presupuesto Total</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(financials.totalBudget)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Costo Actual</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(financials.totalActual)}
            </p>
            <p className="text-xs text-gray-500">
              {((financials.totalActual / financials.totalBudget) * 100).toFixed(1)}% del presupuesto
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Costo Comprometido</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(financials.totalCommitted)}
            </p>
            <p className="text-xs text-gray-500">
              {((financials.totalCommitted / financials.totalBudget) * 100).toFixed(1)}% del presupuesto
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Costo Final Proyectado</p>
            <p className={`text-2xl font-bold ${getMarginColor(profitMargin)}`}>
              {formatCurrency(financials.estimatedFinalCost)}
            </p>
            <p className={`text-xs ${getMarginColor(profitMargin)}`}>
              Margen: {profitMargin.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Budget Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Desempeño Presupuestario</h3>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progreso del Presupuesto</span>
            <span className="font-medium">
              {((financials.totalActual / financials.totalBudget) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div className="h-full flex">
              <div
                className="bg-blue-600"
                style={{ width: `${(financials.totalActual / financials.totalBudget) * 100}%` }}
              />
              <div
                className="bg-orange-400"
                style={{ width: `${(financials.totalCommitted / financials.totalBudget) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Gastado: {formatCurrency(financials.totalActual)}</span>
            <span>Comprometido: {formatCurrency(financials.totalCommitted)}</span>
            <span>Disponible: {formatCurrency(financials.totalBudget - financials.totalActual - financials.totalCommitted)}</span>
          </div>
        </div>

        {/* Variance Analysis */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Variación del Presupuesto</span>
              {budgetVariance > 0 ? (
                <TrendingUp className="w-5 h-5 text-red-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-green-600" />
              )}
            </div>
            <p className={`text-xl font-bold ${getVarianceColor(budgetVariance)}`}>
              {budgetVariance > 0 ? '+' : ''}{formatCurrency(budgetVariance)}
            </p>
            <p className={`text-sm ${getVarianceColor(budgetVariance)}`}>
              {budgetVariancePercent > 0 ? '+' : ''}{budgetVariancePercent.toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Margen de Ganancia</span>
              <DollarSign className={`w-5 h-5 ${getMarginColor(profitMargin)}`} />
            </div>
            <p className={`text-xl font-bold ${getMarginColor(profitMargin)}`}>
              {profitMargin.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">
              {formatCurrency(financials.totalBudget - financials.estimatedFinalCost)}
            </p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown by Code */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Desglose por Código de Costo
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Código
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Presupuesto
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actual
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Comprometido
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Variación
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  % Usado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {financials.budgetByCostCode.map((item) => {
                const variance = item.actualAmount - item.budgetedAmount
                const variancePercent = (variance / item.budgetedAmount) * 100
                const usedPercent = (item.actualAmount / item.budgetedAmount) * 100

                return (
                  <tr key={item.costCodeId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.costCode.code}</p>
                        <p className="text-xs text-gray-500">{item.costCode.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">
                      {formatCurrency(item.budgetedAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-blue-600">
                      {formatCurrency(item.actualAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-orange-600">
                      {formatCurrency(item.committedAmount)}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-medium ${
                      variance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                      <span className="text-xs ml-1">
                        ({variancePercent > 0 ? '+' : ''}{variancePercent.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              usedPercent > 100 ? 'bg-red-600' :
                              usedPercent > 90 ? 'bg-yellow-600' : 'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(usedPercent, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${
                          usedPercent > 100 ? 'text-red-600' :
                          usedPercent > 90 ? 'text-yellow-600' : 'text-gray-900'
                        }`}>
                          {usedPercent.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">TOTAL</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                  {formatCurrency(financials.totalBudget)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-blue-600">
                  {formatCurrency(financials.totalActual)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-orange-600">
                  {formatCurrency(financials.totalCommitted)}
                </td>
                <td className={`px-4 py-3 text-right text-sm font-bold ${
                  budgetVariance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {budgetVariance > 0 ? '+' : ''}{formatCurrency(budgetVariance)}
                </td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Alerts and Warnings */}
      {(budgetVariancePercent > 5 || profitMargin < 10) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 mb-2">Alertas del Proyecto</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                {budgetVariancePercent > 5 && (
                  <li>• El proyecto está excediendo el presupuesto en {budgetVariancePercent.toFixed(1)}%</li>
                )}
                {profitMargin < 10 && (
                  <li>• El margen de ganancia está por debajo del objetivo ({profitMargin.toFixed(1)}%)</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Report Footer */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        <p>Reporte generado el {formatDate(new Date().toISOString())}</p>
        <p className="mt-1">Proyecto ID: {projectId}</p>
      </div>
    </div>
  )
}
