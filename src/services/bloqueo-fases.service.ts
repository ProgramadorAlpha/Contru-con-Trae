/**
 * Bloqueo de Fases Service - Task 13.1
 * Requirements: 7.1, 7.2, 7.3, 7.5
 * 
 * Servicio para gestionar el bloqueo automático de fases basado en cobros
 */

import { localStorageService } from './localStorage.service';
import type { Factura } from '../types/factura.types';

interface BloqueoFase {
  proyectoId: string;
  faseNumero: number;
  bloqueada: boolean;
  motivo?: string;
  fechaBloqueo?: Date;
  fechaDesbloqueo?: Date;
  bloqueadoPor?: 'sistema' | 'usuario';
  puedeForza: boolean;
}

interface AuditoriaDesbloqueo {
  id: string;
  proyectoId: string;
  faseNumero: number;
  usuario: string;
  fecha: Date;
  motivo: string;
  forzado: boolean;
}

const STORAGE_KEY_BLOQUEOS = 'bloqueos_fases';
const STORAGE_KEY_AUDITORIA = 'auditoria_desbloqueos';

class BloqueoFasesService {
  /**
   * Validate if a phase can be started
   * Requirement: 7.1, 7.3
   * 
   * Verifies that the previous phase has been paid before allowing start
   */
  async validarInicioFase(proyectoId: string, faseNumero: number): Promise<{
    puedeIniciar: boolean;
    motivo?: string;
  }> {
    // Fase 1 can always start (only requires adelanto which is checked elsewhere)
    if (faseNumero === 1) {
      return { puedeIniciar: true };
    }

    // Check if previous phase is completed and paid
    const faseAnterior = faseNumero - 1;
    
    // Get facturas for the project
    const facturas = localStorageService.get<Factura[]>('facturas', []);
    const facturaFaseAnterior = facturas.find(
      f => f.proyectoId === proyectoId && 
           f.faseVinculada === faseAnterior &&
           f.estado === 'cobrada'
    );

    if (!facturaFaseAnterior) {
      return {
        puedeIniciar: false,
        motivo: `Pendiente cobro Fase ${faseAnterior}`
      };
    }

    return { puedeIniciar: true };
  }

  /**
   * Block a phase
   * Requirement: 7.3, 7.4
   */
  async bloquearFase(
    proyectoId: string,
    faseNumero: number,
    motivo: string,
    bloqueadoPor: 'sistema' | 'usuario' = 'sistema'
  ): Promise<BloqueoFase> {
    const bloqueos = this.getBloqueos();
    
    // Check if already blocked
    const existingIndex = bloqueos.findIndex(
      b => b.proyectoId === proyectoId && b.faseNumero === faseNumero
    );

    const bloqueo: BloqueoFase = {
      proyectoId,
      faseNumero,
      bloqueada: true,
      motivo,
      fechaBloqueo: new Date(),
      bloqueadoPor,
      puedeForza: true
    };

    if (existingIndex >= 0) {
      bloqueos[existingIndex] = bloqueo;
    } else {
      bloqueos.push(bloqueo);
    }

    this.saveBloqueos(bloqueos);
    return bloqueo;
  }

  /**
   * Unblock a phase
   * Requirement: 7.5
   */
  async desbloquearFase(
    proyectoId: string,
    faseNumero: number,
    usuario?: string,
    forzado: boolean = false
  ): Promise<boolean> {
    const bloqueos = this.getBloqueos();
    
    const index = bloqueos.findIndex(
      b => b.proyectoId === proyectoId && b.faseNumero === faseNumero
    );

    if (index === -1) {
      return false; // Not blocked
    }

    // Update bloqueo
    bloqueos[index].bloqueada = false;
    bloqueos[index].fechaDesbloqueo = new Date();

    this.saveBloqueos(bloqueos);

    // Register in audit if forced
    if (forzado && usuario) {
      await this.registrarAuditoriaDesbloqueo(
        proyectoId,
        faseNumero,
        usuario,
        'Desbloqueo forzado por usuario',
        true
      );
    }

    return true;
  }

  /**
   * Verify and block phases after completing a phase
   * Requirement: 7.1, 7.2, 7.3
   * Task 16.3: Execute financial verifications after phase completion
   * 
   * Called when a phase reaches 100% completion
   */
  async verificarYBloquearFases(proyectoId: string, faseCompletada: number): Promise<void> {
    // Get facturas for the project
    const facturas = localStorageService.get<Factura[]>('facturas', []);
    
    // Check if there's an invoice for the completed phase
    const facturaFase = facturas.find(
      f => f.proyectoId === proyectoId && f.faseVinculada === faseCompletada
    );

    // If no invoice exists, it should be generated (handled by factura service)
    // If invoice exists but not paid, block next phase
    if (!facturaFase || facturaFase.estado !== 'cobrada') {
      const siguienteFase = faseCompletada + 1;
      await this.bloquearFase(
        proyectoId,
        siguienteFase,
        `Pendiente cobro Fase ${faseCompletada}`,
        'sistema'
      );
    }

    // Task 16.3: Execute financial verifications after phase completion
    // Requirements: 8.1, 8.2, 8.3, 8.4
    try {
      const { ejecutarVerificacionesAlCompletarFase } = await import('../utils/financial-verifications.utils');
      await ejecutarVerificacionesAlCompletarFase(proyectoId, faseCompletada, 100);
    } catch (error) {
      console.error('Error executing financial verifications:', error);
      // Don't fail the phase completion if verifications fail
    }
  }

