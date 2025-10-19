/**
 * Fases List Component
 * Task: 13.2 - Integrar bloqueo en componentes de proyecto
 * Requirements: 7.4, 7.6
 * 
 * Displays list of project phases with blocking status
 */

import React, { useState, useEffect } from 'react';
import { FaseCard } from './FaseCard';
import { Layers, AlertCircle } from 'lucide-react';
import { bloqueoFasesService } from '@/services/bloqueo-fases.service';

interface Fase {
  numero: number;
  nombre: string;
  progreso: number;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada';
  monto?: number;
}

interface FasesListProps {
  proyectoId: string;
  fases: Fase[];
  onIniciarFase?: (faseNumero: number) => void;
  isAdmin?: boolean;
}

export function FasesList({
  proyectoId,
  fases,
  onIniciarFase,
  isAdmin = false
}: FasesListProps) {
  const [fasesBloqueadas, setFasesBloqueadas] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBloqueos();
  }, [proyectoId]);

  const loadBloqueos = async () => {
    try {
      setLoading(true);
      const bloqueos = await bloqueoFasesService.getFasesBloqueadas(proyectoId);
      const numerosBloqueados = bloqueos.map(b => b.faseNumero);
      setFasesBloqueadas(numerosBloqueados);
    } catch (error) {
      console.error('Error loading phase blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarFase = (faseNumero: number) => {
    if (onIniciarFase) {
      onIniciarFase(faseNumero);
    }
    // Reload blocks after phase start
    setTimeout(() => loadBloqueos(), 500);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!fases || fases.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            No hay fases definidas para este proyecto
          </p>
        </div>
      </div>
    );
  }

  const totalFases = fases.length;
  const fasesCompletadas = fases.filter(f => f.estado === 'completada').length;
  const fasesBloqueadasCount = fasesBloqueadas.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Fases del Proyecto
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {fasesCompletadas} de {totalFases} fases completadas
              </p>
            </div>
          </div>

          {fasesBloqueadasCount > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {fasesBloqueadasCount} {fasesBloqueadasCount === 1 ? 'fase bloqueada' : 'fases bloqueadas'}
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progreso General
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {Math.round((fasesCompletadas / totalFases) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(fasesCompletadas / totalFases) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Phases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {fases.map((fase) => (
          <FaseCard
            key={fase.numero}
            proyectoId={proyectoId}
            faseNumero={fase.numero}
            faseNombre={fase.nombre}
            progreso={fase.progreso}
            estado={fase.estado}
            monto={fase.monto}
            onIniciarFase={() => handleIniciarFase(fase.numero)}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {/* Admin Info */}
      {isAdmin && fasesBloqueadasCount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                Información para Administradores
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Como administrador, puedes forzar el inicio de fases bloqueadas. 
                Esta acción quedará registrada en la auditoría del sistema y debe usarse 
                solo en casos excepcionales con autorización del cliente.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
