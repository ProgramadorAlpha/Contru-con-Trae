/**
 * Fase Card Component
 * Task: 13.2 - Integrar bloqueo en componentes de proyecto
 * Requirements: 7.4, 7.6
 * 
 * Displays phase information with blocking status and controls
 */

import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Play, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { bloqueoFasesService } from '@/services/bloqueo-fases.service';
import { ForzarDesbloqueoModal } from './ForzarDesbloqueoModal.tsx';

interface FaseCardProps {
  proyectoId: string;
  faseNumero: number;
  faseNombre: string;
  progreso: number;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada';
  monto?: number;
  onIniciarFase?: () => void;
  isAdmin?: boolean;
}

export function FaseCard({
  proyectoId,
  faseNumero,
  faseNombre,
  progreso,
  estado,
  monto,
  onIniciarFase,
  isAdmin = false
}: FaseCardProps) {
  const [bloqueada, setBloqueada] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState<string | undefined>();
  const [puedeForza, setPuedeForza] = useState(false);
  const [showForceModal, setShowForceModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBloqueoStatus();
  }, [proyectoId, faseNumero]);

  const checkBloqueoStatus = async () => {
    try {
      const status = await bloqueoFasesService.estaFaseBloqueada(proyectoId, faseNumero);
      setBloqueada(status.bloqueada);
      setMotivoBloqueo(status.motivo);
      setPuedeForza(status.puedeForza);
    } catch (error) {
      console.error('Error checking phase block status:', error);
    }
  };

  const handleIniciarFase = async () => {
    if (bloqueada && !isAdmin) {
      return; // Cannot start if blocked and not admin
    }

    if (bloqueada && isAdmin) {
      // Show force unblock modal
      setShowForceModal(true);
      return;
    }

    // Normal phase start
    if (onIniciarFase) {
      onIniciarFase();
    }
  };

  const handleForceUnblock = async (motivo: string) => {
    setLoading(true);
    try {
      // In real implementation, would get current user
      const usuario = 'admin@example.com';
      
      await bloqueoFasesService.forzarDesbloqueo(
        proyectoId,
        faseNumero,
        usuario,
        motivo
      );

      // Refresh status
      await checkBloqueoStatus();
      
      // Start phase
      if (onIniciarFase) {
        onIniciarFase();
      }

      setShowForceModal(false);
    } catch (error) {
      console.error('Error forcing unblock:', error);
      alert('Error al forzar desbloqueo');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoIcon = () => {
    if (bloqueada) {
      return <Lock className="w-5 h-5 text-red-500" />;
    }

    switch (estado) {
      case 'completada':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'en_progreso':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'pendiente':
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getEstadoBadge = () => {
    if (bloqueada) {
      return (
        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded font-medium">
          Bloqueada
        </span>
      );
    }

    switch (estado) {
      case 'completada':
        return (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded font-medium">
            Completada
          </span>
        );
      case 'en_progreso':
        return (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded font-medium">
            En Progreso
          </span>
        );
      case 'pendiente':
        return (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded font-medium">
            Pendiente
          </span>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const canStartPhase = estado === 'pendiente' && (!bloqueada || (bloqueada && isAdmin && puedeForza));

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border ${
        bloqueada 
          ? 'border-red-300 dark:border-red-700' 
          : 'border-gray-200 dark:border-gray-700'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getEstadoIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fase {faseNumero}: {faseNombre}
              </h3>
              {monto && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Presupuesto: {formatCurrency(monto)}
                </p>
              )}
            </div>
          </div>
          {getEstadoBadge()}
        </div>

        {/* Blocking Warning */}
        {bloqueada && motivoBloqueo && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Fase bloqueada
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Motivo: {motivoBloqueo}
                </p>
                {isAdmin && puedeForza && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Como administrador, puedes forzar el inicio de esta fase.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progreso
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {progreso}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                bloqueada
                  ? 'bg-red-500'
                  : estado === 'completada'
                  ? 'bg-green-500'
                  : estado === 'en_progreso'
                  ? 'bg-blue-500'
                  : 'bg-gray-400'
              }`}
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        {canStartPhase && (
          <div className="flex gap-2">
            <button
              onClick={handleIniciarFase}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors flex-1 justify-center ${
                bloqueada && isAdmin
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {bloqueada && isAdmin ? (
                <>
                  <Unlock className="w-4 h-4" />
                  Forzar Inicio
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Iniciar Fase
                </>
              )}
            </button>
          </div>
        )}

        {!canStartPhase && estado === 'pendiente' && bloqueada && !isAdmin && (
          <div className="text-center py-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Contacta al administrador para desbloquear esta fase
            </p>
          </div>
        )}
      </div>

      {/* Force Unblock Modal */}
      {showForceModal && (
        <ForzarDesbloqueoModal
          isOpen={showForceModal}
          onClose={() => setShowForceModal(false)}
          faseNumero={faseNumero}
          faseNombre={faseNombre}
          motivoBloqueo={motivoBloqueo || ''}
          onConfirm={handleForceUnblock}
          loading={loading}
        />
      )}
    </>
  );
}
