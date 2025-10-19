/**
 * Income List Component
 * 
 * Displays a list of income entries for a project with localStorage persistence.
 */

import React, { useEffect, useState } from 'react';
import { Trash2, Edit, DollarSign } from 'lucide-react';
import { ingresoService } from '@/services/ingreso.service';
import type { Ingreso } from '@/services/ingreso.service';

interface IncomeListProps {
  projectId: string;
  onEdit?: (ingreso: Ingreso) => void;
  refreshTrigger?: number;
}

export function IncomeList({ projectId, onEdit, refreshTrigger }: IncomeListProps) {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIngresos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ingresoService.getIngresosByProyecto(projectId);
      setIngresos(data);
      console.log('✅ Ingresos cargados:', data.length);
    } catch (err) {
      console.error('Error loading ingresos:', err);
      setError('Error al cargar los ingresos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngresos();
  }, [projectId, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este ingreso?')) {
      return;
    }

    try {
      await ingresoService.deleteIngreso(id);
      console.log('✅ Ingreso eliminado');
      loadIngresos(); // Reload list
    } catch (err) {
      console.error('Error deleting ingreso:', err);
      alert('Error al eliminar el ingreso');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (ingresos.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No hay ingresos registrados</p>
        <p className="text-sm text-gray-500 mt-1">Añade el primer ingreso para este proyecto</p>
      </div>
    );
  }

  const totalIngresos = ingresos.reduce((sum, ing) => sum + ing.monto, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700">Total de Ingresos</p>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalIngresos)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-700">Registros</p>
            <p className="text-2xl font-bold text-blue-900">{ingresos.length}</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {ingresos.map((ingreso) => (
          <div
            key={ingreso.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(ingreso.monto)}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {ingreso.categoria}
                  </span>
                  {ingreso.facturado && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      Facturado
                    </span>
                  )}
                </div>

                {ingreso.descripcion && (
                  <p className="text-sm text-gray-600 mb-2">{ingreso.descripcion}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>📅 {formatDate(ingreso.fecha)}</span>
                  {ingreso.metodo_pago && (
                    <span>💳 {ingreso.metodo_pago}</span>
                  )}
                  {ingreso.referencia && (
                    <span>🔖 {ingreso.referencia}</span>
                  )}
                  {ingreso.folio_factura && (
                    <span>📄 {ingreso.folio_factura}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {onEdit && (
                  <button
                    onClick={() => onEdit(ingreso)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(ingreso.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
