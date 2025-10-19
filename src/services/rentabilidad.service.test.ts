/**
 * Rentabilidad Service Tests - Task 19.1
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { rentabilidadService } from './rentabilidad.service';
import { localStorageService } from './localStorage.service';
import { Timestamp } from 'firebase/firestore';
import type { Presupuesto } from '../types/presupuesto.types';
import type { Factura } from '../types/factura.types';
import type { Expense } from '../types/expenses';

describe('RentabilidadService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageService.clear();
    // Initialize empty arrays for all storage keys
    localStorageService.set('presupuestos', []);
    localStorageService.set('facturas', []);
    localStorageService.set('expenses', []);
    localStorageService.set('analisis_rentabilidad', []);
  });

  describe('calcularAnalisisRentabilidad', () => {
    it('should calculate complete profitability analysis', async () => {
      // Setup test data
      const presupuestoId = 'pres_test_1';
      const proyectoId = 'proj_test_1';

      // Create presupuesto
      const presupuesto: Presupuesto = {
        id: presupuestoId,
        numero: 'PRE-2025-001',
        nombre: 'Test Project',
        version: 1,
        cliente: {
          id: 'cli_1',
          nombre: 'Test Client',
          email: 'test@example.com',
          telefono: '123456789',
          direccion: {
            calle: 'Test St',
            ciudad: 'Test City',
            provincia: 'Test Province',
            codigoPostal: '12345',
            pais: 'España'
          }
        },
        ubicacionObra: {
          direccion: 'Test Location'
        },
        montos: {
          subtotal: 100000,
          iva: 21000,
          total: 121000,
          moneda: 'EUR',
          porFase: [
            { fase: 1, nombre: 'Fase 1', monto: 60000 },
            { fase: 2, nombre: 'Fase 2', monto: 40000 }
          ]
        },
        fases: [
          {
            numero: 1,
            nombre: 'Fase 1',
            monto: 60000,
            duracionEstimada: 30,
            porcentajeCobro: 60,
            partidas: []
          },
          {
            numero: 2,
            nombre: 'Fase 2',
            monto: 40000,
            duracionEstimada: 20,
            porcentajeCobro: 40,
            partidas: []
          }
        ],
        planPagos: [],
        estado: 'convertido',
        estadoDetalle: {
          enviadoCliente: true,
          convertidoAProyecto: true,
          proyectoId,
          fechaConversion: Timestamp.now()
        },
        fechaCreacion: Timestamp.now(),
        fechaValidez: Timestamp.now(),
        diasValidez: 30,
        creadoConIA: false,
        documentos: [],
        condiciones: [],
        firmas: [],
        creadoPor: 'user_1',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Get existing presupuestos and add new one
      const existingPresupuestos = localStorageService.get<Presupuesto[]>('presupuestos', []);
      existingPresupuestos.push(presupuesto);
      localStorageService.set('presupuestos', existingPresupuestos);

      // Create facturas
      const facturas: Factura[] = [
        {
          id: 'fac_1',
          numero: 'FAC-2025-001',
          proyectoId,
          presupuestoId,
          planPagoNumero: 1,
          faseVinculada: 1,
          cliente: {
            id: 'cli_1',
            nombre: 'Test Client',
            email: 'test@example.com',
            direccion: presupuesto.cliente.direccion
          },
          subtotal: 60000,
          iva: 12600,
          total: 72600,
          moneda: 'EUR',
          fechaEmision: Timestamp.now(),
          fechaVencimiento: Timestamp.now(),
          estado: 'cobrada',
          fechaCobro: Timestamp.now(),
          creadoPor: 'user_1',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          id: 'fac_2',
          numero: 'FAC-2025-002',
          proyectoId,
          presupuestoId,
          planPagoNumero: 2,
          faseVinculada: 2,
          cliente: {
            id: 'cli_1',
            nombre: 'Test Client',
            email: 'test@example.com',
            direccion: presupuesto.cliente.direccion
          },
          subtotal: 40000,
          iva: 8400,
          total: 48400,
          moneda: 'EUR',
          fechaEmision: Timestamp.now(),
          fechaVencimiento: Timestamp.now(),
          estado: 'cobrada',
          fechaCobro: Timestamp.now(),
          creadoPor: 'user_1',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      localStorageService.set('facturas', facturas);

      // Create expenses
      const expenses: Expense[] = [
        {
          id: 'exp_1',
          projectId: proyectoId,
          projectName: 'Test Project',
          costCodeId: 'cc_1',
          costCode: {
            id: 'cc_1',
            code: 'MAT-001',
            name: 'Materiales',
            category: 'materials',
            description: 'Materials',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          supplierId: 'sup_1',
          supplierName: 'Test Supplier',
          amount: 30000,
          currency: 'EUR',
          totalAmount: 30000,
          description: 'Materials purchase',
          invoiceDate: new Date().toISOString(),
          status: 'paid',
          paymentStatus: 'paid',
          submittedBy: 'user_1',
          submittedAt: new Date().toISOString(),
          isAutoCreated: false,
          needsReview: false,
          attachments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'exp_2',
          projectId: proyectoId,
          projectName: 'Test Project',
          costCodeId: 'cc_2',
          costCode: {
            id: 'cc_2',
            code: 'LAB-001',
            name: 'Personal',
            category: 'labor',
            description: 'Labor',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          supplierId: 'sup_2',
          supplierName: 'Test Supplier 2',
          amount: 20000,
          currency: 'EUR',
          totalAmount: 20000,
          description: 'Labor costs',
          invoiceDate: new Date().toISOString(),
          status: 'paid',
          paymentStatus: 'paid',
          submittedBy: 'user_1',
          submittedAt: new Date().toISOString(),
          isAutoCreated: false,
          needsReview: false,
          attachments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      localStorageService.set('expenses', expenses);

      // Calculate analysis
      const analisis = await rentabilidadService.calcularAnalisisRentabilidad(
        proyectoId,
        presupuestoId
      );

      // Verify results
      expect(analisis).toBeDefined();
      expect(analisis.proyectoId).toBe(proyectoId);
      expect(analisis.presupuestoId).toBe(presupuestoId);

      // Requirement 11.2: Income calculation
      expect(analisis.ingresos.presupuestoOriginal).toBe(121000);
      expect(analisis.ingresos.totalFacturado).toBe(121000);
      expect(analisis.ingresos.totalCobrado).toBe(121000);
      expect(analisis.ingresos.cambiosAprobados).toBe(0);

      // Requirement 11.3: Direct costs by category
      expect(analisis.costosDirectos.materiales).toBe(30000);
      expect(analisis.costosDirectos.total).toBe(30000);

      // Requirement 11.4: Operational expenses
      expect(analisis.gastosOperativos.personalPropio).toBe(20000);
      expect(analisis.gastosOperativos.total).toBe(20000);

      // Requirement 11.5: Margins and ROI
      expect(analisis.margenBruto).toBe(91000); // 121000 - 30000
      expect(analisis.utilidadNeta).toBe(71000); // 91000 - 20000
      expect(analisis.roi).toBeGreaterThan(0);

      // Requirement 11.6: Comparative analysis
      expect(analisis.comparativa).toBeDefined();
      expect(analisis.comparativa.length).toBeGreaterThan(0);

      // Requirement 11.7: Execution time
      expect(analisis.tiempoEjecucion).toBeDefined();
      expect(analisis.tiempoEjecucion.planificado).toBe(50); // 30 + 20 days
    });

    it('should handle project with no expenses', async () => {
      const presupuestoId = 'pres_test_2';
      const proyectoId = 'proj_test_2';

      const presupuesto: Presupuesto = {
        id: presupuestoId,
        numero: 'PRE-2025-002',
        nombre: 'Test Project 2',
        version: 1,
        cliente: {
          id: 'cli_1',
          nombre: 'Test Client',
          email: 'test@example.com',
          telefono: '123456789',
          direccion: {
            calle: 'Test St',
            ciudad: 'Test City',
            provincia: 'Test Province',
            codigoPostal: '12345',
            pais: 'España'
          }
        },
        ubicacionObra: {
          direccion: 'Test Location'
        },
        montos: {
          subtotal: 50000,
          iva: 10500,
          total: 60500,
          moneda: 'EUR',
          porFase: []
        },
        fases: [],
        planPagos: [],
        estado: 'convertido',
        estadoDetalle: {
          enviadoCliente: true,
          convertidoAProyecto: true,
          proyectoId,
          fechaConversion: Timestamp.now()
        },
        fechaCreacion: Timestamp.now(),
        fechaValidez: Timestamp.now(),
        diasValidez: 30,
        creadoConIA: false,
        documentos: [],
        condiciones: [],
        firmas: [],
        creadoPor: 'user_1',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Get existing presupuestos and add new one
      const existingPresupuestos = localStorageService.get<Presupuesto[]>('presupuestos', []);
      existingPresupuestos.push(presupuesto);
      localStorageService.set('presupuestos', existingPresupuestos);
      localStorageService.set('facturas', []);
      localStorageService.set('expenses', []);

      const analisis = await rentabilidadService.calcularAnalisisRentabilidad(
        proyectoId,
        presupuestoId
      );

      expect(analisis).toBeDefined();
      expect(analisis.costosDirectos.total).toBe(0);
      expect(analisis.gastosOperativos.total).toBe(0);
      expect(analisis.margenBruto).toBe(0);
      expect(analisis.utilidadNeta).toBe(0);
    });

    it('should throw error if presupuesto not found', async () => {
      await expect(
        rentabilidadService.calcularAnalisisRentabilidad('invalid_proj', 'invalid_pres')
      ).rejects.toThrow('Presupuesto no encontrado');
    });
  });

  describe('agregarNota', () => {
    it('should add note to existing analysis', async () => {
      const proyectoId = 'proj_test_3';
      const presupuestoId = 'pres_test_3';

      // Create a minimal presupuesto and calculate analysis first
      const presupuesto: Presupuesto = {
        id: presupuestoId,
        numero: 'PRE-2025-003',
        nombre: 'Test Project 3',
        version: 1,
        cliente: {
          id: 'cli_1',
          nombre: 'Test Client',
          email: 'test@example.com',
          telefono: '123456789',
          direccion: {
            calle: 'Test St',
            ciudad: 'Test City',
            provincia: 'Test Province',
            codigoPostal: '12345',
            pais: 'España'
          }
        },
        ubicacionObra: {
          direccion: 'Test Location'
        },
        montos: {
          subtotal: 50000,
          iva: 10500,
          total: 60500,
          moneda: 'EUR',
          porFase: []
        },
        fases: [],
        planPagos: [],
        estado: 'convertido',
        estadoDetalle: {
          enviadoCliente: true,
          convertidoAProyecto: true,
          proyectoId,
          fechaConversion: Timestamp.now()
        },
        fechaCreacion: Timestamp.now(),
        fechaValidez: Timestamp.now(),
        diasValidez: 30,
        creadoConIA: false,
        documentos: [],
        condiciones: [],
        firmas: [],
        creadoPor: 'user_1',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Get existing presupuestos and add new one
      const existingPresupuestos = localStorageService.get<Presupuesto[]>('presupuestos', []);
      existingPresupuestos.push(presupuesto);
      localStorageService.set('presupuestos', existingPresupuestos);
      localStorageService.set('facturas', []);
      localStorageService.set('expenses', []);

      // Calculate initial analysis
      await rentabilidadService.calcularAnalisisRentabilidad(proyectoId, presupuestoId);

      // Add note
      const nota = 'Test note about variations';
      const analisisActualizado = await rentabilidadService.agregarNota(proyectoId, nota);

      expect(analisisActualizado.notas).toContain(nota);
      expect(analisisActualizado.notas.length).toBe(1);
    });

    it('should throw error if analysis not found', async () => {
      await expect(
        rentabilidadService.agregarNota('invalid_proj', 'Test note')
      ).rejects.toThrow('Análisis no encontrado');
    });
  });

  describe('getAnalisisByProyecto', () => {
    it('should return null if analysis not found', async () => {
      const analisis = await rentabilidadService.getAnalisisByProyecto('invalid_proj');
      expect(analisis).toBeNull();
    });
  });
});
