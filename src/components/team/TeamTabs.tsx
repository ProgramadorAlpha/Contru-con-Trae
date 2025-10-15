import React, { useState } from 'react'
import { Users, Building2, TrendingUp, Calendar, Clock, ChevronDown } from 'lucide-react'
import { TeamTab } from '@/types/team'
import { cn } from '@/lib/utils'

interface TeamTabsProps {
  activeTab: TeamTab
  onTabChange: (tab: TeamTab) => void
  counters: {
    employees: number
    departments: number
    assignments: number
    attendancePercentage: number
    performancePercentage: number
  }
}

export function TeamTabs({ activeTab, onTabChange, counters }: TeamTabsProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const tabs = [
    {
      id: 'employees' as TeamTab,
      name: 'Empleados',
      icon: Users,
      counter: counters.employees,
      counterType: 'number'
    },
    {
      id: 'departments' as TeamTab,
      name: 'Departamentos',
      icon: Building2,
      counter: counters.departments,
      counterType: 'number'
    },
    {
      id: 'performance' as TeamTab,
      name: 'Rendimiento',
      icon: TrendingUp,
      counter: counters.performancePercentage,
      counterType: 'percentage'
    },
    {
      id: 'assignments' as TeamTab,
      name: 'Asignaciones',
      icon: Calendar,
      counter: counters.assignments,
      counterType: 'number'
    },
    {
      id: 'attendance' as TeamTab,
      name: 'Asistencia',
      icon: Clock,
      counter: counters.attendancePercentage,
      counterType: 'percentage'
    }
  ]

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  const handleTabClick = (tabId: TeamTab) => {
    onTabChange(tabId)
    setShowMobileMenu(false)
  }

  const renderCounter = (counter: number, type: string) => {
    if (type === 'percentage') {
      return `${counter}%`
    }
    return counter.toString()
  }

  const getCounterColor = (counter: number, type: string) => {
    if (type === 'percentage') {
      if (counter >= 85) return 'bg-green-100 text-green-800'
      if (counter >= 70) return 'bg-yellow-100 text-yellow-800'
      return 'bg-red-100 text-red-800'
    }
    return 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Desktop Tabs */}
      <div className="hidden md:block">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  'flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="w-5 h-5 mr-2" />
                <span>{tab.name}</span>
                <span
                  className={cn(
                    'ml-2 px-2 py-1 text-xs font-medium rounded-full',
                    isActive 
                      ? getCounterColor(tab.counter, tab.counterType)
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {renderCounter(tab.counter, tab.counterType)}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              {activeTabData && (
                <>
                  <activeTabData.icon className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="font-medium text-gray-900">{activeTabData.name}</span>
                  <span
                    className={cn(
                      'ml-2 px-2 py-1 text-xs font-medium rounded-full',
                      getCounterColor(activeTabData.counter, activeTabData.counterType)
                    )}
                  >
                    {renderCounter(activeTabData.counter, activeTabData.counterType)}
                  </span>
                </>
              )}
            </div>
            <ChevronDown
              className={cn(
                'w-5 h-5 text-gray-400 transition-transform',
                showMobileMenu && 'transform rotate-180'
              )}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    'flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50',
                    isActive && 'bg-blue-50'
                  )}
                >
                  <div className="flex items-center">
                    <Icon className={cn(
                      'w-5 h-5 mr-3',
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    )} />
                    <span className={cn(
                      'font-medium',
                      isActive ? 'text-blue-600' : 'text-gray-900'
                    )}>
                      {tab.name}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      isActive 
                        ? getCounterColor(tab.counter, tab.counterType)
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {renderCounter(tab.counter, tab.counterType)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}