/**
 * RegistrarCobroModal Component
 * Requirements: 9.6, 9.7
 * Task: 15.3
 * 
 * Modal to register payment collection for a factura:
 * - Form fields: fecha, método de pago, referencia
 * - Updates estado to "Cobrada"
 * - Updates tesorería del proyecto
 */

import React, { useState } from 'react';
import { X, DollarSign, Calendar, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import type { Factura } from '../../types/factura.types';
import { facturaService } from '../../services/factura.service';
import { tesoreriaService } from '../../services/tesoreria.service';

interface RegistrarCobroModalProps {
  factura: Factura;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type MetodoPago = 'transferencia' | 'efectivo' | 'cheque' | 'tarjeta';

export function RegistrarCobroModal({
  factura,
  isOpen,
  onClose,
  onSuccess
}: RegistrarCobroModalProps) {
  const [fechaCobro, setFechaCobro] = useState(new Date().toISOString().split('T')[0]);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('transferencia');
  const [referencia, setReferencia] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // Validate
      if (!fechaCobro) {
        throw new Error('La fecha de cobro es requerida');
      }

      // Register payment
      await facturaService.registrarCobro(
        factura.id,
        new Date(fechaCobro),
        metodoPago
      );

      // Update tesorería
      await tesoreriaService.actualizarTesoreria(factura.proyectoId);

      setSuccess(true);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Auto-close after 1.5 seconds
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (err) {
      console.error('Error registrando cobro:', err);
      setError(err instanceof Error ? err.message : 'Error al registrar el cobro');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFechaCobro(new Date().toISOString().split('T')[0]);
      setMetodoPago('transferencia');
      setReferencia('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

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
      month: 'long',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold">Registrar Cobro</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!success ? (
            <>
              {/* Factura Info */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3">Información de la Factura</h3>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Número</p>
                    <p className="font-medium">{factura.numero}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Cliente</p>
                    <p className="font-medium">{factura.cliente.nombre}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Monto Total</p>
                    <p className="font-medium text-green-600 text-lg">
                      {formatCurrency(factura.total, factura.moneda)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Fecha Emisión</p>
                    <p className="font-medium">{formatDate(factura.fechaEmision)}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Fecha de Cobro */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4" />
                    Fecha de Cobro *
                  </label>
                  <input
                    type="date"
                    value={fechaCobro}
                    onChange={(e) => setFechaCobro(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>

                {/* Método de Pago */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <CreditCard className="w-4 h-4" />
                    Método de Pago *
                  </label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="cheque">Cheque</option>
                    <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                  </select>
                </div>

                {/* Referencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Referencia / Número de Transacción (opcional)
                  </label>
                  <input
                    type="text"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    disabled={loading}
                    placeholder="Ej: TRF-2024-001, Cheque #12345"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-medium mb-1">Al registrar el cobro:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>La factura se marcará como "Cobrada"</li>
                        <li>Se actualizará la tesorería del proyecto</li>
                        <li>Se registrará la fecha y método de pago</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Registrar Cobro
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Success Message */
            <div className="py-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-600 mb-2">
                ¡Cobro Registrado Exitosamente!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                La factura {factura.numero} ha sido marcada como cobrada
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                La tesorería del proyecto ha sido actualizada
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
