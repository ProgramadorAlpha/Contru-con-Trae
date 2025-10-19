/**
 * AlertasPanel Component
 * Requirements: 8.5, 8.6, 8.7
 * Task: 17.1
 * 
 * Displays financial alerts grouped by priority:
 * - Colors: crítica (red), alta (orange), media (yellow), baja (blue)
 * - Allow marking as resolved with note
 * - Quick actions: generate invoice, send reminder
 */

import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  FileText,
  Send,
  TrendingDown,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { AlertaFinanciera, PrioridadAlerta } from '../../types/alerta.types';

interface AlertasPanelProps {
  alertas: AlertaFinanciera[];
  onResolver?: (alertaId: string, nota: string) => void;
  onGenerarFactura?: (proyectoId: string) => void;
  onEnviarRecordatorio?: (facturaId: string) => void;
}

export function AlertasPanel({
  alertas,
  onResolver,
  onGenerarFactura,
  onEnviarRecordatorio
}: AlertasPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<PrioridadAlerta>>(
    new Set(['critica', 'alta'])
  );
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [notaResolucion, setNotaResolucion] = useState('');

  // Group alerts by priority
  const alertasPorPrioridad = {
    critica: alertas.filter(a => a.prioridad === 'critica' && a.estado === 'activa'),
    alta: alertas.filter(a => a.prioridad === 'alta' && a.estado === 'activa'),
    media: alertas.filter(a => a.prioridad === 'media' && a.estado === 'activa'),
    baja: alertas.filter(a => a.prioridad === 'baja' && a.estado === 'activa')
  };

  const toggleGroup = (prioridad: PrioridadAlerta) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(prioridad)) {
      newExpanded.delete(prioridad);
    } else {
      newExpanded.add(prioridad);
    }
    setExpandedGroups(newExpanded);
  };

  const handleResolver = async (alertaId: string) => {
    if (!onResolver) return;
    
    if (!notaResolucion.trim()) {
      alert('Por favor, agregue una nota explicando la resolución');
      return;
    }

    await onResolver(alertaId, notaResolucion);
    setResolvingId(null);
    setNotaResolucion('');
  };

  const getPrioridadConfig = (prioridad: PrioridadAlerta) => {
    const configs = {
      critica: {
        color: 'red',
        bgClass: 'bg-red-50 dark:bg-red-900/20',
        borderClass: 'border-red-500',
        textClass: 'text-red-700 dark:text-red-300',
        iconClass: 'text-red-600',
        label: 'Críticas'
      },
      alta: {
        color: 'orange',
        bgClass: 'bg-orange-50 dark:bg-orange-900/20',
        borderClass: 'border-orange-500',
        textClass: 'text-orange-700 dark:text-orange-300',
        iconClass: 'text-orange-600',
        label: 'Altas'
      },
      media: {
        color: 'yellow',
        bgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderClass: 'border-yellow-500',
        textClass: 'text-yellow-700 dark:text-yellow-300',
        iconClass: 'text-yellow-600',
        label: 'Medias'
      },
      baja: {
        color: 'blue',
        bgClass: 'bg-blue-50 dark:bg-blue-900/20',
        borderClass: 'border-blue-500',
        textClass: 'text-blue-700 dark:text-blue-300',
        iconClass: 'text-blue-600',
        label: 'Bajas'
      }
    };
    return configs[prioridad];
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'bajo_capital':
        return TrendingDown;
      case 'cobro_pendiente':
        return DollarSign;
      case 'sobrecosto':
        return AlertCircle;
      case 'pago_vencido':
        return Calendar;
      default:
        return AlertCircle;
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const totalAlertas = alertas.filter(a => a.estado === 'activa').length;

  if (totalAlertas === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          ¡Todo en Orden!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No hay alertas financieras activas en este momento
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Alertas Financieras</h2>
          <div className="flex items-center gap-4">
            {alertasPorPrioridad.critica.length > 0 && (
              <span className="text-sm">
                <span className="font-bold text-red-600">{alertasPorPrioridad.critica.length}</span>
                <span className="text-gray-600 dark:text-gray-400"> críticas</span>
              </span>
            )}
            {alertasPorPrioridad.alta.length > 0 && (
              <span className="text-sm">
                <span className="font-bold text-orange-600">{alertasPorPrioridad.alta.length}</span>
                <span className="text-gray-600 dark:text-gray-400"> altas</span>
              </span>
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {totalAlertas}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts by Priority */}
      {(['critica', 'alta', 'media', 'baja'] as PrioridadAlerta[]).map(prioridad => {
        const alertasPrioridad = alertasPorPrioridad[prioridad];
        if (alertasPrioridad.length === 0) return null;

        const config = getPrioridadConfig(prioridad);
        const isExpanded = expandedGroups.has(prioridad);

        return (
          <div
            key={prioridad}
            className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${config.borderClass} overflow-hidden`}
          >
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(prioridad)}
              className={`w-full ${config.bgClass} p-4 flex items-center justify-between hover:opacity-80 transition-opacity`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className={`w-5 h-5 ${config.iconClass}`} />
                <h3 className={`font-semibold ${config.textClass}`}>
                  Alertas {config.label}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${config.textClass} ${config.bgClass}`}>
                  {alertasPrioridad.length}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className={`w-5 h-5 ${config.iconClass}`} />
              ) : (
                <ChevronDown className={`w-5 h-5 ${config.iconClass}`} />
              )}
            </button>

            {/* Alerts List */}
            {isExpanded && (
              <div className="p-4 space-y-3">
                {alertasPrioridad.map(alerta => {
                  const TipoIcon = getTipoIcon(alerta.tipo);
                  const isResolving = resolvingId === alerta.id;

                  return (
                    <div
                      key={alerta.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      {/* Alert Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <TipoIcon className={`w-5 h-5 ${config.iconClass} flex-shrink-0 mt-0.5`} />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {alerta.titulo}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {alerta.mensaje}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Proyecto: {alerta.proyectoNombre}
                            {alerta.faseNumero && ` • Fase ${alerta.faseNumero}`}
                          </p>
                        </div>
                      </div>

                      {/* Alert Data */}
                      {alerta.datos && Object.keys(alerta.datos).length > 0 && (
                        <div className={`${config.bgClass} rounded p-3 mb-3 text-sm`}>
                          {alerta.datos.tesoreriaActual !== undefined && (
                            <div className="flex justify-between mb-1">
                              <span className={config.textClass}>Tesorería actual:</span>
                              <span className={`font-semibold ${config.textClass}`}>
                                {formatCurrency(alerta.datos.tesoreriaActual)}
                              </span>
                            </div>
                          )}
                          {alerta.datos.tesoreriaNecesaria !== undefined && (
                            <div className="flex justify-between mb-1">
                              <span className={config.textClass}>Tesorería necesaria:</span>
                              <span className={`font-semibold ${config.textClass}`}>
                                {formatCurrency(alerta.datos.tesoreriaNecesaria)}
                              </span>
                            </div>
                          )}
                          {alerta.datos.variacionPorcentaje !== undefined && (
                            <div className="flex justify-between mb-1">
                              <span className={config.textClass}>Variación:</span>
                              <span className={`font-semibold ${config.textClass}`}>
                                {alerta.datos.variacionPorcentaje.toFixed(1)}%
                              </span>
                            </div>
                          )}
                          {alerta.datos.fechaVencimiento && (
                            <div className="flex justify-between">
                              <span className={config.textClass}>Vencimiento:</span>
                              <span className={`font-semibold ${config.textClass}`}>
                                {formatDate(alerta.datos.fechaVencimiento)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Recommended Action */}
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 mb-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Acción Recomendada:
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {alerta.accionRecomendada}
                        </p>
                      </div>

                      {/* Resolution Form */}
                      {isResolving ? (
                        <div className="space-y-3">
                          <textarea
                            value={notaResolucion}
                            onChange={(e) => setNotaResolucion(e.target.value)}
                            placeholder="Explique cómo se resolvió la alerta..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleResolver(alerta.id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Confirmar Resolución
                            </button>
                            <button
                              onClick={() => {
                                setResolvingId(null);
                                setNotaResolucion('');
                              }}
                              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Actions */
                        <div className="flex items-center gap-2">
                          {onResolver && (
                            <button
                              onClick={() => setResolvingId(alerta.id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 rounded transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Marcar como Resuelta
                            </button>
                          )}

                          {alerta.tipo === 'cobro_pendiente' && onGenerarFactura && (
                            <button
                              onClick={() => onGenerarFactura(alerta.proyectoId)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              Generar Factura
                            </button>
                          )}

                          {alerta.facturaId && onEnviarRecordatorio && (
                            <button
                              onClick={() => onEnviarRecordatorio(alerta.facturaId!)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800 rounded transition-colors"
                            >
                              <Send className="w-4 h-4" />
                              Enviar Recordatorio
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
