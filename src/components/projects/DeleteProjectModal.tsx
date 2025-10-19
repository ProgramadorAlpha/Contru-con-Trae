/**
 * Delete Project Modal
 * 
 * Modal de confirmación para eliminar un proyecto con advertencias de seguridad.
 */

import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onConfirm: (projectId: string) => void;
}

export function DeleteProjectModal({ isOpen, onClose, project, onConfirm }: DeleteProjectModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmValid = confirmText === project.name;

  const handleConfirm = async () => {
    if (!isConfirmValid) {
      setError('El nombre del proyecto no coincide');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simular eliminación (en producción sería una llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Proyecto eliminado:', project.id);
      onConfirm(project.id);
      onClose();
      setConfirmText('');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Error al eliminar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setError(null);
    onClose();
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
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Eliminar Proyecto</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Warning */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
                    ¡Advertencia! Esta acción no se puede deshacer
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-400">
                    Al eliminar este proyecto se perderán permanentemente:
                  </p>
                  <ul className="mt-2 text-sm text-red-800 dark:text-red-400 list-disc list-inside space-y-1">
                    <li>Todos los documentos asociados</li>
                    <li>Registros financieros e ingresos</li>
                    <li>Gastos y transacciones</li>
                    <li>Historial y reportes</li>
                    <li>Tareas y cronogramas</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proyecto a eliminar:
              </h4>
              <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                {project.name}
              </p>
              {project.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {project.description}
                </p>
              )}
            </div>

            {/* Confirmation Input */}
            <div>
              <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Para confirmar, escribe el nombre del proyecto:
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1 font-normal">
                  "{project.name}"
                </span>
              </label>
              <input
                type="text"
                id="confirmText"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Escribe el nombre del proyecto"
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Info adicional */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                💡 <strong>Alternativa:</strong> Si solo quieres pausar el proyecto temporalmente, 
                considera cambiar su estado a "En Pausa" en lugar de eliminarlo.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isConfirmValid || loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              {loading ? 'Eliminando...' : 'Eliminar Proyecto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
