/**
 * Services Index
 * 
 * Centralized export for all services with localStorage persistence.
 */

export { localStorageService } from './localStorage.service';
export { documentoService } from './documento.service';
export { proyectoService } from './proyecto.service';
export { storageService } from './storage.service';
export { ingresoService } from './ingreso.service';
export { gastoService } from './gasto.service';

// Re-export types
export type { Documento, DocumentoConGasto, SugerenciaProyecto, ResultadoBusqueda } from './documento.service';
export type { Proyecto, DocumentoStats, ProyectoConDocumentos, LimitValidation, ProyectoParaSugerencia } from './proyecto.service';
export type { UploadResult, StorageUsage, SignedUrlOptions } from './storage.service';
export type { Ingreso, CreateIngresoDTO, UpdateIngresoDTO } from './ingreso.service';
export type { Gasto, CreateGastoDTO, UpdateGastoDTO } from './gasto.service';
