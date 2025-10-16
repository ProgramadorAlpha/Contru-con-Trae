import React from 'react'
import { cn } from '@/lib/utils'

// Base skeleton component with shimmer effect
export const Skeleton = ({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
        'animate-shimmer',
        className
      )}
      {...props}
    />
  )
}

// Chart skeleton with proper aspect ratio
export const ChartSkeleton = ({ 
  height = 300, 
  title,
  className 
}: { 
  height?: number
  title?: string
  className?: string 
}) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      {/* Chart header */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          {title ? (
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
          ) : (
            <Skeleton className="h-6 w-48" />
          )}
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      
      {/* Chart area */}
      <div className="relative" style={{ height }}>
        <Skeleton className="absolute inset-0" />
        
        {/* Simulate chart elements */}
        <div className="absolute inset-4 flex items-end justify-between space-x-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center space-y-2">
              <Skeleton 
                className="w-full bg-gray-300" 
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-4 bottom-8 flex flex-col justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-12" />
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center items-center space-x-4 mt-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="w-3 h-3 rounded-sm" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Stats card skeleton
export const StatsCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="p-3 rounded-lg bg-gray-100">
          <Skeleton className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

// List item skeleton (for projects, deadlines, etc.)
export const ListItemSkeleton = ({ showProgress = false }: { showProgress?: boolean }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      {showProgress && (
        <div className="text-right space-y-2">
          <Skeleton className="h-4 w-12 ml-auto" />
          <Skeleton className="h-2 w-20" />
        </div>
      )}
    </div>
  )
}

// Complete dashboard skeleton
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-16" />
            <div className="flex space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <ChartSkeleton key={i} />
        ))}
      </div>
      
      {/* Additional widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent projects skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <ListItemSkeleton key={i} showProgress />
            ))}
          </div>
        </div>
        
        {/* Upcoming deadlines skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="w-2 h-2 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading spinner component
export const LoadingSpinner = ({ 
  size = 'md', 
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-blue-600', sizeClasses[size], className)} />
  )
}

// Progress bar for exports and long operations
export const ProgressBar = ({ 
  progress, 
  label,
  showPercentage = true,
  className 
}: { 
  progress: number
  label?: string
  showPercentage?: boolean
  className?: string 
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress))
  
  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-gray-700">{label}</span>}
          {showPercentage && <span className="text-gray-500">{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  )
}

// Inline loading state for buttons
export const ButtonLoading = ({ 
  children, 
  loading = false,
  loadingText = 'Cargando...',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  loadingText?: string
}) => {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

// Skeleton for notification items
export const NotificationSkeleton = () => {
  return (
    <div className="p-4 border-b border-gray-100">
      <div className="flex items-start space-x-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  )
}
// Settings modal skeleton
export const SettingsModalSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-6 h-6" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-2 py-4">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <div className="space-y-2">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <Skeleton className="h-10 w-32" />
        <div className="flex space-x-3">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}

// Export all skeletons as a namespace for easier access
export const LoadingSkeletons = {
  Skeleton,
  Chart: ChartSkeleton,
  StatsCard: StatsCardSkeleton,
  ListItem: ListItemSkeleton,
  Dashboard: DashboardSkeleton,
  Notification: NotificationSkeleton,
  SettingsModal: SettingsModalSkeleton,
  Spinner: LoadingSpinner,
  ProgressBar,
  ButtonLoading
}