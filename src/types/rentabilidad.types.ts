import { Timestamp } from 'firebase/firestore';

export interface IngresosRentabilidad {
  presupuestoOriginal: number;
  cambiosAprobados: number;
  totalFacturado: number;
  totalCobrado: number;
}

export interface CostosDirectos {
  subcontratistas: number;
  materiales: number;
  maquinaria: number;
  otros: number;
  total: number;
}

export interface GastosOperativos {
  personalPropio: number;
  transporte: number;
  permisosLicencias: number;
  otros: number;
  total: number;
}

export interface ComparativaItem {
  concepto: string;
  presupuestado: number;
  real: number;
  variacion: number;
  variacionPorcentaje: number;
}

export interface TiempoEjecucion {
  planificado: number;
  real: number;
  variacion: number;
}

export interface AnalisisRentabilidad {
  proyectoId: string;
  presupuestoId: string;
  ingresos: IngresosRentabilidad;
  costosDirectos: CostosDirectos;
  gastosOperativos: GastosOperativos;
  margenBruto: number;
  margenBrutoPorcentaje: number;
  utilidadNeta: number;
  utilidadNetaPorcentaje: number;
  roi: number;
  comparativa: ComparativaItem[];
  tiempoEjecucion: TiempoEjecucion;
  notas: string[];
  createdAt: Timestamp;
}

export interface FinanzasMetricas {
  ingresosTotales: number;
  gastosTotales: number;
  utilidadNeta: number;
  variacionPorcentaje: number;
  pagosPendientes: number;
  pagosVencenHoy: number;
  margenBrutoPromedio: number;
  tesoreriaTotal: number;
}
