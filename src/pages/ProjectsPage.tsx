import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Calendar, DollarSign, MapPin, Building2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { projectAPI } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/chartUtils'

export function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await projectAPI.getAll()
      setProjects(data)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'En Progreso': return 'bg-yellow-100 text-yellow-800'
      case 'Completado': return 'bg-green-100 text-green-800'
      case 'Planificación': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-600'
    if (progress >= 50) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  const getProfitabilityIndicator = (budget, spent) => {
    const margin = ((budget - spent) / budget) * 100
    if (margin >= 15) {
      return { color: 'text-green-600', icon: TrendingUp, label: 'Saludable', bgColor: 'bg-green-50' }
    } else if (margin >= 10) {
      return { color: 'text-yellow-600', icon: AlertTriangle, label: 'Atención', bgColor: 'bg-yellow-50' }
    } else {
      return { color: 'text-red-600', icon: TrendingDown, label: 'Riesgo', bgColor: 'bg-red-50' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Proyectos</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proyecto
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar proyectos por nombre o ubicación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{project.name}</h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {project.location}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{project.description}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progreso</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Budget Info with Profitability */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Presupuesto</div>
                  <div className="font-semibold text-gray-900">{formatCurrency(project.budget)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Ejecutado</div>
                  <div className="font-semibold text-gray-900">{formatCurrency(project.spent)}</div>
                </div>
                <div>
                  {(() => {
                    const indicator = getProfitabilityIndicator(project.budget, project.spent)
                    const Icon = indicator.icon
                    return (
                      <div className={`${indicator.bgColor} rounded-lg p-2`}>
                        <div className="text-xs text-gray-600">Rentabilidad</div>
                        <div className={`flex items-center gap-1 ${indicator.color} font-semibold text-sm`}>
                          <Icon className="w-3 h-3" />
                          {indicator.label}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Inicio</div>
                  <div className="text-sm text-gray-900">{formatDate(project.startDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Fin</div>
                  <div className="text-sm text-gray-900">{formatDate(project.endDate)}</div>
                </div>
              </div>

              {/* Team Info */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-gray-600">Cliente:</span>
                    <span className="ml-2 text-gray-900">{project.client}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Arquitecto:</span>
                    <span className="ml-2 text-gray-900">{project.architect}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <button
                  onClick={() => navigate(`/project-financials/${project.id}`)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <DollarSign className="w-4 h-4" />
                  Ver Financieros
                </button>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron proyectos</h3>
          <p className="text-gray-500">Intenta ajustar tu búsqueda o crea un nuevo proyecto.</p>
        </div>
      )}
    </div>
  )
}