/**
 * Documentos API
 * 
 * API wrapper for document-related operations
 * Requirements: 5, 6
 * Task: 8.1, 8.2, 8.3
 */

import { documentoService, type Documento, type SugerenciaProyecto, type ResultadoBusqueda } from '../services/documento.service';
import { storageService } from '../services/storage.service';
import type { ApiResponse } from './proyectos.api';

/**
 * Upload a document
 * POST /api/documentos/upload
 */
export async function uploadDocumento(data: {
  proyecto_id: string;
  nombre: string;
  tipo: string;
  archivo: File;
  descripcion?: string;
  es_factura?: boolean;
  monto_factura?: number;
  fecha_factura?: string;
  proveedor?: string;
  folio?: string;
  usuario_id?: string;
}): Promise<ApiResponse<Documento>> {
  try {
    // Validate file
    const allowedTypes = [
      'application/pdf',
      'image/*',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!storageService.validateFileType(data.archivo, allowedTypes)) {
      return {
        success: false,
        error: 'Tipo de archivo no permitido'
      };
    }

    // Upload document
    const documento = await documentoService.subirDocumento(data);

    return {
      success: true,
      data: documento,
      message: 'Documento subido exitosamente'
    };
  } catch (error) {
    console.error('API Error - uploadDocumento:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al subir documento'
    };
  }
}

/**
 * Scan receipt and create document + expense
 * POST /api/documentos/escanear-recibo
 */
export async function escanearRecibo(data: {
  archivo: File;
  proyecto_id?: string;
  usuario_id?: string;
}): Promise<ApiResponse<{
  documento: Documento;
  gasto: any;
  sugerencia_proyecto?: SugerenciaProyecto;
}>> {
  try {
    // Validate file is an image
    if (!storageService.validateFileType(data.archivo, ['image/*'])) {
      return {
        success: false,
        error: 'El archivo debe ser una imagen'
      };
    }

    // Scan receipt
    const result = await documentoService.escanearRecibo(data);

    return {
      success: true,
      data: result,
      message: 'Recibo escaneado exitosamente'
    };
  } catch (error) {
    console.error('API Error - escanearRecibo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al escanear recibo'
    };
  }
}

/**
 * Search documents
 * POST /api/documentos/buscar
 */
export async function buscarDocumentos(query: {
  proyecto_id?: string;
  busqueda: string;
  tipo?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  semantica?: boolean;
}): Promise<ApiResponse<ResultadoBusqueda[]>> {
  try {
    if (!query.busqueda || query.busqueda.trim().length === 0) {
      return {
        success: false,
        error: 'Debe proporcionar un término de búsqueda'
      };
    }

    const resultados = await documentoService.buscarDocumentos(query);

    return {
      success: true,
      data: resultados
    };
  } catch (error) {
    console.error('API Error - buscarDocumentos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al buscar documentos'
    };
  }
}

/**
 * Get document by ID
 * GET /api/documentos/:id
 */
export async function getDocumento(documentoId: string): Promise<ApiResponse<Documento>> {
  try {
    const documento = await documentoService.getDocumentoCompleto(documentoId);

    if (!documento) {
      return {
        success: false,
        error: 'Documento no encontrado'
      };
    }

    return {
      success: true,
      data: documento
    };
  } catch (error) {
    console.error('API Error - getDocumento:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener documento'
    };
  }
}

/**
 * Delete document
 * DELETE /api/documentos/:id
 */
export async function deleteDocumento(documentoId: string): Promise<ApiResponse<void>> {
  try {
    await documentoService.eliminarDocumento(documentoId);

    return {
      success: true,
      message: 'Documento eliminado exitosamente'
    };
  } catch (error) {
    console.error('API Error - deleteDocumento:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar documento'
    };
  }
}

/**
 * Link document to expense
 * POST /api/documentos/:id/vincular-gasto
 */
export async function vincularDocumentoGasto(
  documentoId: string,
  gastoId: string
): Promise<ApiResponse<void>> {
  try {
    await documentoService.vincularConGasto(documentoId, gastoId);

    return {
      success: true,
      message: 'Documento vinculado al gasto exitosamente'
    };
  } catch (error) {
    console.error('API Error - vincularDocumentoGasto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al vincular documento'
    };
  }
}

/**
 * Export project documents
 * GET /api/documentos/exportar/:proyectoId
 */
export async function exportarDocumentos(proyectoId: string): Promise<ApiResponse<Blob>> {
  try {
    const blob = await documentoService.exportarDocumentosProyecto(proyectoId);

    return {
      success: true,
      data: blob
    };
  } catch (error) {
    console.error('API Error - exportarDocumentos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al exportar documentos'
    };
  }
}

/**
 * Get documents by folder/type
 * GET /api/documentos/carpeta/:proyectoId/:tipo
 */
export async function getDocumentosPorCarpeta(
  proyectoId: string,
  tipo: string
): Promise<ApiResponse<Documento[]>> {
  try {
    const documentos = await documentoService.getDocumentosPorCarpeta(proyectoId, tipo);

    return {
      success: true,
      data: documentos
    };
  } catch (error) {
    console.error('API Error - getDocumentosPorCarpeta:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener documentos'
    };
  }
}

// Export all API functions
export const documentosApi = {
  uploadDocumento,
  escanearRecibo,
  buscarDocumentos,
  getDocumento,
  deleteDocumento,
  vincularDocumentoGasto,
  exportarDocumentos,
  getDocumentosPorCarpeta
};

export default documentosApi;
