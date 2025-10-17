import React, { useState } from 'react'
import { CheckCircle, XCircle, Clock, FileText, Calendar, DollarSign, AlertCircle } from 'lucide-react'
import { useProgressCertificates } from '@/hooks/useProgressCertificates'
import type { ProgressCertificate } from '@/types/progressCertificates'
import { formatCurrency, formatDate } from '@/lib/chartUtils'

interface CertificateApprovalCardProps {
  certificate: ProgressCertificate
  onApproved?: () => void
  onRejected?: () => void
}

export function CertificateApprovalCard({
  certificate,
  onApproved,
  onRejected
}: CertificateApprovalCardProps) {
  const { approveCertificate, rejectCertificate, loading } = useProgressCertificates()
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState('')

  const handleApprove = async () => {
    try {
      setError('')
      await approveCertificate({
        certificateId: certificate.id,
        approverId: 'current-user-id' // TODO: Get from auth
      })
      onApproved?.()
    } catch (err) {
      setError('Error al aprobar el certificado')
      console.error(err)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Debe proporcionar una razón para el rechazo')
      return
    }

    try {
      setError('')
      await rejectCertificate({
        certificateId: certificate.id,
        rejectedBy: 'current-user-id',
        rejectionReason: rejectionReason
      })
      setShowRejectModal(false)
      onRejected?.()
    } catch (err) {
      setError('Error al rechazar el certificado')
      console.error(err)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Borrador' },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendiente' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Aprobado' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rechazado' },
      paid: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Pagado' }
    }

    const badge = badges[status as keyof typeof badges] || badges.draft
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Certificado {certificate.certificateNumber}
              </h3>
              {getStatusBadge(certificate.status)}
            </div>
            <p className="text-sm text-gray-600">
              Subcontrato: {certificate.subcontractId}
            </p>
          </div>
          <FileText className="w-6 h-6 text-gray-400" />
        </div>

        {/* Period */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Calendar className="w-4 h-4" />
          <span>
            Período: {formatDate(certificate.periodStart)} - {formatDate(certificate.periodEnd)}
          </span>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 mb-1">Monto Certificado</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(certificate.amountCertified)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Retención</p>
            <p className="text-lg font-semibold text-orange-600">
              -{formatCurrency(certificate.retentionAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Neto a Pagar</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(certificate.netPayable)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">% Completado</p>
            <p className="text-lg font-semibold text-blue-600">
              {certificate.percentageComplete}%
            </p>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Certificado Previo:</span>
              <span className="ml-2 font-medium text-blue-900">
                {formatCurrency(certificate.previousCertified)}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Acumulado:</span>
              <span className="ml-2 font-medium text-blue-900">
                {formatCurrency(certificate.cumulativeCertified)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {certificate.notes && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Notas:</p>
            <p className="text-sm text-gray-600">{certificate.notes}</p>
          </div>
        )}

        {/* Rejection Reason */}
        {certificate.status === 'rejected' && certificate.rejectionReason && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-900 mb-1">Razón de Rechazo:</p>
            <p className="text-sm text-red-700">{certificate.rejectionReason}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Approval Actions */}
        {certificate.status === 'pending_approval' && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Rechazar
            </button>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {loading ? 'Aprobando...' : 'Aprobar'}
            </button>
          </div>
        )}

        {/* Submitted Info */}
        <div className="mt-4 pt-4 border-t text-xs text-gray-500">
          <p>Enviado por: {certificate.submittedBy}</p>
          <p>Fecha: {formatDate(certificate.submittedAt)}</p>
          {certificate.approvedBy && (
            <p className="text-green-600">Aprobado por: {certificate.approvedBy} el {formatDate(certificate.approvedAt!)}</p>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rechazar Certificado
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
            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                  setError('')
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Rechazando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
