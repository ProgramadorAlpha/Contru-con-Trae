/**
 * FinanzasDashboard Component
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.6
 * Task: 18.1, 17.3
 * 
 * Updated to include alerts summary integration
 */

import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Wallet,
  Calendar,
  AlertTriangle,
  Info,
  ArrowRight
} from 'lucide-react';
import type { FinanzasMetricas } from '../../types/rentabilidad.types';
import type { Alerta } from '../../services/alerta.service';

interface FinanzasDashboardProps {
  metricas: FinanzasMetricas;
  alertas?: Alerta[];
  loading?: boolean;
  onVerAlertas?: () => void;
}

export function FinanzasDashboard({ 
  metricas, 
  alertas = [], 
  loading = false,
  onVerAlertas 
}: FinanzasDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getMargenColor = (margen: number) => {
    if (margen >= 20) return 'text-green-600';
    if (margen >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMargenBgColor = (margen: number) => {
    if (margen >= 20) return 'bg-green-100 dark:bg-green-900';
    if (margen >= 10) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  // Calculate alert statistics
  const alertasActivas = alertas.filter(a => !a.resuelta);
  const alertasCriticas = alertasActivas.filter(a => a.prioridad === 'critica').length;
  const alertasAltas = alertasActivas.filter(a => a.prioridad === 'alta').length;
  const alertasMedias = alertasActivas.filter(a => a.prioridad === 'media').length;
  const totalAlertas = alertasActivas.length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ingresos Totales */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos Totales</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(metricas.ingresosTotales)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Facturas cobradas
          </p>
        </div>

        {/* Gastos Totales */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Gastos Totales</p>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(metricas.gastosTotales)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Gastos pagados
          </p>
        </div>

        {/* Utilidad Neta */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Utilidad Neta</p>
            <TrendingUp className={`w-5 h-5 ${metricas.utilidadNeta >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <p className={`text-2xl font-bold ${metricas.utilidadNeta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(metricas.utilidadNeta)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {metricas.variacionPorcentaje >= 0 ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            )}
            <p className={`text-xs ${metricas.variacionPorcentaje >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(metricas.variacionPorcentaje).toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Tesorería Total */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Tesorería Total</p>
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(metricas.tesoreriaTotal)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Disponible
          </p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pagos Pendientes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pagos Pendientes</p>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(metricas.pagosPendientes)}
          </p>
          {metricas.pagosVencenHoy > 0 && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <Calendar className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {metricas.pagosVencenHoy} {metricas.pagosVencenHoy === 1 ? 'pago vence' : 'pagos vencen'} hoy
              </p>
            </div>
          )}
        </div>

        {/* Margen Bruto Promedio */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Margen Bruto Promedio</p>
            <TrendingUp className={`w-5 h-5 ${getMargenColor(metricas.margenBrutoPromedio)}`} />
          </div>
          <p className={`text-3xl font-bold ${getMargenColor(metricas.margenBrutoPromedio)}`}>
            {metricas.margenBrutoPromedio.toFixed(2)}%
          </p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500 dark:text-gray-400">Salud</span>
              <span className={getMargenColor(metricas.margenBrutoPromedio)}>
                {metricas.margenBrutoPromedio >= 20 ? 'Excelente' : 
                 metricas.margenBrutoPromedio >= 10 ? 'Bueno' : 'Bajo'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getMargenBgColor(metricas.margenBrutoPromedio)}`}
                style={{ width: `${Math.min(metricas.margenBrutoPromedio * 2, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Ratio Ingresos/Gastos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Ratio Ingresos/Gastos</p>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {metricas.gastosTotales > 0 
              ? (metricas.ingresosTotales / metricas.gastosTotales).toFixed(2)
              : '∞'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {metricas.gastosTotales > 0 && metricas.ingresosTotales / metricas.gastosTotales >= 1.2
              ? 'Ratio saludable'
              : 'Mejorar eficiencia'}
          </p>
        </div>
      </div>

      {/* Alerts Summary - Task 17.3 */}
      {totalAlertas > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Alertas Financieras
                </h3>
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs font-medium rounded-full">
                  {totalAlertas} {totalAlertas === 1 ? 'activa' : 'activas'}
                </span>
              </div>
              {onVerAlertas && (
                <button
                  onClick={onVerAlertas}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  Ver todas
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Alert Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Critical Alerts */}
              {alertasCriticas > 0 && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex-shrink-0">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{alertasCriticas}</p>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {alertasCriticas === 1 ? 'Alerta Crítica' : 'Alertas Críticas'}
                    </p>
                  </div>
                </div>
              )}

              {/* High Priority Alerts */}
              {alertasAltas > 0 && (
                <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{alertasAltas}</p>
                    <p className="text-sm text-orange-700 dark:text-orange-400">
                      Prioridad Alta
                    </p>
                  </div>
                </div>
              )}

              {/* Medium Priority Alerts */}
              {alertasMedias > 0 && (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex-shrink-0">
                    <Info className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{alertasMedias}</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Prioridad Media
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Critical Alerts Preview */}
            {alertasCriticas > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Alertas Críticas Recientes
                </h4>
                {alertasActivas
                  .filter(a => a.prioridad === 'critica')
                  .slice(0, 3)
                  .map(alerta => (
                    <div
                      key={alerta.id}
                      className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-900 dark:text-red-100">
                          {alerta.titulo}
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1 line-clamp-2">
                          {alerta.mensaje}
                        </p>
                        {alerta.accionRecomendada && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2 italic">
                            → {alerta.accionRecomendada}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                {alertasCriticas > 3 && (
                  <button
                    onClick={onVerAlertas}
                    className="w-full py-2 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Ver {alertasCriticas - 3} alertas críticas más
                  </button>
                )}
              </div>
            )}

            {/* No Critical Alerts - Show High Priority */}
            {alertasCriticas === 0 && alertasAltas > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Alertas de Alta Prioridad
                </h4>
                {alertasActivas
                  .filter(a => a.prioridad === 'alta')
                  .slice(0, 2)
                  .map(alerta => (
                    <div
                      key={alerta.id}
                      className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800"
                    >
                      <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                          {alerta.titulo}
                        </p>
                        <p className="text-xs text-orange-700 dark:text-orange-300 mt-1 line-clamp-2">
                          {alerta.mensaje}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Alerts - Success State */}
      {totalAlertas === 0 && alertas.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                Sin Alertas Activas
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Todas las alertas financieras han sido resueltas. El estado financiero es saludable.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
