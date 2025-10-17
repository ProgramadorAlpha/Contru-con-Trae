/**
 * SubcontractCard Component
 * 
 * Detailed card view of a subcontract with financial information.
 */

import React from 'react'
import { DollarSign, Calendar, FileText, TrendingUp } from 'lucide-react'
import type { Subcontract } from '@/types/subcontracts'
import { formatCurrency, formatDate } from '@/lib/chartUtils'

interface SubcontractCardProps {
  subcontract: Subcontract
  onClose: () => void
}

export function SubcontractCard({ subcontract, onClose }: SubcontractCardProps) {
  const progress = subcontract.totalAmount > 0
    ? (subcontract.totalCertified / subcontract.totalAmount) * 100
    : 0

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{subcontract.contractNumber}</h2>
          <p className="text-gray-600">{subcontract.subcontractorName}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
        <p className="text-gray-900">{subcontract.description}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Scope</h3>
        <p className="text-gray-900">{subcontract.scope}</p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Total Amount</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(subcontract.totalAmount)}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Certified</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(subcontract.totalCertified)}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Paid</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(subcontract.totalPaid)}
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">Retained</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(subcontract.totalRetained)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Calendar className="w-4 h-4" />
            Start Date
          </div>
          <div className="font-medium">{formatDate(subcontract.startDate)}</div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Calendar className="w-4 h-4" />
            End Date
          </div>
          <div className="font-medium">{formatDate(subcontract.endDate)}</div>
        </div>
      </div>

      {/* Documents */}
      {subcontract.documents && subcontract.documents.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents ({subcontract.documents.length})
          </h3>
          <div className="space-y-2">
            {subcontract.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-900">{doc.name}</span>
                <span className="text-xs text-gray-500">{doc.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
