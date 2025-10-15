import React, { useState } from 'react'
import { Building2, Users, DollarSign, Edit, Trash2, MoreVertical, Plus } from 'lucide-react'
import { Department } from '@/types/team'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DepartmentsListProps {
  departments: Department[]
  loading: boolean
  onEdit: (department: Department) => void
  onDelete: (id: string) => void
  onNew: () => void
}

export function DepartmentsList({ departments, loading, onEdit, onDelete, onNew }: DepartmentsListProps) {
  const [showDropdown, setShowDropdown] = useState<string | null>(null)

  const handleDropdownToggle = (departmentId: string) => {
    setShowDropdown(showDropdown === departmentId ? null : departmentId)
  }

  const handleEdit = (department: Department) => {
    onEdit(department)
    setShowDropdown(null)
  }

  const handleDelete = (id: string) => {
    onDelete(id)
    setShowDropdown(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo':
        return 'bg-green-100 text-green-800'
      case 'Inactivo':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDepartmentColor = (departmentName: string) => {
    // Generate a consistent color based on department name
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500'
    ]
    const index = departmentName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white border rounded-lg p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (departments.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay departamentos</h3>
        <p className="text-gray-500 mb-4">Comienza creando el primer departamento de tu organización.</p>
        <button
          onClick={onNew}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Departamento
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Departamentos</h3>
          <p className="text-sm text-gray-500">Gestiona los departamentos de tu organización</p>
        </div>
        <button
          onClick={onNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Departamento
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <div
            key={department.id}
            className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', getDepartmentColor(department.name))}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 truncate">
                    {department.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {department.employeeCount} empleado{department.employeeCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle(department.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {showDropdown === department.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleEdit(department)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(department.id)}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        disabled={department.employeeCount > 0}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between mb-4">
              <span className={cn('text-xs font-medium px-2 py-1 rounded-full', getStatusColor(department.status))}>
                {department.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {department.description}
            </p>

            {/* Manager */}
            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="font-medium">Jefe:</span>
                <span className="ml-1 truncate">{department.managerName || 'Sin asignar'}</span>
              </div>
            </div>

            {/* Budget */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>Presupuesto:</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(department.budget)}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {department.employeeCount}
                  </div>
                  <div className="text-xs text-gray-500">Empleados</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {department.budget > 0 ? Math.round(department.budget / Math.max(department.employeeCount, 1)) : 0}€
                  </div>
                  <div className="text-xs text-gray-500">Por empleado</div>
                </div>
              </div>
            </div>

            {/* Warning for departments with no employees */}
            {department.employeeCount === 0 && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                Este departamento no tiene empleados asignados
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Resumen de Departamentos</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {departments.length}
            </div>
            <div className="text-sm text-gray-500">Total Departamentos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {departments.filter(d => d.status === 'Activo').length}
            </div>
            <div className="text-sm text-gray-500">Activos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {departments.reduce((sum, d) => sum + d.employeeCount, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Empleados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(departments.reduce((sum, d) => sum + d.budget, 0))}
            </div>
            <div className="text-sm text-gray-500">Presupuesto Total</div>
          </div>
        </div>
      </div>
    </div>
  )
}