/**
 * Clientes API
 * 
 * API wrapper for cliente-related operations
 * Requirements: 1.1, 1.5
 * Task: 2.2
 */

import { clienteService } from '../services/cliente.service';
import type { Cliente, ClienteStats } from '../types/cliente.types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateClienteRequest {
  nombre: string;
  empresa?: string;
  email: string;
  telefono: string;
  cif?: string;
  direccion: {
    calle: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
    pais: string;
  };
  datosBancarios?: {
    banco: string;
    iban: string;
    swift?: string;
  };
}

export interface UpdateClienteRequest {
  nombre?: string;
  empresa?: string;
  email?: string;
  telefono?: string;
  cif?: string;
  direccion?: {
    calle: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
    pais: string;
  };
  datosBancarios?: {
    banco: string;
    iban: string;
    swift?: string;
  };
}

/**
 * Create a new cliente
 * POST /api/clientes
 */
export async function createCliente(
  clienteData: CreateClienteRequest
): Promise<ApiResponse<Cliente>> {
  try {
    const cliente = await clienteService.createCliente(clienteData);

    return {
      success: true,
      data: cliente,
      message: 'Cliente creado exitosamente'
    };
  } catch (error) {
    console.error('API Error - createCliente:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear cliente'
    };
  }
}

/**
 * Update an existing cliente
 * PUT /api/clientes/:id
 */
export async function updateCliente(
  clienteId: string,
  updates: UpdateClienteRequest
): Promise<ApiResponse<Cliente>> {
  try {
    const cliente = await clienteService.updateCliente(clienteId, updates);

    return {
      success: true,
      data: cliente,
      message: 'Cliente actualizado exitosamente'
    };
  } catch (error) {
    console.error('API Error - updateCliente:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar cliente'
    };
  }
}

/**
 * Get a single cliente by ID
 * GET /api/clientes/:id
 */
export async function getClienteById(clienteId: string): Promise<ApiResponse<Cliente>> {
  try {
    const cliente = await clienteService.getCliente(clienteId);

    if (!cliente) {
      return {
        success: false,
        error: 'Cliente no encontrado'
      };
    }

    return {
      success: true,
      data: cliente
    };
  } catch (error) {
    console.error('API Error - getClienteById:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener cliente'
    };
  }
}

/**
 * Get all clientes
 * GET /api/clientes
 */
export async function getClientes(params?: {
  sortBy?: 'nombre' | 'empresa' | 'totalFacturado' | 'createdAt';
  order?: 'asc' | 'desc';
}): Promise<ApiResponse<Cliente[]>> {
  try {
    let clientes: Cliente[];

    if (params?.sortBy) {
      clientes = await clienteService.getClientesSorted(
        params.sortBy,
        params.order || 'asc'
      );
    } else {
      clientes = await clienteService.getClientesAll();
    }

    return {
      success: true,
      data: clientes
    };
  } catch (error) {
    console.error('API Error - getClientes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener clientes'
    };
  }
}

/**
 * Search clientes by nombre, empresa, or email
 * GET /api/clientes/search?q=query
 */
export async function searchClientes(query: string): Promise<ApiResponse<Cliente[]>> {
  try {
    const clientes = await clienteService.searchClientes(query);

    return {
      success: true,
      data: clientes
    };
  } catch (error) {
    console.error('API Error - searchClientes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al buscar clientes'
    };
  }
}

/**
 * Update cliente statistics
 * PATCH /api/clientes/:id/stats
 */
export async function updateClienteStats(
  clienteId: string,
  statsUpdate: Partial<ClienteStats>
): Promise<ApiResponse<Cliente>> {
  try {
    const cliente = await clienteService.updateClienteStats(clienteId, statsUpdate);

    return {
      success: true,
      data: cliente,
      message: 'Estadísticas actualizadas exitosamente'
    };
  } catch (error) {
    console.error('API Error - updateClienteStats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar estadísticas'
    };
  }
}

/**
 * Delete a cliente
 * DELETE /api/clientes/:id
 */
export async function deleteCliente(clienteId: string): Promise<ApiResponse<void>> {
  try {
    await clienteService.deleteCliente(clienteId);

    return {
      success: true,
      message: 'Cliente eliminado exitosamente'
    };
  } catch (error) {
    console.error('API Error - deleteCliente:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar cliente'
    };
  }
}

/**
 * Get recent clientes
 * GET /api/clientes/recent?limit=5
 */
export async function getClientesRecientes(limit: number = 5): Promise<ApiResponse<Cliente[]>> {
  try {
    const clientes = await clienteService.getClientesRecientes(limit);

    return {
      success: true,
      data: clientes
    };
  } catch (error) {
    console.error('API Error - getClientesRecientes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener clientes recientes'
    };
  }
}

/**
 * Get cliente by email
 * GET /api/clientes/by-email/:email
 */
export async function getClienteByEmail(email: string): Promise<ApiResponse<Cliente>> {
  try {
    const cliente = await clienteService.getClienteByEmail(email);

    if (!cliente) {
      return {
        success: false,
        error: 'Cliente no encontrado'
      };
    }

    return {
      success: true,
      data: cliente
    };
  } catch (error) {
    console.error('API Error - getClienteByEmail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener cliente por email'
    };
  }
}

// Export all API functions as a namespace
export const clientesApi = {
  createCliente,
  updateCliente,
  getClienteById,
  getClientes,
  searchClientes,
  updateClienteStats,
  deleteCliente,
  getClientesRecientes,
  getClienteByEmail
};

export default clientesApi;
