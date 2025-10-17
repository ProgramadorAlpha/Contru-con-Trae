/**
 * SubcontractForm Component
 * 
 * Form for creating and editing subcontracts with payment schedule.
 */

import React, { useState } from 'react'
import type { Subcontract, CreateSubcontractDTO, UpdateSubcontractDTO, PaymentScheduleItem } from '@/types/subcontracts'

interface SubcontractFormProps {
  initialData?: Partial<Subcontract>
  onSubmit: (data: CreateSubcontractDTO | UpdateSubcontractDTO) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

export function SubcontractForm({ initialData, onSubmit, onCancel, isEdit = false }: SubcontractFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    projectId: initialData?.projectId || '',
    projectName: initialData?.projectName || '',
    subcontractorId: initialData?.subcontractorId || '',
    subcontractorName: initialData?.subcontractorName || '',
    contractNumber: initialData?.contractNumber || '',
    description: initialData?.description || '',
    scope: initialData?.scope || '',
    totalAmount: initialData?.totalAmount || 0,
    currency: initialData?.currency || 'USD',
    retentionPercentage: initialData?.retentionPercentage || 10,
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    costCodes: initialData?.costCodes || []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData as any)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contract Number *
          </label>
          <input
            type="text"
            required
            value={formData.contractNumber}
            onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcontractor Name *
          </label>
          <input
            type="text"
            required
            value={formData.subcontractorName}
            onChange={(e) => setFormData({ ...formData, subcontractorName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Amount *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.totalAmount}
            onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Retention % *
          </label>
          <input
            type="number"
            required
            min="0"
            max="100"
            step="0.1"
            value={formData.retentionPercentage}
            onChange={(e) => setFormData({ ...formData, retentionPercentage: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date *
          </label>
          <input
            type="date"
            required
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Subcontract' : 'Create Subcontract'}
        </button>
      </div>
    </form>
  )
}
