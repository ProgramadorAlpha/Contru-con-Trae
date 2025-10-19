/**
 * Tesoreria Service - Task 12.1
 * Requirements: 6.1, 6.2, 6.3, 6.5
 */
import { localStorageService } from './localStorage.service';
import type { Factura } from '../types/factura.types';

interface TesoreriaData {
  proyectoId: string;
  cobros: number;
  gastosPagados: number;
  tesoreria: number;
  ultimaActualizacion: Date;
}

const STORAGE_KEY = 'tesoreria';

class TesoreriaService {
  private getTesoreriaData(): TesoreriaData[] {
    return localStorageService.get<TesoreriaData[]>(STORAGE_KEY, []);
  }

  private saveTesoreriaData(data: TesoreriaData[]): boolean {
    return localStorageService.set(STORAGE_KEY, data);
  }

  /**
   * Calculate tesorería for a project
   * Requirement: 6.1
   * Formula: Sum of cobros - Sum of gastos pagados
   */
  async calcularTesoreria(proyectoId: string): Promise<number> {
    // Get facturas cobradas
    const facturas = localStorageService.get<Factura[]>('facturas', []);
    const facturasProyecto = facturas.filter(
      f => f.proyectoId === proyectoId && f.estado === 'cobrada'
    );
    const cobros = facturasProyecto.reduce((sum, f) => sum + f.total, 0);

    // Get gastos pagados
    const gastos = localStorageService.get<any[]>('gastos', []);
    const gastosProyecto = gastos.filter(
      g => g.proyectoId === proyectoId && g.estado === 'pagado'
    );
    const gastosPagados = gastosProyecto.reduce((sum, g) => sum + g.monto, 0);

    const tesoreria = cobros - gastosPagados;

    // Save tesorería data
    await this.actualizarTesoreria(proyectoId, cobros, gastosPagados, tesoreria);

    return tesoreria;
  }

  /**
   * Get health indicator based on tesorería vs next phase cost
   * Requirements: 6.2, 6.5
   * - Verde: tesorería > 50% of next phase cost
   * - Amarillo: tesorería between 20% and 50%
   * - Rojo: tesorería < 20%
   */
  async getIndicadorSalud(
    proyectoId: string, 
    costoProximaFase: number
  ): Promise<'verde' | 'amarillo' | 'rojo'> {
    const tesoreria = await this.calcularTesoreria(proyectoId);
    
    if (costoProximaFase === 0) return 'verde';
    
    const porcentaje = (tesoreria / costoProximaFase) * 100;
    
    if (porcentaje > 50) return 'verde';
    if (porcentaje > 20) return 'amarillo';
    return 'rojo';
  }

  /**
   * Update tesorería data for a project
   * Requirement: 6.3
   * Called after registering cobro or gasto
   */
  async actualizarTesoreria(
    proyectoId: string,
    cobros?: number,
    gastosPagados?: number,
    tesoreria?: number
  ): Promise<void> {
    const data = this.getTesoreriaData();
    const index = data.findIndex(d => d.proyectoId === proyectoId);

    // If values not provided, calculate them
    if (cobros === undefined || gastosPagados === undefined || tesoreria === undefined) {
      tesoreria = await this.calcularTesoreria(proyectoId);
      
      const facturas = localStorageService.get<Factura[]>('facturas', []);
      const facturasProyecto = facturas.filter(
        f => f.proyectoId === proyectoId && f.estado === 'cobrada'
      );
      cobros = facturasProyecto.reduce((sum, f) => sum + f.total, 0);

      const gastos = localStorageService.get<any[]>('gastos', []);
      const gastosProyecto = gastos.filter(
        g => g.proyectoId === proyectoId && g.estado === 'pagado'
      );
      gastosPagados = gastosProyecto.reduce((sum, g) => sum + g.monto, 0);
    }

    const tesoreriaData: TesoreriaData = {
      proyectoId,
      cobros,
      gastosPagados,
      tesoreria,
      ultimaActualizacion: new Date()
    };

    if (index === -1) {
      data.push(tesoreriaData);
    } else {
      data[index] = tesoreriaData;
    }

    this.saveTesoreriaData(data);
  }

  /**
   * Get tesorería data for a project
   * Requirement: 6.4
   */
  async getTesoreriaProyecto(proyectoId: string): Promise<TesoreriaData | null> {
    const data = this.getTesoreriaData();
    const tesoreriaData = data.find(d => d.proyectoId === proyectoId);
    
    if (!tesoreriaData) {
      // Calculate and save if not exists
      const tesoreria = await this.calcularTesoreria(proyectoId);
      return data.find(d => d.proyectoId === proyectoId) || null;
    }
    
    return tesoreriaData;
  }

  /**
   * Get desglose of cobros and gastos
   * Requirement: 6.4
   */
  async getDesglose(proyectoId: string): Promise<{
    cobros: Array<{ concepto: string; monto: number; fecha: Date }>;
    gastos: Array<{ concepto: string; monto: number; fecha: Date }>;
  }> {
    const facturas = localStorageService.get<Factura[]>('facturas', []);
    const facturasProyecto = facturas.filter(
      f => f.proyectoId === proyectoId && f.estado === 'cobrada'
    );
    
    const cobros = facturasProyecto.map(f => ({
      concepto: `Factura ${f.numero}`,
      monto: f.total,
      fecha: f.fechaCobro ? (f.fechaCobro.toDate ? f.fechaCobro.toDate() : new Date(f.fechaCobro as any)) : new Date()
    }));

    const gastosData = localStorageService.get<any[]>('gastos', []);
    const gastosProyecto = gastosData.filter(
      g => g.proyectoId === proyectoId && g.estado === 'pagado'
    );
    
    const gastos = gastosProyecto.map(g => ({
      concepto: g.concepto || g.descripcion || 'Gasto',
      monto: g.monto,
      fecha: g.fechaPago ? (g.fechaPago.toDate ? g.fechaPago.toDate() : new Date(g.fechaPago as any)) : new Date()
    }));

    return { cobros, gastos };
  }

  /**
   * Get total tesorería across all projects
   */
  async getTesoreriaTotal(): Promise<number> {
    const data = this.getTesoreriaData();
    return data.reduce((sum, d) => sum + d.tesoreria, 0);
  }
}

export const tesoreriaService = new TesoreriaService();
export default tesoreriaService;
