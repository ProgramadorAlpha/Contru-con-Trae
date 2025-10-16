import { DashboardData } from '@/types/dashboard'
import { formatCurrency, formatDate } from './chartUtils'

export interface ExportData {
  timestamp: string
  timeFilter: string
  summary: {
    totalBudgeted: number
    totalSpent: number
    budgetUtilization: number
    averageProjectProgress: number
    averageTeamPerformance: number
    averageAttendance: number
  }
  stats: DashboardData['stats']
  budgetData: DashboardData['budgetData']
  projectProgressData: DashboardData['projectProgressData']
  teamPerformanceData: DashboardData['teamPerformanceData']
  expensesByCategory: DashboardData['expensesByCategory']
  recentProjects: DashboardData['recentProjects']
  upcomingDeadlines: DashboardData['upcomingDeadlines']
}

export type ExportFormat = 'json' | 'csv' | 'excel'

export const prepareExportData = (
  data: DashboardData,
  timeFilter: string
): ExportData => {
  const totalBudgeted = data.budgetData.reduce((sum, item) => sum + item.budgeted, 0)
  const totalSpent = data.budgetData.reduce((sum, item) => sum + item.spent, 0)
  
  const averageProjectProgress = data.projectProgressData.length > 0
    ? Math.round(data.projectProgressData.reduce((sum, p) => sum + p.progress, 0) / data.projectProgressData.length)
    : 0
  
  const averageTeamPerformance = data.teamPerformanceData.length > 0
    ? Math.round(data.teamPerformanceData.reduce((sum, t) => sum + t.performance, 0) / data.teamPerformanceData.length)
    : 0
  
  const averageAttendance = data.teamPerformanceData.length > 0
    ? Math.round(data.teamPerformanceData.reduce((sum, t) => sum + t.attendance, 0) / data.teamPerformanceData.length)
    : 0

  return {
    timestamp: new Date().toISOString(),
    timeFilter,
    summary: {
      totalBudgeted,
      totalSpent,
      budgetUtilization: data.stats.budgetUtilization,
      averageProjectProgress,
      averageTeamPerformance,
      averageAttendance
    },
    stats: data.stats,
    budgetData: data.budgetData,
    projectProgressData: data.projectProgressData,
    teamPerformanceData: data.teamPerformanceData,
    expensesByCategory: data.expensesByCategory,
    recentProjects: data.recentProjects,
    upcomingDeadlines: data.upcomingDeadlines
  }
}

export const exportToJSON = (exportData: ExportData): void => {
  const jsonString = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  downloadFile(blob, `dashboard-report-${getDateString()}.json`)
}

export const exportToCSV = (exportData: ExportData): void => {
  const csvContent = generateCSVContent(exportData)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, `dashboard-report-${getDateString()}.csv`)
}

export const exportToExcel = (exportData: ExportData): void => {
  // Para una implementación completa de Excel, se necesitaría una librería como xlsx
  // Por ahora, exportamos como CSV con formato mejorado
  const csvContent = generateExcelCompatibleCSV(exportData)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, `dashboard-report-${getDateString()}.csv`)
}

const generateCSVContent = (exportData: ExportData): string => {
  let csv = ''
  
  // Header
  csv += `Dashboard Report - ${formatDate(new Date(exportData.timestamp))}\n`
  csv += `Time Filter: ${exportData.timeFilter}\n`
  csv += `Generated: ${exportData.timestamp}\n\n`
  
  // Summary
  csv += 'RESUMEN EJECUTIVO\n'
  csv += 'Métrica,Valor\n'
  csv += `Total Presupuestado,${formatCurrency(exportData.summary.totalBudgeted)}\n`
  csv += `Total Gastado,${formatCurrency(exportData.summary.totalSpent)}\n`
  csv += `Utilización de Presupuesto,${exportData.summary.budgetUtilization}%\n`
  csv += `Progreso Promedio de Proyectos,${exportData.summary.averageProjectProgress}%\n`
  csv += `Rendimiento Promedio del Equipo,${exportData.summary.averageTeamPerformance}%\n`
  csv += `Asistencia Promedio,${exportData.summary.averageAttendance}%\n\n`
  
  // Budget Data
  csv += 'DATOS DE PRESUPUESTO\n'
  csv += 'Período,Presupuestado,Gastado\n'
  exportData.budgetData.forEach(item => {
    csv += `${item.period},${item.budgeted},${item.spent}\n`
  })
  csv += '\n'
  
  // Project Progress
  csv += 'PROGRESO DE PROYECTOS\n'
  csv += 'Proyecto,Progreso (%),Estado\n'
  exportData.projectProgressData.forEach(item => {
    csv += `${item.name},${item.progress},${item.status}\n`
  })
  csv += '\n'
  
  // Team Performance
  csv += 'RENDIMIENTO DEL EQUIPO\n'
  csv += 'Período,Rendimiento (%),Asistencia (%)\n'
  exportData.teamPerformanceData.forEach(item => {
    csv += `${item.period},${item.performance},${item.attendance}\n`
  })
  csv += '\n'
  
  // Expenses by Category
  csv += 'GASTOS POR CATEGORÍA\n'
  csv += 'Categoría,Valor\n'
  exportData.expensesByCategory.forEach(item => {
    csv += `${item.name},${item.value}\n`
  })
  
  return csv
}

