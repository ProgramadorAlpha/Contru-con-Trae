import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Building2, 
  Calculator, 
  FileText, 
  Users, 
  FolderOpen,
  BarChart3,
  Wrench,
  FileCheck,
  CheckSquare,
  DollarSign,
  Code,
  Shield
} from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@/lib/utils'

const menuItems = [
  { name: 'Dashboard Mejorado', href: '/dashboard-enhanced', icon: BarChart3 },
  { name: 'Proyectos', href: '/projects', icon: Building2 },
  { name: 'Presupuesto', href: '/budget', icon: Calculator },
  { name: 'Reportes', href: '/reports', icon: BarChart3 },
  { name: 'Documentos', href: '/documents', icon: FileText },
  { name: 'Herramientas', href: '/tools', icon: Wrench },
  { name: 'Equipo de Trabajo', href: '/team', icon: Users },
]

const jobCostingItems = [
  { name: 'Subcontratos', href: '/subcontracts', icon: FileCheck },
  { name: 'Certificados', href: '/certificates', icon: CheckSquare },
  { name: 'Códigos de Costo', href: '/cost-codes', icon: Code },
  { name: 'Aprobación de Gastos', href: '/expense-approvals', icon: DollarSign },
  { name: 'Registro de Auditoría', href: '/audit-log', icon: Shield },
]

/**
 * Sidebar component with theme support
 * 
 * Features:
 * - Theme-aware navigation items
 * - Active state highlighting
 * - Hover states with smooth transitions
 * - Responsive design
 * - Good contrast in both themes
 */
export function Sidebar() {
  const location = useLocation()
  const { isDarkMode } = useDarkMode()

  return (
    <div 
      className={cn(
        'w-64 shadow-lg transition-colors duration-200',
        isDarkMode 
          ? 'bg-gray-800 border-r border-gray-700' 
          : 'bg-white'
      )}
    >
      {/* Logo Section */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={cn(
              'text-xl font-bold transition-colors duration-200',
              isDarkMode ? 'text-white' : 'text-gray-900'
            )}>
              ConstructPro
            </h1>
            <p className={cn(
              'text-sm transition-colors duration-200',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )}>
              Gestión de Obras
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-6 py-3 text-sm font-medium',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
                isActive 
                  ? isDarkMode
                    ? 'bg-gray-700 text-blue-400 border-r-2 border-blue-400'
                    : 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}

        {/* Job Costing Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="px-6 mb-3">
            <h3 className={cn(
              'text-xs font-semibold uppercase tracking-wider',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )}>
              Costeo de Obra
            </h3>
          </div>
          {jobCostingItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-6 py-3 text-sm font-medium',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
                  isActive 
                    ? isDarkMode
                      ? 'bg-gray-700 text-blue-400 border-r-2 border-blue-400'
                      : 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}