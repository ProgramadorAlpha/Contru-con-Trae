/**
 * TesoreriaService Tests
 * Task: 12.3
 * Requirements: 6.1, 6.5
 * 
 * Tests for tesorería calculation and health indicators
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tesoreriaService } from './tesoreria.service';
import { localStorageService } from './localStorage.service';
import { Timestamp } from 'firebase/firestore';
import type { Factura } from '../types/factura.types';

// Mock localStorage with actual storage
const storage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => { storage[key] = value; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
  length: 0,
  key: (index: number) => Object.keys(storage)[index] || null
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('TesoreriaService', () => {
  const proyectoId = 'test-proyecto-1';

  // Clean up localStorage before and after each test
  beforeEach(() => {
    Object.keys(storage).forEach(key => delete storage[key]);
  });

  afterEach(() => {
    Object.keys(storage).forEach(key => delete storage[key]);
  });

  describe('calcularTesoreria', () => {
    it('should calculate tesorería correctly (cobros - gastos)', async () => {
      // Requirement: 6.1
      // Setup: Create facturas cobradas
      const now = Timestamp.now();
      const facturas: Factura[] = [
        {
          id: 'factura-1',
          numero: 'FAC-2025-001',
          proyectoId,
          presupuestoId: 'pres-1',
          planPagoNumero: 1,
          cliente: {
            id: 'cliente-1',
            nombre: 'Cliente Test',
            email: 'test@test.com',
            direccion: {
              calle: 'Calle Test',
              ciudad: 'Madrid',
              provincia: 'Madrid',
              codigoPostal: '28001',
              pais: 'España'
            }
          },
          subtotal: 10000,
          iva: 2100,
          total: 12100,
          moneda: 'EUR',
          fechaEmision: Timestamp.now(),
          fechaVencimiento: Timestamp.now(),
          fechaCobro: Timestamp.now(),
          estado: 'cobrada',
          creadoPor: 'user-1',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          id: 'factura-2',
          numero: 'FAC-2025-002',
          proyectoId,
          presupuestoId: 'pres-1',
          planPagoNumero: 2,
          cliente: {
            id: 'cliente-1',
            nombre: 'Cliente Test',
            email: 'test@test.com',
            direccion: {
              calle: 'Calle Test',
              ciudad: 'Madrid',
              provincia: 'Madrid',
              codigoPostal: '28001',
              pais: 'España'
            }
          },
          subtotal: 15000,
          iva: 3150,
          total: 18150,
          moneda: 'EUR',
          fechaEmision: Timestamp.now(),
          fechaVencimiento: Timestamp.now(),
          fechaCobro: Timestamp.now(),
          estado: 'cobrada',
          creadoPor: 'user-1',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      localStorageService.set('facturas', facturas);

      // Verify data was stored
      const storedFacturas = localStorageService.get<Factura[]>('facturas', []);
      expect(storedFacturas).toHaveLength(2);

      // Setup: Create gastos pagados
      const gastos = [
        {
          id: 'gasto-1',
          proyectoId,
          concepto: 'Materiales',
          monto: 5000,
          estado: 'pagado',
          fechaPago: new Date()
        },
        {
          id: 'gasto-2',
          proyectoId,
          concepto: 'Mano de obra',
          monto: 8000,
          estado: 'pagado',
          fechaPago: new Date()
        }
      ];

      localStorageService.set('gastos', gastos);

      // Test: Calculate tesorería
      const tesoreria = await tesoreriaService.calcularTesoreria(proyectoId);

      // Expected: (12100 + 18150) - (5000 + 8000) = 17250
      expect(tesoreria).toBe(17250);
    });

    it('should only count cobradas facturas', async () => {
      const facturas: Factura[] = [
        {
          id: 'factura-1',
          numero: 'FAC-2025-001',
          proyectoId,
          presupuestoId: 'pres-1',
          planPagoNumero: 1,
          cliente: {
            id: 'cliente-1',
            nombre: 'Cliente Test',
            email: 'test@test.com',
            direccion: {
              calle: 'Calle Test',
              ciudad: 'Madrid',
              provincia: 'Madrid',
              codigoPostal: '28001',
              pais: 'España'
            }
          },
          subtotal: 10000,
          iva: 2100,
          total: 12100,
          moneda: 'EUR',
          fechaEmision: Timestamp.now(),
          fechaVencimiento: Timestamp.now(),
          estado: 'cobrada',
          creadoPor: 'user-1',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          id: 'factura-2',
          numero: 'FAC-2025-002',
          proyectoId,
          presupuestoId: 'pres-1',
          planPagoNumero: 2,
          cliente: {
            id: 'cliente-1',
            nombre: 'Cliente Test',
            email: 'test@test.com',
            direccion: {
              calle: 'Calle Test',
              ciudad: 'Madrid',
              provincia: 'Madrid',
              codigoPostal: '28001',
              pais: 'España'
            }
          },
          subtotal: 15000,
          iva: 3150,
          total: 18150,
          moneda: 'EUR',
          fechaEmision: Timestamp.now(),
          fechaVencimiento: Timestamp.now(),
          estado: 'enviada', // Not cobrada
          creadoPor: 'user-1',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      localStorageService.set('facturas', facturas);
      localStorageService.set('gastos', []);

      const tesoreria = await tesoreriaService.calcularTesoreria(proyectoId);

      // Should only count the cobrada factura
      expect(tesoreria).toBe(12100);
    });

    it('should only count pagado gastos', async () => {
      localStorageService.set('facturas', []);

      const gastos = [
        {
          id: 'gasto-1',
          proyectoId,
          concepto: 'Materiales',
          monto: 5000,
          estado: 'pagado'
        },
        {
          id: 'gasto-2',
          proyectoId,
          concepto: 'Mano de obra',
          monto: 8000,
          estado: 'pendiente' // Not pagado
        }
      ];

      localStorageService.set('gastos', gastos);

      const tesoreria = await tesoreriaService.calcularTesoreria(proyectoId);

      // Should only count the pagado gasto
      expect(tesoreria).toBe(-5000);
    });

    it('should return 0 when no cobros or gastos exist', async () => {
      localStorageService.set('facturas', []);
      localStorageService.set('gastos', []);

      const tesoreria = await tesoreriaService.calcularTesoreria(proyectoId);

      expect(tesoreria).toBe(0);
    });

    it('should only calculate for specific proyecto', async () => {
      const facturas: Factura[] = [
        {
          id: 'factura-1',
          numero: 'FAC-2025-001',
          proyectoId: 'other-proyecto',
          presupuestoId: 'pres-1',
          planPagoNumero: 1,
          cliente: {
            id: 'cliente-1',
            nombre: 'Cliente Test',
            email: 'test@test.com',
            direccion: {
              calle: 'Calle Test',
              ciudad: 'Madrid',
              provincia: 'Madrid',
              codigoPostal: '28001',
              pais: 'España'
            }
          },
          subtotal: 10000,
          iva: 2100,
          total: 12100,
          moneda: 'EUR',
          fechaEmision: Timestamp.now(),
          fechaVencimiento: Timestamp.now(),
          estado: 'cobrada',
          creadoPor: 'user-1',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      localStorageService.set('facturas', facturas);
      localStorageService.set('gastos', []);

      const tesoreria = await tesoreriaService.calcularTesoreria(proyectoId);

      // Should not count factura from other proyecto
      expect(tesoreria).toBe(0);
    });
  });

  describe('getIndicadorSalud', () => {
    it('should return verde when tesorería > 50% of next phase cost', async () => {
      // Requirement: 6.5
      // Setup: Tesorería = 15000, Next phase cost = 20000
      // Percentage: (15000 / 20000) * 100 = 75% > 50%
      const facturas: Factura[] = [
        {
          id: 'factura-1',
          numero: 'FAC-2025-001',
          proyectoId,
          presupuestoId: 'pres-1',
          planPagoNumero: 1,
          cliente: {
            id: 'cliente-1',
            nombre: 'Cliente Test',
            email: 'test@test.com',
            direccion: {
              calle: 'Calle Test',
              ciudad: 'Madrid',
              provincia: 'Madrid',
              codigoPostal: '28001',
              pais: 'España'
            }
          },
          subtotal: 12396.69,
          iva: 2603.31,
          total: 15000,
          moneda: 'EUR',
          fechaEmision: Timestamp.now(),
          fechaVencimiento: Timestamp.now(),
          estado: 'cobrada',
          creadoPor: 'user-1',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      localStorageService.set('facturas', facturas);
      localStorageService.set('gastos', []);

      const indicador = await tesoreriaService.getIndicadorSalud(proyectoId, 20000);

      expect(indicador).toBe('verde');
    });

    it('should return amarillo when tesorería between 20% and 50% of next phase cost', async () => {
      // Setup: Tesorería = 7000, Next phase cost = 20000
      // Percentage: (7000 / 20000) * 100 = 35% (between 20% and 50%)
      const facturas: Factura[] = [
        {
          id: 'factura-1',
          numero: 'FAC-2025-001',
          proyectoId,
          presupuestoId: 'pres-1',
          planPagoNumero: 1,
          cliente: {
            id: 'cliente-1',
            nombre: 'Cliente Test',
            email: 'test@test.com',
            direccion: {
              calle: 'Calle Test',
              ciudad: 'Madrid',
              provincia: 'Madrid',
              codigoPostal: '28001',
              pais: 'España'
            }
          },
          subtotal: 5785.12,
          iva: 1214.88,
          total: 7000,
          moneda: 'EUR',
          fechaEmision: Timestamp.now(),
          fechaVencimiento: Timestamp.now(),
          estado: 'cobrada',
          creadoPor: 'user-1',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      localStorageService.set('facturas', facturas);
      localStorageService.set('gastos', []);

      const indicador = await tesoreriaService.getIndicadorSalud(proyectoId, 20000);

      expect(indicador).toBe('amarillo');
    });

    it('should return rojo when tesorería < 20% of next phase cost', async () => {
      // Requirement: 6.5
      // Setup: Tesorería = 3000, Next phase cost = 20000
      // Percentage: (3000 / 20000) * 100 = 15% < 20%
      const facturas: Factura[] = [
        {
          id: 'factura-1',
          numero: 'FAC-2025-001',
          proyectoId,
          presupuestoId: 'pres-1',
          planPagoNumero: 1,
          cliente: {
            id: 'cliente-1',
            nombre: 'Cliente Test',
            email: 'test@test.com',
            direccion: {
              calle: 'Calle Test',
              ciudad: 'Madrid',
              provincia: 'Madrid',
              codigoPostal: '28001',
              pais: 'España'
            }
          },
          subtotal: 2479.34,
          iva: 520.66,
          total: 3000,
          moneda: 'EUR',
          fechaEmision: Timestamp.now(),
          fechaVencimiento: Timestamp.now(),
          estado: 'cobrada',
          creadoPor: 'user-1',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      localStorageService.set('facturas', facturas);
      localStorageService.set('gastos', []);

      const indicador = await tesoreriaService.getIndicadorSalud(proyectoId, 20000);

      expect(indicador).toBe('rojo');
    });

    it('should return verde when next phase cost is 0', async () => {
      const facturas: Factura[] = [
        {
          id: 'factura-1',
          numero: 'FAC-2025-001',
          proyectoId,
          presupuestoId: 'pres-1',
          planPagoNumero: 1,
          cliente: {
            id: 'cliente-1',
            nombre: 'Cliente Test',
            email: 'test@test.com',
            direccion: {
              calle: 'Calle Test',
              ciudad: 'Madrid',
              provincia: 'Madrid',
              codigoPostal: '28001',
              pais: 'España'
            }
          },
          subtotal: 10000,
          iva: 2100,
          total: 12100,
          moneda: 'EUR',
          fechaEmision: Timestamp.now(),
          fechaVencimiento: Timestamp.now(),
          estado: 'cobrada',
          creadoPor: 'user-1',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      localStorageService.set('facturas', facturas);
      localStorageService.set('gastos', []);

      const indicador = await tesoreriaService.getIndicadorSalud(proyectoId, 0);

      expect(indicador).toBe('verde');
    });

    it('should handle negative tesorería', async () => {
      // Setup: More gastos than cobros
      localStorageService.set('facturas', []);

      const gastos = [
        {
          id: 'gasto-1',
          proyectoId,
          concepto: 'Materiales',
          monto: 25000,
          estado: 'pagado'
        }
      ];

      localStorageService.set('gastos', gastos);

      const indicador = await tesoreriaService.getIndicadorSalud(proyectoId, 20000);

      // Negative tesorería should be rojo
      expect(indicador).toBe('rojo');
    });

    it('should return rojo at exactly 20% threshold', async () => {
      // Setup: Tesorería = 4000, Next phase cost = 20000
      // Percentage: (4000 / 20000) * 100 = 20% (boundary)
      const facturas: Factura[] = [
        {
          id: 'factura-1',
          numero: 'FAC-2025-001',
          proyectoId,
          presupuestoId: 'pres-1',
          planPagoNumero: 1,
          cliente: {
            id: 'cliente-1',
            nombre: 'Cliente Test',
            email: 'test@test.com',
            direccion: {
              calle: 'Calle Test',
              ciudad: 'Madrid',
              provincia: 'Madrid',
              codigoPostal: '28001',
              pais: 'España'
            }
          },
          subtotal: 3305.79,
          iva: 694.21,
          total: 4000,
          moneda: 'EUR',
          fechaEmision: Timestamp.now(),
          fechaVencimiento: Timestamp.now(),
          estado: 'cobrada',
          creadoPor: 'user-1',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      localStorageService.set('facturas', facturas);
      localStorageService.set('gastos', []);

      const indicador = await tesoreriaService.getIndicadorSalud(proyectoId, 20000);

      // At exactly 20%, should still be rojo (> 20 for amarillo)
      expect(indicador).toBe('rojo');
    });

    it('should return amarillo at exactly 50% threshold', async () => {
      // Setup: Tesorería = 10000, Next phase cost = 20000
      // Percentage: (10000 / 20000) * 100 = 50% (boundary)
      const facturas: Factura[] = [
        {
          id: 'factura-1',
          numero: 'FAC-2025-001',
          proyectoId,
          presupuestoId: 'pres-1',
          planPagoNumero: 1,
          cliente: {
            id: 'cliente-1',
            nombre: 'Cliente Test',
            email: 'test@test.com',
            direccion: {
              calle: 'Calle Test',
              ciudad: 'Madrid',
              provincia: 'Madrid',
              codigoPostal: '28001',
              pais: 'España'
            }
          },
          subtotal: 8264.46,
          iva: 1735.54,
          total: 10000,
          moneda: 'EUR',
          fechaEmision: Timestamp.now(),
          fechaVencimiento: Timestamp.now(),
          estado: 'cobrada',
          creadoPor: 'user-1',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      localStorageService.set('facturas', facturas);
      localStorageService.set('gastos', []);

      const indicador = await tesoreriaService.getIndicadorSalud(proyectoId, 20000);

      // At exactly 50%, should still be amarillo (> 50 for verde)
      expect(indicador).toBe('amarillo');
    });
  });

  describe('actualizarTesoreria', () => {
    it('should save tesorería data', async () => {
      await tesoreriaService.actualizarTesoreria(proyectoId, 10000, 5000, 5000);

      const data = await tesoreriaService.getTesoreriaProyecto(proyectoId);

      expect(data).toBeDefined();
      expect(data?.proyectoId).toBe(proyectoId);
      expect(data?.cobros).toBe(10000);
      expect(data?.gastosPagados).toBe(5000);
      expect(data?.tesoreria).toBe(5000);
    });

    it('should update existing tesorería data', async () => {
      await tesoreriaService.actualizarTesoreria(proyectoId, 10000, 5000, 5000);
      await tesoreriaService.actualizarTesoreria(proyectoId, 15000, 7000, 8000);

      const data = await tesoreriaService.getTesoreriaProyecto(proyectoId);

      expect(data?.cobros).toBe(15000);
      expect(data?.gastosPagados).toBe(7000);
      expect(data?.tesoreria).toBe(8000);
    });
  });

  describe('getDesglose', () => {
    it('should return desglose of cobros and gastos', async () => {
      const facturas: Factura[] = [
        {
          id: 'factura-1',
          numero: 'FAC-2025-001',
          proyectoId,
          presupuestoId: 'pres-1',
          planPagoNumero: 1,
          cliente: {
            id: 'cliente-1',
            nombre: 'Cliente Test',
            email: 'test@test.com',
            direccion: {
              calle: 'Calle Test',
              ciudad: 'Madrid',
              provincia: 'Madrid',
              codigoPostal: '28001',
              pais: 'España'
            }
          },
          subtotal: 10000,
          iva: 2100,
          total: 12100,
          moneda: 'EUR',
          fechaEmision: Timestamp.now(),
          fechaVencimiento: Timestamp.now(),
          fechaCobro: Timestamp.now(),
          estado: 'cobrada',
          creadoPor: 'user-1',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      localStorageService.set('facturas', facturas);

      const gastos = [
        {
          id: 'gasto-1',
          proyectoId,
          concepto: 'Materiales',
          monto: 5000,
          estado: 'pagado',
          fechaPago: new Date()
        }
      ];

      localStorageService.set('gastos', gastos);

      const desglose = await tesoreriaService.getDesglose(proyectoId);

      expect(desglose.cobros).toHaveLength(1);
      expect(desglose.cobros[0].concepto).toBe('Factura FAC-2025-001');
      expect(desglose.cobros[0].monto).toBe(12100);

      expect(desglose.gastos).toHaveLength(1);
      expect(desglose.gastos[0].concepto).toBe('Materiales');
      expect(desglose.gastos[0].monto).toBe(5000);
    });
  });
});
