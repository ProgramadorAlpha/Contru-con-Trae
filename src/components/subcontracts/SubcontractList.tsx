/**
 * SubcontractList Component
 * 
 * Displays a list of subcontracts with filtering and actions.
 */

import React from 'react'
import { FileText, DollarSign, Calendar, CheckCircle } from 'lucide-react'
import type { Subcontract } from '@/types/subcontracts'
import { formatCurrency, formatDate } from '@/lib/chartUtils'

interface SubcontractListProps {
  subcontracts: Subcontract[]
  onView: (subcontract: Subcontract) => void
  onEdit: (subcontract: Subcontract) => void
  loading?: boolean
}

export function SubcontractList({ subcontracts, onView, onEdit, loading }: SubcontractListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading subcontracts...</div>
      </div>
    )
  }

  if (subcontracts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No subcontracts found</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {subcontracts.map((subcontract) => (
        <div
          key={subcontract.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onView(subcontract)}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {subcontract.contractNumber}
              </h3>
              <p className="text-sm text-gray-600">{subcontract.subcontractorName}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subcontract.status)}`}>
              {subcontract.status}
            </span>
          </div>

          <p className="text-gray-700 mb-4 line-clamp-2">{subcontract.description}</p>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-gray-600">Total Amount</div>
                <div className="font-semibold">{formatCurrency(subcontract.totalAmount)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-gray-600">Certified</div>
                <div className="font-semibold">{formatCurrency(subcontract.totalCertified)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-gray-600">End Date</div>
                <div className="font-semibold">{formatDate(subcontract.endDate)}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Remaining: {formatCurrency(subcontract.remainingBalance)}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(subcontract)
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
