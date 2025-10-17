import React, { useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, FileText, Calendar, DollarSign, Filter } from 'lucide-react'
import { useExpenseApprovals } from '@/hooks/useExpenseApprovals'
import type { Expense } from '@/types/expenses'
import { formatCurrency, formatDate } from '@/lib/chartUtils'

export function ExpenseApprovalQueue() {
  const {
    pendingExpenses,
    approveExpense,
    rejectExpense,
    bulkApprove,
    bulkReject,
    loading
  } = useExpenseApprovals()

  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set())
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingExpenseId, setRejectingExpenseId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [filterAutoCreated, setFilterAutoCreated] = useState<boolean | null>(null)
  const [filterNeedsReview, setFilterNeedsReview] = useState<boolean | null>(null)

  const filteredExpenses = pendingExpenses.filter(expense => {
    if (filterAutoCreated !== null && expense.isAutoCreated !== filterAutoCreated) {
      return false
    }
    if (filterNeedsReview !== null && expense.needsReview !== filterNeedsReview) {
      return false
    }
    return true
  })

  const handleSelectExpense = (expenseId: string) => {
    const newSelected = new Set(selectedExpenses)
    if (newSelected.has(expenseId)) {
      newSelected.delete(expenseId)
    } else {
      newSelected.add(expenseId)
    }
    setSelectedExpenses(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedExpenses.size === filteredExpenses.length) {
      setSelectedExpenses(new Set())
    } else {
      setSelectedExpenses(new Set(filteredExpenses.map(e => e.id)))
    }
  }

  const handleApprove = async (expenseId: string) => {
    try {
      await approveExpense({
        expenseId,
        approverId: 'current-user-id' // TODO: Get from auth
      })
    } catch (error) {
      console.error('Error approving expense:', error)
    }
  }

  const handleReject = async () => {
    if (!rejectingExpenseId || !rejectionReason.trim()) {
      return
    }

    try {
      await rejectExpense({
        expenseId: rejectingExpenseId,
        rejectedBy: 'current-user-id',
        rejectionReason: rejectionReason
      })
      setShowRejectModal(false)
      setRejectingExpenseId(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting expense:', error)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedExpenses.size === 0) return

    if (confirm(`¿Aprobar ${selectedExpenses.size} gastos seleccionados?`)) {
      try {
        await bulkApprove({
          expenseIds: Array.from(selectedExpenses),
          approverId: 'current-user-id'
        })
        setSelectedExpenses(new Set())
      } catch (error) {
        console.error('Error bulk approving:', error)
      }
    }
  }

  const handleBulkReject = async () => {
    if (selectedExpenses.size === 0) return

    const reason = prompt('Razón del rechazo masivo:')
    if (!reason) return

    try {
      await bulkReject({
        expenseIds: Array.from(selectedExpenses),
        rejectedBy: 'current-user-id',
        rejectionReason: reason
      })
      setSelectedExpenses(new Set())
    } catch (error) {
      console.error('Error bulk rejecting:', error)
    }
  }

  const openRejectModal = (expenseId: string) => {
    setRejectingExpenseId(expenseId)
    setShowRejectModal(true)
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Cola de Aprobación de Gastos
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredExpenses.length} gastos pendientes de aprobación
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterAutoCreated === null ? 'all' : filterAutoCreated.toString()}
            onChange={(e) => setFilterAutoCreated(e.target.value === 'all' ? null : e.target.value === 'true')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="true">Auto-creados</option>
            <option value="false">Manuales</option>
          </select>
          <select
            value={filterNeedsReview === null ? 'all' : filterNeedsReview.toString()}
            onChange={(e) => setFilterNeedsReview(e.target.value === 'all' ? null : e.target.value === 'true')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="true">Requiere Revisión</option>
            <option value="false">Sin Revisión</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedExpenses.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-900">
            {selectedExpenses.size} gastos seleccionados
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkReject}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Rechazar Seleccionados
            </button>
            <button
              onClick={handleBulkApprove}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Aprobar Seleccionados
            </button>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay gastos pendientes
            </h3>
            <p className="text-gray-500">
              Todos los gastos han sido procesados
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <ExpenseApprovalCard
              key={expense.id}
              expense={expense}
              isSelected={selectedExpenses.has(expense.id)}
              isExpanded={expandedExpense === expense.id}
              onSelect={() => handleSelectExpense(expense.id)}
              onToggleExpand={() => setExpandedExpense(expandedExpense === expense.id ? null : expense.id)}
              onApprove={() => handleApprove(expense.id)}
              onReject={() => openRejectModal(expense.id)}
              loading={loading}
            />
          ))
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rechazar Gasto
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Por favor proporcione una razón para el rechazo:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Razón del rechazo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectingExpenseId(null)
                  setRejectionReason('')
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Rechazando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Expense Approval Card Component
interface ExpenseApprovalCardProps {
  expense: Expense
  isSelected: boolean
  isExpanded: boolean
  onSelect: () => void
  onToggleExpand: () => void
  onApprove: () => void
  onReject: () => void
  loading: boolean
}

function ExpenseApprovalCard({
  expense,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onApprove,
  onReject,
  loading
}: ExpenseApprovalCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 transition-colors ${
      isSelected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {expense.description}
                  </h3>
                  {expense.isAutoCreated && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                      Auto-creado
                    </span>
                  )}
                  {expense.needsReview && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Requiere Revisión
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  {expense.supplierName} • {expense.costCode.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(expense.totalAmount)}
                </p>
                {expense.ocrConfidence && (
                  <p className="text-xs text-gray-500">
                    Confianza OCR: {(expense.ocrConfidence * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(expense.invoiceDate)}
              </span>
              {expense.invoiceNumber && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {expense.invoiceNumber}
                </span>
              )}
              <span>Proyecto: {expense.projectName}</span>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600">Monto Base:</span>
                    <span className="ml-2 font-medium">{formatCurrency(expense.amount)}</span>
                  </div>
                  {expense.taxAmount && (
                    <div>
                      <span className="text-gray-600">Impuesto:</span>
                      <span className="ml-2 font-medium">{formatCurrency(expense.taxAmount)}</span>
                    </div>
                  )}
                </div>
                {expense.notes && (
                  <div>
                    <span className="text-gray-600">Notas:</span>
                    <p className="text-gray-900 mt-1">{expense.notes}</p>
                  </div>
                )}
                {expense.ocrData && (
                  <div className="p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-600">Datos OCR:</span>
                    <p className="text-gray-700 mt-1">
                      Extraído automáticamente con {(expense.ocrData.confidence * 100).toFixed(0)}% de confianza
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={onToggleExpand}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {isExpanded ? 'Ver menos' : 'Ver más detalles'}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onReject}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Rechazar
                </button>
                <button
                  onClick={onApprove}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Aprobar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
