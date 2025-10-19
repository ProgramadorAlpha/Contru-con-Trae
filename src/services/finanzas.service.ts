/**
 * Finanzas Service - Task 18.3
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */
import { localStorageService } from './localStorage.service';
import { tesoreriaService } from './tesoreria.service';
import type { FinanzasMetricas } from '../types/rentabilidad.types';
import type { Factura } from '../types/factura.types';

interface MetricasCache {
  metricas: FinanzasMetricas;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'finanzas_metricas_cache';

class FinanzasService {
  private cache: MetricasCache | null = null;

  /**
   * Calculate consolidated financial metrics
   * Requirements: 10.1, 10.2, 10.3, 10.4
   * Implements 5-minute cache for performance
   */
  async calcularMetricasFinanzas(): Promise<FinanzasMetricas> {
    // Check cache
    if (this.cache && Date.now() - this.cache.timestamp < CACHE_DURATION) {
      return this.cache.metricas;
    }

    // Get all projects
    const proyectos = localStorageService.get<any[]>('proyectos', []);
    const proyectosActivos = proyectos.filter(p => p.estado === 'activo' || p.estado === 'en_progreso');

    // Calculate ingresos totales (from facturas cobradas)
    const facturas = localStorageService.get<Factura[]>('facturas', []);
    const facturasActivas = facturas.filter(f => 
      proyectosActivos.some(p => p.id === f.proyectoId)
    );
    
    const ingresosTotales = facturasActivas
      .filter(f => f.estado === 'cobrada')
      .reduce((sum, f) => sum + f.total, 0);

    // Calculate gastos totales (from gastos pagados)
    const gastos = localStorageService.get<any[]>('gastos', []);
    const gastosActivos = gastos.filter(g => 
      proyectosActivos.some(p => p.id === g.proyectoId)
    );
    
    const gastosTotales = gastosActivos
      .filter(g => g.estado === 'pagado')
      .reduce((sum, g) => sum + g.monto, 0);

    // Calculate utilidad neta
    const utilidadNeta = ingresosTotales - gastosTotales;

    // Calculate variación porcentaje (vs previous period - simplified)
    const variacionPorcentaje = ingresosTotales > 0 
      ? ((utilidadNeta / ingresosTotales) * 100) 
      : 0;

    // Calculate pagos pendientes
    const pagosPendientes = facturasActivas
      .filter(f => f.estado === 'enviada' || f.estado === 'borrador')
      .reduce((sum, f) => sum + f.total, 0);

    // Calculate pagos que vencen hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const pagosVencenHoy = facturasActivas.filter(f => {
      if (f.estado !== 'enviada') return false;
      const fechaVencimiento = f.fechaVencimiento.toDate 
        ? f.fechaVencimiento.toDate() 
        : new Date(f.fechaVencimiento as any);
      return fechaVencimiento >= hoy && fechaVencimiento < manana;
    }).length;

    // Calculate margen bruto promedio
    let margenBrutoPromedio = 0;
    if (proyectosActivos.length > 0) {
      const margenes = proyectosActivos.map(p => {
        const ingresosProyecto = facturasActivas
          .filter(f => f.proyectoId === p.id && f.estado === 'cobrada')
          .reduce((sum, f) => sum + f.total, 0);
        
        const gastosProyecto = gastosActivos
          .filter(g => g.proyectoId === p.id && g.estado === 'pagado')
          .reduce((sum, g) => sum + g.monto, 0);
        
        const margen = ingresosProyecto - gastosProyecto;
        return ingresosProyecto > 0 ? (margen / ingresosProyecto) * 100 : 0;
      });
      
      margenBrutoPromedio = margenes.reduce((sum, m) => sum + m, 0) / margenes.length;
    }

    // Get tesorería total
    const tesoreriaTotal = await tesoreriaService.getTesoreriaTotal();

    const metricas: FinanzasMetricas = {
      ingresosTotales,
      gastosTotales,
      utilidadNeta,
      variacionPorcentaje,
      pagosPendientes,
      pagosVencenHoy,
      margenBrutoPromedio,
      tesoreriaTotal
    };

    // Update cache
    this.cache = {
      metricas,
      timestamp: Date.now()
    };

    // Save to localStorage for persistence
    localStorageService.set(CACHE_KEY, this.cache);

    return metricas;
  }

  /**
   * Clear metrics cache
   */
  clearCache(): void {
    this.cache = null;
    localStorageService.remove(CACHE_KEY);
  }

  /**
   * Get metrics by project
   */
  async getMetricasProyecto(proyectoId: string): Promise<{
    ingresos: number;
    gastos: number;
    utilidad: number;
    margen: number;
  }> {
    const facturas = localStorageService.get<Factura[]>('facturas', []);
    const facturasProyecto = facturas.filter(
      f => f.proyectoId === proyectoId && f.estado === 'cobrada'
    );
    const ingresos = facturasProyecto.reduce((sum, f) => sum + f.total, 0);

    const gastos = localStorageService.get<any[]>('gastos', []);
    const gastosProyecto = gastos.filter(
      g => g.proyectoId === proyectoId && g.estado === 'pagado'
    );
    const gastosTotal = gastosProyecto.reduce((sum, g) => sum + g.monto, 0);

    const utilidad = ingresos - gastosTotal;
    const margen = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;

    return {
      ingresos,
      gastos: gastosTotal,
      utilidad,
      margen
    };
  }

  /**
   * Get facturas pendientes de cobro
   */
  async getFacturasPendientes(): Promise<Factura[]> {
    const facturas = localStorageService.get<Factura[]>('facturas', []);
    return facturas.filter(f => f.estado === 'enviada');
  }

  /**
   * Get facturas vencidas
   */
  async getFacturasVencidas(): Promise<Factura[]> {
    const facturas = localStorageService.get<Factura[]>('facturas', []);
    const hoy = new Date();
    
    return facturas.filter(f => {
      if (f.estado !== 'enviada') return false;
      const fechaVencimiento = f.fechaVencimiento.toDate 
        ? f.fechaVencimiento.toDate() 
        : new Date(f.fechaVencimiento as any);
      return fechaVencimiento < hoy;
    });
  }
}

export const finanzasService = new FinanzasService();
export default finanzasService;
