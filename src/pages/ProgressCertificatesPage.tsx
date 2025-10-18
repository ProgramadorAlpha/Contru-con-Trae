import { useState } from 'react'
import { Plus, Filter, FileText } from 'lucide-react'
import { useProgressCertificates } from '@/hooks/useProgressCertificates'
import { ProgressCertificateForm } from '@/components/certificates/ProgressCertificateForm'
import { CertificateApprovalCard } from '@/components/certificates/CertificateApprovalCard'
import type { ProgressCertificateFilters } from '@/types/progressCertificates'

export function ProgressCertificatesPage() {
  const { certificates, loading, refresh, getPendingApprovals } = useProgressCertificates({ autoLoad: true })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all')
  const [filters, setFilters] = useState<ProgressCertificateFilters>({
    status: undefined,
    projectId: undefined,
    subcontractId: undefined
  })

  // Get certificates based on active tab
  const displayCertificates = activeTab === 'pending' ? getPendingApprovals() : certificates

  const filteredCertificates = displayCertificates.filter(cert => {
    if (filters.status && cert.status !== filters.status) {
      return false
    }
    if (filters.projectId && cert.projectId !== filters.projectId) {
      return false
    }
    if (filters.subcontractId && cert.subcontractId !== filters.subcontractId) {
      return false
    }
    return true
  })

  const stats = {
    total: certificates.length,
    pending: certificates.filter(c => c.status === 'pending_approval').length,
    approved: certificates.filter(c => c.status === 'approved').length,
    paid: certificates.filter(c => c.status === 'paid').length,
    totalCertified: certificates.reduce((sum, c) => sum + c.amountCertified, 0),
    totalPaid: certificates.reduce((sum, c) => sum + (c.status === 'paid' ? c.netPayable : 0), 0)
  }

  return (
    <main role="main" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificados de Progreso</h1>
          <p className="text-gray-600 mt-1">
            Certificación de avance y autorización de pagos
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Certificado
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Certificados</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Certificado</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            ${stats.totalCertified.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Pagado</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ${stats.totalPaid.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Todos los Certificados
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pendientes de Aprobación
            {stats.pending > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {stats.pending}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-gray-500" />
          
          {/* Status Filter */}
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los Estados</option>
            <option value="draft">Borrador</option>
            <option value="pending_approval">Pendiente</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
            <option value="paid">Pagado</option>
          </select>

          {/* Project Filter */}
          <select
            value={filters.projectId || ''}
            onChange={(e) => setFilters({ ...filters, projectId: e.target.value || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los Proyectos</option>
            <option value="proj-1">Proyecto Demo 1</option>
            <option value="proj-2">Proyecto Demo 2</option>
          </select>

          {/* Subcontract Filter */}
          <select
            value={filters.subcontractId || ''}
            onChange={(e) => setFilters({ ...filters, subcontractId: e.target.value || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los Subcontratos</option>
            {/* In real app, load subcontracts dynamically */}
          </select>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Certificado de Progreso</h2>
              <ProgressCertificateForm
                projectId="proj-1" // In real app, allow selection
                onSuccess={() => {
                  setShowCreateForm(false)
                  refresh()
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Certificates List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            {activeTab === 'pending'
              ? 'No hay certificados pendientes de aprobación'
              : 'No se encontraron certificados'}
          </p>
          {activeTab === 'all' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Crear el primer certificado
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCertificates.map((certificate) => (
            <CertificateApprovalCard
              key={certificate.id}
              certificate={certificate}
              onApproved={() => refresh()}
              onRejected={() => refresh()}
            />
          ))}
        </div>
      )}
    </main>
  )
}
