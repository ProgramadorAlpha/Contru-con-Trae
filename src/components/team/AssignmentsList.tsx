import React, { useState } from 'react'
import { Calendar, User, Building, Plus, Edit, Trash2, MoreVertical } from 'lucide-react'
import { Assignment, Employee } from '@/types/team'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AssignmentsListProps {
  assignments: Assignment[]
  employees: Employee[]
  loading: boolean
  onCreate: (data: any) => Promise<void>
  onUpdate: (id: string, data: any) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function AssignmentsList({ 
  assignments, 
  employees, 
  loading, 
  onCreate, 
  onUpdate, 
  onDelete 
}: AssignmentsListProps) {
  const [showDropdown, setShowDropdown] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)

  const handleDropdownToggle = (assignmentId: string) => {
    setShowDropdown(showDropdown === assignmentId ? null : assignmentId)
  }

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setShowForm(true)
    setShowDropdown(null)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta asignación?')) {
      await onDelete(id)
    }
    setShowDropdown(null)
  }

  const handleNewAssignment = () => {
    setEditingAssignment(null)
    setShowForm(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activa':
        return 'bg-green-100 text-green-800'
      case 'Completada':
        return 'bg-blue-100 text-blue-800'
      case 'Cancelada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDedicationColor = (dedication: number) => {
    if (dedication >= 80) return 'text-red-600'
    if (dedication >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white border rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay asignaciones</h3>
        <p className="text-gray-500 mb-4">Comienza asignando empleados a proyectos.</p>
        <button
          onClick={handleNewAssignment}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Asignación
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Asignaciones de Proyecto</h3>
          <p className="text-sm text-gray-500">Gestiona las asignaciones de empleados a proyectos</p>
        </div>
        <button
          onClick={handleNewAssignment}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Asignación
        </button>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {/* Employee Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{
                    backgroundColor: `hsl(${assignment.employeeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 50%)`
                  }}
                >
                  {assignment.employeeName.split(' ').map(n => n.charAt(0)).join('')}
                </div>

                {/* Assignment Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {assignment.employeeName}
                    </h4>
                    <span className="text-sm text-gray-500">→</span>
                    <span className="text-sm font-medium text-blue-600 truncate">
                      {assignment.projectName}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      <span>{assignment.role}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>
                        {formatDate(assignment.startDate)}
                        {assignment.endDate && ` - ${formatDate(assignment.endDate)}`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={cn('font-medium', getDedicationColor(assignment.dedication))}>
                        {assignment.dedication}% dedicación
                      </span>
                    </div>
                  </div>

                  {assignment.notes && (
                    <p className="text-xs text-gray-600 mt-2 truncate">
                      {assignment.notes}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center space-x-3">
                  <span className={cn('text-xs font-medium px-2 py-1 rounded-full', getStatusColor(assignment.status))}>
                    {assignment.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="relative ml-4">
                <button
                  onClick={() => handleDropdownToggle(assignment.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {showDropdown === assignment.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Resumen de Asignaciones</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {assignments.length}
            </div>
            <div className="text-sm text-gray-500">Total Asignaciones</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {assignments.filter(a => a.status === 'Activa').length}
            </div>
            <div className="text-sm text-gray-500">Activas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {assignments.filter(a => a.status === 'Completada').length}
            </div>
            <div className="text-sm text-gray-500">Completadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {assignments.length > 0 ? Math.round(assignments.reduce((sum, a) => sum + a.dedication, 0) / assignments.length) : 0}%
            </div>
            <div className="text-sm text-gray-500">Dedicación Promedio</div>
          </div>
        </div>
      </div>

      {/* Simple Form Modal (placeholder) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAssignment ? 'Editar Asignación' : 'Nueva Asignación'}
              </h3>
              <p className="text-gray-500 mb-4">
                Formulario de asignaciones - Por implementar en versión completa
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}