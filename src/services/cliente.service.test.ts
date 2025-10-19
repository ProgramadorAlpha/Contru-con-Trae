/**
 * ClienteService Tests
 * 
 * Unit tests for ClienteService
 * Requirements: 1.1, 1.3, 1.5
 * Task: 2.3
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { clienteService } from './cliente.service';
import { localStorageService } from './localStorage.service';
import { Timestamp } from 'firebase/firestore';

describe('ClienteService', () => {
  // Clean up localStorage after each test
  afterEach(() => {
    localStorageService.remove('clientes');
  });

  describe('createCliente', () => {
    it('should create a cliente with valid data', async () => {
      // Requirement: 1.1
      const clienteData = {
        nombre: 'Juan Pérez',
        empresa: 'Construcciones ABC',
        email: 'juan@abc.com',
        telefono: '+34 600 123 456',
        cif: 'B12345678',
        direccion: {
          calle: 'Calle Mayor 123',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        },
        datosBancarios: {
          banco: 'Banco Santander',
          iban: 'ES91 2100 0418 4502 0005 1332',
          swift: 'BSCHESMMXXX'
        }
      };

      const cliente = await clienteService.createCliente(clienteData);

      expect(cliente).toBeDefined();
      expect(cliente.id).toBeDefined();
      expect(cliente.nombre).toBe(clienteData.nombre);
      expect(cliente.email).toBe(clienteData.email);
      expect(cliente.stats).toBeDefined();
      expect(cliente.stats.totalPresupuestos).toBe(0);
      expect(cliente.createdAt).toBeDefined();
      expect(cliente.updatedAt).toBeDefined();
    });

    it('should throw error if required fields are missing', async () => {
      const invalidData = {
        nombre: 'Juan Pérez',
        // Missing email and telefono
        direccion: {
          calle: 'Calle Mayor 123',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      } as any;

      await expect(clienteService.createCliente(invalidData)).rejects.toThrow();
    });

    it('should throw error if email format is invalid', async () => {
      const invalidData = {
        nombre: 'Juan Pérez',
        email: 'invalid-email',
        telefono: '+34 600 123 456',
        direccion: {
          calle: 'Calle Mayor 123',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      };

      await expect(clienteService.createCliente(invalidData)).rejects.toThrow('Formato de email inválido');
    });

    it('should throw error if email already exists', async () => {
      const clienteData = {
        nombre: 'Juan Pérez',
        email: 'juan@abc.com',
        telefono: '+34 600 123 456',
        direccion: {
          calle: 'Calle Mayor 123',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      };

      await clienteService.createCliente(clienteData);
      await expect(clienteService.createCliente(clienteData)).rejects.toThrow('Ya existe un cliente con este email');
    });

    it('should initialize stats to zero', async () => {
      const clienteData = {
        nombre: 'Juan Pérez',
        email: 'juan@abc.com',
        telefono: '+34 600 123 456',
        direccion: {
          calle: 'Calle Mayor 123',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      };

      const cliente = await clienteService.createCliente(clienteData);

      expect(cliente.stats.totalPresupuestos).toBe(0);
      expect(cliente.stats.presupuestosAprobados).toBe(0);
      expect(cliente.stats.totalFacturado).toBe(0);
      expect(cliente.stats.totalCobrado).toBe(0);
      expect(cliente.stats.proyectosActivos).toBe(0);
      expect(cliente.stats.proyectosCompletados).toBe(0);
    });
  });

  describe('updateCliente', () => {
    it('should update cliente data', async () => {
      // Create a cliente first
      const clienteData = {
        nombre: 'Juan Pérez',
        email: 'juan@abc.com',
        telefono: '+34 600 123 456',
        direccion: {
          calle: 'Calle Mayor 123',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      };

      const cliente = await clienteService.createCliente(clienteData);

      // Update the cliente
      const updates = {
        nombre: 'Juan Pérez García',
        empresa: 'Nueva Empresa SL'
      };

      const clienteActualizado = await clienteService.updateCliente(cliente.id, updates);

      expect(clienteActualizado.nombre).toBe(updates.nombre);
      expect(clienteActualizado.empresa).toBe(updates.empresa);
      expect(clienteActualizado.email).toBe(clienteData.email); // Should remain unchanged
    });

    it('should throw error if cliente not found', async () => {
      await expect(
        clienteService.updateCliente('invalid-id', { nombre: 'Test' })
      ).rejects.toThrow('Cliente no encontrado');
    });

    it('should validate email format when updating', async () => {
      const cliente = await clienteService.createCliente({
        nombre: 'Juan Pérez',
        email: 'juan@abc.com',
        telefono: '+34 600 123 456',
        direccion: {
          calle: 'Calle Mayor 123',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      });

      await expect(
        clienteService.updateCliente(cliente.id, { email: 'invalid-email' })
      ).rejects.toThrow('Formato de email inválido');
    });
  });

  describe('getCliente', () => {
    it('should return cliente by ID', async () => {
      const clienteData = {
        nombre: 'Juan Pérez',
        email: 'juan@abc.com',
        telefono: '+34 600 123 456',
        direccion: {
          calle: 'Calle Mayor 123',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      };

      const createdCliente = await clienteService.createCliente(clienteData);
      const cliente = await clienteService.getCliente(createdCliente.id);

      expect(cliente).toBeDefined();
      expect(cliente?.id).toBe(createdCliente.id);
      expect(cliente?.nombre).toBe(clienteData.nombre);
    });

    it('should return null for non-existent cliente', async () => {
      const cliente = await clienteService.getCliente('invalid-id');
      expect(cliente).toBeNull();
    });
  });

  describe('getClientesAll', () => {
    it('should return all clientes', async () => {
      // Create multiple clientes
      await clienteService.createCliente({
        nombre: 'Cliente 1',
        email: 'cliente1@test.com',
        telefono: '+34 600 111 111',
        direccion: {
          calle: 'Calle 1',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      });

      await clienteService.createCliente({
        nombre: 'Cliente 2',
        email: 'cliente2@test.com',
        telefono: '+34 600 222 222',
        direccion: {
          calle: 'Calle 2',
          ciudad: 'Barcelona',
          provincia: 'Barcelona',
          codigoPostal: '08001',
          pais: 'España'
        }
      });

      const clientes = await clienteService.getClientesAll();

      expect(clientes).toBeDefined();
      expect(Array.isArray(clientes)).toBe(true);
      expect(clientes.length).toBe(2);
    });

    it('should return empty array when no clientes exist', async () => {
      const clientes = await clienteService.getClientesAll();
      expect(clientes).toEqual([]);
    });
  });

  describe('updateClienteStats', () => {
    it('should update cliente statistics when presupuesto is approved', async () => {
      // Requirement: 1.3
      const cliente = await clienteService.createCliente({
        nombre: 'Juan Pérez',
        email: 'juan@abc.com',
        telefono: '+34 600 123 456',
        direccion: {
          calle: 'Calle Mayor 123',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      });

      // Simulate presupuesto approval
      const statsUpdate = {
        totalPresupuestos: 1,
        presupuestosAprobados: 1,
        totalFacturado: 50000
      };

      const clienteActualizado = await clienteService.updateClienteStats(cliente.id, statsUpdate);

      expect(clienteActualizado.stats.totalPresupuestos).toBe(1);
      expect(clienteActualizado.stats.presupuestosAprobados).toBe(1);
      expect(clienteActualizado.stats.totalFacturado).toBe(50000);
    });

    it('should preserve other stats when updating', async () => {
      const cliente = await clienteService.createCliente({
        nombre: 'Juan Pérez',
        email: 'juan@abc.com',
        telefono: '+34 600 123 456',
        direccion: {
          calle: 'Calle Mayor 123',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      });

      // Update only some stats
      await clienteService.updateClienteStats(cliente.id, {
        totalPresupuestos: 5
      });

      const clienteActualizado = await clienteService.getCliente(cliente.id);

      expect(clienteActualizado?.stats.totalPresupuestos).toBe(5);
      expect(clienteActualizado?.stats.presupuestosAprobados).toBe(0); // Should remain 0
      expect(clienteActualizado?.stats.proyectosActivos).toBe(0); // Should remain 0
    });

    it('should throw error if cliente not found', async () => {
      await expect(
        clienteService.updateClienteStats('invalid-id', { totalPresupuestos: 1 })
      ).rejects.toThrow('Cliente no encontrado');
    });
  });

  describe('searchClientes', () => {
    beforeEach(async () => {
      // Create test clientes
      await clienteService.createCliente({
        nombre: 'Juan Pérez',
        empresa: 'Construcciones ABC',
        email: 'juan@abc.com',
        telefono: '+34 600 111 111',
        direccion: {
          calle: 'Calle 1',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      });

      await clienteService.createCliente({
        nombre: 'María García',
        empresa: 'Reformas XYZ',
        email: 'maria@xyz.com',
        telefono: '+34 600 222 222',
        direccion: {
          calle: 'Calle 2',
          ciudad: 'Barcelona',
          provincia: 'Barcelona',
          codigoPostal: '08001',
          pais: 'España'
        }
      });

      await clienteService.createCliente({
        nombre: 'Pedro López',
        empresa: 'ABC Ingeniería',
        email: 'pedro@abc-ing.com',
        telefono: '+34 600 333 333',
        direccion: {
          calle: 'Calle 3',
          ciudad: 'Valencia',
          provincia: 'Valencia',
          codigoPostal: '46001',
          pais: 'España'
        }
      });
    });

    it('should search clientes by nombre', async () => {
      // Requirement: 1.5
      const results = await clienteService.searchClientes('Juan');

      expect(results.length).toBe(1);
      expect(results[0].nombre).toContain('Juan');
    });

    it('should search clientes by empresa', async () => {
      // Requirement: 1.5
      const results = await clienteService.searchClientes('ABC');

      expect(results.length).toBe(2);
      expect(results.every(c => c.empresa?.includes('ABC'))).toBe(true);
    });

    it('should search clientes by email', async () => {
      // Requirement: 1.5
      const results = await clienteService.searchClientes('maria@xyz.com');

      expect(results.length).toBe(1);
      expect(results[0].email).toBe('maria@xyz.com');
    });

    it('should be case insensitive', async () => {
      const results = await clienteService.searchClientes('JUAN');

      expect(results.length).toBe(1);
      expect(results[0].nombre).toContain('Juan');
    });

    it('should return all clientes when query is empty', async () => {
      const results = await clienteService.searchClientes('');

      expect(results.length).toBe(3);
    });

    it('should return empty array when no matches found', async () => {
      const results = await clienteService.searchClientes('NonExistent');

      expect(results.length).toBe(0);
    });
  });

  describe('deleteCliente', () => {
    it('should delete cliente without active projects', async () => {
      const cliente = await clienteService.createCliente({
        nombre: 'Juan Pérez',
        email: 'juan@abc.com',
        telefono: '+34 600 123 456',
        direccion: {
          calle: 'Calle Mayor 123',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      });

      const result = await clienteService.deleteCliente(cliente.id);
      expect(result).toBe(true);

      const deletedCliente = await clienteService.getCliente(cliente.id);
      expect(deletedCliente).toBeNull();
    });

    it('should throw error when deleting cliente with active projects', async () => {
      const cliente = await clienteService.createCliente({
        nombre: 'Juan Pérez',
        email: 'juan@abc.com',
        telefono: '+34 600 123 456',
        direccion: {
          calle: 'Calle Mayor 123',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      });

      // Simulate active projects
      await clienteService.updateClienteStats(cliente.id, {
        proyectosActivos: 2
      });

      await expect(
        clienteService.deleteCliente(cliente.id)
      ).rejects.toThrow('No se puede eliminar un cliente con proyectos activos');
    });

    it('should throw error if cliente not found', async () => {
      await expect(
        clienteService.deleteCliente('invalid-id')
      ).rejects.toThrow('Cliente no encontrado');
    });
  });

  describe('getClientesSorted', () => {
    beforeEach(async () => {
      await clienteService.createCliente({
        nombre: 'Carlos',
        email: 'carlos@test.com',
        telefono: '+34 600 111 111',
        direccion: {
          calle: 'Calle 1',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      });

      await clienteService.createCliente({
        nombre: 'Ana',
        email: 'ana@test.com',
        telefono: '+34 600 222 222',
        direccion: {
          calle: 'Calle 2',
          ciudad: 'Barcelona',
          provincia: 'Barcelona',
          codigoPostal: '08001',
          pais: 'España'
        }
      });

      await clienteService.createCliente({
        nombre: 'Beatriz',
        email: 'beatriz@test.com',
        telefono: '+34 600 333 333',
        direccion: {
          calle: 'Calle 3',
          ciudad: 'Valencia',
          provincia: 'Valencia',
          codigoPostal: '46001',
          pais: 'España'
        }
      });
    });

    it('should sort clientes by nombre ascending', async () => {
      const clientes = await clienteService.getClientesSorted('nombre', 'asc');

      expect(clientes[0].nombre).toBe('Ana');
      expect(clientes[1].nombre).toBe('Beatriz');
      expect(clientes[2].nombre).toBe('Carlos');
    });

    it('should sort clientes by nombre descending', async () => {
      const clientes = await clienteService.getClientesSorted('nombre', 'desc');

      expect(clientes[0].nombre).toBe('Carlos');
      expect(clientes[1].nombre).toBe('Beatriz');
      expect(clientes[2].nombre).toBe('Ana');
    });
  });

  describe('getClientesRecientes', () => {
    it('should return recent clientes', async () => {
      // Create clientes with delays to ensure different timestamps
      await clienteService.createCliente({
        nombre: 'Cliente 1',
        email: 'cliente1@test.com',
        telefono: '+34 600 111 111',
        direccion: {
          calle: 'Calle 1',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      });

      await clienteService.createCliente({
        nombre: 'Cliente 2',
        email: 'cliente2@test.com',
        telefono: '+34 600 222 222',
        direccion: {
          calle: 'Calle 2',
          ciudad: 'Barcelona',
          provincia: 'Barcelona',
          codigoPostal: '08001',
          pais: 'España'
        }
      });

      const recientes = await clienteService.getClientesRecientes(1);

      expect(recientes.length).toBe(1);
      expect(recientes[0].nombre).toBe('Cliente 2'); // Most recent
    });

    it('should limit results', async () => {
      for (let i = 1; i <= 10; i++) {
        await clienteService.createCliente({
          nombre: `Cliente ${i}`,
          email: `cliente${i}@test.com`,
          telefono: `+34 600 ${i}${i}${i} ${i}${i}${i}`,
          direccion: {
            calle: `Calle ${i}`,
            ciudad: 'Madrid',
            provincia: 'Madrid',
            codigoPostal: '28001',
            pais: 'España'
          }
        });
      }

      const recientes = await clienteService.getClientesRecientes(5);
      expect(recientes.length).toBe(5);
    });
  });

  describe('getClienteByEmail', () => {
    it('should return cliente by email', async () => {
      await clienteService.createCliente({
        nombre: 'Juan Pérez',
        email: 'juan@abc.com',
        telefono: '+34 600 123 456',
        direccion: {
          calle: 'Calle Mayor 123',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      });

      const cliente = await clienteService.getClienteByEmail('juan@abc.com');

      expect(cliente).toBeDefined();
      expect(cliente?.email).toBe('juan@abc.com');
    });

    it('should be case insensitive', async () => {
      await clienteService.createCliente({
        nombre: 'Juan Pérez',
        email: 'juan@abc.com',
        telefono: '+34 600 123 456',
        direccion: {
          calle: 'Calle Mayor 123',
          ciudad: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
          pais: 'España'
        }
      });

      const cliente = await clienteService.getClienteByEmail('JUAN@ABC.COM');

      expect(cliente).toBeDefined();
      expect(cliente?.email).toBe('juan@abc.com');
    });

    it('should return null for non-existent email', async () => {
      const cliente = await clienteService.getClienteByEmail('nonexistent@test.com');
      expect(cliente).toBeNull();
    });
  });
});
