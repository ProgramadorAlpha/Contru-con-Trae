/**
 * ReportesFinancierosPage - Reportes y Análisis Financieros
 * 
 * Página principal para reportes financieros
 * Features:
 * - Reportes de rentabilidad por proyecto
 * - Análisis de flujo de caja
 * - Comparativas de períodos
 * - Exportación de reportes
 * - Gráficos y visualizaciones
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  ArrowLeft,
  Filter,
  PieChart,
  LineChart
} from 'lucide-react';
import { RentabilidadAnalysis } from '../../components/finanzas/RentabilidadAnalysis';

type ReportType = 'rentabilidad' | 'flujo-caja' | 'comparativa' | 'gastos';
type PeriodType = 'mes' | 'trimestre' | 'año' | 'personalizado';

export function ReportesFinancierosPage() {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<ReportType>('rentabilidad');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('mes');
  const [loading, setLoading] = useState(false);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [selectedProyecto, setSelectedProyecto] = useState<string>('');

  // Resumen financiero
  const [resumen, setResumen] = useState({
    ingresosTotales: 0,
    gastosTotales: 0,
    utilidadNeta: 0,
    margenBruto: 0,
    variacionMensual: 0
  });

  useEffect(() => {
    loadProyectos();
  }, []);

  useEffect(() => {
    if (selectedProyecto) {
      loadReportData();
    }
  }, [selectedProyecto, selectedReport, selectedPeriod]);

  const loadProyectos = async () => {
    try {
      // TODO: Cargar proyectos desde Firestore
      setProyectos([]);
    } catch (error) {
      console.error('Error loading proyectos:', error);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);
      // TODO: Cargar datos del reporte según tipo
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // TODO: Implementar exportación según tipo de reporte
    console.log('Exportar reporte:', selectedReport);
    alert('Exportando reporte...');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const reportTypes = [
    {
      id: 'rentabilidad' as ReportType,
      title: 'Rentabilidad',
      description: 'Análisis de rentabilidad por proyecto',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 'flujo-caja' as ReportType,
      title: 'Flujo de Caja',
      description: 'Proyección de ingresos y gastos',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'comparativa' as ReportType,
      title: 'Comparativa',
      description: 'Comparación entre períodos',
      icon: LineChart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      id: 'gastos' as ReportType,
      title: 'Análisis de Gastos',
      description: 'Desglose detallado de gastos',
      icon: PieChart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/finanzas')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Reportes Financieros
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Análisis y reportes detallados
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Exportar Reporte
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(resumen.ingresosTotales)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gastos Totales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(resumen.gastosTotales)}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Utilidad Neta</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(resumen.utilidadNeta)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Margen Bruto</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {resumen.margenBruto.toFixed(1)}%
                </p>
                <p className={`text-xs mt-1 ${resumen.variacionMensual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(resumen.variacionMensual)} vs mes anterior
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tipo de Reporte
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              const isSelected = selectedReport === report.id;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className={`w-12 h-12 ${report.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${report.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {report.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proyecto
              </label>
              <select
                value={selectedProyecto}
                onChange={(e) => setSelectedProyecto(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos los proyectos</option>
                {proyectos.map((proyecto) => (
                  <option key={proyecto.id} value={proyecto.id}>
                    {proyecto.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Período
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="mes">Este mes</option>
                <option value="trimestre">Este trimestre</option>
                <option value="año">Este año</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Filter className="w-5 h-5" />
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 animate-pulse mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Cargando reporte...</p>
              </div>
            </div>
          ) : selectedReport === 'rentabilidad' && selectedProyecto ? (
            <RentabilidadAnalysis proyectoId={selectedProyecto} presupuestoId="" />
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {selectedProyecto
                  ? 'Selecciona un tipo de reporte y aplica los filtros'
                  : 'Selecciona un proyecto para ver el reporte'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
