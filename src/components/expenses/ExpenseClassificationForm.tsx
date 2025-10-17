import React, { useState } from 'react'
import { AlertCircle, DollarSign, Calendar, FileText } from 'lucide-react'
import { CostCodeSelector } from '@/components/costCodes/CostCodeSelector'
import type { CreateExpenseDTO, ExpenseClassification } from '@/types/expenses'
import type { CostCode } from '@/types/costCodes'
import { formatCurrency } from '@/lib/chartUtils'

interface ExpenseClassificationFormProps {
  initialData?: Partial<CreateExpenseDTO>
  onSubmit: (data: CreateExpenseDTO) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export function ExpenseClassificationForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}: ExpenseClassificationFormProps) {
  const [formData, setFormData] = useState<Partial<CreateExpenseDTO>>({
    projectId: initialData?.projectId || '',
    projectName: initialData?.projectName || '',
    costCodeId: initialData?.costCodeId || '',
    supplierId: initialData?.supplierId || '',
    supplierName: initialData?.supplierName || '',
    amount: initialData?.amount || 0,
    taxAmount: initialData?.taxAmount || 0,
    description: initialData?.description || '',
    invoiceNumber: initialData?.invoiceNumber || '',
    invoiceDate: initialData?.invoiceDate || '',
    dueDate: initialData?.dueDate || '',
    notes: initialData?.notes || '',
    currency: initialData?.currency || 'USD'
  })

  const [selectedCostCode, setSelectedCostCode] = useState<CostCode | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [warnings, setWarnings] = useState<string[]>([])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    const newWarnings: string[] = []

    // Required fields
    if (!formData.projectId) {
      newErrors.projectId = 'Proyecto es requerido para costeo adecuado'
    }

    if (!formData.costCodeId) {
      newErrors.costCodeId = 'Código de costo es requerido para clasificación'
    }

    if (!formData.supplierId) {
      newErrors.supplierId = 'Proveedor es requerido para seguimiento'
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Monto debe ser mayor a 0'
    }

    if (!formData.description || formData.description.trim().length < 5) {
      newErrors.description = 'Descripción debe tener al menos 5 caracteres'
    }

    if (!formData.invoiceDate) {
      newErrors.invoiceDate = 'Fecha de factura es requerida'
    }

    // Warnings
    if (formData.amount && formData.amount > 10000) {
      newWarnings.push('Monto elevado detectado - considere si requiere aprobación especial')
    }

    if (!formData.invoiceNumber) {
      newWarnings.push('Número de factura no proporcionado - ayuda con seguimiento y auditoría')
    }

    setErrors(newErrors)
    setWarnings(newWarnings)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData as CreateExpenseDTO)
    } catch (error) {
      console.error('Error submitting expense:', error)
      setErrors({ submit: 'Error al guardar el gasto. Por favor intente nuevamente.' })
    }
  }

  const handleChange = (field: keyof CreateExpenseDTO, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCostCodeChange = (costCodeId: string, costCode: CostCode) => {
    setSelectedCostCode(costCode)
    handleChange('costCodeId', costCodeId)
  }

  const totalAmount = (formData.amount || 0) + (formData.taxAmount || 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Classification Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">
          Clasificación Requerida
        </h3>
        <p className="text-xs text-blue-700 mb-4">
          Todos los gastos deben clasificarse por proyecto, código de costo y proveedor para un costeo adecuado.
        </p>

        {/* Project Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proyecto * <span className="text-red-600">●</span>
          </label>
          <select
            value={formData.projectId}
            onChange={(e) => {
              handleChange('projectId', e.target.value)
              // In real app, fetch project name
              handleChange('projectName', 'Proyecto Seleccionado')
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar proyecto...</option>
            <option value="proj-1">Proyecto Demo 1</option>
            <option value="proj-2">Proyecto Demo 2</option>
          </select>
          {errors.projectId && (
            <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
          )}
        </div>

        {/* Cost Code Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código de Costo * <span className="text-red-600">●</span>
          </label>
          <CostCodeSelector
            value={formData.costCodeId}
            onChange={handleCostCodeChange}
            projectId={formData.projectId}
            error={errors.costCodeId}
          />
        </div>

        {/* Supplier Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proveedor * <span className="text-red-600">●</span>
          </label>
          <select
            value={formData.supplierId}
            onChange={(e) => {
              handleChange('supplierId', e.target.value)
              // In real app, fetch supplier name
              handleChange('supplierName', 'Proveedor Seleccionado')
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar proveedor...</option>
            <option value="sup-1">Proveedor Demo 1</option>
            <option value="sup-2">Proveedor Demo 2</option>
          </select>
          {errors.supplierId && (
            <p className="mt-1 text-sm text-red-600">{errors.supplierId}</p>
          )}
        </div>
      </div>

      {/* Financial Details */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Detalles Financieros</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto * <span className="text-red-600">●</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Impuesto
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                value={formData.taxAmount}
                onChange={(e) => handleChange('taxAmount', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Total Display */}
        {totalAmount > 0 && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total:</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción * <span className="text-red-600">●</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            placeholder="Descripción detallada del gasto..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Invoice Details */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Detalles de Factura</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Factura
            </label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => handleChange('invoiceNumber', e.target.value)}
              placeholder="INV-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Factura * <span className="text-red-600">●</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => handleChange('invoiceDate', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {errors.invoiceDate && (
              <p className="mt-1 text-sm text-red-600">{errors.invoiceDate}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Vencimiento
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas Adicionales
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={2}
          placeholder="Notas adicionales..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900 mb-1">Advertencias:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Guardar Gasto'}
        </button>
      </div>
    </form>
  )
}
