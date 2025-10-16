import { ChartDataPoint, TooltipConfig } from '@/types/charts'

export const formatCurrency = (value: number, locale: string = 'es-ES', currency: string = 'EUR'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatNumber = (value: number, locale: string = 'es-ES'): string => {
  return new Intl.NumberFormat(locale).format(value)
}

export const formatDate = (date: Date | string, locale: string = 'es-ES', options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj)
}

export const getTimeAgo = (date: Date): string => {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Ahora'
  if (diffInMinutes < 60) return `${diffInMinutes}m`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
  return `${Math.floor(diffInMinutes / 1440)}d`
}

export const generateTimeSeriesData = (
  periods: string[],
  baseValue: number,
  variationPercent: number = 0.2
): ChartDataPoint[] => {
  return periods.map((period, index) => {
    const variation = (Math.random() - 0.5) * 2 * variationPercent
    const value = baseValue * (1 + variation) * (1 + index * 0.05)
    return {
      period,
      value: Math.round(value)
    }
  })
}

export const generatePeriods = (timeFilter: string): string[] => {
  const now = new Date()
  
  switch (timeFilter) {
    case 'week':
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now)
        date.setDate(date.getDate() - (6 - i))
        return date.toLocaleDateString('es-ES', { weekday: 'short' })
      })
    
    case 'month':
      return Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now)
        date.setDate(date.getDate() - (29 - i))
        return date.getDate().toString()
      })
    
    case 'quarter':
      return Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now)
        date.setMonth(date.getMonth() - (11 - i))
        return date.toLocaleDateString('es-ES', { month: 'short' })
      })
    
    case 'year':
      return Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now)
        date.setMonth(date.getMonth() - (11 - i))
        return date.toLocaleDateString('es-ES', { month: 'short' })
      })
    
    default:
      return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  }
}

export const createTooltipFormatter = (type: 'currency' | 'percentage' | 'number' = 'number') => {
  return (value: number, name: string): [string, string] => {
    let formattedValue: string
    
    switch (type) {
      case 'currency':
        formattedValue = formatCurrency(value)
        break
      case 'percentage':
        formattedValue = formatPercentage(value)
        break
      default:
        formattedValue = formatNumber(value)
    }
    
    return [formattedValue, name]
  }
}

export const getChartColors = (): string[] => {
  return [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
    '#EC4899', // pink-500
    '#6366F1'  // indigo-500
  ]
}

export const processChartData = (
  rawData: any[],
  xAxisKey: string,
  yAxisKeys: string[]
): ChartDataPoint[] => {
  return rawData.map(item => {
    const processedItem: ChartDataPoint = {
      [xAxisKey]: item[xAxisKey]
    }
    
    yAxisKeys.forEach(key => {
      processedItem[key] = typeof item[key] === 'number' ? item[key] : 0
    })
    
    return processedItem
  })
}

export const calculateGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export const aggregateDataByPeriod = (
  data: any[],
  dateField: string,
  valueField: string,
  aggregationType: 'sum' | 'average' | 'count' = 'sum'
): ChartDataPoint[] => {
  const grouped = data.reduce((acc, item) => {
    const date = new Date(item[dateField])
    const period = date.toISOString().split('T')[0] // YYYY-MM-DD format
    
    if (!acc[period]) {
      acc[period] = []
    }
    acc[period].push(item[valueField])
    
    return acc
  }, {} as Record<string, number[]>)
  
  return Object.entries(grouped).map(([period, values]) => {
    let aggregatedValue: number
    
    switch (aggregationType) {
      case 'average':
        aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length
        break
      case 'count':
        aggregatedValue = values.length
        break
      default: // sum
        aggregatedValue = values.reduce((sum, val) => sum + val, 0)
    }
    
    return {
      period,
      value: Math.round(aggregatedValue)
    }
  }).sort((a, b) => a.period.localeCompare(b.period))
}