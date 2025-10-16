import { useState, useCallback, useMemo, memo } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { BudgetDataPoint, ProjectProgressData, TeamPerformanceData, ExpenseCategory } from '@/types/dashboard'
import { formatCurrency, formatPercentage, createTooltipFormatter, getChartColors } from '@/lib/chartUtils'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@/lib/utils'
import { ChartErrorBoundary } from './ChartErrorBoundary'
import { ChartSkeleton } from './LoadingSkeletons'

interface DashboardChartsProps {
  budgetData: BudgetDataPoint[]
  projectProgressData: ProjectProgressData[]
  teamPerformanceData: TeamPerformanceData[]
  expensesByCategory: ExpenseCategory[]
  timeFilter: string
  onChartInteraction?: (data: any) => void
  loading?: boolean
}

const DashboardCharts = memo(function DashboardCharts({
  budgetData,
  projectProgressData,
  teamPerformanceData,
  expensesByCategory,
  timeFilter,
  onChartInteraction,
  loading = false
}: DashboardChartsProps) {
  const { isDarkMode } = useDarkMode()
  
  // Defensive programming: Ensure all data arrays exist
  const safeBudgetData = budgetData || []
  const safeProjectProgressData = projectProgressData || []
  const safeTeamPerformanceData = teamPerformanceData || []
  const safeExpensesByCategory = expensesByCategory || []
  
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set())

  // Memoize expensive calculations
  const COLORS = useMemo(() => getChartColors(), [])
  
  const customTooltip = useMemo(() => createTooltipFormatter('currency'), [])
  const percentageTooltip = useMemo(() => createTooltipFormatter('percentage'), [])
  
  // Theme-aware colors
  const chartTheme = useMemo(() => ({
    text: isDarkMode ? '#E5E7EB' : '#374151',
    grid: isDarkMode ? '#374151' : '#F0F0F0',
    axis: isDarkMode ? '#4B5563' : '#E5E7EB',
    background: isDarkMode ? '#1F2937' : '#FFFFFF',
    border: isDarkMode ? '#374151' : '#E5E7EB',
    tooltipBg: isDarkMode ? '#1F2937' : '#FFFFFF',
    tooltipBorder: isDarkMode ? '#374151' : '#E5E7EB'
  }), [isDarkMode])

  // Memoize processed data to avoid recalculations
  const processedBudgetData = useMemo(() => {
    return safeBudgetData.map(item => ({
      ...item,
      utilization: item.budgeted > 0 ? (item.spent / item.budgeted) * 100 : 0
    }))
  }, [safeBudgetData])

  const processedExpensesData = useMemo(() => {
    const total = safeExpensesByCategory.reduce((sum, item) => sum + item.value, 0)
    return safeExpensesByCategory.map(item => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0
    }))
  }, [safeExpensesByCategory])

  const handleLegendClick = useCallback((dataKey: string) => {
    setHiddenSeries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey)
      } else {
        newSet.add(dataKey)
      }
      return newSet
    })
  }, [])

  const handleChartClick = useCallback((data: any, chartType: string) => {
    if (onChartInteraction) {
      onChartInteraction({ ...data, chartType })
    }
  }, [onChartInteraction])

  const CustomLegend = ({ payload, onClick }: any) => {
    return (
      <div className="flex justify-center items-center space-x-4 mt-4 flex-wrap gap-2">
        {payload?.map((entry: any, index: number) => (
          <button
            key={`legend-${index}`}
            onClick={() => onClick(entry.dataKey)}
            className={cn(
              'flex items-center space-x-2 px-3 py-1 rounded-md transition-all',
              hiddenSeries.has(entry.dataKey)
                ? isDarkMode
                  ? 'opacity-50 bg-gray-700'
                  : 'opacity-50 bg-gray-100'
                : isDarkMode
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-50'
            )}
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className={cn(
              'text-sm font-medium transition-colors duration-200',
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            )}>
              {entry.value}
            </span>
          </button>
        ))}
      </div>
    )
  }

  const getTimeFilterLabel = (filter: string): string => {
    const labels: Record<string, string> = {
      week: 'Esta Semana',
      month: 'Este Mes',
      quarter: 'Este Trimestre',
      year: 'Este Año',
      custom: 'Período Personalizado'
    }
    return labels[filter] || filter
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <ChartSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-6 gap-4" role="region" aria-label="Gráficos del dashboard">
      {/* Budget Utilization Trend */}
      <div className={cn(
        'rounded-lg shadow-sm border p-6 sm:p-6 p-4 hover:shadow-md transition-all duration-200',
        isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      )}>
        <div className="flex items-center justify-between mb-4 sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-2">
          <h3 id="budget-chart-title" className={cn(
            'text-lg font-semibold sm:text-lg text-base transition-colors duration-200',
            isDarkMode ? 'text-white' : 'text-gray-900'
          )}>
            Utilización de Presupuesto
          </h3>
          <span className={cn(
            'text-sm px-2 py-1 rounded sm:text-sm text-xs transition-colors duration-200',
            isDarkMode
              ? 'text-gray-400 bg-gray-700'
              : 'text-gray-500 bg-gray-100'
          )} aria-label={`Período de tiempo: ${getTimeFilterLabel(timeFilter)}`}>
            {getTimeFilterLabel(timeFilter)}
          </span>
        </div>
        <ChartErrorBoundary chartType="budget-area-chart">
          <div role="img" aria-labelledby="budget-chart-title" aria-describedby="budget-chart-desc">
            <div id="budget-chart-desc" className="sr-only">
              Gráfico de área que muestra la utilización del presupuesto a lo largo del tiempo. 
              Compara el presupuesto asignado con el gasto real para el período seleccionado.
            </div>
            <ResponsiveContainer width="100%" height={300} minHeight={250}>
              <AreaChart 
                data={processedBudgetData}
                onClick={(data) => handleChartClick(data, 'budget')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleChartClick(e, 'budget')
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="Gráfico interactivo de utilización de presupuesto. Presiona Enter para interactuar."
              >
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12, fill: chartTheme.text }}
                axisLine={{ stroke: chartTheme.axis }}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12, fill: chartTheme.text }}
                axisLine={{ stroke: chartTheme.axis }}
              />
              <Tooltip 
                formatter={customTooltip}
                labelStyle={{ color: chartTheme.text }}
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  border: `1px solid ${chartTheme.tooltipBorder}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: chartTheme.text
                }}
              />
              <Legend 
                content={(props) => (
                  <CustomLegend {...props} onClick={handleLegendClick} />
                )}
              />
              {!hiddenSeries.has('budgeted') && (
                <Area
                  type="monotone"
                  dataKey="budgeted"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Presupuestado"
                  strokeWidth={2}
                />
              )}
              {!hiddenSeries.has('spent') && (
                <Area
                  type="monotone"
                  dataKey="spent"
                  stackId="2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Gastado"
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </ChartErrorBoundary>
      </div>

      {/* Project Progress */}
      <div className={cn(
        'rounded-lg shadow-sm border p-6 hover:shadow-md transition-all duration-200',
        isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 id="projects-chart-title" className={cn(
            'text-lg font-semibold transition-colors duration-200',
            isDarkMode ? 'text-white' : 'text-gray-900'
          )}>
            Progreso de Proyectos
          </h3>
          <span className={cn(
            'text-sm transition-colors duration-200',
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          )} aria-label={`Total de proyectos: ${safeProjectProgressData.length}`}>
            {safeProjectProgressData.length} proyectos
          </span>
        </div>
        <ChartErrorBoundary chartType="project-progress-bar-chart">
          <div role="img" aria-labelledby="projects-chart-title" aria-describedby="projects-chart-desc">
            <div id="projects-chart-desc" className="sr-only">
              Gráfico de barras que muestra el progreso de cada proyecto activo. 
              Cada barra representa el porcentaje de completitud de un proyecto específico.
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={safeProjectProgressData}
                onClick={(data) => handleChartClick(data, 'projects')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleChartClick(e, 'projects')
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="Gráfico interactivo de progreso de proyectos. Presiona Enter para interactuar."
              >
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: chartTheme.text }}
                axisLine={{ stroke: chartTheme.axis }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                domain={[0, 100]}
                tickFormatter={formatPercentage}
                tick={{ fontSize: 12, fill: chartTheme.text }}
                axisLine={{ stroke: chartTheme.axis }}
              />
              <Tooltip 
                formatter={percentageTooltip}
                labelStyle={{ color: chartTheme.text }}
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  border: `1px solid ${chartTheme.tooltipBorder}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: chartTheme.text
                }}
              />
              <Bar 
                dataKey="progress" 
                fill="#8B5CF6" 
                radius={[4, 4, 0, 0]}
                name="Progreso"
              />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </ChartErrorBoundary>
      </div>

      {/* Team Performance */}
      <div className={cn(
        'rounded-lg shadow-sm border p-6 hover:shadow-md transition-all duration-200',
        isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn(
            'text-lg font-semibold transition-colors duration-200',
            isDarkMode ? 'text-white' : 'text-gray-900'
          )}>
            Rendimiento del Equipo
          </h3>
          <span className={cn(
            'text-sm transition-colors duration-200',
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          )}>
            Últimos {safeTeamPerformanceData.length} períodos
          </span>
        </div>
        <ChartErrorBoundary chartType="team-performance-line-chart">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={safeTeamPerformanceData}
              onClick={(data) => handleChartClick(data, 'team')}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12, fill: chartTheme.text }}
                axisLine={{ stroke: chartTheme.axis }}
              />
              <YAxis 
                domain={[0, 100]} 
                tickFormatter={formatPercentage}
                tick={{ fontSize: 12, fill: chartTheme.text }}
                axisLine={{ stroke: chartTheme.axis }}
              />
              <Tooltip 
                formatter={percentageTooltip}
                labelStyle={{ color: chartTheme.text }}
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  border: `1px solid ${chartTheme.tooltipBorder}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: chartTheme.text
                }}
              />
              <Legend 
                content={(props) => (
                  <CustomLegend {...props} onClick={handleLegendClick} />
                )}
              />
              {!hiddenSeries.has('performance') && (
                <Line
                  type="monotone"
                  dataKey="performance"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                  name="Rendimiento"
                />
              )}
              {!hiddenSeries.has('attendance') && (
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  name="Asistencia"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartErrorBoundary>
      </div>

      {/* Expenses by Category */}
      <div className={cn(
        'rounded-lg shadow-sm border p-6 hover:shadow-md transition-all duration-200',
        isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn(
            'text-lg font-semibold transition-colors duration-200',
            isDarkMode ? 'text-white' : 'text-gray-900'
          )}>
            Gastos por Categoría
          </h3>
          <span className={cn(
            'text-sm transition-colors duration-200',
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          )}>
            Total: {formatCurrency(safeExpensesByCategory.reduce((sum, item) => sum + item.value, 0))}
          </span>
        </div>
        <ChartErrorBoundary chartType="expenses-pie-chart">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart onClick={(data) => handleChartClick(data, 'expenses')}>
              <Pie
                data={processedExpensesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={2}
              >
                {processedExpensesData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Gasto']}
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  border: `1px solid ${chartTheme.tooltipBorder}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: chartTheme.text
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartErrorBoundary>
      </div>
    </div>
  )
})

export { DashboardCharts }