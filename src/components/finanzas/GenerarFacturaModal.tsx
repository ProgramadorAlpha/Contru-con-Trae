/**
 * Generar Factura Modal
 * Task: 15.2
 * Requirements: 9.1, 9.3
 * 
 * Modal for manually creating invoices
 */

import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, Euro, Save } from 'lucide-react';
import { facturaService } from '@/services/factura.service';
import { Timestamp } from 'firebase/firestore';
import type { Factura } from '@/types/factura.types';

interface GenerarFacturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  proyectoId: string;
  presupuestoId: string;
  cliente: Factura['cliente'];
  onSuccess?: (factura: Factura) => void;
}

export function GenerarFacturaModal({
  isOpen,
  onClose,
  proyectoId,
  presupuestoId,
  cliente,
  onSuccess
}: GenerarFacturaModalProps) {
  const [formData, setFormData] = useState({
    faseVinculada: '',
    planPagoNumero: '',
    subtotal: '',
    iva: '',
    total: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    diasVencimiento: '30',
    notas: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate IVA and total when subtotal changes
  useEffect(() => {
    if (formData.subtotal) {
      const subtotal = parseFloat(formData.subtotal);
      if (!isNaN(subtotal)) {
        const iva = subtotal * 0.21; // 21% IVA in Spain
        const total = subtotal + iva;
        setFormData(prev => ({
          ...prev,
          iva: iva.toFixed(2),
          total: total.toFixed(2)
        }));
      }
    }
  }, [formData.subtotal]);

  // Calculate due date when emission date or days change
  useEffect(() => {
    if (formData.fechaEmision && formData.diasVencimiento) {
      const dias = parseInt(formData.diasVencimiento);
      if (!isNaN(dias)) {
        const emision = new Date(formData.fechaEmision);
        const vencimiento = new Date(emision);
        vencimiento.setDate(vencimiento.getDate() + dias);
        setFormData(prev => ({
          ...prev,
          fechaVencimiento: vencimiento.toISOString().split('T')[0]
        }));
      }
    }
  }, [formData.fechaEmision, formData.diasVencimiento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.subtotal || parseFloat(formData.subtotal) <= 0) {
      setError('El subtotal debe ser mayor a 0');
      return;
    }

    if (!formData.fechaEmision) {
      setError('La fecha de emisión es requerida');
      return;
    }

    if (!formData.fechaVencimiento) {
      setError('La fecha de vencimiento es requerida');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const facturaData: Omit<Factura, 'id' | 'numero' | 'createdAt' | 'updatedAt'> = {
        proyectoId,
        presupuestoId,
        faseVinculada: formData.faseVinculada ? parseInt(formData.faseVinculada) : undefined,
        planPagoNumero: formData.planPagoNumero ? parseInt(formData.planPagoNumero) : 1,
        cliente,
        subtotal: parseFloat(formData.subtotal),
        iva: parseFloat(formData.iva),
        total: parseFloat(formData.total),
        moneda: 'EUR',
        fechaEmision: Timestamp.fromDate(new Date(formData.fechaEmision)),
        fechaVencimiento: Timestamp.fromDate(new Date(formData.fechaVencimiento)),
        estado: 'borrador',
        creadoPor: 'current-user' // In real app, get from auth context
      };

      const factura = await facturaService.createFactura(facturaData);

      console.log('✅ Factura creada:', factura);

      if (onSuccess) {
        onSuccess(factura);
      }

      // Reset form
      setFormData({
        faseVinculada: '',
        planPagoNumero: '',
        subtotal: '',
        iva: '',
        total: '',
        fechaEmision: new Date().toISOString().split('T')[0],
        fechaVencimiento: '',
        diasVencimiento: '30',
        notas: ''
      });

      onClose();
    } catch (err) {
      console.error('Error creating factura:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la factura');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        faseVinculada: '',
        planPagoNumero: '',
        subtotal: '',
        iva: '',
        total: '',
        fechaEmision: new Date().toISOString().split('T')[0],
        fechaVencimiento: '',
        diasVencimiento: '30',
        notas: ''
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Generar Factura
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Crear factura manual para el proyecto
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Cliente Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Cliente
              </h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Nombre:</strong> {cliente.nombre}</p>
                {cliente.empresa && <p><strong>Empresa:</strong> {cliente.empresa}</p>}
                <p><strong>Email:</strong> {cliente.email}</p>
              </div>
            </div>

            {/* Vinculación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="faseVinculada" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fase Vinculada (opcional)
                </label>
                <input
                  type="number"
                  id="faseVinculada"
                  name="faseVinculada"
                  value={formData.faseVinculada}
                  onChange={handleChange}
                  disabled={loading}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  placeholder="Ej: 1"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Número de fase del proyecto
                </p>
              </div>

              <div>
                <label htmlFor="planPagoNumero" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan de Pago (opcional)
                </label>
                <input
                  type="number"
                  id="planPagoNumero"
                  name="planPagoNumero"
                  value={formData.planPagoNumero}
                  onChange={handleChange}
                  disabled={loading}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  placeholder="Ej: 1"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Número del plan de pago
                </p>
              </div>
            </div>

            {/* Montos */}
            <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Euro className="w-5 h-5" />
                Montos
              </h3>

              <div>
                <label htmlFor="subtotal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subtotal <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="subtotal"
                  name="subtotal"
                  value={formData.subtotal}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="iva" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IVA (21%)
                  </label>
                  <input
                    type="number"
                    id="iva"
                    name="iva"
                    value={formData.iva}
                    disabled
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="total" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total
                  </label>
                  <input
                    type="number"
                    id="total"
                    name="total"
                    value={formData.total}
                    disabled
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white font-bold"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Fechas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="fechaEmision" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha Emisión <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="fechaEmision"
                    name="fechaEmision"
                    value={formData.fechaEmision}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="diasVencimiento" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Días Vencimiento
                  </label>
                  <input
                    type="number"
                    id="diasVencimiento"
                    name="diasVencimiento"
                    value={formData.diasVencimiento}
                    onChange={handleChange}
                    disabled={loading}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="fechaVencimiento" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha Vencimiento
                  </label>
                  <input
                    type="date"
                    id="fechaVencimiento"
                    name="fechaVencimiento"
                    value={formData.fechaVencimiento}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label htmlFor="notas" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notas (opcional)
              </label>
              <textarea
                id="notas"
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                disabled={loading}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                placeholder="Notas adicionales sobre la factura..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Generando...' : 'Generar Factura'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
