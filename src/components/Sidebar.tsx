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
  Wrench
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Proyectos', href: '/projects', icon: Building2 },
  { name: 'Presupuesto', href: '/budget', icon: Calculator },
  { name: 'Reportes', href: '/reports', icon: BarChart3 },
  { name: 'Documentos', href: '/documents', icon: FileText },
  { name: 'Equipos', href: '/equipment', icon: Wrench },
  { name: 'Equipo de Trabajo', href: '/team', icon: Users },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ConstructPro</h1>
            <p className="text-sm text-gray-500">Gestión de Obras</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-6 py-3 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}