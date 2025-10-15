import React, { useState, useEffect } from 'react'
import { Plus, Users, DollarSign, Calendar, FileText, AlertTriangle, Wrench } from 'lucide-react'
import { dashboardAPI, projectAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  // Estados para acciones rápidas
  const [projects, setProjects] = useState([])
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showVisitModal, setShowVisitModal] = useState(false)
  const [incomeForm, setIncomeForm] = useState({ projectId: '', amount: '', date: '', description: '', category: 'General' })
  const [expenseForm, setExpenseForm] = useState({ projectId: '', amount: '', date: '', description: '', category: 'General' })
  const [visitForm, setVisitForm] = useState({ projectId: '', date: '', time: '', visitor: '', purpose: '', notes: '' })

  useEffect(() => {
    loadDashboardData()
    ;(async () => {
      const all = await projectAPI.getAll()
      setProjects(all)
    })()
  }, [])

  const loadDashboardData = async () => {
    try {
      const data = await dashboardAPI.getStats()
      setDashboardData(data)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddIncome = async () => {
    if (!incomeForm.projectId || !incomeForm.amount) return
    await dashboardAPI.addIncome(incomeForm)
    setShowIncomeModal(false)
    setIncomeForm({ projectId: '', amount: '', date: '', description: '', category: 'General' })
    await loadDashboardData()
  }

  const handleAddExpense = async () => {
    if (!expenseForm.projectId || !expenseForm.amount) return
    await dashboardAPI.addExpense(expenseForm)
    setShowExpenseModal(false)
    setExpenseForm({ projectId: '', amount: '', date: '', description: '', category: 'General' })
    await loadDashboardData()
  }

  const handleScheduleVisit = async () => {
    if (!visitForm.projectId || !visitForm.date) return
    await dashboardAPI.scheduleVisit(visitForm)
    setShowVisitModal(false)
    setVisitForm({ projectId: '', date: '', time: '', visitor: '', purpose: '', notes: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
        <p className="text-gray-500">Intenta recargar la página.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proyecto
        </button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Proyectos Activos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Proyectos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.activeProjects}</p>
              <p className="text-sm text-green-600 mt-1">+12% este mes</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        {/* Presupuesto Total */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Presupuesto Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.totalBudget)}</p>
              <p className="text-sm text-green-600 mt-1">+8% este mes</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        {/* Miembros */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Miembros del Equipo</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.teamMembers}</p>
              <p className="text-sm text-blue-600 mt-1">+3 nuevos</p>
            </div>
            <div className="bg-purple-100 rounded-lg p-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        {/* Tareas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tareas Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.pendingTasks}</p>
              <p className="text-sm text-red-600 mt-1">+5 urgentes</p>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        {/* Equipos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Equipos Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.availableEquipment || 0}</p>
              <p className="text-sm text-blue-600 mt-1">{dashboardData.inMaintenanceEquipment || 0} en mantenimiento</p>
            </div>
            <div className="bg-orange-100 rounded-lg p-3">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Utilización del Presupuesto */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Utilización del Presupuesto</h3>
          <span className="text-sm text-gray-500">{dashboardData.budgetUtilization}% utilizado</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${dashboardData.budgetUtilization}%` }}></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Utilizado: {formatCurrency(dashboardData.usedBudget)}</span>
          <span>Total: {formatCurrency(dashboardData.totalBudget)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proyectos recientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Proyectos Recientes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {(dashboardData.recentProjects || []).map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-lg p-2 mr-3">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-500">Iniciado: {project.startDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{project.progress}%</p>
                    <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                      <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Vencimientos */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Próximos Vencimientos</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {(dashboardData.upcomingDeadlines || []).map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-red-100 rounded-lg p-2 mr-3">
                      <Calendar className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                      <p className="text-xs text-gray-500">{deadline.project}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{deadline.date}</p>
                    <span className={`text-xs ${deadline.daysLeft <= 3 ? 'text-red-600' : 'text-gray-500'}`}>{deadline.daysLeft} días</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => setShowIncomeModal(true)} className="flex flex-col items-center p-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <Plus className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Añadir Ingreso</span>
          </button>
          <button onClick={() => setShowExpenseModal(true)} className="flex flex-col items-center p-6 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
            <DollarSign className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Registrar Gasto</span>
          </button>
          <button onClick={() => setShowVisitModal(true)} className="flex flex-col items-center p-6 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">
            <Calendar className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Agendar Visita</span>
          </button>
          <Link to="/equipment" className="flex flex-col items-center p-6 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors">
            <Wrench className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Gestión de Equipos</span>
          </Link>
        </div>
      </div>

      {/* Modal Ingreso */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Añadir Ingreso</h4>
            <div className="space-y-3">
              <select className="w-full border rounded p-2" value={incomeForm.projectId} onChange={(e) => setIncomeForm({ ...incomeForm, projectId: e.target.value })}>
                <option value="">Selecciona proyecto</option>
                {projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
              <input type="number" className="w-full border rounded p-2" placeholder="Monto" value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })} />
              <input type="date" className="w-full border rounded p-2" value={incomeForm.date} onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })} />
              <input type="text" className="w-full border rounded p-2" placeholder="Descripción" value={incomeForm.description} onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })} />
              <input type="text" className="w-full border rounded p-2" placeholder="Categoría" value={incomeForm.category} onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 border rounded" onClick={() => setShowIncomeModal(false)}>Cancelar</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAddIncome}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gasto */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Registrar Gasto</h4>
            <div className="space-y-3">
              <select className="w-full border rounded p-2" value={expenseForm.projectId} onChange={(e) => setExpenseForm({ ...expenseForm, projectId: e.target.value })}>
                <option value="">Selecciona proyecto</option>
                {projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
              <input type="number" className="w-full border rounded p-2" placeholder="Monto" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
              <input type="date" className="w-full border rounded p-2" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
              <input type="text" className="w-full border rounded p-2" placeholder="Descripción" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
              <input type="text" className="w-full border rounded p-2" placeholder="Categoría" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 border rounded" onClick={() => setShowExpenseModal(false)}>Cancelar</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={handleAddExpense}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visita */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Agendar Visita</h4>
            <div className="space-y-3">
              <select className="w-full border rounded p-2" value={visitForm.projectId} onChange={(e) => setVisitForm({ ...visitForm, projectId: e.target.value })}>
                <option value="">Selecciona proyecto</option>
                {projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
              <input type="date" className="w-full border rounded p-2" value={visitForm.date} onChange={(e) => setVisitForm({ ...visitForm, date: e.target.value })} />
              <input type="time" className="w-full border rounded p-2" value={visitForm.time} onChange={(e) => setVisitForm({ ...visitForm, time: e.target.value })} />
              <input type="text" className="w-full border rounded p-2" placeholder="Visitante" value={visitForm.visitor} onChange={(e) => setVisitForm({ ...visitForm, visitor: e.target.value })} />
              <input type="text" className="w-full border rounded p-2" placeholder="Propósito" value={visitForm.purpose} onChange={(e) => setVisitForm({ ...visitForm, purpose: e.target.value })} />
              <textarea className="w-full border rounded p-2" placeholder="Notas" value={visitForm.notes} onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}></textarea>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 border rounded" onClick={() => setShowVisitModal(false)}>Cancelar</button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded" onClick={handleScheduleVisit}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}