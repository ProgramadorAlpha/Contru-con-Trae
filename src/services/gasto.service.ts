/**
 * Gasto Service
 * 
 * Service for managing expenses with localStorage persistence.
 */

import { localStorageService } from './localStorage.service';

const STORAGE_KEY = 'gastos';

export interface Gasto {
  id: string;
  proyecto_id: string;
  documento_id?: string;
  categoria: string;
  concepto: string;
  monto: number;
  fecha: string;
  proveedor?: string;
  folio?: string;
  metodo_pago?: string;
  referencia?: string;
  aprobado?: boolean;
  aprobado_por?: string;
  fecha_aprobacion?: string;
  creado_por?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGastoDTO {
  proyecto_id: string;
  documento_id?: string;
  categoria: string;
  concepto: string;
  monto: number;
  fecha: string;
  proveedor?: string;
  folio?: string;
  metodo_pago?: string;
  referencia?: string;
  usuario_id?: string;
}

export interface UpdateGastoDTO {
  categoria?: string;
  concepto?: string;
  monto?: number;
  fecha?: string;
  proveedor?: string;
  folio?: string;
  metodo_pago?: string;
  referencia?: string;
  aprobado?: boolean;
}

class GastoService {
  /**
   * Get all gastos from localStorage
   */
  private getGastos(): Gasto[] {
    return localStorageService.get<Gasto[]>(STORAGE_KEY, []);
  }

  /**
   * Save gastos to localStorage
   */
  private saveGastos(gastos: Gasto[]): void {
    localStorageService.set(STORAGE_KEY, gastos);
    console.log('✅ Gastos persisted to localStorage');
  }

