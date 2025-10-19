/**
 * Forzar Desbloqueo Modal
 * Task: 13.2 - Integrar bloqueo en componentes de proyecto
 * Requirements: 7.6
 * 
 * Modal for admin to force unblock a phase with confirmation and reason
 */

import React, { useState } from 'react';
import { X, AlertTriangle, Unlock } from 'lucide-react';

interface ForzarDesbloqueoModalProps {
  isOpen: boolean;
  onClose: () => void;
  faseNumero: number;
  faseNombre: string;
  motivoBloqueo: string;
  onConfirm: (motivo: string) => void;
  loading?: boolean;
}

export function ForzarDesbloqueoModal({
  isOpen,
  onClose,
  faseNumero,
  faseNombre,
  motivoBloqueo,
  onConfirm,
  loading = false
}: ForzarDesbloqueoModalProps) {
  const [motivo, setMotivo] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!motivo.trim()) {
      setError('Debes proporcionar un motivo para el desbloqueo forzado');
      return;
    }

    if (confirmacion.toUpperCase() !== 'DESBLOQUEAR') {
      setError('Debes escribir "DESBLOQUEAR" para confirmar');
      return;
    }

    setError(null);
    onConfirm(motivo);
  };

  const handleClose = () => {
    if (!loading) {
      setMotivo('');
      setConfirmacion('');
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
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Forzar Desbloqueo de Fase
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Fase {faseNumero}: {faseNombre}
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

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Warning */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-2">
                    ⚠️ Advertencia: Acción de Administrador
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-400">
                    Esta fase está bloqueada por el siguiente motivo:
                  </p>
                  <p className="text-xs font-medium text-orange-900 dark:text-orange-200 mt-1 bg-orange-100 dark:bg-orange-900/40 p-2 rounded">
                    {motivoBloqueo}
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-400 mt-2">
                    Forzar el desbloqueo puede afectar el flujo de caja del proyecto. 
                    Esta acción quedará registrada en la auditoría.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Motivo */}
            <div>
              <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motivo del desbloqueo forzado <span className="text-red-500">*</span>
              </label>
              <textarea
                id="motivo"
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                placeholder="Ej: Cliente autorizó inicio de fase con pago pendiente. Compromiso de pago en 5 días..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Explica por qué es necesario forzar el inicio de esta fase
              </p>
            </div>

            {/* Confirmación */}
            <div>
              <label htmlFor="confirmacion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmación <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="confirmacion"
                value={confirmacion}
                onChange={(e) => {
                  setConfirmacion(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                placeholder="Escribe DESBLOQUEAR para confirmar"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Escribe <span className="font-mono font-bold">DESBLOQUEAR</span> en mayúsculas para confirmar
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Unlock className="w-4 h-4" />
                {loading ? 'Desbloqueando...' : 'Forzar Desbloqueo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
