/**
 * Rentabilidad Service - Task 19.1
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 * 
 * Calculates profitability analysis when a project is completed
 */
import { Timestamp } from 'firebase/firestore';
import { localStorageService } from './localStorage.service';
import type { 
  AnalisisRentabilidad, 
  IngresosRentabilidad,
  CostosDirectos,
  GastosOperativos,
  ComparativaItem,
  TiempoEjecucion
} from '../types/rentabilidad.types';
import type { Presupuesto } from '../types/presupuesto.types';
import type { Factura } from '../types/factura.types';
import type { Expense } from '../types/expenses';

const STORAGE_KEY_ANALISIS = 'analisis_rentabilidad';

class RentabilidadService {
  private getAnalisis(): AnalisisRentabilidad[] {
    return localStorageService.get<AnalisisRentabilidad[]>(STORAGE_KEY_ANALISIS, []);
  }

  private saveAnalisis(analisis: AnalisisRentabilidad[]): boolean {
    return localStorageService.set(STORAGE_KEY_ANALISIS, analisis);
  }

  /**
   * Calculate complete profitability analysis when project is completed
   * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
   */
  async calcularAnalisisRentabilidad(
    proyectoId: string, 
    presupuestoId: string
  ): Promise<AnalisisRentabilidad> {
    // Get presupuesto original
    const presupuestos = localStorageService.get<Presupuesto[]>('presupuestos', []);
    const presupuesto = presupuestos.find(p => p.id === presupuestoId);
    if (!presupuesto) {
      throw new Error('Presupuesto no encontrado');
    }

    // Get all invoices for the project
    const facturas = localStorageService.get<Factura[]>('facturas', []);
    const facturasProyecto = facturas.filter(f => f.proyectoId === proyectoId);

    // Get all expenses for the project
    const expenses = localStorageService.get<Expense[]>('expenses', []);
    const gastosProyecto = expenses.filter(e => e.projectId === proyectoId);

    // Calculate income (Requirement 11.2)
    const ingresos = this.calcularIngresos(presupuesto, facturasProyecto);

    // Calculate direct costs by category (Requirement 11.3)
    const costosDirectos = this.calcularCostosDirectos(gastosProyecto);

    // Calculate operational expenses by category (Requirement 11.4)
    const gastosOperativos = this.calcularGastosOperativos(gastosProyecto);

    // Calculate margins and ROI (Requirement 11.5)
    const margenBruto = ingresos.totalFacturado - costosDirectos.total;
    const margenBrutoPorcentaje = ingresos.totalFacturado > 0 
      ? (margenBruto / ingresos.totalFacturado) * 100 
      : 0;
    
    const utilidadNeta = margenBruto - gastosOperativos.total;
    const utilidadNetaPorcentaje = ingresos.totalFacturado > 0 
      ? (utilidadNeta / ingresos.totalFacturado) * 100 
      : 0;
    
    const roi = ingresos.presupuestoOriginal > 0 
      ? (utilidadNeta / ingresos.presupuestoOriginal) * 100 
      : 0;

    // Compare each category vs original budget (Requirement 11.6)
    const comparativa = this.generarComparativa(
      presupuesto,
      ingresos,
      costosDirectos,
      gastosOperativos
    );

    // Calculate execution time (Requirement 11.7)
    const tiempoEjecucion = this.calcularTiempoEjecucion(proyectoId, presupuesto);

    const analisis: AnalisisRentabilidad = {
      proyectoId,
      presupuestoId,
      ingresos,
      costosDirectos,
      gastosOperativos,
      margenBruto,
      margenBrutoPorcentaje,
      utilidadNeta,
      utilidadNetaPorcentaje,
      roi,
      comparativa,
      tiempoEjecucion,
      notas: [],
      createdAt: Timestamp.now()
    };

    // Save analysis
    const todosAnalisis = this.getAnalisis();
    const existingIndex = todosAnalisis.findIndex(a => a.proyectoId === proyectoId);
    if (existingIndex >= 0) {
      todosAnalisis[existingIndex] = analisis;
    } else {
      todosAnalisis.push(analisis);
    }
    this.saveAnalisis(todosAnalisis);

    return analisis;
  }

