import React, { useState } from 'react'
import { Plus, Edit, Trash2, Save, X, Search } from 'lucide-react'
import { useCostCodes } from '@/hooks/useCostCodes'
import type { CostCode, CreateCostCodeDTO } from '@/types/costCodes'

export function CostCodeManager() {
  const { costCodes, createCostCode, updateCostCode, deleteCostCode, searchCostCodes, loading } = useCostCodes()
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<Partial<CreateCostCodeDTO>>({
    code: '',
    name: '',
    description: '',
    division: '',
    category: '',
    type: 'labor',
    unit: 'global',
    isActive: true,
    isDefault: false
  })

  const filteredCodes = searchTerm
    ? searchCostCodes(searchTerm)
    : costCodes

  const handleCreate = async () => {
    try {
      await createCostCode(formData as CreateCostCodeDTO)
      setShowCreateForm(false)
      setFormData({
        code: '',
        name: '',
        description: '',
        division: '',
        category: '',
        type: 'labor',
        unit: 'global',
        isActive: true,
        isDefault: false
      })
    } catch (error) {
      console.error('Error creating cost code:', error)
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      await updateCostCode(id, formData)
      setEditingId(null)
    } catch (error) {
      console.error('Error updating cost code:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este código de costo?')) {
      try {
        await deleteCostCode(id)
      } catch (error) {
        console.error('Error deleting cost code:', error)
      }
    }
  }

  const startEdit = (code: CostCode) => {
    setEditingId(code.id)
    setFormData({
      code: code.code,
      name: code.name,
      description: code.description,
      division: code.division,
      category: code.category,
      type: code.type,
      unit: code.unit,
      isActive: code.isActive,
      isDefault: code.isDefault
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({
      code: '',
      name: '',
      description: '',
      division: '',
      category: '',
      type: 'labor',
      unit: 'global',
      isActive: true,
      isDefault: false
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Códigos de Costo</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Código
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por código, nombre o descripción..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crear Nuevo Código de Costo</h3>
          <CostCodeForm
            formData={formData}
            onChange={setFormData}
            onSave={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            loading={loading}
          />
        </div>
      )}

      {/* Cost Codes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  División
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCodes.map((code) => (
                <tr key={code.id} className="hover:bg-gray-50">
                  {editingId === code.id ? (
                    <td colSpan={7} className="px-6 py-4">
                      <CostCodeForm
                        formData={formData}
                        onChange={setFormData}
                        onSave={() => handleUpdate(code.id)}
                        onCancel={cancelEdit}
                        loading={loading}
                      />
                    </td>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{code.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{code.name}</p>
                          {code.description && (
                            <p className="text-xs text-gray-500">{code.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {code.division}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {code.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {code.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          code.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {code.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => startEdit(code)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(code.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCodes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron códigos de costo</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Form Component
interface CostCodeFormProps {
  formData: Partial<CreateCostCodeDTO>
  onChange: (data: Partial<CreateCostCodeDTO>) => void
  onSave: () => void
  onCancel: () => void
  loading: boolean
}

function CostCodeForm({ formData, onChange, onSave, onCancel, loading }: CostCodeFormProps) {
  const handleChange = (field: keyof CreateCostCodeDTO, value: any) => {
    onChange({ ...formData, [field]: value })
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">División *</label>
        <input
          type="text"
          value={formData.division}
          onChange={(e) => handleChange('division', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
        <select
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="labor">Mano de Obra</option>
          <option value="material">Material</option>
          <option value="equipment">Equipo</option>
          <option value="subcontract">Subcontrato</option>
          <option value="other">Otro</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
        <select
          value={formData.unit}
          onChange={(e) => handleChange('unit', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="global">Global</option>
          <option value="project">Proyecto</option>
        </select>
      </div>
      <div className="col-span-2 flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Activo</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e) => handleChange('isDefault', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Por Defecto</span>
        </label>
      </div>
      <div className="col-span-2 flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
