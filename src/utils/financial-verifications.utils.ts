/**
 * Financial Verifications Utilities - Task 16.3
 * Requirements: 8.1, 8.2, 8.3, 8.4
 * 
 * Utility functions for executing financial verifications from services
 * (avoiding circular dependencies with hooks)
 */

import { alertaService } from '../services/alerta.service';
import { proyectoService } from '../services/proyecto.service';
import { localStorageService } from '../services/localStorage.service';

/**
 * Execute all financial verifications for a project
 */
async function ejecutarVerificacionesCompletas(
  proyectoId: string,
  contexto?: {
    faseNumero?: number;
    progresoFase?: number;
  }
): Promise<void> {
  try {
    console.log(`[Financial Verifications] Executing for project ${proyectoId}`);

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
    const faseActual = contexto?.faseNumero || 1;
    const progresoFaseActual = contexto?.progresoFase || 0;

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
      console.log(`[Financial Verifications] Generated ${alertasGeneradas.length} alerts`);
      
      // Log critical alerts
      const alertasCriticas = alertasGeneradas.filter(a => a.prioridad === 'critica');
      if (alertasCriticas.length > 0) {
        console.warn(`[Financial Verifications] ${alertasCriticas.length} CRITICAL alerts!`);
      }
    }
  } catch (error) {
    console.error('[Financial Verifications] Error:', error);
    // Don't throw - verifications should not block the main operation
  }
}

/**
 * Execute verifications after phase completion
 * Requirement: 8.2 - Verify pending collections when phase reaches 100%
 */
export async function ejecutarVerificacionesAlCompletarFase(
  proyectoId: string,
  faseNumero: number,
  progresoFase: number
): Promise<void> {
  console.log(`[Financial Verifications] Phase ${faseNumero} completed at ${progresoFase}%`);
  
  await ejecutarVerificacionesCompletas(proyectoId, {
    faseNumero,
    progresoFase
  });
}

/**
 * Execute verifications after registering an expense
 * Requirement: 8.3 - Detect cost overruns when expenses are registered
 */
export async function ejecutarVerificacionesAlRegistrarGasto(
  proyectoId: string,
  montoGasto: number
): Promise<void> {
  console.log(`[Financial Verifications] Expense registered: €${montoGasto}`);
  
  await ejecutarVerificacionesCompletas(proyectoId);
}

/**
 * Execute verifications after registering a payment collection
 * Requirement: 8.1 - Verify treasury after collecting payment
 */
export async function ejecutarVerificacionesAlRegistrarCobro(
  proyectoId: string,
  montoCobro: number
): Promise<void> {
  console.log(`[Financial Verifications] Payment collected: €${montoCobro}`);
  
  await ejecutarVerificacionesCompletas(proyectoId);
}

/**
 * Execute verifications periodically for all active projects
 * Can be called from a background job or scheduled task
 */
export async function ejecutarVerificacionesPeriodicas(): Promise<void> {
  try {
    console.log('[Financial Verifications] Running periodic verifications...');

    // Get all active projects
    const proyectos = await proyectoService.getProyectosUsuario(undefined, { activos: true });

    // Execute verifications for each project
    for (const proyecto of proyectos) {
      await ejecutarVerificacionesCompletas(proyecto.id);
    }

    console.log(`[Financial Verifications] Completed periodic verifications for ${proyectos.length} projects`);
  } catch (error) {
    console.error('[Financial Verifications] Error in periodic verifications:', error);
  }
}
