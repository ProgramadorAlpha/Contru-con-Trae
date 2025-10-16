import React, { Suspense, lazy } from 'react'
import { SettingsModalSkeleton } from './LoadingSkeletons'
import { DashboardWidget } from '@/types/dashboard'

// Lazy load the heavy settings component
const DashboardSettingsComponent = lazy(() => 
  import('./DashboardSettings').then(module => ({ 
    default: module.DashboardSettings 
  }))
)

interface DashboardSettingsLazyProps {
  isOpen: boolean
  onClose: () => void
  widgets: DashboardWidget[]
  onSaveSettings: (widgets: DashboardWidget[]) => void
  onResetToDefault: () => void
}

export function DashboardSettingsLazy(props: DashboardSettingsLazyProps) {
  // Only render the component when the modal is open
  if (!props.isOpen) {
    return null
  }

  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <SettingsModalSkeleton />
      </div>
    }>
      <DashboardSettingsComponent {...props} />
    </Suspense>
  )
}