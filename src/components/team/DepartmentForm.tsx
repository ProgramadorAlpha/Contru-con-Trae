import React, { useState, useEffect } from 'react'
import { X, Building2, User, DollarSign } from 'lucide-react'
import { Department, Employee, DepartmentFormData, ValidationErrors } from '@/types/team'
import { cn } from '@/lib/utils'

interface DepartmentFormProps {
  department?: Department | null
  employees: Employee[]
  isOpen: boolean
  onClose: () => void
  onSave: (data: DepartmentFormData) => Promise<void>
}

export function DepartmentForm({ department, employees, isOpen, onClose, onSave }: DepartmentFormProps) {
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    description: '',
    managerId: '',
    budget: 0
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [loading, setLoading] = useState(false)

  // Initialize form data when department changes
  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        description: department.description,
        managerId: department.managerId,
        budget: department.budget
      })
    } else {
      // Reset form for new department
      setFormData({
        name: '',
        description: '',
        managerId: '',
        budget: 0
      })
    }
    setErrors({})
  }, [department, isOpen])

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del departamento es obligatorio'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria'
    }

    if (!formData.managerId) {
      newErrors.managerId = 'Debe seleccionar un jefe de departamento'
    }

    if (formData.budget < 0) {
      newErrors.budget = 'El presupuesto no puede ser negativo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving department:', error)
      // Handle error (could show toast notification)
    } finally {
      setLoading(false)
    }
  }

  // Filter available managers (employees who are not already managers of other departments)
  const availableManagers = employees.filter(emp => {
    // If editing, allow current manager
    if (department && emp.id === department.managerId) {
      return true
    }
    // Otherwise, only show employees who are not managers of other departments
    return emp.status === 'Activo'
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {department ? 'Editar Departamento' : 'Nuevo Departamento'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Department Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Departamento *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: Ingeniería, Arquitectura, Construcción..."
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                errors.name ? 'border-red-300' : 'border-gray-300'
              )}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe las responsabilidades y funciones del departamento..."
              rows={4}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                errors.description ? 'border-red-300' : 'border-gray-300'
              )}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Manager */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jefe de Departamento *
            </label>
            <select
              value={formData.managerId}
              onChange={(e) => handleInputChange('managerId', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                errors.managerId ? 'border-red-300' : 'border-gray-300'
              )}
            >
              <option value="">Seleccionar jefe de departamento</option>
              {availableManagers.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName} - {employee.role}
                </option>
              ))}
            </select>
            {errors.managerId && (
              <p className="text-red-600 text-sm mt-1">{errors.managerId}</p>
            )}
            {availableManagers.length === 0 && (
              <p className="text-yellow-600 text-sm mt-1">
                No hay empleados activos disponibles para ser jefes de departamento
              </p>
            )}
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Presupuesto Anual (€)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', Number(e.target.value))}
                placeholder="0"
                className={cn(
                  'w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  errors.budget ? 'border-red-300' : 'border-gray-300'
                )}
              />
            </div>
            {errors.budget && (
              <p className="text-red-600 text-sm mt-1">{errors.budget}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Presupuesto anual asignado al departamento para gastos operativos
            </p>
          </div>

          {/* Preview */}
          {formData.name && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Vista Previa</h4>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-semibold text-gray-900">{formData.name}</h5>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{formData.description}</p>
                  {formData.managerId && (
                    <div className="flex items-center mt-2 text-xs text-gray-600">
                      <User className="w-3 h-3 mr-1" />
                      <span>
                        Jefe: {availableManagers.find(emp => emp.id === formData.managerId)?.fullName}
                      </span>
                    </div>
                  )}
                  {formData.budget > 0 && (
                    <div className="flex items-center mt-1 text-xs text-gray-600">
                      <DollarSign className="w-3 h-3 mr-1" />
                      <span>Presupuesto: €{formData.budget.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || availableManagers.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : (department ? 'Actualizar' : 'Crear')} Departamento
          </button>
        </div>
      </div>
    </div>
  )
}