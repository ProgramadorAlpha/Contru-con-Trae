import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, TrendingUp, AlertCircle } from 'lucide-react'
import { useProjectFinancials } from '@/hooks/useProjectFinancials'
import { JobCostingReport } from '@/components/financials/JobCostingReport'
import { ProfitabilityWidget } from '@/components/financials/ProfitabilityWidget'
import { CommittedCostWidget } from '@/components/financials/CommittedCostWidget'
import { CostCodeBreakdown } from '@/components/financials/CostCodeBreakdown'

export function ProjectFinancialsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { financials, loading, error, refresh } = useProjectFinancials({
    projectId: projectId || '',
    autoLoad: true,
    realtime: false
  })
  const [activeTab, setActiveTab] = useState<'overview' | 'report'>('overview')

  const handleExport = async () => {
    try {
      // In real app, would call export service
      console.log('Exporting report for project:', projectId)
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  if (loading) {
    return (
      <main role="main" className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </main>
    )
  }

  if (error) {
    return (
      <main role="main" className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Error al cargar datos financieros</h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
        </div>
      </main>
    )
  }

  if (!financials) {
    return (
      <main role="main" className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-500">No se encontraron datos financieros para este proyecto</p>
      </main>
    )
  }

  return (
    <main role="main" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financieros del Proyecto</h1>
          <p className="text-gray-600 mt-1">
            Análisis financiero y costeo de obra
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar Reporte
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Vista General
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'report'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reporte Completo
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfitabilityWidget
              financials={financials}
            />
            <CommittedCostWidget
              financials={financials}
            />
          </div>

          {/* Cost Code Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Desglose por Código de Costo
            </h2>
            <CostCodeBreakdown budgets={financials.budgetByCostCode} />
          </div>

          {/* Budget Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Estado del Presupuesto
            </h2>
            <div className="space-y-4">
              <div>
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
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Gastado: ${financials.totalActual.toLocaleString()}</span>
                  <span>Comprometido: ${financials.totalCommitted.toLocaleString()}</span>
                  <span>Disponible: ${(financials.totalBudget - financials.totalActual - financials.totalCommitted).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Presupuesto Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${financials.totalBudget.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Costo Actual</p>
                  <p className="text-xl font-bold text-blue-600">
                    ${financials.totalActual.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Proyección Final</p>
                  <p className="text-xl font-bold text-purple-600">
                    ${financials.estimatedFinalCost.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {financials.totalActual > financials.totalBudget * 0.9 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-900">Alerta de Presupuesto</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    El proyecto ha utilizado más del 90% del presupuesto. Se recomienda revisar los costos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <JobCostingReport
          projectId={projectId || ''}
          financials={financials}
          onExport={handleExport}
        />
      )}
    </main>
  )
}
