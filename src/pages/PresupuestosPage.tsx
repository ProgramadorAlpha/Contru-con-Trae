/**
 * PresupuestosPage - Task 7.4
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, FileText } from 'lucide-react';
import { PresupuestosDashboard } from '../components/presupuestos/PresupuestosDashboard';
import { PresupuestosList } from '../components/presupuestos/PresupuestosList';
import { PresupuestoFilters } from '../components/presupuestos/PresupuestoFilters';
import { presupuestoService } from '../services/presupuesto.service';
import { useNavigate } from 'react-router-dom';
import type { Presupuesto, PresupuestoFiltros } from '../types/presupuesto.types';

export function PresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [filtros, setFiltros] = useState<PresupuestoFiltros>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const presupuestosData = await presupuestoService.getPresupuestosAll();
      setPresupuestos(presupuestosData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const presupuestosFiltrados = useMemo(() => {
    return presupuestos.filter(p => {
      // Filter by estado
      if (filtros.estado && p.estado !== filtros.estado) return false;
      
      // Filter by cliente
      if (filtros.clienteId && p.cliente.id !== filtros.clienteId) return false;
      
      // Filter by fecha desde
      if (filtros.fechaDesde) {
        const fechaCreacion = p.fechaCreacion.toDate ? p.fechaCreacion.toDate() : new Date(p.fechaCreacion as any);
        if (fechaCreacion < filtros.fechaDesde) return false;
      }
      
      // Filter by fecha hasta
      if (filtros.fechaHasta) {
        const fechaCreacion = p.fechaCreacion.toDate ? p.fechaCreacion.toDate() : new Date(p.fechaCreacion as any);
        if (fechaCreacion > filtros.fechaHasta) return false;
      }
      
      // Filter by monto min
      if (filtros.montoMin && p.montos.total < filtros.montoMin) return false;
      
      // Filter by monto max
      if (filtros.montoMax && p.montos.total > filtros.montoMax) return false;
      
      return true;
    });
  }, [presupuestos, filtros]);

  // Calculate metrics
  const metricas = useMemo(() => {
    const aprobados = presupuestosFiltrados.filter(p => p.estado === 'aprobado');
    const pendientes = presupuestosFiltrados.filter(p => p.estado === 'enviado');
    const rechazados = presupuestosFiltrados.filter(p => p.estado === 'rechazado');
    const total = presupuestosFiltrados.length;
    
    return {
      total,
      aprobados: aprobados.length,
      aprobadosPorcentaje: total > 0 ? (aprobados.length / total) * 100 : 0,
      pendientes: pendientes.length,
      pendientesPorcentaje: total > 0 ? (pendientes.length / total) * 100 : 0,
      rechazados: rechazados.length,
      rechazadosPorcentaje: total > 0 ? (rechazados.length / total) * 100 : 0,
      montoFacturado: aprobados.reduce((sum, p) => sum + p.montos.total, 0),
      montoCobrado: 0, // TODO: Calculate from facturas
      porcentajeCobro: 0
    };
  }, [presupuestosFiltrados]);

  const handleAprobar = async (id: string) => {
    try {
      await presupuestoService.aprobarPresupuesto(id);
      await loadData();
    } catch (error) {
      console.error('Error aprobando presupuesto:', error);
    }
  };

  const handleRechazar = async (id: string) => {
    const motivo = prompt('Motivo del rechazo:');
    if (!motivo) return;
    
    try {
      await presupuestoService.rechazarPresupuesto(id, motivo);
      await loadData();
    } catch (error) {
      console.error('Error rechazando presupuesto:', error);
    }
  };

  const handleDuplicar = async (id: string) => {
    const presupuesto = await presupuestoService.getPresupuesto(id);
    if (!presupuesto) return;
    
    try {
      const { id: _, numero: __, createdAt: ___, updatedAt: ____, ...data } = presupuesto;
      await presupuestoService.createPresupuesto({
        ...data,
        nombre: `${presupuesto.nombre} (Copia)`,
        estado: 'borrador',
        estadoDetalle: {
          enviadoCliente: false,
          convertidoAProyecto: false
        }
      });
      await loadData();
    } catch (error) {
      console.error('Error duplicando presupuesto:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando presupuestos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold">Presupuestos</h1>
          </div>
          <button
            onClick={() => navigate('/presupuestos/crear')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Presupuesto
          </button>
        </div>

        {/* Dashboard */}
        <div className="mb-8">
          <PresupuestosDashboard {...metricas} />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <PresupuestoFilters 
            filtros={filtros}
            onFiltrosChange={setFiltros}
            onLimpiar={() => setFiltros({})}
          />
        </div>

        {/* List */}
        <PresupuestosList
          presupuestos={presupuestosFiltrados}
          onAprobar={handleAprobar}
          onRechazar={handleRechazar}
          onDuplicar={handleDuplicar}
        />
      </div>
    </div>
  );
}
