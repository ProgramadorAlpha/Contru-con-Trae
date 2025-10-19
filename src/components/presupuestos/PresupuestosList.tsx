/**
 * PresupuestosList Component
 * Requirements: 4.6
 * Task: 7.2
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Eye, 
  Edit, 
  Check, 
  X, 
  Copy, 
  Calendar,
  User,
  DollarSign,
  Layers,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import type { Presupuesto } from '../../types/presupuesto.types';
import { formatearMoneda, getEstadoColor, getEstadoLabel, diasHastaExpiracion } from '../../utils/presupuesto.utils';

interface PresupuestosListProps {
  presupuestos: Presupuesto[];
  onAprobar?: (id: string) => void;
  onRechazar?: (id: string) => void;
  onDuplicar?: (id: string) => void;
}

export function PresupuestosList({ 
  presupuestos, 
  onAprobar, 
  onRechazar, 
  onDuplicar 
}: PresupuestosListProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination
  const totalPages = Math.ceil(presupuestos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPresupuestos = presupuestos.slice(startIndex, endIndex);

  const getEstadoBadgeClass = (estado: Presupuesto['estado']) => {
    const color = getEstadoColor(estado);
    const classes = {
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
    };
    return classes[color] || classes.gray;
  };

  const formatFecha = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getValidezInfo = (presupuesto: Presupuesto) => {
    if (presupuesto.estado !== 'enviado') return null;
    
    const dias = diasHastaExpiracion(presupuesto);
    if (dias < 0) return { text: 'Expirado', color: 'text-red-600' };
    if (dias <= 7) return { text: `${dias} días`, color: 'text-orange-600' };
    return { text: `${dias} días`, color: 'text-gray-600' };
  };

  if (presupuestos.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No hay presupuestos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* List */}
      <div className="space-y-3">
        {currentPresupuestos.map((presupuesto) => {
          const validezInfo = getValidezInfo(presupuesto);
          
          return (
            <div
              key={presupuesto.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{presupuesto.nombre}</h3>
                      {presupuesto.creadoConIA && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded text-xs">
                          <Sparkles className="w-3 h-3" />
                          IA
                        </span>
                      )}
                      {presupuesto.version > 1 && (
                        <span className="text-xs text-gray-500">v{presupuesto.version}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{presupuesto.numero}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      {formatearMoneda(presupuesto.montos.total, presupuesto.montos.moneda)}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(presupuesto.estado)}`}>
                      {getEstadoLabel(presupuesto.estado)}
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">{presupuesto.cliente.nombre}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">{formatFecha(presupuesto.fechaCreacion)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Layers className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">{presupuesto.fases.length} fases</span>
                  </div>
                  
                  {validezInfo && (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <span className={validezInfo.color}>{validezInfo.text}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => navigate(`/presupuestos/${presupuesto.id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  
                  {presupuesto.estado === 'borrador' && (
                    <button
                      onClick={() => navigate(`/presupuestos/${presupuesto.id}/editar`)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                  )}
                  
                  {presupuesto.estado === 'enviado' && onAprobar && (
                    <button
                      onClick={() => onAprobar(presupuesto.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 rounded transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Aprobar
                    </button>
                  )}
                  
                  {presupuesto.estado === 'enviado' && onRechazar && (
                    <button
                      onClick={() => onRechazar(presupuesto.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Rechazar
                    </button>
                  )}
                  
                  {onDuplicar && (
                    <button
                      onClick={() => onDuplicar(presupuesto.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors ml-auto"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicar
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
            Mostrando {startIndex + 1}-{Math.min(endIndex, presupuestos.length)} de {presupuestos.length}
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
