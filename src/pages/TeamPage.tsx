import React from 'react'
import { Users, Plus, Download, RefreshCw } from 'lucide-react'
import { useTeam } from '@/hooks/useTeam'
import {
  TeamStats,
  TeamTabs,
  TeamFilters,
  EmployeesList,
  DepartmentsList,
  PerformanceView,
  AssignmentsList,
  AttendanceView,
  EmployeeForm,
  DepartmentForm
} from '@/components/team'

export function TeamPage() {
  const {
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
  } = useTeam()

  const handleRefresh = async () => {
    await loadData()
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export functionality to be implemented')
  }

  const handleNewEmployee = () => {
    openEmployeeForm()
  }

  const handleNewDepartment = () => {
    openDepartmentForm()
  }

  const handleEmployeeEdit = (employee: any) => {
    openEmployeeForm(employee)
  }

  const handleEmployeeDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este empleado?')) {
      try {
        await deleteEmployee(id)
      } catch (error) {
        console.error('Error deleting employee:', error)
        alert('Error al eliminar el empleado. Verifique que no tenga asignaciones activas.')
      }
    }
  }

  const handleDepartmentEdit = (department: any) => {
    openDepartmentForm(department)
  }

  const handleDepartmentDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este departamento?')) {
      try {
        await deleteDepartment(id)
      } catch (error) {
        console.error('Error deleting department:', error)
        alert('Error al eliminar el departamento. Verifique que no tenga empleados asignados.')
      }
    }
  }

  const handleEmployeeFormSubmit = async (data: any) => {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, data)
      } else {
        await createEmployee(data)
      }
      closeEmployeeForm()
    } catch (error) {
      console.error('Error saving employee:', error)
      throw error
    }
  }

  const handleDepartmentFormSubmit = async (data: any) => {
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, data)
      } else {
        await createDepartment(data)
      }
      closeDepartmentForm()
    } catch (error) {
      console.error('Error saving department:', error)
      throw error
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'employees':
        return (
          <EmployeesList
            employees={employees}
            loading={loading}
            selectedIds={selectedEmployees}
            onEdit={handleEmployeeEdit}
            onDelete={handleEmployeeDelete}
            onSelectionChange={toggleEmployeeSelection}
            onSelectAll={selectAllEmployees}
            onClearSelection={clearSelection}
          />
        )
      case 'departments':
        return (
          <DepartmentsList
            departments={departments}
            loading={loading}
            onEdit={handleDepartmentEdit}
            onDelete={handleDepartmentDelete}
            onNew={handleNewDepartment}
          />
        )
      case 'performance':
        return (
          <PerformanceView
            employees={employees}
            loading={loading}
          />
        )
      case 'assignments':
        return (
          <AssignmentsList
            assignments={assignments}
            employees={employees}
            loading={loading}
            onCreate={createAssignment}
            onUpdate={updateAssignment}
            onDelete={deleteAssignment}
          />
        )
      case 'attendance':
        return (
          <AttendanceView
            attendance={attendance}
            employees={employees}
            loading={loading}
            onCreate={createAttendanceRecord}
          />
        )
      default:
        return null
    }
  }

  const getActionButton = () => {
    switch (activeTab) {
      case 'employees':
        return (
          <button
            onClick={handleNewEmployee}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Empleado
          </button>
        )
      case 'departments':
        return (
          <button
            onClick={handleNewDepartment}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Departamento
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Equipo</h1>
          <p className="text-gray-600 mt-1">Administra tu equipo de trabajo y recursos humanos</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          {getActionButton()}
        </div>
      </div>

      {/* Stats */}
      <TeamStats stats={stats} loading={loading} />

      {/* Tabs */}
      <TeamTabs
        activeTab={activeTab}
        onTabChange={changeTab}
        counters={{
          employees: employees.length,
          departments: departments.length,
          assignments: assignments.filter(a => a.status === 'Activa').length,
          attendancePercentage: stats?.attendanceRate || 0,
          performancePercentage: stats?.averagePerformance || 0
        }}
      />

      {/* Filters */}
      {(activeTab === 'employees' || activeTab === 'assignments' || activeTab === 'attendance') && (
        <TeamFilters
          filters={filters}
          departments={departments}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          activeTab={activeTab}
        />
      )}

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {renderTabContent()}
      </div>

      {/* Modals */}
      {showEmployeeForm && (
        <EmployeeForm
          employee={editingEmployee}
          departments={departments}
          isOpen={showEmployeeForm}
          onClose={closeEmployeeForm}
          onSave={handleEmployeeFormSubmit}
        />
      )}

      {showDepartmentForm && (
        <DepartmentForm
          department={editingDepartment}
          employees={employees}
          isOpen={showDepartmentForm}
          onClose={closeDepartmentForm}
          onSave={handleDepartmentFormSubmit}
        />
      )}
    </div>
  )
}