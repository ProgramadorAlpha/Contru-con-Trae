import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { useSubcontracts } from '@/hooks/useSubcontracts'
import { SubcontractList } from '@/components/subcontracts/SubcontractList'
import { SubcontractForm } from '@/components/subcontracts/SubcontractForm'
import type { Subcontract } from '@/types/subcontracts'

interface SubcontractFilters {
  status?: string
  projectId?: string
}

export function SubcontractsPage() {
  const { subcontracts, loading, refresh, createSubcontract } = useSubcontracts({ autoLoad: true })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedSubcontract, setSelectedSubcontract] = useState<Subcontract | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<SubcontractFilters>({
    status: undefined,
    projectId: undefined
  })

  const filteredSubcontracts = subcontracts.filter(sc => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const matchesSearch = 
        sc.contractNumber.toLowerCase().includes(search) ||
        sc.subcontractorName.toLowerCase().includes(search) ||
        sc.description.toLowerCase().includes(search) ||
        sc.projectName.toLowerCase().includes(search)
      
      if (!matchesSearch) return false
    }

    // Status filter
    if (filters.status && sc.status !== filters.status) {
      return false
    }

    // Project filter
    if (filters.projectId && sc.projectId !== filters.projectId) {
      return false
    }

    return true
  })

  const stats = {
    total: subcontracts.length,
    active: subcontracts.filter(sc => sc.status === 'active').length,
    draft: subcontracts.filter(sc => sc.status === 'draft').length,
    completed: subcontracts.filter(sc => sc.status === 'completed').length,
    totalValue: subcontracts.reduce((sum, sc) => sum + sc.totalAmount, 0),
    totalCertified: subcontracts.reduce((sum, sc) => sum + sc.totalCertified, 0)
  }

  return (
    <main role="main" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subcontratos</h1>
          <p className="text-gray-600 mt-1">
            Gestión de contratos con subcontratistas
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Subcontrato
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Subcontratos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Activos</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Valor Total</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            ${stats.totalValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Certificado</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            ${stats.totalCertified.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número, subcontratista, descripción o proyecto..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los Estados</option>
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Project Filter */}
          <select
            value={filters.projectId || ''}
            onChange={(e) => setFilters({ ...filters, projectId: e.target.value || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los Proyectos</option>
            {/* In real app, load projects dynamically */}
            <option value="proj-1">Proyecto Demo 1</option>
            <option value="proj-2">Proyecto Demo 2</option>
          </select>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Subcontrato</h2>
              <SubcontractForm
                onSubmit={async (data) => {
                  await createSubcontract(data as any)
                  setShowCreateForm(false)
                  refresh()
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Modal */}
      {selectedSubcontract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Subcontrato Detalles</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contract Number</label>
                  <p className="mt-1 text-gray-900">{selectedSubcontract.contractNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subcontractor</label>
                  <p className="mt-1 text-gray-900">{selectedSubcontract.subcontractorName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-gray-900">{selectedSubcontract.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                    <p className="mt-1 text-gray-900">${selectedSubcontract.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-gray-900">{selectedSubcontract.status}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => setSelectedSubcontract(null)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subcontracts List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredSubcontracts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">
            {searchTerm || filters.status || filters.projectId
              ? 'No se encontraron subcontratos con los filtros aplicados'
              : 'No hay subcontratos registrados'}
          </p>
          {!searchTerm && !filters.status && !filters.projectId && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Crear el primer subcontrato
            </button>
          )}
        </div>
      ) : (
        <SubcontractList
          subcontracts={filteredSubcontracts}
          onView={(subcontract) => setSelectedSubcontract(subcontract)}
          onEdit={(subcontract) => setSelectedSubcontract(subcontract)}
          loading={loading}
        />
      )}
    </main>
  )
}
