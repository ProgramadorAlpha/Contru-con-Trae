/**
 * Project Detail Page
 * 
 * Página interna detallada de un proyecto con métricas, ejecución por área,
 * tareas críticas y filtros. Soporta temas claro/oscuro y carga datos dinámicos.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Clock,
  Euro
} from 'lucide-react';
import { projectAPI } from '@/lib/api';

interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  totalBudget: number;
  executed: number;
  performanceIndex: number;
  scheduleCompliance: number;
  criticalTasks: number;
  areas: {
    name: string;
    progress: number;
    status: 'on-time' | 'warning' | 'critical';
  }[];
  tasks: {
    id: string;
    title: string;
    responsible: string;
    daysRemaining: number;
    impact: 'high' | 'medium' | 'low';
  }[];
  budgetItems: {
    id: string;
    name: string;
    budget: number;
    executed: number;
    status: 'on-track' | 'warning' | 'critical';
  }[];
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'on-time' | 'delayed' | 'critical'>('all');

  useEffect(() => {
    loadProjectDetail();
  }, [projectId]);

  const loadProjectDetail = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del proyecto desde la API
      const projects = await projectAPI.getAll();
      const projectData = projects.find(p => p.id === projectId);
      
      if (!projectData) {
        setProject(null);
        setLoading(false);
        return;
      }

      // Calcular métricas basadas en datos reales del proyecto
      const executed = projectData.spent || 0;
      const totalBudget = projectData.budget || 1;
      const progress = projectData.progress || 0;
      
      setProject({
        id: projectData.id,
        name: projectData.name,
        description: projectData.description || 'Sin descripción',
        totalBudget: totalBudget,
        executed: executed,
        performanceIndex: executed > 0 ? (totalBudget / executed) : 1.0,
        scheduleCompliance: progress / 100,
        criticalTasks: Math.floor(Math.random() * 3), // Mock - en producción vendría de la API
        areas: [
          { name: 'Estructura', progress: Math.min(progress + 10, 100), status: progress > 80 ? 'on-time' : 'warning' },
          { name: 'Albañilería', progress: Math.min(progress, 100), status: progress > 70 ? 'on-time' : 'warning' },
          { name: 'Instalaciones', progress: Math.max(progress - 20, 0), status: progress > 50 ? 'warning' : 'critical' },
          { name: 'Acabados', progress: Math.max(progress - 40, 0), status: progress > 30 ? 'warning' : 'critical' },
          { name: 'Exteriores', progress: Math.max(progress - 50, 0), status: progress > 20 ? 'critical' : 'critical' }
        ],
        tasks: [
          {
            id: '1',
            title: `Instalación eléctrica - ${projectData.name}`,
            responsible: projectData.architect || 'Sin asignar',
            daysRemaining: 3,
            impact: 'high'
          }
        ],
        budgetItems: [
          { id: '1', name: 'Estructura', budget: totalBudget * 0.4, executed: executed * 0.35, status: 'on-track' },
          { id: '2', name: 'Albañilería', budget: totalBudget * 0.3, executed: executed * 0.32, status: 'warning' }
        ]
      });
    } catch (error) {
      console.error('Error loading project:', error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-time':
      case 'on-track':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on-time':
      case 'on-track':
        return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded">En tiempo</span>;
      case 'warning':
        return <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded">Atención</span>;
      case 'critical':
        return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded">Crítico</span>;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <main role="main" className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </main>
    );
  }

  if (!project) {
    return (
      <main role="main" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <p className="text-red-800 dark:text-red-300">Proyecto no encontrado</p>
      </main>
    );
  }

  const executionPercentage = (project.executed / project.totalBudget) * 100;

  return (
    <main role="main" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
            title="Volver a proyectos"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm lg:text-base">{project.description}</p>
          </div>
        </div>
        <div className="text-right bg-blue-50 dark:bg-blue-900/20 px-6 py-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1">Ejecución Total</div>
          <div className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">{executionPercentage.toFixed(1)}%</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Filtros</h3>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${
                activeFilter === 'all' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 font-medium' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Todas las partidas
            </button>
            <button
              onClick={() => setActiveFilter('on-time')}
              className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors text-sm ${
                activeFilter === 'on-time' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 font-medium' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              En tiempo
            </button>
            <button
              onClick={() => setActiveFilter('delayed')}
              className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors text-sm ${
                activeFilter === 'delayed' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 font-medium' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Con retrasos
            </button>
            <button
              onClick={() => setActiveFilter('critical')}
              className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors text-sm ${
                activeFilter === 'critical' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 font-medium' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Críticas
            </button>
          </div>

          {/* Budget Items */}
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked readOnly className="rounded" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Partidas</span>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {project.budgetItems.map((item) => (
                <div key={item.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-xs">
                        📊
                      </div>
                      {getStatusIcon(item.status)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Presupuesto:</div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">{formatCurrency(item.budget)}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Ejecutado: {formatCurrency(item.executed)}</div>
                  <div className="bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-1 text-xs text-center text-gray-900 dark:text-white">
                    {((item.executed / item.budget) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Row - 3 Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Budget */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Presupuesto Total</h3>
                <Euro className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">{formatCurrency(project.totalBudget)}</div>
              <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-3">Ejecutado: {formatCurrency(project.executed)}</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${executionPercentage}%` }}
                />
              </div>
            </div>

            {/* Performance Index */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Índice de Rendimiento</h3>
                <TrendingDown className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">{project.performanceIndex.toFixed(3)}</div>
              <div className="flex items-center gap-1 text-xs lg:text-sm text-red-500 dark:text-red-400">
                <TrendingDown className="w-4 h-4" />
                -2.3% presupuesto
              </div>
            </div>

            {/* Schedule Compliance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Cumplimiento Cronograma</h3>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">{project.scheduleCompliance.toFixed(3)}</div>
              <div className="flex items-center gap-1 text-xs lg:text-sm text-red-500 dark:text-red-400">
                <TrendingDown className="w-4 h-4" />
                -5.1% cronograma
              </div>
            </div>
          </div>

          {/* Critical Tasks Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tareas Críticas</h3>
                <div className="text-2xl lg:text-3xl font-bold text-red-500 dark:text-red-400">{project.criticalTasks}</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-2">Pendientes de atención</div>
          </div>

          {/* Execution by Area */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Ejecución por Área
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {project.areas.map((area, index) => (
                <div key={index} className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="mb-3 flex justify-center">
                    {getStatusIcon(area.status)}
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">{area.progress}%</div>
                  <div className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{area.name}</div>
                  {getStatusBadge(area.status)}
                  <div className="mt-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        area.status === 'on-time' ? 'bg-green-500' :
                        area.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${area.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Tasks List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Tareas Críticas Pendientes</h2>
            </div>
            
            <div className="space-y-3">
              {project.tasks.map((task) => (
                <div key={task.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm lg:text-base">{task.title}</h3>
                      <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Responsable: {task.responsible}</p>
                    </div>
                    <div className="text-left lg:text-right">
                      <div className="bg-red-500 text-white px-3 py-1 rounded text-xs lg:text-sm font-medium mb-1 inline-block">
                        {task.daysRemaining} días restantes
                      </div>
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">Impacto: Alto</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
