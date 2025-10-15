import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Award, AlertTriangle, Users, Target } from 'lucide-react'
import { Employee } from '@/types/team'
import { cn } from '@/lib/utils'

interface PerformanceViewProps {
  employees: Employee[]
  loading: boolean
}

export function PerformanceView({ employees, loading }: PerformanceViewProps) {
  const [sortBy, setSortBy] = useState<'performance' | 'name' | 'department'>('performance')
  const [filterBy, setFilterBy] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const getPerformanceLevel = (performance: number) => {
    if (performance >= 85) return 'high'
    if (performance >= 70) return 'medium'
    return 'low'
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 85) return 'text-green-600'
    if (performance >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBgColor = (performance: number) => {
    if (performance >= 85) return 'bg-green-500'
    if (performance >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getPerformanceLabel = (performance: number) => {
    if (performance >= 85) return 'Excelente'
    if (performance >= 70) return 'Bueno'
    return 'Necesita Mejora'
  }

  const getPerformanceIcon = (performance: number) => {
    if (performance >= 85) return TrendingUp
    if (performance >= 70) return Target
    return TrendingDown
  }

  // Filter and sort employees
  const filteredEmployees = employees
    .filter(emp => {
      if (filterBy === 'all') return true
      return getPerformanceLevel(emp.performance) === filterBy
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return b.performance - a.performance
        case 'name':
          return a.fullName.localeCompare(b.fullName)
        case 'department':
          return a.department.localeCompare(b.department)
        default:
          return 0
      }
    })

  // Calculate statistics
  const stats = {
    total: employees.length,
    average: employees.length > 0 ? Math.round(employees.reduce((sum, emp) => sum + emp.performance, 0) / employees.length) : 0,
    high: employees.filter(emp => getPerformanceLevel(emp.performance) === 'high').length,
    medium: employees.filter(emp => getPerformanceLevel(emp.performance) === 'medium').length,
    low: employees.filter(emp => getPerformanceLevel(emp.performance) === 'low').length
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white border rounded-lg p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white border rounded-lg p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rendimiento Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{stats.average}%</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alto Rendimiento</p>
              <p className="text-2xl font-bold text-green-600">{stats.high}</p>
              <p className="text-xs text-gray-500">{stats.total > 0 ? Math.round((stats.high / stats.total) * 100) : 0}% del equipo</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rendimiento Medio</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
              <p className="text-xs text-gray-500">{stats.total > 0 ? Math.round((stats.medium / stats.total) * 100) : 0}% del equipo</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Necesita Mejora</p>
              <p className="text-2xl font-bold text-red-600">{stats.low}</p>
              <p className="text-xs text-gray-500">{stats.total > 0 ? Math.round((stats.low / stats.total) * 100) : 0}% del equipo</p>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="performance">Rendimiento</option>
            <option value="name">Nombre</option>
            <option value="department">Departamento</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por:</label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="high">Alto Rendimiento (85%+)</option>
            <option value="medium">Rendimiento Medio (70-84%)</option>
            <option value="low">Necesita Mejora (&lt;70%)</option>
          </select>
        </div>
      </div>

      {/* Performance List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Rendimiento del Equipo ({filteredEmployees.length} empleados)
          </h3>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No se encontraron empleados</h4>
            <p className="text-gray-500">Intenta ajustar los filtros para ver más resultados.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEmployees.map((employee, index) => {
              const PerformanceIcon = getPerformanceIcon(employee.performance)
              
              return (
                <div key={employee.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Ranking */}
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                        #{index + 1}
                      </div>

                      {/* Employee Info */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                        style={{
                          backgroundColor: `hsl(${employee.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 50%)`
                        }}
                      >
                        {employee.avatar || employee.firstName.charAt(0) + employee.lastName.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {employee.fullName}
                          </h4>
                          <PerformanceIcon className={cn('w-4 h-4', getPerformanceColor(employee.performance))} />
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{employee.role}</span>
                          <span>•</span>
                          <span>{employee.department}</span>
                          <span>•</span>
                          <span className={cn('font-medium', getPerformanceColor(employee.performance))}>
                            {getPerformanceLabel(employee.performance)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Score and Bar */}
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={cn('text-lg font-bold', getPerformanceColor(employee.performance))}>
                          {employee.performance}%
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={cn('h-2 rounded-full transition-all duration-300', getPerformanceBgColor(employee.performance))}
                            style={{ width: `${employee.performance}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Disponibilidad</div>
                        <div className="text-sm font-medium text-gray-900">{employee.availability}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Projects */}
                  {employee.projects && employee.projects.length > 0 && (
                    <div className="mt-3 ml-16">
                      <div className="text-xs text-gray-500">
                        Proyectos activos: {employee.projects.length}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Performance Distribution Chart (Simple) */}
      <div className="mt-8 bg-white border rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Distribución de Rendimiento</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-700">Alto Rendimiento (85%+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">{stats.high} empleados</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.total > 0 ? (stats.high / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-700">Rendimiento Medio (70-84%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">{stats.medium} empleados</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${stats.total > 0 ? (stats.medium / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-700">Necesita Mejora (&lt;70%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">{stats.low} empleados</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${stats.total > 0 ? (stats.low / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {stats.low > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Recomendaciones</h4>
              <p className="text-sm text-yellow-700 mt-1">
                {stats.low} empleado{stats.low !== 1 ? 's' : ''} necesita{stats.low === 1 ? '' : 'n'} mejora en su rendimiento. 
                Considera programar sesiones de capacitación o reuniones de seguimiento individual.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}