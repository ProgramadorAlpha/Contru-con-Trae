import React from 'react'
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  CheckSquare,
  Square
} from 'lucide-react'
import { Employee } from '@/types/team'
import { cn } from '@/lib/utils'

interface EmployeesListProps {
  employees: Employee[]
  loading: boolean
  selectedIds: string[]
  onEdit: (employee: Employee) => void
  onDelete: (id: string) => void
  onSelectionChange: (id: string) => void
  onSelectAll: () => void
  onClearSelection: () => void
}

export function EmployeesList({
  employees,
  loading,
  selectedIds,
  onEdit,
  onDelete,
  onSelectionChange,
  onSelectAll,
  onClearSelection
}: EmployeesListProps) {
  const [showDropdown, setShowDropdown] = React.useState<string | null>(null)

  const handleDropdownToggle = (employeeId: string) => {
    setShowDropdown(showDropdown === employeeId ? null : employeeId)
  }

  // Cerrar dropdown al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setShowDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleEdit = (employee: Employee) => {
    onEdit(employee)
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
      case 'Vacaciones':
        return 'bg-blue-100 text-blue-800'
      case 'Licencia':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAvailabilityColor = (availability: number) => {
    if (availability >= 80) return 'bg-green-500'
    if (availability >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 85) return 'text-green-600'
    if (performance >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const allSelected = employees.length > 0 && selectedIds.length === employees.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < employees.length

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white border rounded-lg p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (employees.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron empleados</h3>
        <p className="text-gray-500">Intenta ajustar los filtros o crea un nuevo empleado.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Selection Header */}
      {employees.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={allSelected ? onClearSelection : onSelectAll}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4" />
              ) : someSelected ? (
                <div className="w-4 h-4 bg-blue-600 rounded border-2 border-blue-600 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                </div>
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>
                {selectedIds.length > 0 
                  ? `${selectedIds.length} seleccionados`
                  : 'Seleccionar todos'
                }
              </span>
            </button>
          </div>
          
          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (window.confirm(`¿Eliminar ${selectedIds.length} empleados seleccionados?`)) {
                    selectedIds.forEach(id => onDelete(id))
                    onClearSelection()
                  }
                }}
                className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar seleccionados
              </button>
            </div>
          )}
        </div>
      )}

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className={cn(
              'bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow duration-200',
              selectedIds.includes(employee.id) && 'ring-2 ring-blue-500 border-blue-500'
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onSelectionChange(employee.id)}
                  className="flex-shrink-0"
                >
                  {selectedIds.includes(employee.id) ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
                
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{
                    backgroundColor: `hsl(${employee.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 50%)`
                  }}
                >
                  {employee.avatar || employee.firstName.charAt(0) + employee.lastName.charAt(0)}
                </div>
                
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {employee.fullName}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {employee.role}
                  </p>
                </div>
              </div>
              
              <div className="relative" data-dropdown>
                <button
                  onClick={() => handleDropdownToggle(employee.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {showDropdown === employee.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
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

            {/* Department and Status */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {employee.department}
              </span>
              <span className={cn('text-xs font-medium px-2 py-1 rounded-full', getStatusColor(employee.status))}>
                {employee.status}
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-xs text-gray-600">
                <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                <span>{employee.phone}</span>
              </div>
            </div>

            {/* Performance and Availability */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Rendimiento</span>
                  <span className={cn('text-xs font-medium', getPerformanceColor(employee.performance))}>
                    {employee.performance}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={cn('h-1.5 rounded-full transition-all duration-300', 
                      employee.performance >= 85 ? 'bg-green-500' :
                      employee.performance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${employee.performance}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Disponibilidad</span>
                  <span className="text-xs font-medium text-gray-900">
                    {employee.availability}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={cn('h-1.5 rounded-full transition-all duration-300', getAvailabilityColor(employee.availability))}
                    style={{ width: `${employee.availability}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Projects */}
            {employee.projects && employee.projects.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-600">
                  <Calendar className="w-3 h-3 mr-2" />
                  <span>{employee.projects.length} proyecto{employee.projects.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}