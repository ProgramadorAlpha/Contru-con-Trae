import { Timestamp } from 'firebase/firestore';

export type TipoAlerta = 'cobro_pendiente' | 'bajo_capital' | 'sobrecosto' | 'pago_vencido';
export type PrioridadAlerta = 'baja' | 'media' | 'alta' | 'critica';
export type EstadoAlerta = 'activa' | 'resuelta' | 'ignorada';

export interface DatosAlerta {
  tesoreriaActual?: number;
  tesoreriaNecesaria?: number;
  montoFactura?: number;
  presupuestoOriginal?: number;
  gastoReal?: number;
  variacionPorcentaje?: number;
  proveedorNombre?: string;
  montoPago?: number;
  fechaVencimiento?: Timestamp;
}

export interface AlertaFinanciera {
  id: string;
  tipo: TipoAlerta;
  prioridad: PrioridadAlerta;
  proyectoId: string;
  proyectoNombre: string;
  faseNumero?: number;
  facturaId?: string;
  titulo: string;
  mensaje: string;
  accionRecomendada: string;
  datos: DatosAlerta;
  estado: EstadoAlerta;
  fechaResolucion?: Timestamp;
  notaResolucion?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AlertaFiltros {
  proyectoId?: string;
  prioridad?: PrioridadAlerta;
  tipo?: TipoAlerta;
  estado?: EstadoAlerta;
}