  /**
   * Create a new gasto
   * Task 16.3: Execute financial verifications after registering expense
   */
  async createGasto(data: CreateGastoDTO): Promise<Gasto> {
    try {
      const gastos = this.getGastos();

      const newGasto: Gasto = {
        id: `gasto-${Date.now()}`,
        proyecto_id: data.proyecto_id,
        documento_id: data.documento_id,
        categoria: data.categoria,
        concepto: data.concepto,
        monto: data.monto,
        fecha: data.fecha,
        proveedor: data.proveedor,
        folio: data.folio,
        metodo_pago: data.metodo_pago,
        referencia: data.referencia,
        aprobado: false,
        creado_por: data.usuario_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      gastos.push(newGasto);
      this.saveGastos(gastos);

      console.log('✅ Gasto created with projectId:', data.proyecto_id, newGasto);

      // Task 16.3: Execute financial verifications after registering expense
      // Requirements: 8.1, 8.2, 8.3, 8.4
      try {
        const { ejecutarVerificacionesAlRegistrarGasto } = await import('../utils/financial-verifications.utils');
        await ejecutarVerificacionesAlRegistrarGasto(data.proyecto_id, data.monto);
      } catch (error) {
        console.error('Error executing financial verifications:', error);
        // Don't fail the expense registration if verifications fail
      }

      return newGasto;
    } catch (error) {
      console.error('Error creating gasto:', error);
      throw error;
    }
  }

  /**
   * Get all gastos
   */
  async getAllGastos(filtros?: {
    proyecto_id?: string;
    categoria?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    aprobado?: boolean;
  }): Promise<Gasto[]> {
    try {
      let gastos = this.getGastos();

      // Apply filters
      if (filtros?.proyecto_id) {
        gastos = gastos.filter(g => g.proyecto_id === filtros.proyecto_id);
      }

      if (filtros?.categoria) {
        gastos = gastos.filter(g => g.categoria === filtros.categoria);
      }

      if (filtros?.fecha_desde) {
        gastos = gastos.filter(g => g.fecha >= filtros.fecha_desde!);
      }

      if (filtros?.fecha_hasta) {
        gastos = gastos.filter(g => g.fecha <= filtros.fecha_hasta!);
      }

      if (filtros?.aprobado !== undefined) {
        gastos = gastos.filter(g => g.aprobado === filtros.aprobado);
      }

      // Sort by date descending
      gastos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      return gastos;
    } catch (error) {
      console.error('Error getting gastos:', error);
      throw error;
    }
  }

  /**
   * Get gasto by ID
   */
  async getGastoById(id: string): Promise<Gasto | null> {
    try {
      const gastos = this.getGastos();
      return gastos.find(g => g.id === id) || null;
    } catch (error) {
      console.error('Error getting gasto:', error);
      throw error;
    }
  }

  /**
   * Get gastos by project
   */
  async getGastosByProyecto(proyectoId: string): Promise<Gasto[]> {
    try {
      return this.getAllGastos({ proyecto_id: proyectoId });
    } catch (error) {
      console.error('Error getting gastos by project:', error);
      throw error;
    }
  }

  /**
   * Update gasto
   */
  async updateGasto(id: string, data: UpdateGastoDTO): Promise<Gasto> {
    try {
      const gastos = this.getGastos();
      const index = gastos.findIndex(g => g.id === id);

      if (index === -1) {
        throw new Error('Gasto not found');
      }

      // Update gasto
      gastos[index] = {
        ...gastos[index],
        ...data,
        updated_at: new Date().toISOString()
      };

      this.saveGastos(gastos);

      console.log('✅ Gasto updated:', gastos[index]);

      return gastos[index];
    } catch (error) {
      console.error('Error updating gasto:', error);
      throw error;
    }
  }

  /**
   * Approve gasto
   */
  async approveGasto(id: string, userId: string): Promise<Gasto> {
    try {
      const gastos = this.getGastos();
      const index = gastos.findIndex(g => g.id === id);

      if (index === -1) {
        throw new Error('Gasto not found');
      }

      gastos[index] = {
        ...gastos[index],
        aprobado: true,
        aprobado_por: userId,
        fecha_aprobacion: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.saveGastos(gastos);

      console.log('✅ Gasto approved:', gastos[index]);

      return gastos[index];
    } catch (error) {
      console.error('Error approving gasto:', error);
      throw error;
    }
  }

  /**
   * Delete gasto
   */
  async deleteGasto(id: string): Promise<void> {
    try {
      const gastos = this.getGastos();
      const index = gastos.findIndex(g => g.id === id);

      if (index === -1) {
        throw new Error('Gasto not found');
      }

      gastos.splice(index, 1);
      this.saveGastos(gastos);

      console.log('✅ Gasto deleted:', id);
    } catch (error) {
      console.error('Error deleting gasto:', error);
      throw error;
    }
  }

  /**
   * Get total gastos for a project
   */
  async getTotalGastosByProyecto(proyectoId: string): Promise<number> {
    try {
      const gastos = await this.getGastosByProyecto(proyectoId);
      return gastos.reduce((total, gasto) => total + gasto.monto, 0);
    } catch (error) {
      console.error('Error getting total gastos:', error);
      throw error;
    }
  }

  /**
   * Get gastos statistics for a project
   */
  async getEstadisticasGastos(proyectoId: string): Promise<{
    total: number;
    count: number;
    promedio: number;
    aprobados: number;
    pendientes: number;
    por_categoria: Record<string, number>;
  }> {
    try {
      const gastos = await this.getGastosByProyecto(proyectoId);

      const stats = {
        total: 0,
        count: gastos.length,
        promedio: 0,
        aprobados: 0,
        pendientes: 0,
        por_categoria: {} as Record<string, number>
      };

      gastos.forEach(gasto => {
        stats.total += gasto.monto;

        if (gasto.aprobado) {
          stats.aprobados += gasto.monto;
        } else {
          stats.pendientes += gasto.monto;
        }

        stats.por_categoria[gasto.categoria] = (stats.por_categoria[gasto.categoria] || 0) + gasto.monto;
      });

      stats.promedio = stats.count > 0 ? stats.total / stats.count : 0;

      return stats;
    } catch (error) {
      console.error('Error getting gastos statistics:', error);
      throw error;
    }
  }

  /**
   * Link gasto to document
   */
  async linkToDocument(gastoId: string, documentoId: string): Promise<Gasto> {
    try {
      return this.updateGasto(gastoId, { documento_id: documentoId } as UpdateGastoDTO);
    } catch (error) {
      console.error('Error linking gasto to document:', error);
      throw error;
    }
  }

  /**
   * Export gastos data
   */
  exportData(): Gasto[] {
    return this.getGastos();
  }

  /**
   * Import gastos data
   */
  importData(gastos: Gasto[]): boolean {
    try {
      this.saveGastos(gastos);
      return true;
    } catch (error) {
      console.error('Error importing gastos:', error);
      return false;
    }
  }

  /**
   * Clear all gastos (use with caution)
   */
  clearAll(): boolean {
    try {
      localStorageService.remove(STORAGE_KEY);
      console.log('✅ All gastos cleared');
      return true;
    } catch (error) {
      console.error('Error clearing gastos:', error);
      return false;
    }
  }
}

// Export singleton instance
export const gastoService = new GastoService();
export default gastoService;
