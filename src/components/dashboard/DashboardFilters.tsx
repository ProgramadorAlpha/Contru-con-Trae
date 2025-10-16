import React from 'react'
import { Calendar, Filter, Download, Settings, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TimeFilter, DateRange } from '@/types/dashboard'
import { ButtonLoading } from './LoadingSkeletons'

interface DashboardFiltersProps {
  timeFilter: TimeFilter
  onTimeFilterChange: (filter: TimeFilter) => void
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  onExport: () => void
  onToggleNotifications: () => void
  onOpenSettings: () => void
  notificationsEnabled: boolean
  isExporting?: boolean
}

export function DashboardFilters({
  timeFilter,
  onTimeFilterChange,
  dateRange,
  onDateRangeChange,
  onExport,
  onToggleNotifications,
  onOpenSettings,
  notificationsEnabled,
  isExporting = false
}: DashboardFiltersProps) {
  const timeFilters: Array<{ value: TimeFilter; label: string }> = [
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mes' },
    { value: 'quarter', label: 'Este Trimestre' },
    { value: 'year', label: 'Este Año' },
    { value: 'custom', label: 'Personalizado' }
  ]

  const validateDateRange = (start: string, end: string): boolean => {
    if (!start || !end) return false
    const startDate = new Date(start)
    const endDate = new Date(end)
    return startDate <= endDate
  }

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newRange = { ...dateRange, [field]: value }
    
    if (validateDateRange(newRange.start, newRange.end)) {
      onDateRangeChange(newRange)
    } else {
      // Si el rango no es válido, solo actualizar el campo pero mostrar error visual
      onDateRangeChange(newRange)
    }
  }

  const isDateRangeValid = validateDateRange(dateRange.start, dateRange.end)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Time Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Período:</span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {timeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => onTimeFilterChange(filter.value)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-all duration-200 font-medium',
                  timeFilter === filter.value
                    ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-transparent'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleNotifications}
            className={cn(
              'p-2 rounded-md transition-all duration-200',
              notificationsEnabled
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            )}
            title={notificationsEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones'}
          >
            <Bell className="w-4 h-4" />
          </button>
          
          <button
            onClick={onOpenSettings}
            className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-md transition-all duration-200"
            title="Configurar dashboard"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <ButtonLoading
            onClick={onExport}
            loading={isExporting}
            loadingText="Exportando..."
            className={cn(
              'flex items-center px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium',
              isExporting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'
            )}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </ButtonLoading>
        </div>
      </div>

      {/* Custom Date Range */}
      {timeFilter === 'custom' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Rango personalizado:</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex flex-col">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className={cn(
                    'px-3 py-2 border rounded-md text-sm transition-colors',
                    'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    !isDateRangeValid && dateRange.start && dateRange.end
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  )}
                  max={dateRange.end || undefined}
                />
                {!isDateRangeValid && dateRange.start && dateRange.end && (
                  <span className="text-xs text-red-500 mt-1">Fecha inválida</span>
                )}
              </div>
              
              <span className="text-gray-500 text-sm">a</span>
              
              <div className="flex flex-col">
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className={cn(
                    'px-3 py-2 border rounded-md text-sm transition-colors',
                    'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    !isDateRangeValid && dateRange.start && dateRange.end
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  )}
                  min={dateRange.start || undefined}
                />
                {!isDateRangeValid && dateRange.start && dateRange.end && (
                  <span className="text-xs text-red-500 mt-1">Fecha inválida</span>
                )}
              </div>
            </div>
            
            {isDateRangeValid && dateRange.start && dateRange.end && (
              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                ✓ Rango válido
              </div>
            )}
          </div>
          
          {/* Quick Date Presets for Custom Range */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Accesos rápidos:</span>
            <button
              onClick={() => {
                const end = new Date().toISOString().split('T')[0]
                const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                onDateRangeChange({ start, end })
              }}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => {
                const end = new Date().toISOString().split('T')[0]
                const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                onDateRangeChange({ start, end })
              }}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              Últimos 30 días
            </button>
            <button
              onClick={() => {
                const end = new Date().toISOString().split('T')[0]
                const start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                onDateRangeChange({ start, end })
              }}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              Últimos 90 días
            </button>
          </div>
        </div>
      )}
      
      {/* Filter Summary */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Mostrando datos de: {' '}
            <span className="font-medium text-gray-700">
              {timeFilter === 'custom' && isDateRangeValid
                ? `${dateRange.start} a ${dateRange.end}`
                : timeFilters.find(f => f.value === timeFilter)?.label
              }
            </span>
          </span>
          <span>
            Última actualización: {new Date().toLocaleTimeString('es-ES')}
          </span>
        </div>
      </div>
    </div>
  )
}