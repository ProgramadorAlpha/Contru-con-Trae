/**
 * GastosList Component - Task 20.2
 * Requirements: 15.2, 15.3
 * 
 * List of gastos with document support
 */
import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import type { Gasto } from '../../services/gasto.service';
import { gastoService } from '../../services/gasto.service';
import { GastoCard } from './GastoCard';
import { GastoFormModal } from './GastoFormModal';

interface GastosListProps {
  proyectoId?: string;
}

export const GastosList: React.FC<GastosListProps> = ({ proyectoId }) => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | undefined>();
  const [filtros, setFiltros] = useState({
    categoria: '',
    aprobado: null as boolean | null,
    busqueda: ''
  });

  useEffect(() => {
    cargarGastos();
  }, [proyectoId, filtros]);

  const cargarGastos = async () => {
    try {
      setLoading(true);
      const gastosData = await gastoService.getAllGastos({
        proyecto_id: proyectoId,
        categoria: filtros.categoria || undefined,
        aprobado: filtros.aprobado ?? undefined
      });

      // Apply search filter
      let gastosFiltrados = gastosData;
      if (filtros.busqueda) {
        const search = filtros.busqueda.toLowerCase();
        gastosFiltrados = gastosData.filter(g =>
          g.concepto.toLowerCase().includes(search) ||
          g.proveedor?.toLowerCase().includes(search) ||
          g.folio?.toLowerCase().includes(search)
        );
      }

      setGastos(gastosFiltrados);
    } catch (error) {
      console.error('Error loading gastos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingGasto(undefined);
    setShowFormModal(true);
  };

  const handleEdit = (gasto: Gasto) => {
    setEditingGasto(gasto);
    setShowFormModal(true);
  };

  const handleDelete = async (gastoId: string) => {
    if (!confirm('¿Eliminar este gasto?')) return;

    try {
      await gastoService.deleteGasto(gastoId);
      cargarGastos();
    } catch (error) {
      console.error('Error deleting gasto:', error);
    }
  };

  const handleApprove = async (gastoId: string) => {
    try {
      await gastoService.approveGasto(gastoId, 'current-user'); // TODO: Get from auth
      cargarGastos();
    } catch (error) {
      console.error('Error approving gasto:', error);
    }
  };

  const handleFormSuccess = () => {
    cargarGastos();
  };

  const categorias = [
    'Materiales',
    'Mano de obra',
    'Subcontratistas',
    'Maquinaria',
    'Transporte',
    'Permisos/Licencias',
    'Otros'
  ];

  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
  const gastosAprobados = gastos.filter(g => g.aprobado).length;
  const gastosPendientes = gastos.filter(g => !g.aprobado).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gastos</h2>
          <p className="text-sm text-gray-600 mt-1">
            {gastos.length} gastos • {gastosAprobados} aprobados • {gastosPendientes} pendientes
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Gasto
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Gastos</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR'
            }).format(totalGastos)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Aprobados</p>
          <p className="text-2xl font-bold text-green-600">{gastosAprobados}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">{gastosPendientes}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filtros.busqueda}
                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                placeholder="Concepto, proveedor, folio..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Categoría</label>
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Estado</label>
            <select
              value={filtros.aprobado === null ? 'all' : filtros.aprobado.toString()}
              onChange={(e) => setFiltros(prev => ({
                ...prev,
                aprobado: e.target.value === 'all' ? null : e.target.value === 'true'
              }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="true">Aprobados</option>
              <option value="false">Pendientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gastos List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : gastos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">No hay gastos registrados</p>
          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear primer gasto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {gastos.map((gasto) => (
            <GastoCard
              key={gasto.id}
              gasto={gasto}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onApprove={handleApprove}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <GastoFormModal
          gasto={editingGasto}
          proyectoId={proyectoId || 'default-project'}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default GastosList;