const generateExcelCompatibleCSV = (exportData: ExportData): string => {
  // Usar separador de punto y coma para mejor compatibilidad con Excel en español
  let csv = ''
  
  // BOM para UTF-8
  csv = '\uFEFF'
  
  // Header
  csv += `Dashboard Report - ${formatDate(new Date(exportData.timestamp))}\n`
  csv += `Filtro Temporal;${exportData.timeFilter}\n`
  csv += `Generado;${formatDate(new Date(exportData.timestamp))}\n\n`
  
  // Summary
  csv += 'RESUMEN EJECUTIVO\n'
  csv += 'Métrica;Valor\n'
  csv += `Total Presupuestado;${formatCurrency(exportData.summary.totalBudgeted)}\n`
  csv += `Total Gastado;${formatCurrency(exportData.summary.totalSpent)}\n`
  csv += `Utilización de Presupuesto;${exportData.summary.budgetUtilization}%\n`
  csv += `Progreso Promedio de Proyectos;${exportData.summary.averageProjectProgress}%\n`
  csv += `Rendimiento Promedio del Equipo;${exportData.summary.averageTeamPerformance}%\n`
  csv += `Asistencia Promedio;${exportData.summary.averageAttendance}%\n\n`
  
  // Budget Data
  csv += 'DATOS DE PRESUPUESTO\n'
  csv += 'Período;Presupuestado;Gastado\n'
  exportData.budgetData.forEach(item => {
    csv += `${item.period};${item.budgeted};${item.spent}\n`
  })
  csv += '\n'
  
  // Project Progress
  csv += 'PROGRESO DE PROYECTOS\n'
  csv += 'Proyecto;Progreso (%);Estado\n'
  exportData.projectProgressData.forEach(item => {
    csv += `${item.name};${item.progress};${item.status}\n`
  })
  csv += '\n'
  
  // Team Performance
  csv += 'RENDIMIENTO DEL EQUIPO\n'
  csv += 'Período;Rendimiento (%);Asistencia (%)\n'
  exportData.teamPerformanceData.forEach(item => {
    csv += `${item.period};${item.performance};${item.attendance}\n`
  })
  csv += '\n'
  
  // Expenses by Category
  csv += 'GASTOS POR CATEGORÍA\n'
  csv += 'Categoría;Valor\n'
  exportData.expensesByCategory.forEach(item => {
    csv += `${item.name};${item.value}\n`
  })
  
  return csv
}

const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const getDateString = (): string => {
  const now = new Date()
  return now.toISOString().split('T')[0] // YYYY-MM-DD format
}

export const validateExportData = (data: DashboardData): boolean => {
  if (!data) return false
  if (!data.stats) return false
  if (!Array.isArray(data.budgetData)) return false
  if (!Array.isArray(data.projectProgressData)) return false
  if (!Array.isArray(data.teamPerformanceData)) return false
  if (!Array.isArray(data.expensesByCategory)) return false
  
  return true
}

export const getExportSizeEstimate = (data: DashboardData): number => {
  // Estimar el tamaño del archivo en bytes
  const jsonString = JSON.stringify(data)
  return new Blob([jsonString]).size
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}