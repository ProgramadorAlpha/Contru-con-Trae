/**
 * Project Phases Section Component
 * Task: 13.2 - Integrar bloqueo en componentes de proyecto
 * Requirements: 7.4, 7.6
 * 
 * Section component to integrate phase blocking into project detail pages
 * This can be added to any project detail view
 */

import React, { useState, useEffect } from 'react';
import { FasesList } from './FasesList';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ProjectPhasesSectionProps {
  proyectoId: string;
  isAdmin?: boolean;
  onPhaseStarted?: (faseNumero: number) => void;
}

interface Fase {
  numero: number;
  nombre: string;
  progreso: number;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada';
  monto?: number;
}

export function ProjectPhasesSection({
  proyectoId,
  isAdmin = false,
  onPhaseStarted
}: ProjectPhasesSectionProps) {
  const [fases, setFases] = useState<Fase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFases();
  }, [proyectoId]);

  const loadFases = async () => {
    try {
      setLoading(true);
      setError(null);

      // In real implementation, this would fetch from the proyecto service
      // For now, we'll use mock data based on the project
      // This should be replaced with actual API call:
      // const proyecto = await proyectoService.getProyectoById(proyectoId);
      // const fases = proyecto.fases || [];

      // Mock data for demonstration
      const mockFases: Fase[] = [
        {
          numero: 1,
          nombre: 'Cimentación y Estructura',
          progreso: 100,
          estado: 'completada',
          monto: 50000
        },
        {
          numero: 2,
          nombre: 'Albañilería y Cerramientos',
          progreso: 75,
          estado: 'en_progreso',
          monto: 35000
        },
        {
          numero: 3,
          nombre: 'Instalaciones',
          progreso: 0,
          estado: 'pendiente',
          monto: 28000
        },
        {
          numero: 4,
          nombre: 'Acabados',
          progreso: 0,
          estado: 'pendiente',
          monto: 22000
        },
        {
          numero: 5,
          nombre: 'Exteriores y Urbanización',
          progreso: 0,
          estado: 'pendiente',
          monto: 15000
        }
      ];

      setFases(mockFases);
    } catch (err) {
      console.error('Error loading phases:', err);
      setError('Error al cargar las fases del proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarFase = async (faseNumero: number) => {
    try {
      // In real implementation, this would call the proyecto service
      // await proyectoService.iniciarFase(proyectoId, faseNumero);
      
      console.log(`Iniciando fase ${faseNumero} del proyecto ${proyectoId}`);
      
      // Update local state
      setFases(prev => prev.map(f => 
        f.numero === faseNumero 
          ? { ...f, estado: 'en_progreso' as const }
          : f
      ));

      // Notify parent
      if (onPhaseStarted) {
        onPhaseStarted(faseNumero);
      }

      // Reload to get updated blocking status
      setTimeout(() => loadFases(), 500);
    } catch (err) {
      console.error('Error starting phase:', err);
      alert('Error al iniciar la fase');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-12 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando fases del proyecto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-1">
              Error al cargar fases
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={loadFases}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FasesList
      proyectoId={proyectoId}
      fases={fases}
      onIniciarFase={handleIniciarFase}
      isAdmin={isAdmin}
    />
  );
}
