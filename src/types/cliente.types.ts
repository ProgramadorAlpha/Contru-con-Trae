import { Timestamp } from 'firebase/firestore';

export interface Direccion {
  calle: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
}

export interface DatosBancarios {
  banco: string;
  iban: string;
  swift?: string;
}

export interface ClienteStats {
  totalPresupuestos: number;
  presupuestosAprobados: number;
  totalFacturado: number;
  totalCobrado: number;
  proyectosActivos: number;
  proyectosCompletados: number;
}

export interface Cliente {
  id: string;
  nombre: string;
  empresa?: string;
  email: string;
  telefono: string;
  cif?: string;
  direccion: Direccion;
  datosBancarios?: DatosBancarios;
  stats: ClienteStats;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