  /**
   * Calculate total income from invoices
   * Requirement 11.2
   */
  private calcularIngresos(
    presupuesto: Presupuesto, 
    facturas: Factura[]
  ): IngresosRentabilidad {
    const presupuestoOriginal = presupuesto.montos.total;
    
    // Calculate approved changes (difference between invoiced and original budget)
    const totalFacturado = facturas.reduce((sum, f) => sum + f.total, 0);
    const cambiosAprobados = totalFacturado - presupuestoOriginal;
    
    // Calculate total collected
    const totalCobrado = facturas
      .filter(f => f.estado === 'cobrada')
      .reduce((sum, f) => sum + f.total, 0);

    return {
      presupuestoOriginal,
      cambiosAprobados,
      totalFacturado,
      totalCobrado
    };
  }

  /**
   * Calculate direct costs by category
   * Requirement 11.3
   */
  private calcularCostosDirectos(gastos: Expense[]): CostosDirectos {
    // Filter only paid expenses for direct costs
    const gastosPagados = gastos.filter(g => g.paymentStatus === 'paid');

    // Categorize by cost code type
    const subcontratistas = gastosPagados
      .filter(g => g.costCode?.category === 'subcontractor' || g.costCode?.name?.toLowerCase().includes('subcontrat'))
      .reduce((sum, g) => sum + g.totalAmount, 0);

    const materiales = gastosPagados
      .filter(g => g.costCode?.category === 'materials' || g.costCode?.name?.toLowerCase().includes('material'))
      .reduce((sum, g) => sum + g.totalAmount, 0);

    const maquinaria = gastosPagados
      .filter(g => g.costCode?.category === 'equipment' || g.costCode?.name?.toLowerCase().includes('maquinaria') || g.costCode?.name?.toLowerCase().includes('equipo'))
      .reduce((sum, g) => sum + g.totalAmount, 0);

    // Other direct costs not in the above categories
    const otros = gastosPagados
      .filter(g => {
        const name = g.costCode?.name?.toLowerCase() || '';
        const category = g.costCode?.category?.toLowerCase() || '';
        return !name.includes('subcontrat') && 
               !name.includes('material') && 
               !name.includes('maquinaria') && 
               !name.includes('equipo') &&
               category !== 'subcontractor' &&
               category !== 'materials' &&
               category !== 'equipment' &&
               category !== 'labor' &&
               category !== 'overhead';
      })
      .reduce((sum, g) => sum + g.totalAmount, 0);

    const total = subcontratistas + materiales + maquinaria + otros;

    return {
      subcontratistas,
      materiales,
      maquinaria,
      otros,
      total
    };
  }

  /**
   * Calculate operational expenses by category
   * Requirement 11.4
   */
  private calcularGastosOperativos(gastos: Expense[]): GastosOperativos {
    // Filter only paid expenses for operational costs
    const gastosPagados = gastos.filter(g => g.paymentStatus === 'paid');

    const personalPropio = gastosPagados
      .filter(g => g.costCode?.category === 'labor' || g.costCode?.name?.toLowerCase().includes('personal') || g.costCode?.name?.toLowerCase().includes('labor'))
      .reduce((sum, g) => sum + g.totalAmount, 0);

    const transporte = gastosPagados
      .filter(g => g.costCode?.name?.toLowerCase().includes('transport') || g.costCode?.name?.toLowerCase().includes('vehic'))
      .reduce((sum, g) => sum + g.totalAmount, 0);

    const permisosLicencias = gastosPagados
      .filter(g => g.costCode?.name?.toLowerCase().includes('permis') || g.costCode?.name?.toLowerCase().includes('licen'))
      .reduce((sum, g) => sum + g.totalAmount, 0);

    const otros = gastosPagados
      .filter(g => {
        const name = g.costCode?.name?.toLowerCase() || '';
        const category = g.costCode?.category?.toLowerCase() || '';
        return category === 'overhead' ||
               (!name.includes('personal') && 
                !name.includes('labor') && 
                !name.includes('transport') && 
                !name.includes('vehic') && 
                !name.includes('permis') && 
                !name.includes('licen') &&
                category !== 'subcontractor' &&
                category !== 'materials' &&
                category !== 'equipment');
      })
      .reduce((sum, g) => sum + g.totalAmount, 0);

    const total = personalPropio + transporte + permisosLicencias + otros;

    return {
      personalPropio,
      transporte,
      permisosLicencias,
      otros,
      total
    };
  }

