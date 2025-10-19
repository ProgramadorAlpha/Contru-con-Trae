/**
 * Project Income Page
 * 
 * Page for managing project income/revenue with localStorage persistence.
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, TrendingUp } from 'lucide-react';
import { AddIncomeModal } from '@/components/financials/AddIncomeModal';
import { IncomeList } from '@/components/financials/IncomeList';

export function ProjectIncomePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    // Trigger refresh of the income list
    setRefreshTrigger(prev => prev + 1);
  };

  if (!projectId) {
    return (
      <main role="main" className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">ID de proyecto no encontrado</p>
      </main>
    );
  }

  return (
    <main role="main" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ingresos del Proyecto</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los ingresos y pagos recibidos
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Añadir Ingreso
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Persistencia Automática
            </h3>
            <p className="text-sm text-gray-700">
              Todos los ingresos se guardan automáticamente en localStorage. 
              Los datos persisten entre sesiones y recargas de página.
            </p>
            <p className="text-xs text-gray-600 mt-2">
              💡 Tip: Abre DevTools → Application → Local Storage para ver los datos guardados
            </p>
          </div>
        </div>
      </div>

      {/* Income List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Historial de Ingresos
        </h2>
        <IncomeList 
          projectId={projectId} 
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Add Income Modal */}
      <AddIncomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        onSuccess={handleSuccess}
      />
    </main>
  );
}
