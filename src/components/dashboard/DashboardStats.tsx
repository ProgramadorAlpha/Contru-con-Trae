import React from 'react'
import { LucideIcon } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/chartUtils'
import { StatsCardSkeleton } from './LoadingSkeletons'

export interface StatCardData {
  title: string
  value: number
  icon: LucideIcon
  trend?: number
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  format?: 'number' | 'currency' | 'percentage'
}

interface StatsCardProps extends StatCardData {
  loading?: boolean
}

interface DashboardStatsProps {
  stats: StatCardData[]
  loading?: boolean
  isVisible?: boolean
}

/**
 * Format value based on type
 */
function formatValue(value: number, format?: 'number' | 'currency' | 'percentage'): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value)
    case 'percentage':
      return `${value.toFixed(1)}%`
    default:
      return value.toLocaleString()
  }
}

/**
 * Get color classes for card icon background
 */
function getColorClasses(color: string, isDarkMode: boolean) {
  const colorMap = {
    blue: isDarkMode ? 'bg-blue-900 text-blue-400' : 'bg-blue-100 text-blue-600',
    green: isDarkMode ? 'bg-green-900 text-green-400' : 'bg-green-100 text-green-600',
    purple: isDarkMode ? 'bg-purple-900 text-purple-400' : 'bg-purple-100 text-purple-600',
    orange: isDarkMode ? 'bg-orange-900 text-orange-400' : 'bg-orange-100 text-orange-600',
    red: isDarkMode ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-600'
  }
  return colorMap[color as keyof typeof colorMap] || colorMap.blue
}

/**
 * StatsCard component - Individual stat card with icon, value, and trend
 */
export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color, 
  format,
  loading = false
}: StatsCardProps) {
  const { isDarkMode } = useDarkMode()

  if (loading) {
    return <StatsCardSkeleton />
  }

  return (
    <div 
      className={cn(
        'rounded-lg shadow-sm border p-6',
        'hover:shadow-md transition-all duration-200',
        isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p 
            className={cn(
              'text-sm font-medium transition-colors duration-200',
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            )}
          >
            {title}
          </p>
          <p 
            className={cn(
              'text-2xl font-bold mt-1 transition-colors duration-200',
              isDarkMode ? 'text-white' : 'text-gray-900'
            )}
          >
            {formatValue(value, format)}
          </p>
          {trend !== undefined && (
            <p 
              className={cn(
                'text-sm mt-1 flex items-center transition-colors duration-200',
                trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}
            >
              <span className="mr-1" aria-hidden="true">
                {trend >= 0 ? '↗' : '↘'}
              </span>
              <span>
                {Math.abs(trend)}% vs mes anterior
              </span>
            </p>
          )}
        </div>
        <div 
          className={cn(
            'rounded-lg p-3 transition-colors duration-200',
            getColorClasses(color, isDarkMode)
          )}
        >
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

/**
 * DashboardStats component - Grid of stat cards
 * 
 * Features:
 * - Responsive grid (1-2-4 columns)
 * - Theme-aware styling
 * - Skeleton loaders during loading
 * - Conditional rendering based on visibility
 * - Formatted values (number, currency, percentage)
 * - Trend indicators
 * 
 * @example
 * ```tsx
 * <DashboardStats
 *   stats={[
 *     {
 *       title: 'Proyectos Activos',
 *       value: 12,
 *       icon: Calendar,
 *       trend: 15,
 *       color: 'blue',
 *       format: 'number'
 *     },
 *     {
 *       title: 'Presupuesto Total',
 *       value: 580000,
 *       icon: DollarSign,
 *       trend: 8,
 *       color: 'green',
 *       format: 'currency'
 *     }
 *   ]}
 *   loading={false}
 *   isVisible={true}
 * />
 * ```
 */
export function DashboardStats({ 
  stats, 
  loading = false, 
  isVisible = true 
}: DashboardStatsProps) {
  if (!isVisible) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))
      ) : (
        stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))
      )}
    </div>
  )
}
