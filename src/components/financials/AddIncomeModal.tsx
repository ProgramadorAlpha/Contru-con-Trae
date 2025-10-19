/**
 * Add Income Modal Component
 * 
 * Modal for adding income/revenue entries to a project with localStorage persistence.
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ingresoService } from '@/services/ingreso.service';
import type { CreateIngresoDTO } from '@/services/ingreso.service';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName?: string;
  onSuccess?: () => void;
}

export function AddIncomeModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  onSuccess
}: AddIncomeModalProps) {
  const [formData, setFormData] = useState({
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    categoria: 'General',
    metodo_pago: '',
    referencia: '',
    facturado: false,
    folio_factura: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ingresoData: CreateIngresoDTO = {
        proyecto_id: projectId,
        monto: parseFloat(formData.monto),
        fecha: formData.fecha,
        descripcion: formData.descripcion || undefined,
        categoria: formData.categoria,
        metodo_pago: formData.metodo_pago || undefined,
        referencia: formData.referencia || undefined,
        facturado: formData.facturado,
        folio_factura: formData.folio_factura || undefined
      };

      const ingreso = await ingresoService.createIngreso(ingresoData);
      
      console.log('✅ Ingreso creado exitosamente:', ingreso);
      
      // Reset form
      setFormData({
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
        categoria: 'General',
        metodo_pago: '',
        referencia: '',
        facturado: false,
        folio_factura: ''
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (err) {
      console.error('Error creating ingreso:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el ingreso');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Añadir Ingreso</h2>
              {projectName && (
                <p className="text-sm text-gray-600 mt-1">Proyecto: {projectName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Monto */}
              <div>
                <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-1">
                  Monto <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="monto"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Fecha */}
              <div>
                <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Categoría */}
              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="General">General</option>
                  <option value="Anticipo">Anticipo</option>
                  <option value="Pago Parcial">Pago Parcial</option>
                  <option value="Pago Final">Pago Final</option>
                  <option value="Certificación">Certificación</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Método de Pago */}
              <div>
                <label htmlFor="metodo_pago" className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  id="metodo_pago"
                  name="metodo_pago"
                  value={formData.metodo_pago}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>

              {/* Referencia */}
              <div>
                <label htmlFor="referencia" className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia
                </label>
                <input
                  type="text"
                  id="referencia"
                  name="referencia"
                  value={formData.referencia}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Número de referencia"
                />
              </div>

              {/* Folio Factura */}
              <div>
                <label htmlFor="folio_factura" className="block text-sm font-medium text-gray-700 mb-1">
                  Folio de Factura
                </label>
                <input
                  type="text"
                  id="folio_factura"
                  name="folio_factura"
                  value={formData.folio_factura}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Folio"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción del ingreso..."
              />
            </div>

            {/* Facturado */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="facturado"
                name="facturado"
                checked={formData.facturado}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="facturado" className="ml-2 text-sm text-gray-700">
                Ingreso facturado
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Ingreso'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
