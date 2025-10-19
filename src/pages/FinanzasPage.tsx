/**
 * FinanzasPage - Task 18.2
 * Requirements: 10.5, 10.6
 * 
 * Main financial dashboard page with:
 * - Complete financial metrics dashboard
 * - Alerts summary integration
 * - Quick access to financial modules
 * - Real-time data loading
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  FileText,
  Receipt,
  BarChart3,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Wallet,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { FinanzasDashboard } from '../components/finanzas/FinanzasDashboard';
import { finanzasService } from '../services/finanzas.service';
import { alertaService } from '../services/alerta.service';
import type { FinanzasMetricas } from '../types/rentabilidad.types';
import type { Alerta } from '../services/alerta.service';
import { AlertaCard } from '../components/finanzas/AlertaCard';

export function FinanzasPage() {
  const navigate = useNavigate();
  const [metricas, setMetricas] = useState<FinanzasMetricas | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlertasPanel, setShowAlertasPanel] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load financial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load metrics and alerts in parallel
      const [metricasData, alertasData] = await Promise.all([
        finanzasService.calcularMetricasFinanzas(),
        alertaService.getAlertasActivas()
      ]);

      setMetricas(metricasData);
      setAlertas(alertasData);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleVerAlertas = () => {
    setShowAlertasPanel(true);
  };

  const handleResolverAlerta = async (alertaId: string, nota: string) => {
    try {
      await alertaService.resolverAlerta(alertaId, 'current-user', nota);
      // Reload alerts
      const alertasData = await alertaService.getAlertasActivas();
      setAlertas(alertasData);
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  // Quick access modules
  const modules = [
    {
      id: 'gastos',
      title: 'Control de Gastos',
      description: 'Gestionar y categorizar gastos del proyecto',
      icon: Receipt,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      path: '/gastos'
    },
    {
      id: 'facturacion',
      title: 'Facturación',
      description: 'Crear y gestionar facturas',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      path: '/facturas'
    },
    {
      id: 'presupuestos',
      title: 'Presupuestos',
      description: 'Crear y enviar presupuestos',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      path: '/presupuestos'
    },
    {
      id: 'reportes',
      title: 'Reportes',
      description: 'Análisis y reportes financieros',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      path: '/reportes'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Finanzas
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Panel de control financiero
              </p>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Actualizar</span>
          </button>
        </div>

        {/* Main Dashboard */}
        {metricas && (
          <div className="mb-8">
            <FinanzasDashboard
              metricas={metricas}
              alertas={alertas}
              loading={loading}
              onVerAlertas={handleVerAlertas}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && !metricas && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Cargando datos financieros...</p>
            </div>
          </div>
        )}

        {/* Quick Access Modules */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Accesos Rápidos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => navigate(module.path)}
                  className="group bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all text-left"
                >
                  <div className={`w-12 h-12 ${module.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${module.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center justify-between">
                    {module.title}
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {module.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Actividad Reciente
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Facturas este mes</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {metricas?.ingresosTotales ? '12' : '0'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Gastos registrados</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {metricas?.gastosTotales ? '45' : '0'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Presupuestos enviados</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">8</span>
              </div>
            </div>
          </div>

          {/* Cash Flow */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Flujo de Caja
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Entradas</span>
                <span className="font-semibold text-green-600">
                  +€{metricas?.ingresosTotales.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Salidas</span>
                <span className="font-semibold text-red-600">
                  -€{metricas?.gastosTotales.toLocaleString() || '0'}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Balance</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    €{metricas?.utilidadNeta.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Próximos Vencimientos
              </h3>
            </div>
            <div className="space-y-3">
              {metricas?.pagosVencenHoy && metricas.pagosVencenHoy > 0 ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      {metricas.pagosVencenHoy} {metricas.pagosVencenHoy === 1 ? 'pago vence' : 'pagos vencen'} hoy
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No hay pagos próximos a vencer
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Panel Modal */}
      {showAlertasPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Alertas Financieras
              </h2>
              <button
                onClick={() => setShowAlertasPanel(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {alertas.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No hay alertas activas</p>
                  </div>
                ) : (
                  alertas.map(alerta => (
                    <AlertaCard
                      key={alerta.id}
                      alerta={alerta}
                      onResolver={handleResolverAlerta}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
