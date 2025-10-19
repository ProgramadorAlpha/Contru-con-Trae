/**
 * Facturas API - Task 14.2
 * Requirement: 9.1
 * 
 * API wrapper for factura-related operations
 */

import { facturaService } from '../services/factura.service';
import type { Factura } from '../types/factura.types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateFacturaRequest {
  proyectoId: string;
  presupuestoId: string;
  planPagoNumero: number;
  faseVinculada?: number;
  clienteId: string;
  subtotal: number;
  iva: number;
  total: number;
  moneda: 'EUR' | 'USD';
  fechaVencimiento: Date;
  creadoPor: string;
}

export interface UpdateFacturaRequest {
  subtotal?: number;
  iva?: number;
  total?: number;
  fechaVencimiento?: Date;
  metodoPago?: Factura['metodoPago'];
  referenciaPago?: string;
}

export interface RegistrarCobroRequest {
  fechaCobro: Date;
  metodoPago: Factura['metodoPago'];
  referenciaPago?: string;
}

/**
 * Get all facturas
 */
export async function getAllFacturas(): Promise<ApiResponse<Factura[]>> {
  try {
    const facturas = await facturaService.getFacturasAll();
    return {
      success: true,
      data: facturas
    };
  } catch (error) {
    console.error('Error getting facturas:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener las facturas'
    };
  }
}

/**
 * Get factura by ID
 */
export async function getFacturaById(id: string): Promise<ApiResponse<Factura>> {
  try {
    const facturas = await facturaService.getFacturasAll();
    const factura = facturas.find(f => f.id === id);
    
    if (!factura) {
      return {
        success: false,
        error: 'Factura no encontrada'
      };
    }
    
    return {
      success: true,
      data: factura
    };
  } catch (error) {
    console.error('Error getting factura:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener la factura'
    };
  }
}

/**
 * Get facturas by proyecto
 */
export async function getFacturasByProyecto(proyectoId: string): Promise<ApiResponse<Factura[]>> {
  try {
    const facturas = await facturaService.getFacturasAll();
    const facturasProyecto = facturas.filter(f => f.proyectoId === proyectoId);
    
    return {
      success: true,
      data: facturasProyecto
    };
  } catch (error) {
    console.error('Error getting facturas by proyecto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener las facturas del proyecto'
    };
  }
}

/**
 * Get facturas by estado
 */
export async function getFacturasByEstado(estado: Factura['estado']): Promise<ApiResponse<Factura[]>> {
  try {
    const facturas = await facturaService.getFacturasAll();
    const facturasEstado = facturas.filter(f => f.estado === estado);
    
    return {
      success: true,
      data: facturasEstado
    };
  } catch (error) {
    console.error('Error getting facturas by estado:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener las facturas por estado'
    };
  }
}

/**
 * Mark factura as cobrada
 */
export async function registrarCobro(
  id: string,
  request: RegistrarCobroRequest
): Promise<ApiResponse<Factura>> {
  try {
    const factura = await facturaService.registrarCobro(
      id,
      request.fechaCobro,
      request.metodoPago as any
    );
    
    return {
      success: true,
      data: factura,
      message: 'Cobro registrado exitosamente'
    };
  } catch (error) {
    console.error('Error registering cobro:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al registrar el cobro'
    };
  }
}

/**
 * Mark factura as enviada
 */
export async function marcarFacturaEnviada(id: string): Promise<ApiResponse<Factura>> {
  try {
    const factura = await facturaService.enviarFactura(id);
    
    return {
      success: true,
      data: factura,
      message: 'Factura marcada como enviada'
    };
  } catch (error) {
    console.error('Error marking factura as enviada:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al marcar la factura como enviada'
    };
  }
}

/**
 * Get facturas vencidas (overdue)
 */
export async function getFacturasVencidas(): Promise<ApiResponse<Factura[]>> {
  try {
    const facturas = await facturaService.getFacturasAll();
    const now = new Date();
    
    const facturasVencidas = facturas.filter(f => 
      (f.estado === 'enviada' || f.estado === 'borrador') &&
      f.fechaVencimiento.toDate() < now
    );
    
    return {
      success: true,
      data: facturasVencidas
    };
  } catch (error) {
    console.error('Error getting facturas vencidas:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener las facturas vencidas'
    };
  }
}

/**
 * Get facturas pendientes de cobro
 */
export async function getFacturasPendientesCobro(): Promise<ApiResponse<Factura[]>> {
  try {
    const facturas = await facturaService.getFacturasAll();
    const facturasPendientes = facturas.filter(f => 
      f.estado === 'enviada' || f.estado === 'borrador'
    );
    
    return {
      success: true,
      data: facturasPendientes
    };
  } catch (error) {
    console.error('Error getting facturas pendientes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener las facturas pendientes de cobro'
    };
  }
}

/**
 * Get total facturado by proyecto
 */
export async function getTotalFacturadoByProyecto(proyectoId: string): Promise<ApiResponse<number>> {
  try {
    const facturas = await facturaService.getFacturasAll();
    const facturasProyecto = facturas.filter(f => f.proyectoId === proyectoId);
    const total = facturasProyecto.reduce((sum, f) => sum + f.total, 0);
    
    return {
      success: true,
      data: total
    };
  } catch (error) {
    console.error('Error getting total facturado:', error);
    return {
      success: false,
      data: 0,
      error: error instanceof Error ? error.message : 'Error al obtener el total facturado'
    };
  }
}

/**
 * Get total cobrado by proyecto
 */
export async function getTotalCobradoByProyecto(proyectoId: string): Promise<ApiResponse<number>> {
  try {
    const facturas = await facturaService.getFacturasAll();
    const facturasProyecto = facturas.filter(f => 
      f.proyectoId === proyectoId && f.estado === 'cobrada'
    );
    const total = facturasProyecto.reduce((sum, f) => sum + f.total, 0);
    
    return {
      success: true,
      data: total
    };
  } catch (error) {
    console.error('Error getting total cobrado:', error);
    return {
      success: false,
      data: 0,
      error: error instanceof Error ? error.message : 'Error al obtener el total cobrado'
    };
  }
}
