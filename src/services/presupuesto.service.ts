/**
 * Presupuesto Service
 * Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 3.7
 * Task: 6.1
 */

import { localStorageService } from './localStorage.service';
import { Timestamp } from 'firebase/firestore';
import type { Presupuesto } from '../types/presupuesto.types';
import { generarNumeroPresupuesto, estaExpirado } from '../utils/presupuesto.utils';

const STORAGE_KEY = 'presupuestos';

class PresupuestoService {
  private getPresupuestos(): Presupuesto[] {
    return localStorageService.get<Presupuesto[]>(STORAGE_KEY, []);
  }

  private savePresupuestos(presupuestos: Presupuesto[]): boolean {
    return localStorageService.set(STORAGE_KEY, presupuestos);
  }

  async createPresupuesto(data: Omit<Presupuesto, 'id' | 'numero' | 'createdAt' | 'updatedAt'>): Promise<Presupuesto> {
    const presupuestos = this.getPresupuestos();
    const ultimoNumero = presupuestos.length > 0 ? presupuestos[presupuestos.length - 1].numero : undefined;
    
    const nuevoPresupuesto: Presupuesto = {
      ...data,
      id: `pres_${Date.now()}`,
      numero: generarNumeroPresupuesto(ultimoNumero),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    presupuestos.push(nuevoPresupuesto);
    this.savePresupuestos(presupuestos);
    return nuevoPresupuesto;
  }

  async updatePresupuesto(id: string, updates: Partial<Presupuesto>): Promise<Presupuesto> {
    const presupuestos = this.getPresupuestos();
    const index = presupuestos.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Presupuesto no encontrado');

    presupuestos[index] = {
      ...presupuestos[index],
      ...updates,
      updatedAt: Timestamp.now()
    };

    this.savePresupuestos(presupuestos);
    return presupuestos[index];
  }

  async getPresupuesto(id: string): Promise<Presupuesto | null> {
    const presupuestos = this.getPresupuestos();
    return presupuestos.find(p => p.id === id) || null;
  }

  async getPresupuestosAll(): Promise<Presupuesto[]> {
    return this.getPresupuestos();
  }

  async enviarPresupuesto(id: string): Promise<Presupuesto> {
    return this.updatePresupuesto(id, {
      estado: 'enviado',
      estadoDetalle: {
        ...((await this.getPresupuesto(id))?.estadoDetalle || {}),
        enviadoCliente: true,
        fechaEnvio: Timestamp.now()
      } as any
    });
  }

  async aprobarPresupuesto(id: string): Promise<Presupuesto> {
    return this.updatePresupuesto(id, {
      estado: 'aprobado',
      estadoDetalle: {
        ...((await this.getPresupuesto(id))?.estadoDetalle || {}),
        fechaAprobacion: Timestamp.now()
      } as any
    });
  }

  async rechazarPresupuesto(id: string, motivo: string): Promise<Presupuesto> {
    return this.updatePresupuesto(id, {
      estado: 'rechazado',
      estadoDetalle: {
        ...((await this.getPresupuesto(id))?.estadoDetalle || {}),
        fechaRechazo: Timestamp.now(),
        motivoRechazo: motivo
      } as any
    });
  }

  async verificarExpiracion(): Promise<void> {
    const presupuestos = this.getPresupuestos();
    const actualizados = presupuestos.map(p => {
      if (p.estado === 'enviado' && estaExpirado(p)) {
        return { ...p, estado: 'expirado' as const };
      }
      return p;
    });
    this.savePresupuestos(actualizados);
  }

  /**
   * Create a new version of an existing presupuesto
   * Requirements: 12.1, 12.2, 12.3
   * Task: 10.1
   * 
   * Creates a copy of the presupuesto with:
   * - Incremented version number
   * - New ID and numero
   * - Estado set to 'borrador'
   * - Links to original presupuesto
   * - Preserves all other data (fases, partidas, cliente, etc.)
   */
  async crearVersionPresupuesto(presupuestoId: string): Promise<Presupuesto> {
    const presupuestoOriginal = await this.getPresupuesto(presupuestoId);
    if (!presupuestoOriginal) {
      throw new Error('Presupuesto original no encontrado');
    }

    // Get all presupuestos to generate new numero
    const presupuestos = this.getPresupuestos();
    const ultimoNumero = presupuestos.length > 0 
      ? presupuestos[presupuestos.length - 1].numero 
      : undefined;

    // Create new version
    const nuevaVersion: Presupuesto = {
      ...presupuestoOriginal,
      id: `pres_${Date.now()}_v${presupuestoOriginal.version + 1}`,
      numero: generarNumeroPresupuesto(ultimoNumero),
      version: presupuestoOriginal.version + 1,
      estado: 'borrador',
      estadoDetalle: {
        enviadoCliente: false,
        convertidoAProyecto: false
      },
      // Clear signatures for new version
      firmas: [],
      // Reset dates
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      // Keep reference to original
      nombre: `${presupuestoOriginal.nombre} (v${presupuestoOriginal.version + 1})`
    };

    presupuestos.push(nuevaVersion);
    this.savePresupuestos(presupuestos);

    return nuevaVersion;
  }

  /**
   * Get all versions of a presupuesto
   * Finds presupuestos with the same base name
   */
  async getVersionesPresupuesto(presupuestoId: string): Promise<Presupuesto[]> {
    const presupuesto = await this.getPresupuesto(presupuestoId);
    if (!presupuesto) return [];

    const presupuestos = this.getPresupuestos();
    
    // Extract base name (remove version suffix if exists)
    const baseName = presupuesto.nombre.replace(/\s*\(v\d+\)$/, '');
    
    // Find all presupuestos with same base name
    return presupuestos
      .filter(p => {
        const pBaseName = p.nombre.replace(/\s*\(v\d+\)$/, '');
        return pBaseName === baseName;
      })
      .sort((a, b) => a.version - b.version);
  }

  /**
   * Mark other versions as obsolete when one is approved
   * Requirement: 12.6
   */
  async marcarVersionesObsoletas(presupuestoAprobadoId: string): Promise<void> {
    const versiones = await this.getVersionesPresupuesto(presupuestoAprobadoId);
    const presupuestos = this.getPresupuestos();

    const actualizados = presupuestos.map(p => {
      // Find if this presupuesto is in the versions list
      const esVersion = versiones.some(v => v.id === p.id);
      
      // If it's a version but not the approved one, mark as obsolete
      if (esVersion && p.id !== presupuestoAprobadoId && p.estado !== 'aprobado') {
        return {
          ...p,
          estado: 'expirado' as const, // Using 'expirado' to represent obsolete
          notas: (p.notas || '') + '\n[Versión obsoleta - Otra versión fue aprobada]'
        };
      }
      return p;
    });

    this.savePresupuestos(actualizados);
  }
}

export const presupuestoService = new PresupuestoService();
export default presupuestoService;
