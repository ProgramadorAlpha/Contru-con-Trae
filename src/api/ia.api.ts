/**
 * IA API
 * 
 * API wrapper for AI-related operations
 * Requirements: 11, 6
 * Task: 9.1, 9.2
 */

import { 
  sugerirProyectoParaRecibo, 
  busquedaSemantica,
  categorizarDocumento,
  type AnalisisRecibo,
  type SugerenciaProyectoIA,
  type ResultadoBusquedaSemantica,
  type CategorizacionDocumento
} from '../services/ai/claudeService';
import { proyectoService } from '../services/proyecto.service';
import type { ApiResponse } from './proyectos.api';

// Rate limiting state
interface RateLimitState {
  requests: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitState>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_HOUR = 100;

/**
 * Check rate limit for a user
 */
function checkRateLimit(userId: string = 'anonymous'): boolean {
  const now = Date.now();
  const state = rateLimits.get(userId);

  if (!state || now > state.resetTime) {
    // Reset or initialize
    rateLimits.set(userId, {
      requests: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (state.requests >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }

  state.requests++;
  return true;
}

/**
 * Suggest project for a receipt
 * POST /api/ia/sugerir-proyecto
 */
export async function sugerirProyecto(data: {
  recibo: AnalisisRecibo;
  usuario_id?: string;
}): Promise<ApiResponse<SugerenciaProyectoIA>> {
  try {
    // Check rate limit
    if (!checkRateLimit(data.usuario_id)) {
      return {
        success: false,
        error: 'Límite de solicitudes excedido. Intente nuevamente en una hora.'
      };
    }

    // Get active projects
    const proyectos = await proyectoService.getProyectosActivosParaSugerencia(data.usuario_id);

    if (proyectos.length === 0) {
      return {
        success: false,
        error: 'No hay proyectos activos disponibles'
      };
    }

    // Get AI suggestion
    const sugerencia = await sugerirProyectoParaRecibo(data.recibo, proyectos);

    return {
      success: true,
      data: sugerencia
    };
  } catch (error) {
    console.error('API Error - sugerirProyecto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al sugerir proyecto'
    };
  }
}

/**
 * Semantic search across documents
 * POST /api/ia/busqueda-semantica
 */
export async function busquedaSemanticaDocumentos(data: {
  query: string;
  proyecto_id?: string;
  usuario_id?: string;
}): Promise<ApiResponse<ResultadoBusquedaSemantica[]>> {
  try {
    // Check rate limit
    if (!checkRateLimit(data.usuario_id)) {
      return {
        success: false,
        error: 'Límite de solicitudes excedido. Intente nuevamente en una hora.'
      };
    }

    // Validate query
    if (!data.query || data.query.trim().length === 0) {
      return {
        success: false,
        error: 'Debe proporcionar un término de búsqueda'
      };
    }

    if (data.query.length < 3) {
      return {
        success: false,
        error: 'El término de búsqueda debe tener al menos 3 caracteres'
      };
    }

    // Get documents
    const documentos = data.proyecto_id
      ? await proyectoService.getDocumentosProyecto(data.proyecto_id)
      : [];

    if (documentos.length === 0) {
      return {
        success: true,
        data: []
      };
    }

    // Perform semantic search
    const resultados = await busquedaSemantica(data.query, documentos);

    return {
      success: true,
      data: resultados
    };
  } catch (error) {
    console.error('API Error - busquedaSemanticaDocumentos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error en búsqueda semántica'
    };
  }
}

/**
 * Categorize document automatically
 * POST /api/ia/categorizar-documento
 */
export async function categorizarDocumentoAuto(data: {
  nombre: string;
  contenido?: string;
  usuario_id?: string;
}): Promise<ApiResponse<CategorizacionDocumento>> {
  try {
    // Check rate limit
    if (!checkRateLimit(data.usuario_id)) {
      return {
        success: false,
        error: 'Límite de solicitudes excedido. Intente nuevamente en una hora.'
      };
    }

    // Categorize document
    const categorizacion = await categorizarDocumento(data.nombre, data.contenido);

    return {
      success: true,
      data: categorizacion
    };
  } catch (error) {
    console.error('API Error - categorizarDocumentoAuto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al categorizar documento'
    };
  }
}

/**
 * Get rate limit status for a user
 * GET /api/ia/rate-limit-status
 */
export async function getRateLimitStatus(
  userId: string = 'anonymous'
): Promise<ApiResponse<{
  requests: number;
  limit: number;
  remaining: number;
  resetTime: number;
}>> {
  try {
    const state = rateLimits.get(userId);
    const now = Date.now();

    if (!state || now > state.resetTime) {
      return {
        success: true,
        data: {
          requests: 0,
          limit: MAX_REQUESTS_PER_HOUR,
          remaining: MAX_REQUESTS_PER_HOUR,
          resetTime: now + RATE_LIMIT_WINDOW
        }
      };
    }

    return {
      success: true,
      data: {
        requests: state.requests,
        limit: MAX_REQUESTS_PER_HOUR,
        remaining: Math.max(0, MAX_REQUESTS_PER_HOUR - state.requests),
        resetTime: state.resetTime
      }
    };
  } catch (error) {
    console.error('API Error - getRateLimitStatus:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener estado de límite'
    };
  }
}

// Export all API functions
export const iaApi = {
  sugerirProyecto,
  busquedaSemanticaDocumentos,
  categorizarDocumentoAuto,
  getRateLimitStatus
};

export default iaApi;