  /**
   * Check if a phase is blocked
   */
  async estaFaseBloqueada(proyectoId: string, faseNumero: number): Promise<{
    bloqueada: boolean;
    motivo?: string;
    puedeForza: boolean;
  }> {
    const bloqueos = this.getBloqueos();
    
    const bloqueo = bloqueos.find(
      b => b.proyectoId === proyectoId && 
           b.faseNumero === faseNumero &&
           b.bloqueada
    );

    if (!bloqueo) {
      return { bloqueada: false, puedeForza: false };
    }

    return {
      bloqueada: true,
      motivo: bloqueo.motivo,
      puedeForza: bloqueo.puedeForza
    };
  }

  /**
   * Get all blocked phases for a project
   */
  async getFasesBloqueadas(proyectoId: string): Promise<BloqueoFase[]> {
    const bloqueos = this.getBloqueos();
    return bloqueos.filter(
      b => b.proyectoId === proyectoId && b.bloqueada
    );
  }

  /**
   * Automatically unblock next phase when invoice is paid
   * Requirement: 7.5
   */
  async desbloquearSiguienteFaseSiCorresponde(
    proyectoId: string,
    faseVinculada: number
  ): Promise<void> {
    const siguienteFase = faseVinculada + 1;
    
    // Check if next phase is blocked due to this phase
    const bloqueos = this.getBloqueos();
    const bloqueo = bloqueos.find(
      b => b.proyectoId === proyectoId && 
           b.faseNumero === siguienteFase &&
           b.bloqueada &&
           b.motivo?.includes(`Fase ${faseVinculada}`)
    );

    if (bloqueo) {
      await this.desbloquearFase(proyectoId, siguienteFase);
    }
  }

  /**
   * Force unblock a phase with audit trail
   * Requirement: 7.6
   */
  async forzarDesbloqueo(
    proyectoId: string,
    faseNumero: number,
    usuario: string,
    motivo: string
  ): Promise<boolean> {
    const bloqueos = this.getBloqueos();
    
    const index = bloqueos.findIndex(
      b => b.proyectoId === proyectoId && b.faseNumero === faseNumero
    );

    if (index === -1) {
      return false; // Not blocked
    }

    // Update bloqueo
    bloqueos[index].bloqueada = false;
    bloqueos[index].fechaDesbloqueo = new Date();

    this.saveBloqueos(bloqueos);

    // Register in audit with custom motivo
    await this.registrarAuditoriaDesbloqueo(
      proyectoId,
      faseNumero,
      usuario,
      motivo,
      true
    );

    return true;
  }

  /**
   * Register forced unblock in audit trail
   */
  private async registrarAuditoriaDesbloqueo(
    proyectoId: string,
    faseNumero: number,
    usuario: string,
    motivo: string,
    forzado: boolean
  ): Promise<void> {
    const auditoria = this.getAuditoria();
    
    const registro: AuditoriaDesbloqueo = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      proyectoId,
      faseNumero,
      usuario,
      fecha: new Date(),
      motivo,
      forzado
    };

    auditoria.push(registro);
    this.saveAuditoria(auditoria);
  }

  /**
   * Get audit trail for a project
   */
  async getAuditoriaProyecto(proyectoId: string): Promise<AuditoriaDesbloqueo[]> {
    const auditoria = this.getAuditoria();
    return auditoria.filter(a => a.proyectoId === proyectoId);
  }

  /**
   * Get all blocks
   */
  private getBloqueos(): BloqueoFase[] {
    return localStorageService.get<BloqueoFase[]>(STORAGE_KEY_BLOQUEOS, []);
  }

  /**
   * Save blocks
   */
  private saveBloqueos(bloqueos: BloqueoFase[]): boolean {
    return localStorageService.set(STORAGE_KEY_BLOQUEOS, bloqueos);
  }

  /**
   * Get audit trail
   */
  private getAuditoria(): AuditoriaDesbloqueo[] {
    return localStorageService.get<AuditoriaDesbloqueo[]>(STORAGE_KEY_AUDITORIA, []);
  }

  /**
   * Save audit trail
   */
  private saveAuditoria(auditoria: AuditoriaDesbloqueo[]): boolean {
    return localStorageService.set(STORAGE_KEY_AUDITORIA, auditoria);
  }

  /**
   * Clear all blocks for a project (for testing/admin)
   */
  async limpiarBloqueosProyecto(proyectoId: string): Promise<void> {
    const bloqueos = this.getBloqueos();
    const bloqueosActualizados = bloqueos.filter(b => b.proyectoId !== proyectoId);
    this.saveBloqueos(bloqueosActualizados);
  }
}

export const bloqueoFasesService = new BloqueoFasesService();
export default bloqueoFasesService;
