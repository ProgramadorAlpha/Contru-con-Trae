import { Timestamp } from 'firebase/firestore';
import { Direccion } from './cliente.types';

export interface ClienteFactura {
  id: string;
  nombre: string;
  empresa?: string;
  email: string;
  cif?: string;
  direccion: Direccion;
}

export interface Factura {
  id: string;
  numero: string;
  proyectoId: string;
  presupuestoId: string;
  planPagoNumero: number;
  faseVinculada?: number;
  cliente: ClienteFactura;
  subtotal: number;
  iva: number;
  total: number;
  moneda: 'EUR' | 'USD';
  fechaEmision: Timestamp;
  fechaVencimiento: Timestamp;
  fechaEnvio?: Timestamp;
  fechaCobro?: Timestamp;
  estado: 'borrador' | 'enviada' | 'cobrada' | 'vencida' | 'cancelada';
  metodoPago?: 'transferencia' | 'efectivo' | 'cheque' | 'tarjeta';
  referenciaPago?: string;
  pdfUrl?: string;
  creadoPor: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
