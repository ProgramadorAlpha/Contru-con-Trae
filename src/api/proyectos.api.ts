/**
 * Proyectos API
 * 
 * API wrapper for project-related operations
 * Requirements: 2, 3, 7B
 * Task: 7.1, 7.2
 */

import { proyectoService, type Proyecto, type DocumentoStats } from '../services/proyecto.service';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Get all projects for current user
 * GET /api/proyectos
 */
export async function getProyectos(params?: {
  estado?: string;
  activos?: boolean;
  userId?: string;
}): Promise<ApiResponse<Proyecto[]>> {
  try {
    const proyectos = await proyectoService.getProyectosUsuario(params?.userId, {
      estado: params?.estado,
      activos: params?.activos
    });

    return {
      success: true,
      data: proyectos
    };
  } catch (error) {
    console.error('API Error - getProyectos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener proyectos'
    };
  }
}

/**
 * Get project by ID
 * GET /api/proyectos/:id
 */
export async function getProyectoById(proyectoId: string): Promise<ApiResponse<Proyecto>> {
  try {
    const proyecto = await proyectoService.getProyectoById(proyectoId);

    if (!proyecto) {
      return {
        success: false,
        error: 'Proyecto no encontrado'
      };
    }

    return {
      success: true,
      data: proyecto
    };
  } catch (error) {
    console.error('API Error - getProyectoById:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener proyecto'
    };
  }
}

/**
 * Get documents for a project
 * GET /api/proyectos/:id/documentos
 */
export async function getProyectoDocumentos(
  proyectoId: string,
  params?: {
    tipo?: string;
    busqueda?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<ApiResponse<PaginatedResponse<any>>> {
  try {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 50;
    const offset = (page - 1) * pageSize;

    const documentos = await proyectoService.getDocumentosProyecto(proyectoId, {
      tipo: params?.tipo,
      busqueda: params?.busqueda,
      limit: pageSize,
      offset
    });

    // In real implementation, would get total count from database
    const total = documentos.length;
    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      data: {
        data: documentos,
        total,
        page,
        pageSize,
        totalPages
      }
    };
  } catch (error) {
    console.error('API Error - getProyectoDocumentos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener documentos'
    };
  }
}

/**
 * Get document statistics for a project
 * GET /api/proyectos/:id/documentos/stats
 */
export async function getProyectoDocumentosStats(
  proyectoId: string
): Promise<ApiResponse<DocumentoStats>> {
  try {
    const stats = await proyectoService.getEstadisticasDocumentos(proyectoId);

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('API Error - getProyectoDocumentosStats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
    };
  }
}

/**
 * Get folder structure for a project
 * GET /api/proyectos/:id/documentos/carpetas
 */
export async function getProyectoCarpetas(
  proyectoId: string
): Promise<ApiResponse<Record<string, number>>> {
  try {
    const stats = await proyectoService.getEstadisticasDocumentos(proyectoId);

    const carpetas = {
      'Contratos': stats.docs_contratos,
      'Planos': stats.docs_planos,
      'Facturas': stats.docs_facturas,
      'Permisos': stats.docs_permisos,
      'Reportes': stats.docs_reportes,
      'Certificados': stats.docs_certificados,
      'Otros': stats.docs_otros
    };

    return {
      success: true,
      data: carpetas
    };
  } catch (error) {
    console.error('API Error - getProyectoCarpetas:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener carpetas'
    };
  }
}

/**
 * Validate project limits before upload
 * POST /api/proyectos/:id/validar-limites
 */
export async function validarLimitesProyecto(
  proyectoId: string,
  fileSize: number
): Promise<ApiResponse<{
  valid: boolean;
  reason?: string;
  limite_documentos?: number;
  documentos_actuales?: number;
  limite_espacio_gb?: number;
  espacio_usado_gb?: number;
}>> {
  try {
    const validation = await proyectoService.validarLimites(proyectoId, fileSize);

    return {
      success: true,
      data: validation
    };
  } catch (error) {
    console.error('API Error - validarLimitesProyecto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al validar límites'
    };
  }
}

// Export all API functions
export const proyectosApi = {
  getProyectos,
  getProyectoById,
  getProyectoDocumentos,
  getProyectoDocumentosStats,
  getProyectoCarpetas,
  validarLimitesProyecto
};

export default proyectosApi;
