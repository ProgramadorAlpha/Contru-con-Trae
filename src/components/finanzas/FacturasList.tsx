/**
 * FacturasList Component
 * Requirements: 9.1, 9.3
 * Task: 15.1
 * 
 * List of facturas with:
 * - Filters by estado and proyecto
 * - Display: número, cliente, monto, fecha emisión, vencimiento, estado
 * - Actions: ver, editar, enviar, registrar cobro
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Eye, 
  Edit, 
  Send, 
  DollarSign,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import type { Factura } from '../../types/factura.types';

interface FacturasListProps {
  facturas: Factura[];
  onVer?: (id: string) => void;
  onEditar?: (id: string) => void;
  onEnviar?: (id: string) => void;
  onRegistrarCobro?: (id: string) => void;
}

export function FacturasList({
  facturas,
  onVer,
  onEditar,
  onEnviar,
  onRegistrarCobro
}: FacturasListProps) {
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroProyecto, setFiltroProyecto] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get unique proyectos for filter
  const proyectos = Array.from(new Set(facturas.map(f => f.proyectoId)));

  // Apply filters
  const facturasFiltradas = facturas.filter(factura => {
    if (filtroEstado && factura.estado !== filtroEstado) return false;
    if (filtroProyecto && factura.proyectoId !== filtroProyecto) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(facturasFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFacturas = facturasFiltradas.slice(startIndex, endIndex);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
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

  const getEstadoBadge = (estado: Factura['estado']) => {
    const badges = {
      borrador: {
        icon: Edit,
        class: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        label: 'Borrador'
      },
      enviada: {
        icon: Send,
        class: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        label: 'Enviada'
      },
      cobrada: {
        icon: CheckCircle,
        class: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        label: 'Cobrada'
      },
      vencida: {
        icon: AlertCircle,
        class: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        label: 'Vencida'
      },
      cancelada: {
        icon: XCircle,
        class: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        label: 'Cancelada'
      }
    };

    const badge = badges[estado];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.class}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const getDiasVencimiento = (factura: Factura) => {
    if (factura.estado === 'cobrada' || factura.estado === 'cancelada') return null;
    
    const hoy = new Date();
    const vencimiento = factura.fechaVencimiento.toDate 
      ? factura.fechaVencimiento.toDate() 
      : new Date(factura.fechaVencimiento as any);
    
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { dias: Math.abs(diffDays), tipo: 'vencida', color: 'text-red-600' };
    } else if (diffDays <= 7) {
      return { dias: diffDays, tipo: 'proximo', color: 'text-orange-600' };
    }
    return { dias: diffDays, tipo: 'normal', color: 'text-gray-600' };
  };

  if (facturas.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No hay facturas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="cobrada">Cobrada</option>
              <option value="vencida">Vencida</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por Proyecto
            </label>
            <select
              value={filtroProyecto}
              onChange={(e) => {
                setFiltroProyecto(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos los proyectos</option>
              {proyectos.map(proyectoId => (
                <option key={proyectoId} value={proyectoId}>
                  {proyectoId}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(filtroEstado || filtroProyecto) && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {facturasFiltradas.length} de {facturas.length} facturas
            </p>
            <button
              onClick={() => {
                setFiltroEstado('');
                setFiltroProyecto('');
                setCurrentPage(1);
              }}
              className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {currentFacturas.map((factura) => {
          const vencimiento = getDiasVencimiento(factura);
          
          return (
            <div
              key={factura.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{factura.numero}</h3>
                      {getEstadoBadge(factura.estado)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Proyecto: {factura.proyectoId}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(factura.total, factura.moneda)}
                    </p>
                    {vencimiento && (
                      <p className={`text-xs ${vencimiento.color}`}>
                        {vencimiento.tipo === 'vencida' 
                          ? `Vencida hace ${vencimiento.dias} días`
                          : vencimiento.tipo === 'proximo'
                          ? `Vence en ${vencimiento.dias} días`
                          : `${vencimiento.dias} días`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {factura.cliente.nombre}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Emisión</p>
                      <span className="text-gray-600 dark:text-gray-300">
                        {formatDate(factura.fechaEmision)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Vencimiento</p>
                      <span className="text-gray-600 dark:text-gray-300">
                        {formatDate(factura.fechaVencimiento)}
                      </span>
                    </div>
                  </div>
                  
                  {factura.fechaCobro && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-xs text-gray-500">Cobro</p>
                        <span className="text-gray-600 dark:text-gray-300">
                          {formatDate(factura.fechaCobro)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {onVer && (
                    <button
                      onClick={() => onVer(factura.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                  )}
                  
                  {factura.estado === 'borrador' && onEditar && (
                    <button
                      onClick={() => onEditar(factura.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                  )}
                  
                  {factura.estado === 'borrador' && onEnviar && (
                    <button
                      onClick={() => onEnviar(factura.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 rounded transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Enviar
                    </button>
                  )}
                  
                  {(factura.estado === 'enviada' || factura.estado === 'vencida') && onRegistrarCobro && (
                    <button
                      onClick={() => onRegistrarCobro(factura.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 rounded transition-colors ml-auto"
                    >
                      <DollarSign className="w-4 h-4" />
                      Registrar Cobro
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {startIndex + 1}-{Math.min(endIndex, facturasFiltradas.length)} de {facturasFiltradas.length}
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
