/**
 * PresupuestoFilters Component
 * Requirements: 4.5
 * Task: 7.3
 * 
 * Provides filtering capabilities for presupuestos by:
 * - Estado (status)
 * - Cliente (client)
 * - Rango de fechas (date range)
 * - Rango de montos (amount range)
 * 
 * Filters are applied in real-time as the user changes values.
 */

import React, { useState, useEffect } from 'react';
import { Filter, X, Calendar, DollarSign, User, FileText } from 'lucide-react';
import type { PresupuestoFiltros } from '../../types/presupuesto.types';
import type { Cliente } from '../../types/cliente.types';
import { clienteService } from '../../services/cliente.service';

interface PresupuestoFiltersProps {
  filtros: PresupuestoFiltros;
  onFiltrosChange: (filtros: PresupuestoFiltros) => void;
  onLimpiar?: () => void;
}

const ESTADOS = [
  { value: '', label: 'Todos los estados' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'expirado', label: 'Expirado' },
  { value: 'convertido', label: 'Convertido' }
];

export function PresupuestoFilters({ 
  filtros, 
  onFiltrosChange,
  onLimpiar 
}: PresupuestoFiltersProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load clientes for dropdown
  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const clientesData = await clienteService.getClientesSorted('nombre', 'asc');
      setClientes(clientesData);
    } catch (error) {
      console.error('Error loading clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = (estado: string) => {
    onFiltrosChange({
      ...filtros,
      estado: estado || undefined
    });
  };

  const handleClienteChange = (clienteId: string) => {
    onFiltrosChange({
      ...filtros,
      clienteId: clienteId || undefined
    });
  };

  const handleFechaDesdeChange = (fecha: string) => {
    onFiltrosChange({
      ...filtros,
      fechaDesde: fecha ? new Date(fecha) : undefined
    });
  };

  const handleFechaHastaChange = (fecha: string) => {
    onFiltrosChange({
      ...filtros,
      fechaHasta: fecha ? new Date(fecha) : undefined
    });
  };

  const handleMontoMinChange = (monto: string) => {
    const value = parseFloat(monto);
    onFiltrosChange({
      ...filtros,
      montoMin: !isNaN(value) && value > 0 ? value : undefined
    });
  };

  const handleMontoMaxChange = (monto: string) => {
    const value = parseFloat(monto);
    onFiltrosChange({
      ...filtros,
      montoMax: !isNaN(value) && value > 0 ? value : undefined
    });
  };

  const handleLimpiar = () => {
    if (onLimpiar) {
      onLimpiar();
    } else {
      onFiltrosChange({});
    }
  };

  const hasActiveFilters = () => {
    return !!(
      filtros.estado ||
      filtros.clienteId ||
      filtros.fechaDesde ||
      filtros.fechaHasta ||
      filtros.montoMin ||
      filtros.montoMax
    );
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold">Filtros</h3>
            {hasActiveFilters() && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded text-xs font-medium">
                Activos
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <button
                onClick={handleLimpiar}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                Limpiar
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              {isExpanded ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Estado Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4" />
                Estado
              </label>
              <select
                value={filtros.estado || ''}
                onChange={(e) => handleEstadoChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {ESTADOS.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cliente Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4" />
                Cliente
              </label>
              <select
                value={filtros.clienteId || ''}
                onChange={(e) => handleClienteChange(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Todos los clientes</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} {cliente.empresa ? `(${cliente.empresa})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Desde Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4" />
                Fecha desde
              </label>
              <input
                type="date"
                value={formatDateForInput(filtros.fechaDesde)}
                onChange={(e) => handleFechaDesdeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Fecha Hasta Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4" />
                Fecha hasta
              </label>
              <input
                type="date"
                value={formatDateForInput(filtros.fechaHasta)}
                onChange={(e) => handleFechaHastaChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Monto Mínimo Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4" />
                Monto mínimo (€)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={filtros.montoMin || ''}
                onChange={(e) => handleMontoMinChange(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Monto Máximo Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4" />
                Monto máximo (€)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={filtros.montoMax || ''}
                onChange={(e) => handleMontoMaxChange(e.target.value)}
                placeholder="Sin límite"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters() && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Filtros activos:
              </p>
              <div className="flex flex-wrap gap-2">
                {filtros.estado && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded text-xs">
                    Estado: {ESTADOS.find(e => e.value === filtros.estado)?.label}
                    <button
                      onClick={() => handleEstadoChange('')}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filtros.clienteId && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded text-xs">
                    Cliente: {clientes.find(c => c.id === filtros.clienteId)?.nombre}
                    <button
                      onClick={() => handleClienteChange('')}
                      className="hover:text-purple-900 dark:hover:text-purple-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filtros.fechaDesde && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded text-xs">
                    Desde: {filtros.fechaDesde.toLocaleDateString('es-ES')}
                    <button
                      onClick={() => handleFechaDesdeChange('')}
                      className="hover:text-green-900 dark:hover:text-green-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filtros.fechaHasta && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded text-xs">
                    Hasta: {filtros.fechaHasta.toLocaleDateString('es-ES')}
                    <button
                      onClick={() => handleFechaHastaChange('')}
                      className="hover:text-green-900 dark:hover:text-green-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filtros.montoMin && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded text-xs">
                    Min: €{filtros.montoMin.toLocaleString('es-ES')}
                    <button
                      onClick={() => handleMontoMinChange('')}
                      className="hover:text-orange-900 dark:hover:text-orange-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filtros.montoMax && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded text-xs">
                    Max: €{filtros.montoMax.toLocaleString('es-ES')}
                    <button
                      onClick={() => handleMontoMaxChange('')}
                      className="hover:text-orange-900 dark:hover:text-orange-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
