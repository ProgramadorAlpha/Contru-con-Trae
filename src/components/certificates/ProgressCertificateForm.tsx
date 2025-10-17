import React, { useState, useEffect } from 'react'
import { FileText, Upload, X, AlertCircle } from 'lucide-react'
import { useProgressCertificates } from '@/hooks/useProgressCertificates'
import { useSubcontracts } from '@/hooks/useSubcontracts'
import type { CreateProgressCertificateDTO } from '@/types/progressCertificates'
import { formatCurrency } from '@/lib/chartUtils'

interface ProgressCertificateFormProps {
  projectId: string
  subcontractId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProgressCertificateForm({
  projectId,
  subcontractId,
  onSuccess,
  onCancel
}: ProgressCertificateFormProps) {
  const { createCertificate, loading } = useProgressCertificates()
  const { subcontracts, fetchSubcontractsByProject } = useSubcontracts()

  const [formData, setFormData] = useState<Partial<CreateProgressCertificateDTO>>({
    projectId,
    subcontractId: subcontractId || '',
    certificateNumber: '',
    periodStart: '',
    periodEnd: '',
    percentageComplete: 0,
    amountCertified: 0,
    notes: '',
    photos: [],
    documents: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedSubcontract, setSelectedSubcontract] = useState<any>(null)
  const [calculatedValues, setCalculatedValues] = useState({
    retentionAmount: 0,
    netPayable: 0,
    remainingBalance: 0
  })

  useEffect(() => {
    if (projectId) {
      fetchSubcontractsByProject(projectId)
    }
  }, [projectId])

  useEffect(() => {
    if (formData.subcontractId) {
      const subcontract = subcontracts.find(sc => sc.id === formData.subcontractId)
      setSelectedSubcontract(subcontract)

      if (subcontract && formData.amountCertified) {
        const retentionAmount = formData.amountCertified * (subcontract.retentionPercentage / 100)
        const netPayable = formData.amountCertified - retentionAmount
        const remainingBalance = subcontract.remainingBalance - formData.amountCertified

        setCalculatedValues({
          retentionAmount,
          netPayable,
          remainingBalance
        })
      }
    }
  }, [formData.subcontractId, formData.amountCertified, subcontracts])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.subcontractId) {
      newErrors.subcontractId = 'Subcontrato es requerido'
    }

    if (!formData.certificateNumber) {
      newErrors.certificateNumber = 'Número de certificado es requerido'
    }

    if (!formData.periodStart) {
      newErrors.periodStart = 'Fecha de inicio es requerida'
    }

    if (!formData.periodEnd) {
      newErrors.periodEnd = 'Fecha de fin es requerida'
    }

    if (formData.periodStart && formData.periodEnd && formData.periodStart > formData.periodEnd) {
      newErrors.periodEnd = 'La fecha de fin debe ser posterior a la fecha de inicio'
    }

    if (!formData.amountCertified || formData.amountCertified <= 0) {
      newErrors.amountCertified = 'Monto certificado debe ser mayor a 0'
    }

    if (selectedSubcontract && formData.amountCertified && formData.amountCertified > selectedSubcontract.remainingBalance) {
      newErrors.amountCertified = `El monto excede el saldo restante (${formatCurrency(selectedSubcontract.remainingBalance)})`
    }

    if (!formData.percentageComplete || formData.percentageComplete < 0 || formData.percentageComplete > 100) {
      newErrors.percentageComplete = 'Porcentaje debe estar entre 0 y 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await createCertificate(formData as CreateProgressCertificateDTO)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating certificate:', error)
      setErrors({ submit: 'Error al crear el certificado. Por favor intente nuevamente.' })
    }
  }

  const handleChange = (field: keyof CreateProgressCertificateDTO, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Subcontract Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subcontrato *
        </label>
        <select
          value={formData.subcontractId}
          onChange={(e) => handleChange('subcontractId', e.target.value)}
          disabled={!!subcontractId}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Seleccionar subcontrato...</option>
          {subcontracts.map(sc => (
            <option key={sc.id} value={sc.id}>
              {sc.contractNumber} - {sc.subcontractorName} ({formatCurrency(sc.remainingBalance)} restante)
            </option>
          ))}
        </select>
        {errors.subcontractId && (
          <p className="mt-1 text-sm text-red-600">{errors.subcontractId}</p>
        )}
      </div>

      {/* Certificate Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número de Certificado *
        </label>
        <input
          type="text"
          value={formData.certificateNumber}
          onChange={(e) => handleChange('certificateNumber', e.target.value)}
          placeholder="CERT-001"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.certificateNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.certificateNumber}</p>
        )}
      </div>

      {/* Period */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período Inicio *
          </label>
          <input
            type="date"
            value={formData.periodStart}
            onChange={(e) => handleChange('periodStart', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.periodStart && (
            <p className="mt-1 text-sm text-red-600">{errors.periodStart}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período Fin *
          </label>
          <input
            type="date"
            value={formData.periodEnd}
            onChange={(e) => handleChange('periodEnd', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.periodEnd && (
            <p className="mt-1 text-sm text-red-600">{errors.periodEnd}</p>
          )}
        </div>
      </div>

      {/* Amount and Percentage */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto Certificado *
          </label>
          <input
            type="number"
            value={formData.amountCertified}
            onChange={(e) => handleChange('amountCertified', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.amountCertified && (
            <p className="mt-1 text-sm text-red-600">{errors.amountCertified}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Porcentaje Completado *
          </label>
          <input
            type="number"
            value={formData.percentageComplete}
            onChange={(e) => handleChange('percentageComplete', parseFloat(e.target.value) || 0)}
            min="0"
            max="100"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.percentageComplete && (
            <p className="mt-1 text-sm text-red-600">{errors.percentageComplete}</p>
          )}
        </div>
      </div>

      {/* Calculated Values */}
      {selectedSubcontract && formData.amountCertified > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Cálculos Automáticos</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Retención ({selectedSubcontract.retentionPercentage}%):</span>
              <p className="font-semibold text-blue-900">{formatCurrency(calculatedValues.retentionAmount)}</p>
            </div>
            <div>
              <span className="text-blue-700">Neto a Pagar:</span>
              <p className="font-semibold text-blue-900">{formatCurrency(calculatedValues.netPayable)}</p>
            </div>
            <div>
              <span className="text-blue-700">Saldo Restante:</span>
              <p className="font-semibold text-blue-900">{formatCurrency(calculatedValues.remainingBalance)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          placeholder="Descripción del trabajo certificado..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

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
          {loading ? 'Creando...' : 'Crear Certificado'}
        </button>
      </div>
    </form>
  )
}
