/**
 * PresupuestosDashboard Component
 * Requirements: 4.1, 4.2, 4.3, 4.4
 * Task: 7.1
 * 
 * Displays consolidated metrics for all presupuestos:
 * - Total presupuestos count
 * - Approved count and percentage
 * - Pending count and percentage
 * - Rejected count and percentage
 * - Total invoiced amount from approved presupuestos
 * - Total collected amount from converted presupuestos
 * - Collection percentage (collected / invoiced * 100)
 */

import React from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp,
  DollarSign,
  Percent
} from 'lucide-react';
import type { PresupuestosMetricas } from '../../types/presupuesto.types';

interface PresupuestosDashboardProps extends PresupuestosMetricas {}

export function PresupuestosDashboard({
  total,
  aprobados,
  aprobadosPorcentaje,
  pendientes,
  pendientesPorcentaje,
  rechazados,
  rechazadosPorcentaje,
  montoFacturado,
  montoCobrado,
  porcentajeCobro
}: PresupuestosDashboardProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Presupuestos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Presupuestos
            </h3>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {total}
        </p>
      </div>

      {/* Aprobados */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Aprobados
            </h3>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-green-600">
            {aprobados}
          </p>
          <span className="text-sm text-gray-500">
            ({formatPercentage(aprobadosPorcentaje)})
          </span>
        </div>
        {total > 0 && (
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(aprobadosPorcentaje, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Pendientes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pendientes
            </h3>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-blue-600">
            {pendientes}
          </p>
          <span className="text-sm text-gray-500">
            ({formatPercentage(pendientesPorcentaje)})
          </span>
        </div>
        {total > 0 && (
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(pendientesPorcentaje, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Rechazados */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Rechazados
            </h3>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-red-600">
            {rechazados}
          </p>
          <span className="text-sm text-gray-500">
            ({formatPercentage(rechazadosPorcentaje)})
          </span>
        </div>
        {total > 0 && (
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(rechazadosPorcentaje, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Monto Facturado */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Monto Facturado
            </h3>
          </div>
        </div>
        <p className="text-2xl font-bold text-purple-600">
          {formatCurrency(montoFacturado)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          De presupuestos aprobados
        </p>
      </div>

      {/* Monto Cobrado */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Monto Cobrado
            </h3>
          </div>
        </div>
        <p className="text-2xl font-bold text-green-600">
          {formatCurrency(montoCobrado)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          De proyectos convertidos
        </p>
      </div>

      {/* Porcentaje de Cobro */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Porcentaje de Cobro
            </h3>
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-bold text-orange-600">
            {formatPercentage(porcentajeCobro)}
          </p>
          <div className="text-sm text-gray-500">
            <span className="font-medium">{formatCurrency(montoCobrado)}</span>
            {' / '}
            <span>{formatCurrency(montoFacturado)}</span>
          </div>
        </div>
        {montoFacturado > 0 && (
          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                porcentajeCobro >= 80 ? 'bg-green-500' :
                porcentajeCobro >= 50 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(porcentajeCobro, 100)}%` }}
            />
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          {porcentajeCobro >= 80 ? 'Excelente tasa de cobro' :
           porcentajeCobro >= 50 ? 'Tasa de cobro moderada' :
           'Mejorar gestión de cobros'}
        </p>
      </div>
    </div>
  );
}
