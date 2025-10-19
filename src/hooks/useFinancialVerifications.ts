/**
 * Financial Verifications Hook - Task 16.3
 * Requirements: 8.1, 8.2, 8.3, 8.4
 * 
 * Automatically executes financial verifications when key events occur:
 * - Phase completion
 * - Expense registration
 * - Payment collection
 */

import { useCallback } from 'react';
import { alertaService } from '../services/alerta.service';
import { proyectoService } from '../services/proyecto.service';
import { localStorageService } from '../services/localStorage.service';

interface VerificationContext {
  proyectoId: string;
  evento: 'fase_completada' | 'gasto_registrado' | 'cobro_registrado';
  datos?: {
    faseNumero?: number;
    progresoFase?: number;
    montoGasto?: number;
    montoCobro?: number;
  };
}

export function useFinancialVerifications() {
  /**
   * Execute all financial verifications for a project
   * This is the main entry point that should be called after key events
   */
  const ejecutarVerificaciones = useCallback(async (context: VerificationContext) => {
    const { proyectoId, evento, datos } = context;

    try {
      console.log(`[Financial Verifications] Executing for project ${proyectoId} after ${evento}`);

      // Get project data
      const proyecto = await proyectoService.getProyectoById(proyectoId);
      if (!proyecto) {
        console.warn(`[Financial Verifications] Project ${proyectoId} not found`);
        return;
      }

      // Get project financial data
      const presupuestos = localStorageService.get<any[]>('presupuestos', []);
      const presupuesto = presupuestos.find(p => p.proyectoId === proyectoId);

      // Get gastos for the project
      const gastos = localStorageService.get<any[]>('gastos', []);
      const gastosProyecto = gastos.filter(g => g.proyectoId === proyectoId);
      const gastosReales = gastosProyecto.reduce((sum, g) => sum + (g.monto || 0), 0);

      // Get fases data
      const fases = presupuesto?.fases || [];
      const faseActual = datos?.faseNumero || 1;
      const progresoFaseActual = datos?.progresoFase || 0;

      // Calculate next phase cost
      const proximaFaseIndex = fases.findIndex((f: any) => f.numero === faseActual + 1);
      const costoProximaFase = proximaFaseIndex >= 0 ? fases[proximaFaseIndex].monto : 0;

      // Prepare verification data
      const datosVerificacion = {
        costoProximaFase: costoProximaFase > 0 ? costoProximaFase : undefined,
        faseActual: faseActual,
        progresoFaseActual: progresoFaseActual,
        presupuestoTotal: presupuesto?.montos?.total || proyecto.presupuesto_total,
        gastosReales: gastosReales > 0 ? gastosReales : undefined
      };

      // Execute all verifications
      const alertasGeneradas = await alertaService.ejecutarVerificaciones(
        proyectoId,
        datosVerificacion
      );

      if (alertasGeneradas.length > 0) {
        console.log(`[Financial Verifications] Generated ${alertasGeneradas.length} alerts for project ${proyectoId}`);
        
        // Log critical alerts
        const alertasCriticas = alertasGeneradas.filter(a => a.prioridad === 'critica');
        if (alertasCriticas.length > 0) {
          console.warn(`[Financial Verifications] ${alertasCriticas.length} CRITICAL alerts generated!`);
        }
      } else {
        console.log(`[Financial Verifications] No alerts generated for project ${proyectoId}`);
      }

      return alertasGeneradas;
    } catch (error) {
      console.error('[Financial Verifications] Error executing verifications:', error);
      // Don't throw - verifications should not block the main operation
      return [];
    }
  }, []);

  /**
   * Execute verifications after phase completion
   * Requirement: 8.2 - Verify pending collections when phase reaches 100%
   */
  const verificarAlCompletarFase = useCallback(async (
    proyectoId: string,
    faseNumero: number,
    progresoFase: number
  ) => {
    return ejecutarVerificaciones({
      proyectoId,
      evento: 'fase_completada',
      datos: {
        faseNumero,
        progresoFase
      }
    });
  }, [ejecutarVerificaciones]);

  /**
   * Execute verifications after registering an expense
   * Requirement: 8.3 - Detect cost overruns when expenses are registered
   */
  const verificarAlRegistrarGasto = useCallback(async (
    proyectoId: string,
    montoGasto: number
  ) => {
    return ejecutarVerificaciones({
      proyectoId,
      evento: 'gasto_registrado',
      datos: {
        montoGasto
      }
    });
  }, [ejecutarVerificaciones]);

  /**
   * Execute verifications after registering a payment collection
   * Requirement: 8.1 - Verify treasury after collecting payment
   */
  const verificarAlRegistrarCobro = useCallback(async (
    proyectoId: string,
    montoCobro: number
  ) => {
    return ejecutarVerificaciones({
      proyectoId,
      evento: 'cobro_registrado',
      datos: {
        montoCobro
      }
    });
  }, [ejecutarVerificaciones]);

  return {
    ejecutarVerificaciones,
    verificarAlCompletarFase,
    verificarAlRegistrarGasto,
    verificarAlRegistrarCobro
  };
}

export default useFinancialVerifications;
