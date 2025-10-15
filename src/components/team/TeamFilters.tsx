import React, { useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { TeamFilters as TeamFiltersType, TeamTab, Department } from '@/types/team'
import { cn } from '@/lib/utils'

interface TeamFiltersProps {
  filters: TeamFiltersType
  departments: Department[]
  onFiltersChange: (filters: Partial<TeamFiltersType>) => void
  onClearFilters: () => void
  activeTab: TeamTab
}

export function TeamFilters({ 
  filters, 
  departments, 
  onFiltersChange, 
  onClearFilters, 
  activeTab 
}: TeamFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value })
  }

  const handleDepartmentChange = (value: string) => {
    onFiltersChange({ department: value })
  }

  const handleRoleChange = (value: string) => {
    onFiltersChange({ role: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ status: value })
  }

  const handleDateFromChange = (value: string) => {
    onFiltersChange({ dateFrom: value })
  }

  const handleDateToChange = (value: string) => {
    onFiltersChange({ dateTo: value })
  }

  const handleMinPerformanceChange = (value: string) => {
    onFiltersChange({ minPerformance: value ? Number(value) : undefined })
  }

  const handleMaxPerformanceChange = (value: string) => {
    onFiltersChange({ maxPerformance: value ? Number(value) : undefined })
  }

  const handleAvailabilityChange = (value: string) => {
    onFiltersChange({ availability: value ? Number(value) : undefined })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.department) count++
    if (filters.role) count++
    if (filters.status) count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    if (filters.minPerformance) count++
    if (filters.maxPerformance) count++
    if (filters.availability) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  // Common roles for filtering
  const commonRoles = [
    'Director de Proyecto',
    'Arquitecta',
    'Arquitecto',
    'Ingeniero Civil',
    'Ingeniera Civil',
    'Maestro de Obra',
    'Coordinador',
    'Coordinadora',
    'Operario',
    'Diseñador',
    'Diseñadora'
  ]

  // Status options
  const statusOptions = [
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' },
    { value: 'Vacaciones', label: 'Vacaciones' },
    { value: 'Licencia', label: 'Licencia' }
  ]

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Basic Filters Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={
              activeTab === 'employees' ? 'Buscar empleados...' :
              activeTab === 'assignments' ? 'Buscar asignaciones...' :
              activeTab === 'attendance' ? 'Buscar registros...' :
              'Buscar...'
            }
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Department Filter */}
        <div className="min-w-[200px]">
          <select
            value={filters.department}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los departamentos</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter (for employees and assignments) */}
        {(activeTab === 'employees' || activeTab === 'assignments') && (
          <div className="min-w-[150px]">
            <select
              value={filters.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={cn(
            'flex items-center px-4 py-2 border rounded-lg transition-colors',
            showAdvancedFilters || activeFiltersCount > 3
              ? 'bg-blue-50 border-blue-300 text-blue-600'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          )}
        >
          <Filter className="w-4 h-4 mr-2" />
          <span>Filtrar</span>
          {activeFiltersCount > 0 && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown
            className={cn(
              'w-4 h-4 ml-2 transition-transform',
              showAdvancedFilters && 'transform rotate-180'
            )}
          />
        </button>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Limpiar
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Role Filter */}
            {activeTab === 'employees' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo/Rol
                </label>
                <select
                  value={filters.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los cargos</option>
                  {commonRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Performance Range */}
            {activeTab === 'employees' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rendimiento mínimo (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.minPerformance || ''}
                    onChange={(e) => handleMinPerformanceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rendimiento máximo (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.maxPerformance || ''}
                    onChange={(e) => handleMaxPerformanceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
              </>
            )}

            {/* Availability Filter */}
            {activeTab === 'employees' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disponibilidad mínima (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.availability || ''}
                  onChange={(e) => handleAvailabilityChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            )}

            {/* Date Range Filters */}
            {(activeTab === 'assignments' || activeTab === 'attendance') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha desde
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleDateFromChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha hasta
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleDateToChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}