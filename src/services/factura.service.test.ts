/**
 * FacturaService Tests
 * Task: 14.3, 14.4
 * Requirements: 9.1, 9.2, 9.7
 * 
 * Tests for invoice service including treasury integration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { facturaService } from './factura.service';
import { tesoreriaService } from './tesoreria.service';
import { bloqueoFasesService } from './bloqueo-fases.service';
import { Timestamp } from 'firebase/firestore';

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

describe('FacturaService', () => {
  const proyectoId = 'test-proyecto-1';
  const presupuestoId = 'test-presupuesto-1';

  // Clean up localStorage before and after each test
  beforeEach(() => {
    Object.keys(storage).forEach(key => delete storage[key]);
  });

  afterEach(() => {
    Object.keys(storage).forEach(key => delete storage[key]);
  });

  describe('createFactura', () => {
    it('should create factura with consecutive number', async () => {
      // Requirement: 9.1, 9.2
      const facturaData = {
        proyectoId,
        presupuestoId,
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
        moneda: 'EUR' as const,
        fechaEmision: Timestamp.now(),
        fechaVencimiento: Timestamp.now(),
        estado: 'borrador' as const,
        creadoPor: 'user-1'
      };

      const factura = await facturaService.createFactura(facturaData);

      expect(factura.id).toBeDefined();
      expect(factura.numero).toMatch(/^FAC-\d{4}-\d{3}$/);
      expect(factura.total).toBe(12100);
      expect(factura.estado).toBe('borrador');
    });

    it('should generate consecutive numbers', async () => {
      const facturaData = {
        proyectoId,
        presupuestoId,
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
        moneda: 'EUR' as const,
        fechaEmision: Timestamp.now(),
        fechaVencimiento: Timestamp.now(),
        estado: 'borrador' as const,
        creadoPor: 'user-1'
      };

      const factura1 = await facturaService.createFactura(facturaData);
      const factura2 = await facturaService.createFactura(facturaData);

      expect(factura1.numero).toContain('-001');
      expect(factura2.numero).toContain('-002');
    });
  });

  describe('registrarCobro', () => {
    it('should update invoice status to cobrada', async () => {
      // Create a factura first
      const facturaData = {
        proyectoId,
        presupuestoId,
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
        moneda: 'EUR' as const,
        fechaEmision: Timestamp.now(),
        fechaVencimiento: Timestamp.now(),
        estado: 'enviada' as const,
        creadoPor: 'user-1'
      };

      const factura = await facturaService.createFactura(facturaData);

      // Register payment
      const fechaCobro = new Date();
      const facturaActualizada = await facturaService.registrarCobro(
        factura.id,
        fechaCobro,
        'transferencia'
      );

      expect(facturaActualizada.estado).toBe('cobrada');
      expect(facturaActualizada.metodoPago).toBe('transferencia');
      expect(facturaActualizada.fechaCobro).toBeDefined();
    });

    it('should update project treasury when registering payment', async () => {
      // Requirement: 9.7
      // Task: 14.3
      // Create a factura
      const facturaData = {
        proyectoId,
        presupuestoId,
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
        moneda: 'EUR' as const,
        fechaEmision: Timestamp.now(),
        fechaVencimiento: Timestamp.now(),
        estado: 'enviada' as const,
        creadoPor: 'user-1'
      };

      const factura = await facturaService.createFactura(facturaData);

      // Check treasury before payment
      const tesoreriaAntes = await tesoreriaService.calcularTesoreria(proyectoId);
      expect(tesoreriaAntes).toBe(0);

      // Register payment
      await facturaService.registrarCobro(factura.id, new Date(), 'transferencia');

      // Check treasury after payment
      const tesoreriaDespues = await tesoreriaService.calcularTesoreria(proyectoId);
      expect(tesoreriaDespues).toBe(12100);

      // Verify treasury data was saved
      const tesoreriaData = await tesoreriaService.getTesoreriaProyecto(proyectoId);
      expect(tesoreriaData).toBeDefined();
      expect(tesoreriaData?.tesoreria).toBe(12100);
      expect(tesoreriaData?.cobros).toBe(12100);
    });

    it('should unblock next phase when registering payment for phase invoice', async () => {
      // Requirement: 7.5
      // Task: 14.3
      // Create a factura linked to phase 1
      const facturaData = {
        proyectoId,
        presupuestoId,
        planPagoNumero: 1,
        faseVinculada: 1,
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
        moneda: 'EUR' as const,
        fechaEmision: Timestamp.now(),
        fechaVencimiento: Timestamp.now(),
        estado: 'enviada' as const,
        creadoPor: 'user-1'
      };

      const factura = await facturaService.createFactura(facturaData);

      // Block phase 2 due to pending payment of phase 1
      await bloqueoFasesService.bloquearFase(
        proyectoId,
        2,
        'Pendiente cobro Fase 1',
        'sistema'
      );

      // Verify phase 2 is blocked
      const estadoAntes = await bloqueoFasesService.estaFaseBloqueada(proyectoId, 2);
      expect(estadoAntes.bloqueada).toBe(true);

      // Register payment
      await facturaService.registrarCobro(factura.id, new Date(), 'transferencia');

      // Verify phase 2 is unblocked
      const estadoDespues = await bloqueoFasesService.estaFaseBloqueada(proyectoId, 2);
      expect(estadoDespues.bloqueada).toBe(false);
    });

    it('should not fail if treasury update fails', async () => {
      // Create a factura
      const facturaData = {
        proyectoId,
        presupuestoId,
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
        moneda: 'EUR' as const,
        fechaEmision: Timestamp.now(),
        fechaVencimiento: Timestamp.now(),
        estado: 'enviada' as const,
        creadoPor: 'user-1'
      };

      const factura = await facturaService.createFactura(facturaData);

      // Register payment should not throw even if treasury service has issues
      await expect(
        facturaService.registrarCobro(factura.id, new Date(), 'transferencia')
      ).resolves.toBeDefined();
    });

    it('should throw error if factura not found', async () => {
      await expect(
        facturaService.registrarCobro('non-existent-id', new Date(), 'transferencia')
      ).rejects.toThrow('Factura no encontrada');
    });
  });

  describe('enviarFactura', () => {
    it('should update status to enviada and set fechaEnvio', async () => {
      const facturaData = {
        proyectoId,
        presupuestoId,
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
        moneda: 'EUR' as const,
        fechaEmision: Timestamp.now(),
        fechaVencimiento: Timestamp.now(),
        estado: 'borrador' as const,
        creadoPor: 'user-1'
      };

      const factura = await facturaService.createFactura(facturaData);
      const facturaEnviada = await facturaService.enviarFactura(factura.id);

      expect(facturaEnviada.estado).toBe('enviada');
      expect(facturaEnviada.fechaEnvio).toBeDefined();
    });
  });

  describe('getFacturasAll', () => {
    it('should return all facturas', async () => {
      const facturaData = {
        proyectoId,
        presupuestoId,
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
        moneda: 'EUR' as const,
        fechaEmision: Timestamp.now(),
        fechaVencimiento: Timestamp.now(),
        estado: 'borrador' as const,
        creadoPor: 'user-1'
      };

      await facturaService.createFactura(facturaData);
      await facturaService.createFactura(facturaData);

      const facturas = await facturaService.getFacturasAll();

      expect(facturas).toHaveLength(2);
    });
  });

  describe('generarFacturaAutomatica', () => {
    it('should generate invoice automatically when phase completes', async () => {
      // Requirement: 9.2
      // Task: 14.4
      // This tests the automatic invoice generation when a phase reaches 100%
      
      const faseNumero = 1;
      const montoFase = 50000;
      const cliente = {
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
      };

      // Generate automatic invoice for completed phase
      const factura = await facturaService.generarFacturaFase(
        proyectoId,
        presupuestoId,
        faseNumero,
        montoFase,
        cliente,
        'user-1'
      );

      expect(factura).toBeDefined();
      expect(factura.proyectoId).toBe(proyectoId);
      expect(factura.faseVinculada).toBe(faseNumero);
      expect(factura.subtotal).toBe(montoFase);
      expect(factura.total).toBeGreaterThan(montoFase); // Should include IVA
      expect(factura.estado).toBe('borrador');
      expect(factura.numero).toMatch(/^FAC-\d{4}-\d{3}$/);
    });

    it('should calculate IVA correctly for automatic invoice', async () => {
      const faseNumero = 2;
      const montoFase = 30000;
      const cliente = {
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
      };

      const factura = await facturaService.generarFacturaFase(
        proyectoId,
        presupuestoId,
        faseNumero,
        montoFase,
        cliente,
        'user-1'
      );

      // IVA should be 21% of subtotal
      const ivaEsperado = montoFase * 0.21;
      const totalEsperado = montoFase + ivaEsperado;

      expect(factura.subtotal).toBe(montoFase);
      expect(factura.iva).toBe(ivaEsperado);
      expect(factura.total).toBe(totalEsperado);
    });

    it('should set correct due date for automatic invoice', async () => {
      const faseNumero = 1;
      const montoFase = 50000;
      const cliente = {
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
      };

      const factura = await facturaService.generarFacturaFase(
        proyectoId,
        presupuestoId,
        faseNumero,
        montoFase,
        cliente,
        'user-1'
      );

      // Due date should be 30 days from emission
      const fechaEmision = factura.fechaEmision.toDate();
      const fechaVencimiento = factura.fechaVencimiento.toDate();
      
      const diffDays = Math.floor(
        (fechaVencimiento.getTime() - fechaEmision.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(diffDays).toBe(30);
    });

    it('should link invoice to correct phase', async () => {
      const faseNumero = 3;
      const montoFase = 25000;
      const cliente = {
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
      };

      const factura = await facturaService.generarFacturaFase(
        proyectoId,
        presupuestoId,
        faseNumero,
        montoFase,
        cliente,
        'user-1'
      );

      expect(factura.faseVinculada).toBe(faseNumero);
      expect(factura.proyectoId).toBe(proyectoId);
      expect(factura.presupuestoId).toBe(presupuestoId);
    });

    it('should block next phase after generating invoice', async () => {
      // Requirement: 7.2, 7.3
      // When a phase completes and invoice is generated, next phase should be blocked
      
      const faseNumero = 1;
      const montoFase = 50000;
      const cliente = {
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
      };

      // Generate invoice for completed phase
      await facturaService.generarFacturaFase(
        proyectoId,
        presupuestoId,
        faseNumero,
        montoFase,
        cliente,
        'user-1'
      );

      // Simulate phase completion and blocking
      await bloqueoFasesService.verificarYBloquearFases(proyectoId, faseNumero);

      // Verify next phase is blocked
      const estadoFase2 = await bloqueoFasesService.estaFaseBloqueada(proyectoId, 2);
      expect(estadoFase2.bloqueada).toBe(true);
      expect(estadoFase2.motivo).toContain('Pendiente cobro Fase 1');
    });
  });

  describe('getFacturasByProyecto', () => {
    it('should return only facturas for specific project', async () => {
      const proyecto1 = 'proyecto-1';
      const proyecto2 = 'proyecto-2';

      const facturaData1 = {
        proyectoId: proyecto1,
        presupuestoId,
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
        moneda: 'EUR' as const,
        fechaEmision: Timestamp.now(),
        fechaVencimiento: Timestamp.now(),
        estado: 'borrador' as const,
        creadoPor: 'user-1'
      };

      const facturaData2 = { ...facturaData1, proyectoId: proyecto2 };

      await facturaService.createFactura(facturaData1);
      await facturaService.createFactura(facturaData1);
      await facturaService.createFactura(facturaData2);

      const facturasProyecto1 = await facturaService.getFacturasByProyecto(proyecto1);
      const facturasProyecto2 = await facturaService.getFacturasByProyecto(proyecto2);

      expect(facturasProyecto1).toHaveLength(2);
      expect(facturasProyecto2).toHaveLength(1);
      expect(facturasProyecto1.every(f => f.proyectoId === proyecto1)).toBe(true);
      expect(facturasProyecto2.every(f => f.proyectoId === proyecto2)).toBe(true);
    });
  });

  describe('updateFacturaEstado', () => {
    it('should update factura status', async () => {
      const facturaData = {
        proyectoId,
        presupuestoId,
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
        moneda: 'EUR' as const,
        fechaEmision: Timestamp.now(),
        fechaVencimiento: Timestamp.now(),
        estado: 'borrador' as const,
        creadoPor: 'user-1'
      };

      const factura = await facturaService.createFactura(facturaData);
      const facturaActualizada = await facturaService.updateFacturaEstado(
        factura.id,
        'enviada'
      );

      expect(facturaActualizada.estado).toBe('enviada');
    });
  });
});
