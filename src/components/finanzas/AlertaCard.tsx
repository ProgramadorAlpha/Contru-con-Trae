/**
 * AlertaCard Component - Task 17.2
 * Requirements: 8.5, 8.7
 * 
 * Displays individual financial alert with:
 * - Title, message, and recommended action
 * - Specific data based on alert type
 * - Contextual action buttons
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  FileText,
  Send,
  DollarSign,
  TrendingDown,
  Calendar,
  Lock
} from 'lucide-react';
import type { Alerta, PrioridadAlerta, TipoAlerta } from '../../services/alerta.service';

interface AlertaCardProps {
  alerta: Alerta;
  onResolver?: (alertaId: string, nota: string) => void;
  onGenerarFactura?: (proyectoId: string, faseNumero?: number) => void;
  onEnviarRecordatorio?: (facturaId: string) => void;
  onVerProyecto?: (proyectoId: string) => void;
}

export function AlertaCard({
  alerta,
  onResolver,
  onGenerarFactura,
  onEnviarRecordatorio,
  onVerProyecto
}: AlertaCardProps) {
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [notaResolucion, setNotaResolucion] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Get priority styles
  const getPriorityStyles = (prioridad: PrioridadAlerta) => {
    switch (prioridad) {
      case 'critica':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-800'
        };
      case 'alta':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          icon: 'text-orange-600',
          badge: 'bg-orange-100 text-orange-800'
        };
      case 'media':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      case 'baja':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800'
        };
    }
  };

  // Get icon based on priority
  const getPriorityIcon = (prioridad: PrioridadAlerta) => {
    switch (prioridad) {
      case 'critica':
        return AlertCircle;
      case 'alta':
        return AlertTriangle;
      case 'media':
      case 'baja':
        return Info;
    }
  };

  // Get type icon
  const getTypeIcon = (tipo: TipoAlerta) => {
    switch (tipo) {
      case 'tesoreria_baja':
        return DollarSign;
      case 'cobro_pendiente':
        return Calendar;
      case 'sobrecosto':
        return TrendingDown;
      case 'pago_vencido':
      case 'factura_vencida':
        return Calendar;
      case 'fase_bloqueada':
        return Lock;
      default:
        return AlertCircle;
    }
  };

  const styles = getPriorityStyles(alerta.prioridad);
  const PriorityIcon = getPriorityIcon(alerta.prioridad);
  const TypeIcon = getTypeIcon(alerta.tipo);

  const handleResolve = async () => {
    if (!onResolver) return;
    
    setIsResolving(true);
    try {
      await onResolver(alerta.id, notaResolucion);
      setShowResolveForm(false);
      setNotaResolucion('');
    } catch (error) {
      console.error('Error resolving alert:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleQuickAction = () => {
    switch (alerta.tipo) {
      case 'cobro_pendiente':
        if (alerta.datos?.facturaId && onEnviarRecordatorio) {
          onEnviarRecordatorio(alerta.datos.facturaId);
        } else if (onGenerarFactura) {
          onGenerarFactura(alerta.proyectoId, alerta.datos?.faseNumero);
        }
        break;
      case 'factura_vencida':
      case 'pago_vencido':
        if (alerta.datos?.facturaId && onEnviarRecordatorio) {
          onEnviarRecordatorio(alerta.datos.facturaId);
        }
        break;
      case 'tesoreria_baja':
      case 'sobrecosto':
        if (onVerProyecto) {
          onVerProyecto(alerta.proyectoId);
        }
        break;
    }
  };

  const getQuickActionLabel = () => {
    switch (alerta.tipo) {
      case 'cobro_pendiente':
        return alerta.datos?.facturaId ? 'Enviar Recordatorio' : 'Generar Factura';
      case 'factura_vencida':
      case 'pago_vencido':
        return 'Enviar Recordatorio';
      case 'tesoreria_baja':
      case 'sobrecosto':
        return 'Ver Proyecto';
      default:
        return 'Ver Detalles';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-lg p-4 transition-all hover:shadow-md`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Priority Icon */}
          <div className={`${styles.icon} mt-0.5`}>
            <PriorityIcon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Badge */}
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-semibold ${styles.text}`}>
                {alerta.titulo}
              </h4>
              <span className={`${styles.badge} text-xs px-2 py-0.5 rounded-full font-medium uppercase`}>
                {alerta.prioridad}
              </span>
            </div>

            {/* Message */}
            <p className={`text-sm ${styles.text} mb-2`}>
              {alerta.mensaje}
            </p>

            {/* Recommended Action */}
            {alerta.accionRecomendada && (
              <div className="flex items-start gap-2 mb-3">
                <TypeIcon className={`w-4 h-4 ${styles.icon} mt-0.5 flex-shrink-0`} />
                <p className={`text-sm ${styles.text} italic`}>
                  <span className="font-medium">Acción recomendada:</span> {alerta.accionRecomendada}
                </p>
              </div>
            )}

            {/* Specific Data */}
            {alerta.datos && (
              <div className="bg-white bg-opacity-50 rounded p-3 mb-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {/* Treasury Data */}
                  {alerta.tipo === 'tesoreria_baja' && (
                    <>
                      <div>
                        <span className="text-gray-600">Tesorería actual:</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          {formatCurrency(alerta.datos.tesoreria)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Requerido (120%):</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          {formatCurrency(alerta.datos.umbralCritico)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Déficit:</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          {formatCurrency(alerta.datos.deficit)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Disponible:</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          {alerta.datos.porcentajeDisponible}%
                        </span>
                      </div>
                    </>
                  )}

                  {/* Pending Collection Data */}
                  {alerta.tipo === 'cobro_pendiente' && (
                    <>
                      <div>
                        <span className="text-gray-600">Fase:</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          Fase {alerta.datos.faseNumero}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Factura:</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          {alerta.datos.facturaNumero || 'No generada'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Monto:</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          {formatCurrency(alerta.datos.monto)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Días pendiente:</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          {alerta.datos.diasPendientes} días
                        </span>
                      </div>
                    </>
                  )}

                  {/* Cost Overrun Data */}
                  {alerta.tipo === 'sobrecosto' && (
                    <>
                      <div>
                        <span className="text-gray-600">Presupuesto:</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          {formatCurrency(alerta.datos.presupuestoTotal)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Gastos reales:</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          {formatCurrency(alerta.datos.gastosReales)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Sobrecosto:</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          {formatCurrency(alerta.datos.sobrecosto)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Porcentaje:</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          +{alerta.datos.porcentajeSobrecosto}%
                        </span>
                      </div>
                    </>
                  )}

                  {/* Overdue Invoice Data */}
                  {(alerta.tipo === 'factura_vencida' || alerta.tipo === 'pago_vencido') && (
                    <>
                      <div>
                        <span className="text-gray-600">Factura:</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          {alerta.datos.facturaNumero}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Monto:</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          {formatCurrency(alerta.datos.monto)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Vencimiento:</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          {new Date(alerta.datos.fechaVencimiento).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Días vencidos:</span>
                        <span className={`ml-2 font-semibold ${styles.text}`}>
                          {alerta.datos.diasVencidos} días
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Creada: {formatDate(alerta.fechaCreacion)}</span>
              {alerta.resuelta && alerta.fechaResolucion && (
                <span className="text-green-600">
                  Resuelta: {formatDate(alerta.fechaResolucion)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Close button for resolved alerts */}
        {alerta.resuelta && (
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Ocultar alerta resuelta"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Actions */}
      {!alerta.resuelta && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
          {/* Quick Action Button */}
          <button
            onClick={handleQuickAction}
            className={`flex items-center gap-2 px-3 py-1.5 ${styles.badge} rounded-md text-sm font-medium hover:opacity-80 transition-opacity`}
          >
            {alerta.tipo === 'cobro_pendiente' || alerta.tipo === 'factura_vencida' ? (
              <Send className="w-4 h-4" />
            ) : alerta.tipo === 'tesoreria_baja' || alerta.tipo === 'sobrecosto' ? (
              <FileText className="w-4 h-4" />
            ) : (
              <Info className="w-4 h-4" />
            )}
            {getQuickActionLabel()}
          </button>

          {/* Resolve Button */}
          {onResolver && (
            <button
              onClick={() => setShowResolveForm(!showResolveForm)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Marcar como Resuelta
            </button>
          )}
        </div>
      )}

      {/* Resolve Form */}
      {showResolveForm && !alerta.resuelta && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nota de resolución (opcional)
          </label>
          <textarea
            value={notaResolucion}
            onChange={(e) => setNotaResolucion(e.target.value)}
            placeholder="Describe cómo se resolvió esta alerta..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleResolve}
              disabled={isResolving}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResolving ? 'Resolviendo...' : 'Confirmar Resolución'}
            </button>
            <button
              onClick={() => {
                setShowResolveForm(false);
                setNotaResolucion('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Resolution Note */}
      {alerta.resuelta && alerta.notaResolucion && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">Resolución:</p>
              <p className="text-sm text-gray-600">{alerta.notaResolucion}</p>
              {alerta.resueltaPor && (
                <p className="text-xs text-gray-500 mt-1">
                  Por: {alerta.resueltaPor}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlertaCard;
