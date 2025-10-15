import { useState, useEffect, useCallback } from 'react'
import { teamAPI } from '@/lib/api'
import { Employee, Department, Assignment, AttendanceRecord, TeamStats, TeamFilters, TeamTab } from '@/types/team'

export function useTeam() {
  // Data state
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<TeamStats | null>(null)
  
  // UI state
  const [activeTab, setActiveTab] = useState<TeamTab>('employees')
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<TeamFilters>({
    search: '',
    department: '',
    role: '',
    status: ''
  })
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  
  // Modal state
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [showDepartmentForm, setShowDepartmentForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)

  // Load initial data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [employeesData, departmentsData, assignmentsData, statsData] = await Promise.all([
        teamAPI.getEmployees(filters),
        teamAPI.getDepartments(),
        teamAPI.getAssignments(),
        teamAPI.getTeamStats()
      ])
      
      setEmployees(employeesData)
      setDepartments(departmentsData)
      setAssignments(assignmentsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading team data:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Load employees with filters
  const loadEmployees = useCallback(async () => {
    try {
      const employeesData = await teamAPI.getEmployees(filters)
      setEmployees(employeesData)
    } catch (error) {
      console.error('Error loading employees:', error)
    }
  }, [filters])

  // Load departments
  const loadDepartments = useCallback(async () => {
    try {
      const departmentsData = await teamAPI.getDepartments()
      setDepartments(departmentsData)
    } catch (error) {
      console.error('Error loading departments:', error)
    }
  }, [])

  // Load assignments
  const loadAssignments = useCallback(async () => {
    try {
      const assignmentsData = await teamAPI.getAssignments()
      setAssignments(assignmentsData)
    } catch (error) {
      console.error('Error loading assignments:', error)
    }
  }, [])

  // Load attendance
  const loadAttendance = useCallback(async (attendanceFilters = {}) => {
    try {
      const attendanceData = await teamAPI.getAttendance(attendanceFilters)
      setAttendance(attendanceData)
    } catch (error) {
      console.error('Error loading attendance:', error)
    }
  }, [])

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const statsData = await teamAPI.getTeamStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }, [])

  // Employee operations
  const createEmployee = useCallback(async (employeeData: any) => {
    try {
      const newEmployee = await teamAPI.createEmployee(employeeData)
      await Promise.all([loadEmployees(), loadDepartments(), loadStats()])
      return newEmployee
    } catch (error) {
      console.error('Error creating employee:', error)
      throw error
    }
  }, [loadEmployees, loadDepartments, loadStats])

  const updateEmployee = useCallback(async (id: string, updates: any) => {
    try {
      const updatedEmployee = await teamAPI.updateEmployee(id, updates)
      await Promise.all([loadEmployees(), loadDepartments(), loadStats()])
      return updatedEmployee
    } catch (error) {
      console.error('Error updating employee:', error)
      throw error
    }
  }, [loadEmployees, loadDepartments, loadStats])

  const deleteEmployee = useCallback(async (id: string) => {
    try {
      await teamAPI.deleteEmployee(id)
      await Promise.all([loadEmployees(), loadDepartments(), loadStats()])
    } catch (error) {
      console.error('Error deleting employee:', error)
      throw error
    }
  }, [loadEmployees, loadDepartments, loadStats])

  // Department operations
  const createDepartment = useCallback(async (departmentData: any) => {
    try {
      const newDepartment = await teamAPI.createDepartment(departmentData)
      await Promise.all([loadDepartments(), loadStats()])
      return newDepartment
    } catch (error) {
      console.error('Error creating department:', error)
      throw error
    }
  }, [loadDepartments, loadStats])

  const updateDepartment = useCallback(async (id: string, updates: any) => {
    try {
      const updatedDepartment = await teamAPI.updateDepartment(id, updates)
      await Promise.all([loadDepartments(), loadEmployees(), loadStats()])
      return updatedDepartment
    } catch (error) {
      console.error('Error updating department:', error)
      throw error
    }
  }, [loadDepartments, loadEmployees, loadStats])

  const deleteDepartment = useCallback(async (id: string) => {
    try {
      await teamAPI.deleteDepartment(id)
      await Promise.all([loadDepartments(), loadStats()])
    } catch (error) {
      console.error('Error deleting department:', error)
      throw error
    }
  }, [loadDepartments, loadStats])

  // Assignment operations
  const createAssignment = useCallback(async (assignmentData: any) => {
    try {
      const newAssignment = await teamAPI.createAssignment(assignmentData)
      await Promise.all([loadAssignments(), loadEmployees(), loadStats()])
      return newAssignment
    } catch (error) {
      console.error('Error creating assignment:', error)
      throw error
    }
  }, [loadAssignments, loadEmployees, loadStats])

  const updateAssignment = useCallback(async (id: string, updates: any) => {
    try {
      const updatedAssignment = await teamAPI.updateAssignment(id, updates)
      await Promise.all([loadAssignments(), loadEmployees()])
      return updatedAssignment
    } catch (error) {
      console.error('Error updating assignment:', error)
      throw error
    }
  }, [loadAssignments, loadEmployees])

  const deleteAssignment = useCallback(async (id: string) => {
    try {
      await teamAPI.deleteAssignment(id)
      await Promise.all([loadAssignments(), loadEmployees(), loadStats()])
    } catch (error) {
      console.error('Error deleting assignment:', error)
      throw error
    }
  }, [loadAssignments, loadEmployees, loadStats])

  // Attendance operations
  const createAttendanceRecord = useCallback(async (attendanceData: any) => {
    try {
      const newRecord = await teamAPI.createAttendanceRecord(attendanceData)
      await loadAttendance()
      return newRecord
    } catch (error) {
      console.error('Error creating attendance record:', error)
      throw error
    }
  }, [loadAttendance])

  // Filter operations
  const updateFilters = useCallback((newFilters: Partial<TeamFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      department: '',
      role: '',
      status: ''
    })
  }, [])

  // Modal operations
  const openEmployeeForm = useCallback((employee?: Employee) => {
    setEditingEmployee(employee || null)
    setShowEmployeeForm(true)
  }, [])

  const closeEmployeeForm = useCallback(() => {
    setEditingEmployee(null)
    setShowEmployeeForm(false)
  }, [])

  const openDepartmentForm = useCallback((department?: Department) => {
    setEditingDepartment(department || null)
    setShowDepartmentForm(true)
  }, [])

  const closeDepartmentForm = useCallback(() => {
    setEditingDepartment(null)
    setShowDepartmentForm(false)
  }, [])

  // Selection operations
  const toggleEmployeeSelection = useCallback((employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }, [])

  const selectAllEmployees = useCallback(() => {
    setSelectedEmployees(employees.map(emp => emp.id))
  }, [employees])

  const clearSelection = useCallback(() => {
    setSelectedEmployees([])
  }, [])

  // Tab operations
  const changeTab = useCallback((tab: TeamTab) => {
    setActiveTab(tab)
    // Load specific data for the tab if needed
    switch (tab) {
      case 'assignments':
        loadAssignments()
        break
      case 'attendance':
        loadAttendance()
        break
      default:
        break
    }
  }, [loadAssignments, loadAttendance])

  // Load initial data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Reload employees when filters change
  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  return {
    // Data
    employees,
    departments,
    assignments,
    attendance,
    stats,
    
    // UI State
    activeTab,
    loading,
    filters,
    selectedEmployees,
    
    // Modal State
    showEmployeeForm,
    showDepartmentForm,
    editingEmployee,
    editingDepartment,
    
    // Operations
    loadData,
    loadEmployees,
    loadDepartments,
    loadAssignments,
    loadAttendance,
    loadStats,
    
    // Employee operations
    createEmployee,
    updateEmployee,
    deleteEmployee,
    
    // Department operations
    createDepartment,
    updateDepartment,
    deleteDepartment,
    
    // Assignment operations
    createAssignment,
    updateAssignment,
    deleteAssignment,
    
    // Attendance operations
    createAttendanceRecord,
    
    // Filter operations
    updateFilters,
    clearFilters,
    
    // Modal operations
    openEmployeeForm,
    closeEmployeeForm,
    openDepartmentForm,
    closeDepartmentForm,
    
    // Selection operations
    toggleEmployeeSelection,
    selectAllEmployees,
    clearSelection,
    
    // Tab operations
    changeTab
  }
}