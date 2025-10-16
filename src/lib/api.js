// Configuración para usar datos simulados o Firebase
const USE_FIREBASE = false // Cambiar a true para usar Firebase

// Importar datos simulados
import { 
  mockProjects, 
  mockBudgetItems, 
  mockTeamMembers, 
  mockDocuments, 
  mockReports,
  mockIncomes,
  mockExpenses,
  mockVisits,
  mockEquipment,
  mockEquipmentCategories,
  mockEquipmentTypes,
  mockEquipmentAssignments,
  mockEquipmentMaintenance,
  mockEquipmentStats,
  mockDepartments,
  mockAssignments,
  mockAttendance
} from './mockData'

// Simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// API de Proyectos
export const projectAPI = {
  async getAll() {
    await delay(500)
    return mockProjects
  },

  async getById(id) {
    await delay(300)
    return mockProjects.find(project => project.id === id)
  },

  async create(project) {
    await delay(400)
    const newProject = {
      ...project,
      id: `proj-${Date.now()}`,
      progress: 0,
      spent: 0
    }
    mockProjects.push(newProject)
    return newProject
  },

  async update(id, updates) {
    await delay(400)
    const index = mockProjects.findIndex(p => p.id === id)
    if (index !== -1) {
      mockProjects[index] = { ...mockProjects[index], ...updates }
      return mockProjects[index]
    }
    throw new Error('Proyecto no encontrado')
  },

  async delete(id) {
    await delay(400)
    const index = mockProjects.findIndex(p => p.id === id)
    if (index !== -1) {
      mockProjects.splice(index, 1)
      return true
    }
    return false
  }
}

// API de Presupuesto
export const budgetAPI = {
  async getByProject(projectId) {
    await delay(400)
    return mockBudgetItems.filter(item => item.projectId === projectId)
  },

  async create(budgetItem) {
    await delay(400)
    const newItem = {
      ...budgetItem,
      id: `budget-${Date.now()}`,
      actual: 0,
      status: 'Pendiente'
    }
    mockBudgetItems.push(newItem)
    return newItem
  },

  async update(id, updates) {
    await delay(400)
    const index = mockBudgetItems.findIndex(item => item.id === id)
    if (index !== -1) {
      mockBudgetItems[index] = { ...mockBudgetItems[index], ...updates }
      return mockBudgetItems[index]
    }
    throw new Error('Item de presupuesto no encontrado')
  }
}