  /**
   * Generate comparative analysis between budgeted and actual costs
   * Requirement 11.6
   */
  private generarComparativa(
    presupuesto: Presupuesto,
    ingresos: IngresosRentabilidad,
    costosDirectos: CostosDirectos,
    gastosOperativos: GastosOperativos
  ): ComparativaItem[] {
    const comparativa: ComparativaItem[] = [];

    // Income comparison
    comparativa.push({
      concepto: 'Ingresos Totales',
      presupuestado: ingresos.presupuestoOriginal,
      real: ingresos.totalFacturado,
      variacion: ingresos.totalFacturado - ingresos.presupuestoOriginal,
      variacionPorcentaje: ingresos.presupuestoOriginal > 0 
        ? ((ingresos.totalFacturado - ingresos.presupuestoOriginal) / ingresos.presupuestoOriginal) * 100 
        : 0
    });

    // Estimate budgeted costs (assuming 70% of budget is direct costs, 15% operational)
    const costosDirectosPresupuestados = ingresos.presupuestoOriginal * 0.70;
    const gastosOperativosPresupuestados = ingresos.presupuestoOriginal * 0.15;

    // Direct costs comparison
    comparativa.push({
      concepto: 'Costos Directos',
      presupuestado: costosDirectosPresupuestados,
      real: costosDirectos.total,
      variacion: costosDirectos.total - costosDirectosPresupuestados,
      variacionPorcentaje: costosDirectosPresupuestados > 0 
        ? ((costosDirectos.total - costosDirectosPresupuestados) / costosDirectosPresupuestados) * 100 
        : 0
    });

    // Operational expenses comparison
    comparativa.push({
      concepto: 'Gastos Operativos',
      presupuestado: gastosOperativosPresupuestados,
      real: gastosOperativos.total,
      variacion: gastosOperativos.total - gastosOperativosPresupuestados,
      variacionPorcentaje: gastosOperativosPresupuestados > 0 
        ? ((gastosOperativos.total - gastosOperativosPresupuestados) / gastosOperativosPresupuestados) * 100 
        : 0
    });

    // Margin comparison
    const margenPresupuestado = ingresos.presupuestoOriginal - costosDirectosPresupuestados - gastosOperativosPresupuestados;
    const margenReal = ingresos.totalFacturado - costosDirectos.total - gastosOperativos.total;
    
    comparativa.push({
      concepto: 'Utilidad Neta',
      presupuestado: margenPresupuestado,
      real: margenReal,
      variacion: margenReal - margenPresupuestado,
      variacionPorcentaje: margenPresupuestado > 0 
        ? ((margenReal - margenPresupuestado) / margenPresupuestado) * 100 
        : 0
    });

    return comparativa;
  }

  /**
   * Calculate execution time vs planned
   * Requirement 11.7
   */
  private calcularTiempoEjecucion(proyectoId: string, presupuesto: Presupuesto): TiempoEjecucion {
    // Calculate planned time from phases
    const planificado = presupuesto.fases.reduce((sum, fase) => sum + (fase.duracionEstimada || 0), 0);

    // Try to get actual execution time from project
    // For now, use a simple calculation based on conversion date
    let real = planificado; // Default to planned if we can't calculate
    
    if (presupuesto.estadoDetalle.fechaConversion) {
      const fechaInicio = presupuesto.estadoDetalle.fechaConversion.toDate();
      const fechaFin = new Date(); // Assuming project is completed now
      const diasReales = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
      real = diasReales;
    }

    return {
      planificado,
      real,
      variacion: real - planificado
    };
  }

  /**
   * Get analysis by project ID
   */
  async getAnalisisByProyecto(proyectoId: string): Promise<AnalisisRentabilidad | null> {
    const analisis = this.getAnalisis();
    return analisis.find(a => a.proyectoId === proyectoId) || null;
  }

  /**
   * Add note to analysis
   * Requirement 11.8
   */
  async agregarNota(proyectoId: string, nota: string): Promise<AnalisisRentabilidad> {
    const analisis = this.getAnalisis();
    const index = analisis.findIndex(a => a.proyectoId === proyectoId);
    
    if (index === -1) {
      throw new Error('Análisis no encontrado');
    }

    analisis[index].notas.push(nota);
    this.saveAnalisis(analisis);
    
    return analisis[index];
  }

  /**
   * Get all analyses
   */
  async getAllAnalisis(): Promise<AnalisisRentabilidad[]> {
    return this.getAnalisis();
  }
}

export const rentabilidadService = new RentabilidadService();
export default rentabilidadService;
