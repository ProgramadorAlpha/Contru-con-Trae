/**
 * Alertas API - Task 16.2
 * Requirement: 8.5
 * 
 * API wrapper for alerta-related operations
 */

import { alertaService } from '../services/alerta.service';
import type { Alerta, TipoAlerta, PrioridadAlerta } from '../services/alerta.service';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ResolverAlertaRequest {
  usuario: string;
  nota?: string;
}

export interface AlertasFiltros {
  proyectoId?: string;
  tipo?: TipoAlerta;
  prioridad?: PrioridadAlerta;
  soloActivas?: boolean;
}

/**
 * Get all active alerts across all projects
 * GET /api/alertas/activas
 */
export async function getAlertasActivas(): Promise<ApiResponse<Alerta[]>> {
  try {
    const alertas = await alertaService.getAlertasActivas();

    return {
      success: true,
      data: alertas
    };
  } catch (error) {
    console.error('API Error - getAlertasActivas:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener alertas activas'
    };
  }
}

/**
 * Get alerts by proyecto
 * GET /api/alertas/proyecto/:proyectoId
 */
export async function getAlertasByProyecto(
  proyectoId: string,
  soloActivas: boolean = true
): Promise<ApiResponse<Alerta[]>> {
  try {
    const alertas = await alertaService.getAlertasProyecto(proyectoId, soloActivas);

    return {
      success: true,
      data: alertas
    };
  } catch (error) {
    console.error('API Error - getAlertasByProyecto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener alertas del proyecto'
    };
  }
}

/**
 * Get alerts with filters
 * GET /api/alertas?proyectoId=xxx&tipo=xxx&prioridad=xxx
 */
export async function getAlertas(filtros?: AlertasFiltros): Promise<ApiResponse<Alerta[]>> {
  try {
    let alertas: Alerta[];

    if (filtros?.proyectoId) {
      alertas = await alertaService.getAlertasProyecto(
        filtros.proyectoId,
        filtros.soloActivas ?? true
      );
    } else {
      alertas = await alertaService.getAlertasActivas();
    }

    // Apply additional filters
    if (filtros?.tipo) {
      alertas = alertas.filter(a => a.tipo === filtros.tipo);
    }

    if (filtros?.prioridad) {
      alertas = alertas.filter(a => a.prioridad === filtros.prioridad);
    }

    return {
      success: true,
      data: alertas
    };
  } catch (error) {
    console.error('API Error - getAlertas:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener alertas'
    };
  }
}

/**
 * Resolve an alert
 * PATCH /api/alertas/:id/resolver
 */
export async function resolverAlerta(
  alertaId: string,
  request: ResolverAlertaRequest
): Promise<ApiResponse<Alerta>> {
  try {
    const alerta = await alertaService.resolverAlerta(
      alertaId,
      request.usuario,
      request.nota
    );

    if (!alerta) {
      return {
        success: false,
        error: 'Alerta no encontrada'
      };
    }

    return {
      success: true,
      data: alerta,
      message: 'Alerta resuelta exitosamente'
    };
  } catch (error) {
    console.error('API Error - resolverAlerta:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al resolver alerta'
    };
  }
}

/**
 * Get alert statistics
 * GET /api/alertas/estadisticas?proyectoId=xxx
 */
export async function getEstadisticasAlertas(
  proyectoId?: string
): Promise<ApiResponse<{
  total: number;
  criticas: number;
  altas: number;
  medias: number;
  bajas: number;
  porTipo: Record<TipoAlerta, number>;
}>> {
  try {
    const stats = await alertaService.getEstadisticasAlertas(proyectoId);

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('API Error - getEstadisticasAlertas:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas de alertas'
    };
  }
}

/**
 * Run all verifications for a project
 * POST /api/alertas/verificar/:proyectoId
 */
export async function ejecutarVerificaciones(
  proyectoId: string,
  datos: {
    costoProximaFase?: number;
    faseActual?: number;
    progresoFaseActual?: number;
    presupuestoTotal?: number;
    gastosReales?: number;
  }
): Promise<ApiResponse<Alerta[]>> {
  try {
    const alertas = await alertaService.ejecutarVerificaciones(proyectoId, datos);

    return {
      success: true,
      data: alertas,
      message: alertas.length > 0 
        ? `Se generaron ${alertas.length} alerta(s)` 
        : 'No se detectaron problemas'
    };
  } catch (error) {
    console.error('API Error - ejecutarVerificaciones:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al ejecutar verificaciones'
    };
  }
}

/**
 * Get alerts by priority
 * GET /api/alertas/prioridad/:prioridad
 */
export async function getAlertasByPrioridad(
  prioridad: PrioridadAlerta
): Promise<ApiResponse<Alerta[]>> {
  try {
    const alertas = await alertaService.getAlertasActivas();
    const alertasFiltradas = alertas.filter(a => a.prioridad === prioridad);

    return {
      success: true,
      data: alertasFiltradas
    };
  } catch (error) {
    console.error('API Error - getAlertasByPrioridad:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener alertas por prioridad'
    };
  }
}

/**
 * Get alerts by type
 * GET /api/alertas/tipo/:tipo
 */
export async function getAlertasByTipo(
  tipo: TipoAlerta
): Promise<ApiResponse<Alerta[]>> {
  try {
    const alertas = await alertaService.getAlertasActivas();
    const alertasFiltradas = alertas.filter(a => a.tipo === tipo);

    return {
      success: true,
      data: alertasFiltradas
    };
  } catch (error) {
    console.error('API Error - getAlertasByTipo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener alertas por tipo'
    };
  }
}

/**
 * Clear all alerts for a project (admin only)
 * DELETE /api/alertas/proyecto/:proyectoId
 */
export async function limpiarAlertasProyecto(
  proyectoId: string
): Promise<ApiResponse<void>> {
  try {
    await alertaService.limpiarAlertasProyecto(proyectoId);

    return {
      success: true,
      message: 'Alertas del proyecto eliminadas exitosamente'
    };
  } catch (error) {
    console.error('API Error - limpiarAlertasProyecto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al limpiar alertas del proyecto'
    };
  }
}

// Export all API functions as a namespace
export const alertasApi = {
  getAlertasActivas,
  getAlertasByProyecto,
  getAlertas,
  resolverAlerta,
  getEstadisticasAlertas,
  ejecutarVerificaciones,
  getAlertasByPrioridad,
  getAlertasByTipo,
  limpiarAlertasProyecto
};

export default alertasApi;