// API de Equipo
export const teamAPI = {
  // Empleados
  async getEmployees(filters = {}) {
    await delay(500)
    let employees = [...mockTeamMembers]

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      employees = employees.filter(emp => 
        emp.fullName.toLowerCase().includes(searchTerm) ||
        emp.email.toLowerCase().includes(searchTerm) ||
        emp.role.toLowerCase().includes(searchTerm) ||
        emp.department.toLowerCase().includes(searchTerm)
      )
    }

    if (filters.department) {
      employees = employees.filter(emp => emp.departmentId === filters.department)
    }

    if (filters.role) {
      employees = employees.filter(emp => emp.role.toLowerCase().includes(filters.role.toLowerCase()))
    }

    if (filters.status) {
      employees = employees.filter(emp => emp.status === filters.status)
    }

    if (filters.minPerformance) {
      employees = employees.filter(emp => emp.performance >= filters.minPerformance)
    }

    if (filters.maxPerformance) {
      employees = employees.filter(emp => emp.performance <= filters.maxPerformance)
    }

    return employees
  },

  async getEmployeeById(id) {
    await delay(300)
    const employee = mockTeamMembers.find(member => member.id === id)
    if (!employee) throw new Error('Empleado no encontrado')
    
    // Enriquecer con asignaciones y asistencia
    const assignments = mockAssignments.filter(a => a.employeeId === id)
    const attendance = mockAttendance.filter(a => a.employeeId === id)
    
    return {
      ...employee,
      assignments,
      attendance
    }
  },

  async createEmployee(employeeData) {
    await delay(400)
    const newEmployee = {
      ...employeeData,
      id: `team-${Date.now()}`,
      fullName: `${employeeData.firstName} ${employeeData.lastName}`,
      name: `${employeeData.firstName} ${employeeData.lastName}`, // backward compatibility
      avatar: `${employeeData.firstName.charAt(0)}${employeeData.lastName.charAt(0)}`.toUpperCase(),
      status: 'Activo',
      availability: 100,
      performance: 75,
      projects: [],
      skills: employeeData.skills || [],
      certifications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    mockTeamMembers.push(newEmployee)
    
    // Actualizar contador del departamento
    const department = mockDepartments.find(d => d.id === employeeData.departmentId)
    if (department) {
      department.employeeCount += 1
    }
    
    return newEmployee
  },

  async updateEmployee(id, updates) {
    await delay(400)
    const index = mockTeamMembers.findIndex(emp => emp.id === id)
    if (index === -1) throw new Error('Empleado no encontrado')

    const oldEmployee = mockTeamMembers[index]
    mockTeamMembers[index] = {
      ...oldEmployee,
      ...updates,
      fullName: updates.firstName && updates.lastName ? 
        `${updates.firstName} ${updates.lastName}` : oldEmployee.fullName,
      name: updates.firstName && updates.lastName ? 
        `${updates.firstName} ${updates.lastName}` : oldEmployee.name,
      updatedAt: new Date().toISOString()
    }

    // Actualizar contadores de departamentos si cambió
    if (updates.departmentId && updates.departmentId !== oldEmployee.departmentId) {
      const oldDept = mockDepartments.find(d => d.id === oldEmployee.departmentId)
      const newDept = mockDepartments.find(d => d.id === updates.departmentId)
      if (oldDept) oldDept.employeeCount -= 1
      if (newDept) newDept.employeeCount += 1
    }

    return mockTeamMembers[index]
  },

  async deleteEmployee(id) {
    await delay(400)
    const index = mockTeamMembers.findIndex(emp => emp.id === id)
    if (index === -1) return false

    const employee = mockTeamMembers[index]
    
    // Verificar que no tenga asignaciones activas
    const activeAssignments = mockAssignments.filter(a => 
      a.employeeId === id && a.status === 'Activa'
    )
    
    if (activeAssignments.length > 0) {
      throw new Error('No se puede eliminar un empleado con asignaciones activas')
    }

    mockTeamMembers.splice(index, 1)
    
    // Actualizar contador del departamento
    const department = mockDepartments.find(d => d.id === employee.departmentId)
    if (department) {
      department.employeeCount -= 1
    }

    return true
  },

  // Departamentos
  async getDepartments() {
    await delay(400)
    return mockDepartments
  },

  async getDepartmentById(id) {
    await delay(300)
    const department = mockDepartments.find(d => d.id === id)
    if (!department) throw new Error('Departamento no encontrado')
    
    // Enriquecer con empleados
    const employees = mockTeamMembers.filter(emp => emp.departmentId === id)
    
    return {
      ...department,
      employees
    }
  },

  async createDepartment(departmentData) {
    await delay(400)
    const newDepartment = {
      ...departmentData,
      id: `dept-${Date.now()}`,
      employeeCount: 0,
      status: 'Activo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Obtener nombre del manager
    const manager = mockTeamMembers.find(emp => emp.id === departmentData.managerId)
    if (manager) {
      newDepartment.managerName = manager.fullName
    }
    
    mockDepartments.push(newDepartment)
    return newDepartment
  },

  async updateDepartment(id, updates) {
    await delay(400)
    const index = mockDepartments.findIndex(d => d.id === id)
    if (index === -1) throw new Error('Departamento no encontrado')

    // Obtener nombre del manager si cambió
    if (updates.managerId) {
      const manager = mockTeamMembers.find(emp => emp.id === updates.managerId)
      if (manager) {
        updates.managerName = manager.fullName
      }
    }

    mockDepartments[index] = {
      ...mockDepartments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return mockDepartments[index]
  },

  async deleteDepartment(id) {
    await delay(400)
    const index = mockDepartments.findIndex(d => d.id === id)
    if (index === -1) return false

    const department = mockDepartments[index]
    
    // Verificar que no tenga empleados
    if (department.employeeCount > 0) {
      throw new Error('No se puede eliminar un departamento con empleados asignados')
    }

    mockDepartments.splice(index, 1)
    return true
  },

  // Asignaciones
  async getAssignments(filters = {}) {
    await delay(400)
    let assignments = [...mockAssignments]

    if (filters.employeeId) {
      assignments = assignments.filter(a => a.employeeId === filters.employeeId)
    }

    if (filters.projectId) {
      assignments = assignments.filter(a => a.projectId === filters.projectId)
    }

    if (filters.status) {
      assignments = assignments.filter(a => a.status === filters.status)
    }

    return assignments
  },

  async createAssignment(assignmentData) {
    await delay(400)
    
    // Verificar disponibilidad del empleado
    const employee = mockTeamMembers.find(emp => emp.id === assignmentData.employeeId)
    if (!employee) throw new Error('Empleado no encontrado')
    
    const activeAssignments = mockAssignments.filter(a => 
      a.employeeId === assignmentData.employeeId && a.status === 'Activa'
    )
    
    const totalDedication = activeAssignments.reduce((sum, a) => sum + a.dedication, 0)
    
    if (totalDedication + assignmentData.dedication > 100) {
      throw new Error('El empleado no tiene suficiente disponibilidad')
    }

    const project = mockProjects.find(p => p.id === assignmentData.projectId)
    
    const newAssignment = {
      ...assignmentData,
      id: `assign-${Date.now()}`,
      employeeName: employee.fullName,
      projectName: project ? project.name : 'Proyecto desconocido',
      status: 'Activa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockAssignments.push(newAssignment)
    
    // Actualizar disponibilidad del empleado
    employee.availability = 100 - (totalDedication + assignmentData.dedication)
    
    // Agregar proyecto a la lista del empleado
    if (!employee.projects.includes(assignmentData.projectId)) {
      employee.projects.push(assignmentData.projectId)
    }
    
    return newAssignment
  },

  async updateAssignment(id, updates) {
    await delay(400)
    const index = mockAssignments.findIndex(a => a.id === id)
    if (index === -1) throw new Error('Asignación no encontrada')

    mockAssignments[index] = {
      ...mockAssignments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return mockAssignments[index]
  },

  async deleteAssignment(id) {
    await delay(400)
    const index = mockAssignments.findIndex(a => a.id === id)
    if (index === -1) return false

    const assignment = mockAssignments[index]
    mockAssignments.splice(index, 1)
    
    // Recalcular disponibilidad del empleado
    const employee = mockTeamMembers.find(emp => emp.id === assignment.employeeId)
    if (employee) {
      const activeAssignments = mockAssignments.filter(a => 
        a.employeeId === assignment.employeeId && a.status === 'Activa'
      )
      const totalDedication = activeAssignments.reduce((sum, a) => sum + a.dedication, 0)
      employee.availability = 100 - totalDedication
    }

    return true
  },

  // Asistencia
  async getAttendance(filters = {}) {
    await delay(400)
    let attendance = [...mockAttendance]

    if (filters.employeeId) {
      attendance = attendance.filter(a => a.employeeId === filters.employeeId)
    }

    if (filters.dateFrom) {
      attendance = attendance.filter(a => a.date >= filters.dateFrom)
    }

    if (filters.dateTo) {
      attendance = attendance.filter(a => a.date <= filters.dateTo)
    }

    if (filters.status) {
      attendance = attendance.filter(a => a.status === filters.status)
    }

    return attendance
  },

  async createAttendanceRecord(attendanceData) {
    await delay(400)
    const employee = mockTeamMembers.find(emp => emp.id === attendanceData.employeeId)
    
    const newRecord = {
      ...attendanceData,
      id: `att-${Date.now()}`,
      employeeName: employee ? employee.fullName : 'Empleado desconocido'
    }
    
    mockAttendance.push(newRecord)
    return newRecord
  },

  // Estadísticas
  async getTeamStats() {
    await delay(400)
    const totalEmployees = mockTeamMembers.length
    const activeEmployees = mockTeamMembers.filter(emp => emp.status === 'Activo').length
    const totalDepartments = mockDepartments.length
    
    const averagePerformance = totalEmployees > 0 ? 
      Math.round(mockTeamMembers.reduce((sum, emp) => sum + emp.performance, 0) / totalEmployees) : 0
    
    const activeAssignments = mockAssignments.filter(a => a.status === 'Activa').length
    
    // Calcular tasa de asistencia (últimos 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentAttendance = mockAttendance.filter(a => new Date(a.date) >= thirtyDaysAgo)
    const presentDays = recentAttendance.filter(a => a.status === 'Presente').length
    const attendanceRate = recentAttendance.length > 0 ? 
      Math.round((presentDays / recentAttendance.length) * 100) : 0
    
    return {
      totalEmployees,
      activeEmployees,
      averagePerformance,
      totalDepartments,
      attendanceRate,
      activeAssignments
    }
  },

  // Backward compatibility
  async getAll() {
    return this.getEmployees()
  },

  async getById(id) {
    return this.getEmployeeById(id)
  },

  async create(member) {
    return this.createEmployee(member)
  }
}

// API de Documentos
export const documentAPI = {
  async getAll() {
    await delay(400)
    return mockDocuments
  },

  async getById(id) {
    await delay(300)
    return mockDocuments.find(doc => doc.id === id)
  },

  async getByProject(projectId) {
    await delay(400)
    return mockDocuments.filter(doc => doc.projectId === projectId)
  },

  async getByCategory(category) {
    await delay(400)
    return mockDocuments.filter(doc => doc.category === category)
  },

  async upload(file, projectId, category = 'General') {
    await delay(1000) // Simular carga de archivo
    const newDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: file.name.split('.').pop().toUpperCase(),
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      projectId,
      category: category || 'General',
      url: URL.createObjectURL(file) // Para preview local
    }
    mockDocuments.push(newDocument)
    return newDocument
  },

  async delete(id) {
    await delay(400)
    const index = mockDocuments.findIndex(doc => doc.id === id)
    if (index !== -1) {
      mockDocuments.splice(index, 1)
      return true
    }
    return false
  },

  async search(query, filters = {}) {
    await delay(400)
    let results = mockDocuments

    if (query) {
      const searchTerm = query.toLowerCase()
      results = results.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm) ||
        doc.type.toLowerCase().includes(searchTerm) ||
        doc.category.toLowerCase().includes(searchTerm)
      )
    }

    if (filters.category) {
      results = results.filter(doc => doc.category === filters.category)
    }

    if (filters.projectId) {
      results = results.filter(doc => doc.projectId === filters.projectId)
    }

    if (filters.type) {
      results = results.filter(doc => doc.type === filters.type)
    }

    if (filters.dateFrom) {
      results = results.filter(doc => doc.uploadDate >= filters.dateFrom)
    }

    if (filters.dateTo) {
      results = results.filter(doc => doc.uploadDate <= filters.dateTo)
    }

    return results
  },

  async getCategories() {
    await delay(300)
    const categories = [...new Set(mockDocuments.map(doc => doc.category))]
    return categories.length > 0 ? categories : ['Planos', 'Contratos', 'Facturas', 'Presupuestos', 'Informes', 'General']
  },

  async getTypes() {
    await delay(300)
    const types = [...new Set(mockDocuments.map(doc => doc.type))]
    return types.length > 0 ? types : ['PDF', 'DWG', 'XLSX', 'DOCX', 'JPG', 'PNG', 'ZIP']
  }
}

// API de Reportes
export const reportAPI = {
  async getAll() {
    await delay(600)
    return mockReports
  },

  async getReports() {
    await delay(600)
    const totalProjects = mockProjects.length
    const activeProjects = mockProjects.filter(p => p.status === 'En Progreso' || p.status === 'Activo').length
    const teamMembers = mockTeamMembers.length
    const completionRate = totalProjects > 0 ? Math.round((mockProjects.reduce((sum, p) => sum + p.progress, 0) / (totalProjects)) ) : 0

    const projectProgress = mockProjects.map(p => ({ name: p.name, progress: p.progress }))

    const categoryMap = {}
    for (const item of mockBudgetItems) {
      categoryMap[item.category] = categoryMap[item.category] || { budget: 0, actual: 0 }
      categoryMap[item.category].budget += item.total || 0
      categoryMap[item.category].actual += item.actual || 0
    }
    const budgetDistribution = Object.entries(categoryMap).map(([name, vals]) => ({ name, value: vals.budget }))
    const budgetByCategory = Object.entries(categoryMap).map(([category, vals]) => ({ category, budget: vals.budget, actual: vals.actual, variance: (vals.actual - vals.budget) }))

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
    const totalBudget = budgetByCategory.reduce((s, c) => s + c.budget, 0)
    const totalActual = budgetByCategory.reduce((s, c) => s + c.actual, 0)
    const budgetTrend = months.map((month, i) => ({ month, budget: Math.round(totalBudget * ((i + 1) / months.length)), actual: Math.round(totalActual * ((i + 1) / months.length)) }))

    const projects = mockProjects.map(p => ({ id: p.id, name: p.name, status: p.status, progress: p.progress, startDate: p.startDate, endDate: p.endDate, budget: p.budget }))

    const roleMap = {}
    for (const member of mockTeamMembers) {
      roleMap[member.role] = (roleMap[member.role] || 0) + 1
    }
    const teamDistribution = Object.entries(roleMap).map(([name, value]) => ({ name, value }))

    return {
      overview: { activeProjects, teamMembers, completionRate },
      projectProgress,
      budgetDistribution,
      budgetTrend,
      projects,
      budgetByCategory,
      teamDistribution
    }
  },

  async generate(type, filters = {}) {
    await delay(1500) // Simular generación de reporte
    const newReport = {
      id: `report-${Date.now()}`,
      title: `Nuevo ${type} - ${new Date().toLocaleDateString('es-ES')}`,
      type,
      date: new Date().toISOString().split('T')[0],
      projectId: filters.projectId || 'all',
      data: {
        generated: true,
        timestamp: Date.now()
      }
    }
    mockReports.push(newReport)
    return newReport
  }
}

// Dashboard Stats
export const dashboardAPI = {
  async getStats(timeFilter = 'month') {
    await delay(500)
    const totalBudget = mockProjects.reduce((sum, p) => sum + p.budget, 0)
    const totalSpent = mockProjects.reduce((sum, p) => sum + p.spent, 0)
    const activeProjects = mockProjects.filter(p => p.status === 'En Progreso').length
    const completedProjects = mockProjects.filter(p => p.status === 'Completado').length

    const recentProjects = [...mockProjects]
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      .slice(0, 5)
      .map(p => ({ id: p.id, name: p.name, startDate: p.startDate, progress: p.progress }))

    const today = new Date()
    const upcomingDeadlines = [...mockProjects]
      .filter(p => new Date(p.endDate) >= today)
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
      .slice(0, 5)
      .map(p => {
        const end = new Date(p.endDate)
        const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
        return { id: `${p.id}-deadline`, title: 'Entrega', project: p.name, date: p.endDate, daysLeft }
      })

    // Generate chart data based on time filter
    const generateBudgetTrend = () => {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const currentMonth = new Date().getMonth()
      
      let periods = []
      switch (timeFilter) {
        case 'week':
          periods = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
          break
        case 'quarter':
          periods = months.slice(Math.floor(currentMonth / 3) * 3, Math.floor(currentMonth / 3) * 3 + 3)
          break
        case 'year':
          periods = months
          break
        default: // month
          periods = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1)
      }
      
      return periods.map((period, index) => ({
        month: period,
        budget: Math.round(totalBudget * (0.7 + Math.random() * 0.3) * ((index + 1) / periods.length)),
        spent: Math.round(totalSpent * (0.6 + Math.random() * 0.4) * ((index + 1) / periods.length))
      }))
    }

    const projectProgress = mockProjects.map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      progress: p.progress
    }))

    // Budget by category
    const categoryMap = {}
    for (const item of mockBudgetItems) {
      categoryMap[item.category] = categoryMap[item.category] || { budget: 0, spent: 0 }
      categoryMap[item.category].budget += item.total || 0
      categoryMap[item.category].spent += item.actual || 0
    }
    const budgetByCategory = Object.entries(categoryMap).map(([category, vals]) => ({
      category,
      budget: vals.budget,
      spent: vals.spent
    }))

    // Team distribution
    const roleMap = {}
    for (const member of mockTeamMembers) {
      roleMap[member.role] = (roleMap[member.role] || 0) + 1
    }
    const teamDistribution = Object.entries(roleMap).map(([name, value]) => ({ name, value }))

    return {
      totalProjects: mockProjects.length,
      activeProjects,
      completedProjects,
      totalBudget,
      totalSpent,
      usedBudget: totalSpent,
      teamMembers: mockTeamMembers.length,
      pendingTasks: mockBudgetItems.filter(i => i.status === 'Pendiente').length,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      averageProgress: mockProjects.length > 0 ? (mockProjects.reduce((sum, p) => sum + p.progress, 0) / mockProjects.length) : 0,
      recentProjects,
      upcomingDeadlines,
      // Chart data
      budgetTrend: generateBudgetTrend(),
      projectProgress,
      budgetByCategory,
      teamDistribution,
      // Estadísticas de herramientas/equipos
      availableEquipment: mockEquipmentStats.availableEquipment,
      inMaintenanceEquipment: mockEquipmentStats.inMaintenanceEquipment,
      totalEquipment: mockEquipmentStats.totalEquipment,
      equipmentUtilization: mockEquipmentStats.totalEquipment > 0 ?
        ((mockEquipmentStats.totalEquipment - mockEquipmentStats.availableEquipment) / mockEquipmentStats.totalEquipment) * 100 : 0,
      // Nuevas claves para herramientas (compatibilidad con Dashboard)
      availableTools: mockEquipmentStats.availableTools ?? mockEquipmentStats.availableEquipment,
      inMaintenanceTools: mockEquipmentStats.inMaintenanceTools ?? mockEquipmentStats.inMaintenanceEquipment,
      totalTools: mockEquipmentStats.totalTools ?? mockEquipmentStats.totalEquipment,
      toolsUtilization: (mockEquipmentStats.totalTools ?? mockEquipmentStats.totalEquipment) > 0 ?
        (((mockEquipmentStats.totalTools ?? mockEquipmentStats.totalEquipment) - (mockEquipmentStats.availableTools ?? mockEquipmentStats.availableEquipment)) / (mockEquipmentStats.totalTools ?? mockEquipmentStats.totalEquipment)) * 100 : 0
    }
  },

  async exportDashboard(format = 'pdf', timeFilter = 'month') {
    await delay(1000) // Simulate export processing
    const data = await this.getStats(timeFilter)
    
    // In a real implementation, this would generate the actual file
    const exportData = {
      format,
      timeFilter,
      generatedAt: new Date().toISOString(),
      data: {
        summary: {
          totalProjects: data.totalProjects,
          activeProjects: data.activeProjects,
          totalBudget: data.totalBudget,
          budgetUtilization: data.budgetUtilization
        },
        charts: {
          budgetTrend: data.budgetTrend,
          projectProgress: data.projectProgress,
          budgetByCategory: data.budgetByCategory,
          teamDistribution: data.teamDistribution
        }
      }
    }

    // Simulate file download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-report-${timeFilter}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true, filename: a.download }
  },

  async addIncome({ projectId, amount, date, description, category = 'General' }) {
    await delay(400)
    const income = {
      id: `income-${Date.now()}`,
      projectId,
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      description: description || 'Ingreso registrado',
      category
    }
    mockIncomes.push(income)
    const project = mockProjects.find(p => p.id === projectId)
    if (project) {
      project.budget += income.amount
    }
    return income
  },

  async addExpense({ projectId, amount, date, description, category = 'General' }) {
    await delay(400)
    const expense = {
      id: `expense-${Date.now()}`,
      projectId,
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      description: description || 'Gasto registrado',
      category
    }
    mockExpenses.push(expense)
    const project = mockProjects.find(p => p.id === projectId)
    if (project) {
      project.spent += expense.amount
    }
    return expense
  },

  async scheduleVisit({ projectId, date, time, visitor, purpose, notes }) {
    await delay(300)
    const visit = {
      id: `visit-${Date.now()}`,
      projectId,
      date,
      time: time || '10:00',
      visitor: visitor || 'Invitado',
      purpose: purpose || 'Seguimiento',
      notes: notes || ''
    }
    mockVisits.push(visit)
    return visit
  }
}

