import React from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

/**
 * Main layout component that wraps the entire application
 * Provides theme-aware styling and manages the overall structure
 * 
 * Features:
 * - Responsive sidebar and header
 * - Theme-aware background colors
 * - Smooth color transitions (200ms)
 * - Proper overflow handling
 */
export function Layout({ children }: LayoutProps) {
  const { isDarkMode } = useDarkMode()

  return (
    <div 
      className={cn(
        'flex h-screen',
        'transition-colors duration-200',
        isDarkMode 
          ? 'bg-gray-900 text-white' 
          : 'bg-gray-50 text-gray-900'
      )}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main 
          className={cn(
            'flex-1 overflow-x-hidden overflow-y-auto',
            'transition-colors duration-200',
            isDarkMode 
              ? 'bg-gray-900' 
              : 'bg-gray-50'
          )}
        >
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}