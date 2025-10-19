/**
 * Project Phases Example Page
 * Task: 13.2 - Integrar bloqueo en componentes de proyecto
 * 
 * Example page demonstrating phase blocking integration
 * This shows how to integrate the ProjectPhasesSection into a project detail view
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, Euro, MapPin } from 'lucide-react';
import { ProjectPhasesSection } from '@/components/projects';

export function ProjectPhasesExamplePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  // In real implementation, this would come from auth context
  const [isAdmin] = useState(true);

  // Mock project data - in real implementation, load from API
  const project = {
    id: projectId || '1',
    nombre: 'Edificio Residencial Vista Hermosa',
    cliente: 'Inmobiliaria del Sur S.A.',
    ubicacion: 'Madrid, España',
    presupuesto: 150000,
    fechaInicio: '2024-01-15',
    fechaFin: '2024-12-31'
  };

  const handlePhaseStarted = (faseNumero: number) => {
    console.log(`Phase ${faseNumero} started for project ${projectId}`);
    // In real implementation:
    // - Show success notification
    // - Refresh project data
    // - Update analytics
    // - Send notifications to team
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <main role="main" className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => navigate('/projects')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              title="Volver a proyectos"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {project.nombre}
                </h1>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>{project.cliente}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{project.ubicacion}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  <span>{formatCurrency(project.presupuesto)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{project.fechaInicio} - {project.fechaFin}</span>
                </div>
              </div>
            </div>
          </div>
          
          {isAdmin && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-1">
              <span className="text-xs font-medium text-blue-800 dark:text-blue-300">
                Administrador
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Project Phases Section with Blocking */}
      <ProjectPhasesSection
        proyectoId={project.id}
        isAdmin={isAdmin}
        onPhaseStarted={handlePhaseStarted}
      />

      {/* Additional Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
          💡 Información sobre Bloqueo de Fases
        </h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
          <p>
            <strong>Protección de Capital:</strong> Las fases se bloquean automáticamente 
            hasta que se cobre la fase anterior, protegiendo tu flujo de caja.
          </p>
          <p>
            <strong>Fase 1:</strong> Puede iniciarse una vez cobrado el adelanto del proyecto.
          </p>
          <p>
            <strong>Fases Siguientes:</strong> Se desbloquean automáticamente al registrar 
            el cobro de la factura de la fase anterior.
          </p>
          {isAdmin && (
            <p>
              <strong>Desbloqueo Forzado:</strong> Como administrador, puedes forzar el 
              inicio de una fase bloqueada. Esta acción queda registrada en auditoría.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