// API de Equipos
export const equipmentAPI = {
  async getAll(filters = {}) {
    await delay(500)
    let equipment = mockEquipment

    if (filters.category) {
      equipment = equipment.filter(eq => eq.category === filters.category)
    }

    if (filters.status) {
      equipment = equipment.filter(eq => eq.status === filters.status)
    }

    if (filters.projectId) {
      const assignments = mockEquipmentAssignments.filter(a => 
        a.projectId === filters.projectId && a.status === 'active'
      )
      const equipmentIds = assignments.map(a => a.equipmentId)
      equipment = equipment.filter(eq => equipmentIds.includes(eq.id))
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      equipment = equipment.filter(eq =>
        eq.name.toLowerCase().includes(searchTerm) ||
        eq.description.toLowerCase().includes(searchTerm) ||
        eq.brand.toLowerCase().includes(searchTerm) ||
        eq.model.toLowerCase().includes(searchTerm) ||
        eq.serialNumber.toLowerCase().includes(searchTerm)
      )
    }

    // Enriquecer con información de asignación actual
    const enrichedEquipment = equipment.map(eq => {
      const currentAssignment = mockEquipmentAssignments.find(a => 
        a.equipmentId === eq.id && a.status === 'active'
      )
      
      if (currentAssignment) {
        const project = mockProjects.find(p => p.id === currentAssignment.projectId)
        const assignedUser = mockTeamMembers.find(u => u.id === currentAssignment.assignedTo)
        return {
          ...eq,
          currentAssignment,
          projectName: project?.name,
          assignedUserName: assignedUser?.name
        }
      }
      
      return eq
    })

    return enrichedEquipment
  },

  async getById(id) {
    await delay(300)
    const equipment = mockEquipment.find(eq => eq.id === id)
    if (!equipment) throw new Error('Equipo no encontrado')

    // Obtener asignaciones y mantenimientos
    const assignments = mockEquipmentAssignments.filter(a => a.equipmentId === id)
    const maintenanceHistory = mockEquipmentMaintenance.filter(m => m.equipmentId === id)

    // Enriquecer asignaciones con información de proyectos y usuarios
    const enrichedAssignments = assignments.map(assignment => {
      const project = mockProjects.find(p => p.id === assignment.projectId)
      const assignedBy = mockTeamMembers.find(u => u.id === assignment.assignedBy)
      const assignedTo = mockTeamMembers.find(u => u.id === assignment.assignedTo)
      
      return {
        ...assignment,
        projectName: project?.name,
        assignedByName: assignedBy?.name,
        assignedToName: assignedTo?.name
      }
    })

    return {
      ...equipment,
      assignments: enrichedAssignments,
      maintenanceHistory,
      projectHistory: this.generateProjectHistory(id, assignments)
    }
  },

  async create(equipmentData) {
    await delay(400)
    const newEquipment = {
      id: `equip-${Date.now()}`,
      ...equipmentData,
      currentValue: equipmentData.purchasePrice,
      status: 'available',
      images: [],
      documents: [],
      specifications: equipmentData.specifications || {},
      maintenanceSchedule: equipmentData.maintenanceSchedule || {
        intervalType: 'months',
        intervalValue: 6
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    mockEquipment.push(newEquipment)
    return newEquipment
  },

  async update(id, updates) {
    await delay(400)
    const index = mockEquipment.findIndex(eq => eq.id === id)
    if (index === -1) throw new Error('Equipo no encontrado')

    mockEquipment[index] = {
      ...mockEquipment[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return mockEquipment[index]
  },

  async delete(id) {
    await delay(400)
    const index = mockEquipment.findIndex(eq => eq.id === id)
    if (index === -1) return false

    // Verificar que no esté asignado activamente
    const activeAssignments = mockEquipmentAssignments.filter(a => 
      a.equipmentId === id && a.status === 'active'
    )
    
    if (activeAssignments.length > 0) {
      throw new Error('No se puede eliminar un equipo asignado activamente')
    }

    mockEquipment.splice(index, 1)
    return true
  },

  async assign(id, assignmentData) {
    await delay(400)
    const equipment = mockEquipment.find(eq => eq.id === id)
    if (!equipment) throw new Error('Equipo no encontrado')

    if (equipment.status !== 'available') {
      throw new Error('El equipo no está disponible para asignación')
    }

    // Verificar que el proyecto exista
    const project = mockProjects.find(p => p.id === assignmentData.projectId)
    if (!project) throw new Error('Proyecto no encontrado')

    const newAssignment = {
      id: `assign-${Date.now()}`,
      equipmentId: id,
      ...assignmentData,
      assignedBy: 'current-user', // Esto vendría del contexto de autenticación
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockEquipmentAssignments.push(newAssignment)

    // Actualizar estado del equipo
    equipment.status = 'in_use'
    equipment.updatedAt = new Date().toISOString()

    return newAssignment
  },

  async unassign(id) {
    await delay(400)
    const equipment = mockEquipment.find(eq => eq.id === id)
    if (!equipment) throw new Error('Equipo no encontrado')

    // Encontrar asignación activa
    const assignmentIndex = mockEquipmentAssignments.findIndex(a => 
      a.equipmentId === id && a.status === 'active'
    )
    
    if (assignmentIndex === -1) {
      throw new Error('El equipo no tiene una asignación activa')
    }

    // Finalizar asignación
    mockEquipmentAssignments[assignmentIndex].status = 'completed'
    mockEquipmentAssignments[assignmentIndex].endDate = new Date().toISOString()
    mockEquipmentAssignments[assignmentIndex].updatedAt = new Date().toISOString()

    // Actualizar estado del equipo
    equipment.status = 'available'
    equipment.updatedAt = new Date().toISOString()

    return mockEquipmentAssignments[assignmentIndex]
  },

  async getMaintenanceHistory(id) {
    await delay(300)
    return mockEquipmentMaintenance.filter(m => m.equipmentId === id)
  },

  async scheduleMaintenance(id, maintenanceData) {
    await delay(400)
    const equipment = mockEquipment.find(eq => eq.id === id)
    if (!equipment) throw new Error('Equipo no encontrado')

    const newMaintenance = {
      id: `maint-${Date.now()}`,
      equipmentId: id,
      ...maintenanceData,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockEquipmentMaintenance.push(newMaintenance)
    return newMaintenance
  },

  async getStats() {
    await delay(300)
    const total = mockEquipment.length
    const available = mockEquipment.filter(eq => eq.status === 'available').length
    const inUse = mockEquipment.filter(eq => eq.status === 'in_use').length
    const inMaintenance = mockEquipment.filter(eq => eq.status === 'maintenance').length
    const retired = mockEquipment.filter(eq => eq.status === 'retired').length
    
    const totalValue = mockEquipment.reduce((sum, eq) => sum + eq.currentValue, 0)
    const utilizationRate = total > 0 ? (inUse / total) * 100 : 0
    
    const today = new Date()
    const upcomingMaintenance = mockEquipmentMaintenance.filter(m => {
      const scheduledDate = new Date(m.scheduledDate)
      const daysDiff = Math.ceil((scheduledDate - today) / (1000 * 60 * 60 * 24))
      return m.status === 'scheduled' && daysDiff <= 30
    }).length

    const overdueMaintenance = mockEquipmentMaintenance.filter(m => {
      const scheduledDate = new Date(m.scheduledDate)
      return m.status === 'scheduled' && scheduledDate < today
    }).length

    return {
      total,
      available,
      inUse,
      inMaintenance,
      retired,
      totalValue,
      utilizationRate,
      upcomingMaintenance,
      overdueMaintenance
    }
  },

  async getCategories() {
    await delay(300)
    return mockEquipmentCategories
  },

  async getTypes() {
    await delay(300)
    return mockEquipmentTypes
  },

  // Método auxiliar para generar historial de proyectos
  generateProjectHistory(equipmentId, assignments) {
    return assignments
      .filter(a => a.status === 'completed')
      .map(assignment => {
        const project = mockProjects.find(p => p.id === assignment.projectId)
        const startDate = new Date(assignment.startDate)
        const endDate = new Date(assignment.endDate)
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
        
        return {
          projectId: assignment.projectId,
          projectName: project?.name || 'Proyecto desconocido',
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          usageHours: daysDiff * 8, // Asumiendo 8 horas por día
          cost: daysDiff * 100 // Costo estimado por día
        }
      })
  }
}

// Exportar configuración
export const toolAPI = equipmentAPI
export { USE_FIREBASE }