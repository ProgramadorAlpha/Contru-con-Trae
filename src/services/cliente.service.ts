/**
 * Cliente Service
 * 
 * Service for managing clients (clientes) with CRUD operations,
 * statistics tracking, and search functionality.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 * Task: 2.1
 */

import { localStorageService } from './localStorage.service';
import type { Cliente, ClienteStats } from '../types/cliente.types';
import { Timestamp } from 'firebase/firestore';

const STORAGE_KEY_CLIENTES = 'clientes';

/**
 * Generate a unique ID for a new cliente
 */
function generateClienteId(): string {
  return `cliente_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Initialize empty cliente stats
 */
function initializeClienteStats(): ClienteStats {
  return {
    totalPresupuestos: 0,
    presupuestosAprobados: 0,
    totalFacturado: 0,
    totalCobrado: 0,
    proyectosActivos: 0,
    proyectosCompletados: 0
  };
}

class ClienteService {
  /**
   * Get all clientes from localStorage
   */
  private getClientes(): Cliente[] {
    return localStorageService.get<Cliente[]>(STORAGE_KEY_CLIENTES, []);
  }

  /**
   * Save clientes to localStorage
   */
  private saveClientes(clientes: Cliente[]): boolean {
    return localStorageService.set(STORAGE_KEY_CLIENTES, clientes);
  }

  /**
   * Create a new cliente
   * Requirement: 1.1
   */
  async createCliente(clienteData: Omit<Cliente, 'id' | 'stats' | 'createdAt' | 'updatedAt'>): Promise<Cliente> {
    try {
      // Validate required fields
      if (!clienteData.nombre || !clienteData.email || !clienteData.telefono) {
        throw new Error('Nombre, email y teléfono son campos requeridos');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clienteData.email)) {
        throw new Error('Formato de email inválido');
      }

      // Check if email already exists
      const clientes = this.getClientes();
      const emailExists = clientes.some(c => c.email.toLowerCase() === clienteData.email.toLowerCase());
      if (emailExists) {
        throw new Error('Ya existe un cliente con este email');
      }

      // Create new cliente
      const now = Timestamp.now();
      const nuevoCliente: Cliente = {
        id: generateClienteId(),
        ...clienteData,
        stats: initializeClienteStats(),
        createdAt: now,
        updatedAt: now
      };

      // Save to storage
      clientes.push(nuevoCliente);
      const saved = this.saveClientes(clientes);

      if (!saved) {
        throw new Error('Error al guardar el cliente');
      }

      return nuevoCliente;
    } catch (error) {
      console.error('Error creating cliente:', error);
      throw error;
    }
  }

  /**
   * Update an existing cliente
   * Requirement: 1.1
   */
  async updateCliente(
    clienteId: string,
    updates: Partial<Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Cliente> {
    try {
      const clientes = this.getClientes();
      const index = clientes.findIndex(c => c.id === clienteId);

      if (index === -1) {
        throw new Error('Cliente no encontrado');
      }

      // Validate email if being updated
      if (updates.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.email)) {
          throw new Error('Formato de email inválido');
        }

        // Check if email already exists (excluding current cliente)
        const emailExists = clientes.some(
          c => c.id !== clienteId && c.email.toLowerCase() === updates.email!.toLowerCase()
        );
        if (emailExists) {
          throw new Error('Ya existe un cliente con este email');
        }
      }

      // Update cliente
      const clienteActualizado: Cliente = {
        ...clientes[index],
        ...updates,
        updatedAt: Timestamp.now()
      };

      clientes[index] = clienteActualizado;
      const saved = this.saveClientes(clientes);

      if (!saved) {
        throw new Error('Error al actualizar el cliente');
      }

      return clienteActualizado;
    } catch (error) {
      console.error('Error updating cliente:', error);
      throw error;
    }
  }

  /**
   * Get a single cliente by ID
   * Requirement: 1.2
   */
  async getCliente(clienteId: string): Promise<Cliente | null> {
    try {
      const clientes = this.getClientes();
      return clientes.find(c => c.id === clienteId) || null;
    } catch (error) {
      console.error('Error getting cliente:', error);
      throw new Error('Error al obtener el cliente');
    }
  }

  /**
   * Get all clientes
   * Requirement: 1.2
   */
  async getClientesAll(): Promise<Cliente[]> {
    try {
      return this.getClientes();
    } catch (error) {
      console.error('Error getting clientes:', error);
      throw new Error('Error al obtener los clientes');
    }
  }

  /**
   * Update cliente statistics
   * Requirement: 1.3, 1.4
   */
  async updateClienteStats(
    clienteId: string,
    statsUpdate: Partial<ClienteStats>
  ): Promise<Cliente> {
    try {
      const clientes = this.getClientes();
      const index = clientes.findIndex(c => c.id === clienteId);

      if (index === -1) {
        throw new Error('Cliente no encontrado');
      }

      // Update stats
      const clienteActualizado: Cliente = {
        ...clientes[index],
        stats: {
          ...clientes[index].stats,
          ...statsUpdate
        },
        updatedAt: Timestamp.now()
      };

      clientes[index] = clienteActualizado;
      const saved = this.saveClientes(clientes);

      if (!saved) {
        throw new Error('Error al actualizar estadísticas del cliente');
      }

      return clienteActualizado;
    } catch (error) {
      console.error('Error updating cliente stats:', error);
      throw error;
    }
  }

  /**
   * Search clientes by nombre, empresa, or email
   * Requirement: 1.5
   */
  async searchClientes(query: string): Promise<Cliente[]> {
    try {
      if (!query || query.trim() === '') {
        return this.getClientes();
      }

      const searchTerm = query.toLowerCase().trim();
      const clientes = this.getClientes();

      return clientes.filter(cliente => {
        const nombre = cliente.nombre?.toLowerCase() || '';
        const empresa = cliente.empresa?.toLowerCase() || '';
        const email = cliente.email?.toLowerCase() || '';

        return (
          nombre.includes(searchTerm) ||
          empresa.includes(searchTerm) ||
          email.includes(searchTerm)
        );
      });
    } catch (error) {
      console.error('Error searching clientes:', error);
      throw new Error('Error al buscar clientes');
    }
  }

  /**
   * Delete a cliente
   * Note: This should check for dependencies (presupuestos, proyectos) before deleting
   */
  async deleteCliente(clienteId: string): Promise<boolean> {
    try {
      const clientes = this.getClientes();
      const index = clientes.findIndex(c => c.id === clienteId);

      if (index === -1) {
        throw new Error('Cliente no encontrado');
      }

      // Check if cliente has active projects or presupuestos
      const cliente = clientes[index];
      if (cliente.stats.proyectosActivos > 0) {
        throw new Error('No se puede eliminar un cliente con proyectos activos');
      }

      // Remove cliente
      clientes.splice(index, 1);
      return this.saveClientes(clientes);
    } catch (error) {
      console.error('Error deleting cliente:', error);
      throw error;
    }
  }

  /**
   * Get clientes sorted by a specific field
   */
  async getClientesSorted(
    sortBy: 'nombre' | 'empresa' | 'totalFacturado' | 'createdAt' = 'nombre',
    order: 'asc' | 'desc' = 'asc'
  ): Promise<Cliente[]> {
    try {
      const clientes = this.getClientes();

      return clientes.sort((a, b) => {
        let valueA: any;
        let valueB: any;

        switch (sortBy) {
          case 'nombre':
            valueA = a.nombre.toLowerCase();
            valueB = b.nombre.toLowerCase();
            break;
          case 'empresa':
            valueA = (a.empresa || '').toLowerCase();
            valueB = (b.empresa || '').toLowerCase();
            break;
          case 'totalFacturado':
            valueA = a.stats.totalFacturado;
            valueB = b.stats.totalFacturado;
            break;
          case 'createdAt':
            valueA = a.createdAt.toMillis();
            valueB = b.createdAt.toMillis();
            break;
          default:
            valueA = a.nombre.toLowerCase();
            valueB = b.nombre.toLowerCase();
        }

        if (valueA < valueB) return order === 'asc' ? -1 : 1;
        if (valueA > valueB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    } catch (error) {
      console.error('Error getting sorted clientes:', error);
      throw new Error('Error al ordenar clientes');
    }
  }

  /**
   * Get recent clientes (by creation date)
   */
  async getClientesRecientes(limit: number = 5): Promise<Cliente[]> {
    try {
      const clientes = await this.getClientesSorted('createdAt', 'desc');
      return clientes.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent clientes:', error);
      throw new Error('Error al obtener clientes recientes');
    }
  }

  /**
   * Get cliente by email
   */
  async getClienteByEmail(email: string): Promise<Cliente | null> {
    try {
      const clientes = this.getClientes();
      return clientes.find(c => c.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error('Error getting cliente by email:', error);
      throw new Error('Error al obtener cliente por email');
    }
  }
}

// Export singleton instance
export const clienteService = new ClienteService();
export default clienteService;
