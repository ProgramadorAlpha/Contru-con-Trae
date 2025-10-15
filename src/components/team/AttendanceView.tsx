import React, { useState } from 'react'
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, Plus, Filter } from 'lucide-react'
import { AttendanceRecord, Employee } from '@/types/team'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AttendanceViewProps {
  attendance: AttendanceRecord[]
  employees: Employee[]
  loading: boolean
  onCreate: (data: any) => Promise<void>
}

export function AttendanceView({ attendance, employees, loading, onCreate }: AttendanceViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [showForm, setShowForm] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Presente':
        return CheckCircle
      case 'Ausente':
        return XCircle
      case 'Tardanza':
        return AlertCircle
      case 'Vacaciones':
        return Calendar
      case 'Licencia':
        return Calendar
      default:
        return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Presente':
        return 'text-green-600 bg-green-100'
      case 'Ausente':
        return 'text-red-600 bg-red-100'
      case 'Tardanza':
        return 'text-yellow-600 bg-yellow-100'
      case 'Vacaciones':
        return 'text-blue-600 bg-blue-100'
      case 'Licencia':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  // Filter attendance records
  const filteredAttendance = attendance.filter(record => {
    const matchesDate = !selectedDate || record.date === selectedDate
    const matchesEmployee = !selectedEmployee || record.employeeId === selectedEmployee
    return matchesDate && matchesEmployee
  })

  // Calculate attendance statistics
  const calculateStats = () => {
    const totalRecords = attendance.length
    const presentRecords = attendance.filter(r => r.status === 'Presente').length
    const absentRecords = attendance.filter(r => r.status === 'Ausente').length
    const lateRecords = attendance.filter(r => r.status === 'Tardanza').length
    
    const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0
    const punctualityRate = totalRecords > 0 ? Math.round(((presentRecords) / (presentRecords + lateRecords)) * 100) : 0

    return {
      total: totalRecords,
      present: presentRecords,
      absent: absentRecords,
      late: lateRecords,
      attendanceRate,
      punctualityRate
    }
  }

  const stats = calculateStats()

  // Group attendance by employee for summary view
  const getEmployeeAttendanceSummary = () => {
    const summary = employees.map(employee => {
      const employeeRecords = attendance.filter(r => r.employeeId === employee.id)
      const presentCount = employeeRecords.filter(r => r.status === 'Presente').length
      const totalCount = employeeRecords.length
      const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0
      
      return {
        employee,
        totalRecords: totalCount,
        presentCount,
        attendanceRate,
        lastRecord: employeeRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      }
    })
    
    return summary.sort((a, b) => b.attendanceRate - a.attendanceRate)
  }

  const employeeSummary = getEmployeeAttendanceSummary()

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
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Asistencia</p>
              <p className="text-2xl font-bold text-green-600">{stats.attendanceRate}%</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Presentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
              <p className="text-xs text-gray-500">de {stats.total} registros</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ausencias</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-xs text-gray-500">registros</p>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tardanzas</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              <p className="text-xs text-gray-500">registros</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Fecha:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Empleado:</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los empleados</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Vista:</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="daily">Diaria</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Asistencia
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Attendance Records */}
        <div className="bg-white border rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Registros de Asistencia ({filteredAttendance.length})
            </h3>
          </div>

          {filteredAttendance.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h4>
              <p className="text-gray-500">No se encontraron registros para los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredAttendance.map((record) => {
                const StatusIcon = getStatusIcon(record.status)
                
                return (
                  <div key={record.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn('p-2 rounded-full', getStatusColor(record.status))}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {record.employeeName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {formatDate(record.date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={cn('text-xs font-medium px-2 py-1 rounded-full', getStatusColor(record.status))}>
                          {record.status}
                        </span>
                        {record.checkIn && record.checkOut && (
                          <p className="text-xs text-gray-500 mt-1">
                            {record.checkIn} - {record.checkOut}
                          </p>
                        )}
                        {record.hoursWorked > 0 && (
                          <p className="text-xs text-gray-500">
                            {record.hoursWorked}h trabajadas
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {record.notes && (
                      <p className="text-xs text-gray-600 mt-2 ml-11">
                        {record.notes}
                      </p>
                    )}
                    
                    {record.justification && (
                      <p className="text-xs text-blue-600 mt-1 ml-11">
                        Justificación: {record.justification}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Employee Attendance Summary */}
        <div className="bg-white border rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Resumen por Empleado</h3>
          </div>

          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {employeeSummary.map((summary) => (
              <div key={summary.employee.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{
                        backgroundColor: `hsl(${summary.employee.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 50%)`
                      }}
                    >
                      {summary.employee.avatar || summary.employee.firstName.charAt(0) + summary.employee.lastName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {summary.employee.fullName}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {summary.employee.department}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={cn('text-lg font-bold', 
                      summary.attendanceRate >= 95 ? 'text-green-600' :
                      summary.attendanceRate >= 85 ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      {summary.attendanceRate}%
                    </div>
                    <p className="text-xs text-gray-500">
                      {summary.presentCount}/{summary.totalRecords} días
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 ml-13">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn('h-2 rounded-full transition-all duration-300',
                        summary.attendanceRate >= 95 ? 'bg-green-500' :
                        summary.attendanceRate >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ width: `${summary.attendanceRate}%` }}
                    ></div>
                  </div>
                  
                  {summary.lastRecord && (
                    <p className="text-xs text-gray-500 mt-1">
                      Último registro: {formatDate(summary.lastRecord.date)} - {summary.lastRecord.status}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Alerts */}
      {stats.attendanceRate < 85 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Alerta de Asistencia</h4>
              <p className="text-sm text-red-700 mt-1">
                La tasa de asistencia general está por debajo del 85%. Considera revisar las políticas de asistencia 
                y programar reuniones individuales con los empleados que tienen baja asistencia.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Simple Form Modal (placeholder) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Registrar Asistencia</h3>
              <p className="text-gray-500 mb-4">
                Formulario de registro de asistencia - Por implementar en versión completa
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