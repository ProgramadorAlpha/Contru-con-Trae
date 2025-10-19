import { Timestamp } from 'firebase/firestore';
import { Direccion } from './cliente.types';

export interface Subpartida {
  codigo: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  total: number;
}

export interface Partida {
  id: string;
  codigo: string;
  nombre: string;
  unidad: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  subpartidas?: Subpartida[];
}

export interface Fase {
  numero: number;
  nombre: string;
  descripcion?: string;
  monto: number;
  duracionEstimada?: number;
  porcentajeCobro: number;
  partidas: Partida[];
}

export interface PlanPago {
  numero: number;
  descripcion: string;
  porcentaje: number;
  monto: number;
  fecha?: Timestamp;
  vinculadoAFase?: number;
  estado: 'pendiente' | 'facturado' | 'cobrado';
}

export interface ClientePresupuesto {
  id: string;
  nombre: string;
  empresa?: string;
  email: string;
  telefono: string;
  direccion: Direccion;
}

export interface UbicacionObra {
  direccion: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  referenciaCatastral?: string;
}

export interface MontosPresupuesto {
  subtotal: number;
  iva: number;
  total: number;
  moneda: 'EUR' | 'USD';
  porFase: Array<{
    fase: number;
    nombre: string;
    monto: number;
  }>;
}

export interface EstadoDetallePresupuesto {
  enviadoCliente: boolean;
  fechaEnvio?: Timestamp;
  fechaVisualizacion?: Timestamp;
  fechaAprobacion?: Timestamp;
  fechaRechazo?: Timestamp;
  motivoRechazo?: string;
  convertidoAProyecto: boolean;
  proyectoId?: string;
  fechaConversion?: Timestamp;
}

export interface MetadatosIA {
  modelo: string;
  confianza: number;
  iteraciones: number;
  promptInicial: string;
  conversacionId: string;
}

export interface DocumentoPresupuesto {
  tipo: 'plano' | 'especificacion' | 'foto' | 'otro';
  nombre: string;
  url: string;
  uploadedBy: string;
  fecha: Timestamp;
}

export interface FirmaDigital {
  tipo: 'empresa' | 'cliente';
  firmadoPor: string;
  fecha: Timestamp;
  ip: string;
  firma: string;
}

export interface Presupuesto {
  id: string;
  numero: string;
  nombre: string;
  version: number;
  cliente: ClientePresupuesto;
  ubicacionObra: UbicacionObra;
  montos: MontosPresupuesto;
  fases: Fase[];
  planPagos: PlanPago[];
  estado: 'borrador' | 'enviado' | 'aprobado' | 'rechazado' | 'expirado' | 'convertido';
  estadoDetalle: EstadoDetallePresupuesto;
  fechaCreacion: Timestamp;
  fechaValidez: Timestamp;
  diasValidez: number;
  creadoConIA: boolean;
  metadatosIA?: MetadatosIA;
  documentos: DocumentoPresupuesto[];
  notas?: string;
  condiciones: string[];
  firmas: FirmaDigital[];
  creadoPor: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PresupuestoGenerado {
  fases: Fase[];
  montos?: {
    subtotal: number;
    iva: number;
    total: number;
  };
}

export interface Mensaje {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
}

export interface PresupuestoFiltros {
  estado?: string;
  clienteId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  montoMin?: number;
  montoMax?: number;
}

export interface PresupuestosMetricas {
  total: number;
  aprobados: number;
  aprobadosPorcentaje: number;
  pendientes: number;
  pendientesPorcentaje: number;
  rechazados: number;
  rechazadosPorcentaje: number;
  montoFacturado: number;
  montoCobrado: number;
  porcentajeCobro: number;
}
