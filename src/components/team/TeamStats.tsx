import React from 'react'
import { Users, UserCheck, TrendingUp, Building2 } from 'lucide-react'
import { TeamStats as TeamStatsType } from '@/types/team'

interface TeamStatsProps {
  stats: TeamStatsType | null
  loading: boolean
}

export function TeamStats({ stats, loading }: TeamStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
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
    )
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <p>No hay datos disponibles</p>
          </div>
        </div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total Empleados',
      value: stats.totalEmployees,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600'
    },
    {
      title: 'Empleados Activos',
      value: stats.activeEmployees,
      icon: UserCheck,
      color: 'green',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-600'
    },
    {
      title: 'Rendimiento Promedio',
      value: `${stats.averagePerformance}%`,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-600'
    },
    {
      title: 'Departamentos',
      value: stats.totalDepartments,
      icon: Building2,
      color: 'orange',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.value}
                </p>
                {/* Additional info based on card type */}
                {card.title === 'Empleados Activos' && stats.totalEmployees > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((stats.activeEmployees / stats.totalEmployees) * 100)}% del total
                  </p>
                )}
                {card.title === 'Rendimiento Promedio' && (
                  <p className={`text-xs mt-1 ${
                    stats.averagePerformance >= 85 ? 'text-green-600' :
                    stats.averagePerformance >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {stats.averagePerformance >= 85 ? 'Excelente' :
                     stats.averagePerformance >= 70 ? 'Bueno' : 'Necesita mejora'}
                  </p>
                )}
              </div>
              <div className={`${card.bgColor} rounded-lg p-3`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}