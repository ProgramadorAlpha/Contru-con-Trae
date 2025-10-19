/**
 * Ingreso Service
 * 
 * Service for managing income/revenue entries with localStorage persistence.
 */

import { localStorageService } from './localStorage.service';

const STORAGE_KEY = 'ingresos';

export interface Ingreso {
  id: string;
  proyecto_id: string;
  monto: number;
  fecha: string;
  descripcion?: string;
  categoria?: string;
  metodo_pago?: string;
  referencia?: string;
  facturado?: boolean;
  folio_factura?: string;
  creado_por?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIngresoDTO {
  proyecto_id: string;
  monto: number;
  fecha: string;
  descripcion?: string;
  categoria?: string;
  metodo_pago?: string;
  referencia?: string;
  facturado?: boolean;
  folio_factura?: string;
  usuario_id?: string;
}

export interface UpdateIngresoDTO {
  monto?: number;
  fecha?: string;
  descripcion?: string;
  categoria?: string;
  metodo_pago?: string;
  referencia?: string;
  facturado?: boolean;
  folio_factura?: string;
}

class IngresoService {
  /**
   * Get all ingresos from localStorage
   */
  private getIngresos(): Ingreso[] {
    return localStorageService.get<Ingreso[]>(STORAGE_KEY, []);
  }

  /**
   * Save ingresos to localStorage
   */
  private saveIngresos(ingresos: Ingreso[]): void {
    localStorageService.set(STORAGE_KEY, ingresos);
    console.log('✅ Ingresos persisted to localStorage');
  }

  /**
   * Create a new ingreso
   */
  async createIngreso(data: CreateIngresoDTO): Promise<Ingreso> {
    try {
      const ingresos = this.getIngresos();

      const newIngreso: Ingreso = {
        id: `ingreso-${Date.now()}`,
        proyecto_id: data.proyecto_id,
        monto: data.monto,
        fecha: data.fecha,
        descripcion: data.descripcion,
        categoria: data.categoria || 'General',
        metodo_pago: data.metodo_pago,
        referencia: data.referencia,
        facturado: data.facturado || false,
        folio_factura: data.folio_factura,
        creado_por: data.usuario_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      ingresos.push(newIngreso);
      this.saveIngresos(ingresos);

      console.log('✅ Ingreso created with projectId:', data.proyecto_id, newIngreso);

      return newIngreso;
    } catch (error) {
      console.error('Error creating ingreso:', error);
      throw error;
    }
  }

  /**
   * Get all ingresos
   */
  async getAllIngresos(filtros?: {
    proyecto_id?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    categoria?: string;
  }): Promise<Ingreso[]> {
    try {
      let ingresos = this.getIngresos();

      // Apply filters
      if (filtros?.proyecto_id) {
        ingresos = ingresos.filter(i => i.proyecto_id === filtros.proyecto_id);
      }

      if (filtros?.fecha_desde) {
        ingresos = ingresos.filter(i => i.fecha >= filtros.fecha_desde!);
      }

      if (filtros?.fecha_hasta) {
        ingresos = ingresos.filter(i => i.fecha <= filtros.fecha_hasta!);
      }

      if (filtros?.categoria) {
        ingresos = ingresos.filter(i => i.categoria === filtros.categoria);
      }

      // Sort by date descending
      ingresos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      return ingresos;
    } catch (error) {
      console.error('Error getting ingresos:', error);
      throw error;
    }
  }

  /**
   * Get ingreso by ID
   */
  async getIngresoById(id: string): Promise<Ingreso | null> {
    try {
      const ingresos = this.getIngresos();
      return ingresos.find(i => i.id === id) || null;
    } catch (error) {
      console.error('Error getting ingreso:', error);
      throw error;
    }
  }

  /**
   * Get ingresos by project
   */
  async getIngresosByProyecto(proyectoId: string): Promise<Ingreso[]> {
    try {
      return this.getAllIngresos({ proyecto_id: proyectoId });
    } catch (error) {
      console.error('Error getting ingresos by project:', error);
      throw error;
    }
  }

  /**
   * Update ingreso
   */
  async updateIngreso(id: string, data: UpdateIngresoDTO): Promise<Ingreso> {
    try {
      const ingresos = this.getIngresos();
      const index = ingresos.findIndex(i => i.id === id);

      if (index === -1) {
        throw new Error('Ingreso not found');
      }

      // Update ingreso
      ingresos[index] = {
        ...ingresos[index],
        ...data,
        updated_at: new Date().toISOString()
      };

      this.saveIngresos(ingresos);

      console.log('✅ Ingreso updated:', ingresos[index]);

      return ingresos[index];
    } catch (error) {
      console.error('Error updating ingreso:', error);
      throw error;
    }
  }

  /**
   * Delete ingreso
   */
  async deleteIngreso(id: string): Promise<void> {
    try {
      const ingresos = this.getIngresos();
      const index = ingresos.findIndex(i => i.id === id);

      if (index === -1) {
        throw new Error('Ingreso not found');
      }

      ingresos.splice(index, 1);
      this.saveIngresos(ingresos);

      console.log('✅ Ingreso deleted:', id);
    } catch (error) {
      console.error('Error deleting ingreso:', error);
      throw error;
    }
  }

  /**
   * Get total ingresos for a project
   */
  async getTotalIngresosByProyecto(proyectoId: string): Promise<number> {
    try {
      const ingresos = await this.getIngresosByProyecto(proyectoId);
      return ingresos.reduce((total, ingreso) => total + ingreso.monto, 0);
    } catch (error) {
      console.error('Error getting total ingresos:', error);
      throw error;
    }
  }

  /**
   * Get ingresos statistics for a project
   */
  async getEstadisticasIngresos(proyectoId: string): Promise<{
    total: number;
    count: number;
    promedio: number;
    facturados: number;
    no_facturados: number;
    por_categoria: Record<string, number>;
  }> {
    try {
      const ingresos = await this.getIngresosByProyecto(proyectoId);

      const stats = {
        total: 0,
        count: ingresos.length,
        promedio: 0,
        facturados: 0,
        no_facturados: 0,
        por_categoria: {} as Record<string, number>
      };

      ingresos.forEach(ingreso => {
        stats.total += ingreso.monto;

        if (ingreso.facturado) {
          stats.facturados += ingreso.monto;
        } else {
          stats.no_facturados += ingreso.monto;
        }

        const categoria = ingreso.categoria || 'General';
        stats.por_categoria[categoria] = (stats.por_categoria[categoria] || 0) + ingreso.monto;
      });

      stats.promedio = stats.count > 0 ? stats.total / stats.count : 0;

      return stats;
    } catch (error) {
      console.error('Error getting ingresos statistics:', error);
      throw error;
    }
  }

  /**
   * Export ingresos data
   */
  exportData(): Ingreso[] {
    return this.getIngresos();
  }

  /**
   * Import ingresos data
   */
  importData(ingresos: Ingreso[]): boolean {
    try {
      this.saveIngresos(ingresos);
      return true;
    } catch (error) {
      console.error('Error importing ingresos:', error);
      return false;
    }
  }

  /**
   * Clear all ingresos (use with caution)
   */
  clearAll(): boolean {
    try {
      localStorageService.remove(STORAGE_KEY);
      console.log('✅ All ingresos cleared');
      return true;
    } catch (error) {
      console.error('Error clearing ingresos:', error);
      return false;
    }
  }
}

// Export singleton instance
export const ingresoService = new IngresoService();
export default ingresoService;
