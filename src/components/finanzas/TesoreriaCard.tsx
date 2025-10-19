/**
 * TesoreriaCard Component
 * Requirements: 6.4, 6.5
 * Task: 12.2
 * 
 * Displays project tesorería (treasury) information:
 * - Current tesorería amount
 * - Health indicator (green/yellow/red)
 * - Comparison with next phase cost
 * - Breakdown of cobros and gastos
 */

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-react';
import { tesoreriaService } from '../../services/tesoreria.service';

interface TesoreriaCardProps {
  proyectoId: string;
  costoProximaFase?: number;
  nombreProximaFase?: string;
  showDesglose?: boolean;
}

interface TesoreriaData {
  proyectoId: string;
  cobros: number;
  gastosPagados: number;
  tesoreria: number;
  ultimaActualizacion: Date;
}

interface Desglose {
  cobros: Array<{ concepto: string; monto: number; fecha: Date }>;
  gastos: Array<{ concepto: string; monto: number; fecha: Date }>;
}

export function TesoreriaCard({
  proyectoId,
  costoProximaFase = 0,
  nombreProximaFase = 'Próxima Fase',
  showDesglose = true
}: TesoreriaCardProps) {
  const [tesoreria, setTesoreria] = useState<TesoreriaData | null>(null);
  const [indicador, setIndicador] = useState<'verde' | 'amarillo' | 'rojo'>('verde');
  const [desglose, setDesglose] = useState<Desglose | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadTesoreria();
  }, [proyectoId]);

  const loadTesoreria = async () => {
    try {
      setLoading(true);
      
      // Get tesorería data
      const data = await tesoreriaService.getTesoreriaProyecto(proyectoId);
      setTesoreria(data);

      // Get health indicator
      if (costoProximaFase > 0) {
        const salud = await tesoreriaService.getIndicadorSalud(proyectoId, costoProximaFase);
        setIndicador(salud);
      }

      // Get desglose if needed
      if (showDesglose) {
        const desgloseData = await tesoreriaService.getDesglose(proyectoId);
        setDesglose(desgloseData);
      }
    } catch (error) {
      console.error('Error loading tesorería:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getIndicadorColor = () => {
    switch (indicador) {
      case 'verde':
        return {
          bg: 'bg-green-100 dark:bg-green-900/20',
          border: 'border-green-500',
          text: 'text-green-700 dark:text-green-300',
          icon: 'text-green-600'
        };
      case 'amarillo':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          border: 'border-yellow-500',
          text: 'text-yellow-700 dark:text-yellow-300',
          icon: 'text-yellow-600'
        };
      case 'rojo':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          border: 'border-red-500',
          text: 'text-red-700 dark:text-red-300',
          icon: 'text-red-600'
        };
    }
  };

  const getIndicadorMensaje = () => {
    if (!costoProximaFase || costoProximaFase === 0) {
      return 'Sin próxima fase definida';
    }

    const porcentaje = tesoreria ? (tesoreria.tesoreria / costoProximaFase) * 100 : 0;

    switch (indicador) {
      case 'verde':
        return `Capital suficiente (${porcentaje.toFixed(0)}% del costo de ${nombreProximaFase})`;
      case 'amarillo':
        return `Capital limitado (${porcentaje.toFixed(0)}% del costo de ${nombreProximaFase})`;
      case 'rojo':
        return `Capital insuficiente (${porcentaje.toFixed(0)}% del costo de ${nombreProximaFase})`;
    }
  };

  const colors = getIndicadorColor();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!tesoreria) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>No hay datos de tesorería disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${colors.border} overflow-hidden`}>
      {/* Header */}
      <div className={`${colors.bg} p-4 border-b ${colors.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className={`w-5 h-5 ${colors.icon}`} />
            <h3 className="font-semibold">Tesorería del Proyecto</h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${colors.text} ${colors.bg}`}>
            {indicador === 'verde' && '● Saludable'}
            {indicador === 'amarillo' && '● Precaución'}
            {indicador === 'rojo' && '● Crítico'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Tesorería Amount */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Capital Disponible
          </p>
          <div className="flex items-baseline gap-2">
            <p className={`text-4xl font-bold ${colors.text}`}>
              {formatCurrency(tesoreria.tesoreria)}
            </p>
            {tesoreria.tesoreria >= 0 ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
          </div>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <p className="text-xs text-green-700 dark:text-green-300 mb-1">
              Total Cobros
            </p>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              {formatCurrency(tesoreria.cobros)}
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <p className="text-xs text-red-700 dark:text-red-300 mb-1">
              Total Gastos
            </p>
            <p className="text-lg font-bold text-red-700 dark:text-red-300">
              {formatCurrency(tesoreria.gastosPagados)}
            </p>
          </div>
        </div>

        {/* Next Phase Comparison */}
        {costoProximaFase > 0 && (
          <div className={`${colors.bg} rounded-lg p-4 mb-4`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${colors.text} mb-1`}>
                  {getIndicadorMensaje()}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className={colors.text}>Costo {nombreProximaFase}:</span>
                  <span className={`font-semibold ${colors.text}`}>
                    {formatCurrency(costoProximaFase)}
                  </span>
                </div>
                {tesoreria.tesoreria < costoProximaFase && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className={colors.text}>Faltante:</span>
                    <span className={`font-semibold ${colors.text}`}>
                      {formatCurrency(costoProximaFase - tesoreria.tesoreria)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Desglose Section */}
        {showDesglose && desglose && (desglose.cobros.length > 0 || desglose.gastos.length > 0) && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <span>Ver Desglose Detallado</span>
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expanded && (
              <div className="mt-4 space-y-4">
                {/* Cobros */}
                {desglose.cobros.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                      Cobros ({desglose.cobros.length})
                    </h4>
                    <div className="space-y-2">
                      {desglose.cobros.map((cobro, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm bg-green-50 dark:bg-green-900/10 rounded p-2"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {cobro.concepto}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(cobro.fecha)}
                            </p>
                          </div>
                          <span className="font-semibold text-green-700 dark:text-green-300">
                            +{formatCurrency(cobro.monto)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gastos */}
                {desglose.gastos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                      Gastos ({desglose.gastos.length})
                    </h4>
                    <div className="space-y-2">
                      {desglose.gastos.map((gasto, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm bg-red-50 dark:bg-red-900/10 rounded p-2"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {gasto.concepto}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(gasto.fecha)}
                            </p>
                          </div>
                          <span className="font-semibold text-red-700 dark:text-red-300">
                            -{formatCurrency(gasto.monto)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Last Update */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Última actualización: {formatDate(tesoreria.ultimaActualizacion)}
          </p>
        </div>
      </div>
    </div>
  );
}
