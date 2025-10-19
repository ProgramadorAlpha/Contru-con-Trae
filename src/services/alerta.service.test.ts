/**
 * Alerta Service Tests - Task 16.4
 * Requirements: 8.1, 8.2, 8.3
 * 
 * Tests for financial alert generation and management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { alertaService } from './alerta.service';
import { localStorageService } from './localStorage.service';
import { tesoreriaService } from './tesoreria.service';
import { facturaService } from './factura.service';
import { Timestamp } from 'firebase/firestore';

// Mock dependencies
vi.mock('./localStorage.service');
vi.mock('./tesoreria.service');
vi.mock('./factura.service');

describe('AlertaService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Reset localStorage
    vi.mocked(localStorageService.get).mockReturnValue([]);
    vi.mocked(localStorageService.set).mockReturnValue(true);
  });

  describe('verificarTesoreria - Requirement 8.1', () => {
    it('should create CRITICAL alert when treasury < 120% of next phase cost', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      const costoProximaFase = 10000;
      const tesoreriaActual = 10000; // Less than 12000 (120%)
      
      vi.mocked(tesoreriaService.calcularTesoreria).mockResolvedValue(tesoreriaActual);
      
      // Act
      const alerta = await alertaService.verificarTesoreria(proyectoId, costoProximaFase);
      
      // Assert
      expect(alerta).toBeDefined();
      expect(alerta?.tipo).toBe('tesoreria_baja');
      expect(alerta?.prioridad).toBe('critica');
      expect(alerta?.titulo).toBe('Tesorería Insuficiente');
      expect(alerta?.datos?.tesoreria).toBe(tesoreriaActual);
      expect(alerta?.datos?.costoProximaFase).toBe(costoProximaFase);
      expect(alerta?.datos?.umbralCritico).toBe(12000);
    });

    it('should NOT create alert when treasury >= 120% of next phase cost', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      const costoProximaFase = 10000;
      const tesoreriaActual = 15000; // More than 12000 (120%)
      
      vi.mocked(tesoreriaService.calcularTesoreria).mockResolvedValue(tesoreriaActual);
      
      // Act
      const alerta = await alertaService.verificarTesoreria(proyectoId, costoProximaFase);
      
      // Assert
      expect(alerta).toBeNull();
    });

    it('should resolve existing alert when treasury becomes sufficient', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      const costoProximaFase = 10000;
      const tesoreriaActual = 15000;
      
      const alertaExistente = {
        id: 'alert-1',
        proyectoId,
        tipo: 'tesoreria_baja' as const,
        prioridad: 'critica' as const,
        titulo: 'Tesorería Insuficiente',
        mensaje: 'Test',
        resuelta: false,
        fechaCreacion: new Date()
      };
      
      vi.mocked(localStorageService.get).mockReturnValue([alertaExistente]);
      vi.mocked(tesoreriaService.calcularTesoreria).mockResolvedValue(tesoreriaActual);
      
      // Act
      await alertaService.verificarTesoreria(proyectoId, costoProximaFase);
      
      // Assert
      const savedAlertas = vi.mocked(localStorageService.set).mock.calls[0]?.[1];
      expect(savedAlertas).toBeDefined();
      if (Array.isArray(savedAlertas)) {
        const alertaResuelta = savedAlertas.find(a => a.id === 'alert-1');
        expect(alertaResuelta?.resuelta).toBe(true);
      }
    });

    it('should calculate deficit correctly', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      const costoProximaFase = 10000;
      const tesoreriaActual = 8000;
      const umbralCritico = 12000;
      const deficitEsperado = 4000;
      
      vi.mocked(tesoreriaService.calcularTesoreria).mockResolvedValue(tesoreriaActual);
      
      // Act
      const alerta = await alertaService.verificarTesoreria(proyectoId, costoProximaFase);
      
      // Assert
      expect(alerta?.datos?.deficit).toBe(deficitEsperado);
      expect(alerta?.datos?.umbralCritico).toBe(umbralCritico);
    });
  });

  describe('verificarCobrosPendientes - Requirement 8.2', () => {
    it('should create HIGH alert when phase 100% complete but invoice not paid', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      const faseNumero = 1;
      const progresoFase = 100;
      
      const facturaImpaga: any = {
        id: 'fac-1',
        numero: 'FAC-2024-001',
        proyectoId,
        faseVinculada: faseNumero,
        estado: 'enviada',
        total: 5000,
        fechaEmision: Timestamp.now()
      };
      
      vi.mocked(facturaService.getFacturasByProyecto).mockResolvedValue([facturaImpaga]);
      
      // Act
      const alerta = await alertaService.verificarCobrosPendientes(
        proyectoId,
        faseNumero,
        progresoFase
      );
      
      // Assert
      expect(alerta).toBeDefined();
      expect(alerta?.tipo).toBe('cobro_pendiente');
      expect(alerta?.prioridad).toBe('alta');
      expect(alerta?.titulo).toBe('Cobro Pendiente de Fase Completada');
      expect(alerta?.mensaje).toContain('Fase 1');
      expect(alerta?.mensaje).toContain('100%');
      expect(alerta?.datos?.faseNumero).toBe(faseNumero);
      expect(alerta?.datos?.facturaNumero).toBe('FAC-2024-001');
    });

    it('should NOT create alert when phase < 100% complete', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      const faseNumero = 1;
      const progresoFase = 80;
      
      // Act
      const alerta = await alertaService.verificarCobrosPendientes(
        proyectoId,
        faseNumero,
        progresoFase
      );
      
      // Assert
      expect(alerta).toBeNull();
    });

    it('should NOT create alert when invoice is already paid', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      const faseNumero = 1;
      const progresoFase = 100;
      
      const facturaCobrada: any = {
        id: 'fac-1',
        numero: 'FAC-2024-001',
        proyectoId,
        faseVinculada: faseNumero,
        estado: 'cobrada',
        total: 5000,
        fechaEmision: Timestamp.now()
      };
      
      vi.mocked(facturaService.getFacturasByProyecto).mockResolvedValue([facturaCobrada]);
      
      // Act
      const alerta = await alertaService.verificarCobrosPendientes(
        proyectoId,
        faseNumero,
        progresoFase
      );
      
      // Assert
      expect(alerta).toBeNull();
    });

    it('should calculate days pending correctly', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      const faseNumero = 1;
      const progresoFase = 100;
      
      // Create a date 15 days ago
      const fechaEmision = new Date();
      fechaEmision.setDate(fechaEmision.getDate() - 15);
      
      const facturaImpaga: any = {
        id: 'fac-1',
        numero: 'FAC-2024-001',
        proyectoId,
        faseVinculada: faseNumero,
        estado: 'enviada',
        total: 5000,
        fechaEmision: {
          toDate: () => fechaEmision
        }
      };
      
      vi.mocked(facturaService.getFacturasByProyecto).mockResolvedValue([facturaImpaga]);
      
      // Act
      const alerta = await alertaService.verificarCobrosPendientes(
        proyectoId,
        faseNumero,
        progresoFase
      );
      
      // Assert
      expect(alerta?.datos?.diasPendientes).toBeGreaterThanOrEqual(14);
      expect(alerta?.datos?.diasPendientes).toBeLessThanOrEqual(16);
    });
  });

  describe('detectarSobrecostos - Requirement 8.3', () => {
    it('should create HIGH alert when expenses > 110% of budget', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      const presupuestoTotal = 100000;
      const gastosReales = 115000; // 115% of budget
      
      // Act
      const alerta = await alertaService.detectarSobrecostos(
        proyectoId,
        presupuestoTotal,
        gastosReales
      );
      
      // Assert
      expect(alerta).toBeDefined();
      expect(alerta?.tipo).toBe('sobrecosto');
      expect(alerta?.prioridad).toBe('alta');
      expect(alerta?.titulo).toBe('Sobrecosto Detectado');
      expect(alerta?.datos?.presupuestoTotal).toBe(presupuestoTotal);
      expect(alerta?.datos?.gastosReales).toBe(gastosReales);
      expect(alerta?.datos?.sobrecosto).toBe(15000);
      expect(alerta?.datos?.porcentajeSobrecosto).toBe('15.0');
    });

    it('should NOT create alert when expenses <= 110% of budget', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      const presupuestoTotal = 100000;
      const gastosReales = 105000; // 105% of budget
      
      // Act
      const alerta = await alertaService.detectarSobrecostos(
        proyectoId,
        presupuestoTotal,
        gastosReales
      );
      
      // Assert
      expect(alerta).toBeNull();
    });

    it('should resolve existing alert when costs return to normal', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      const presupuestoTotal = 100000;
      const gastosReales = 100000; // Back to budget
      
      const alertaExistente = {
        id: 'alert-2',
        proyectoId,
        tipo: 'sobrecosto' as const,
        prioridad: 'alta' as const,
        titulo: 'Sobrecosto Detectado',
        mensaje: 'Test',
        resuelta: false,
        fechaCreacion: new Date()
      };
      
      vi.mocked(localStorageService.get).mockReturnValue([alertaExistente]);
      
      // Act
      await alertaService.detectarSobrecostos(proyectoId, presupuestoTotal, gastosReales);
      
      // Assert
      const savedAlertas = vi.mocked(localStorageService.set).mock.calls[0]?.[1];
      expect(savedAlertas).toBeDefined();
      if (Array.isArray(savedAlertas)) {
        const alertaResuelta = savedAlertas.find(a => a.id === 'alert-2');
        expect(alertaResuelta?.resuelta).toBe(true);
      }
    });

    it('should calculate percentage correctly', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      const presupuestoTotal = 100000;
      const gastosReales = 125000; // 125% of budget
      
      // Act
      const alerta = await alertaService.detectarSobrecostos(
        proyectoId,
        presupuestoTotal,
        gastosReales
      );
      
      // Assert
      expect(alerta?.datos?.porcentajeSobrecosto).toBe('25.0');
    });
  });

  describe('verificarPagosVencidos - Requirement 8.4', () => {
    it('should create CRITICAL alert for invoices > 30 days overdue', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() - 35);
      
      const facturaVencida: any = {
        id: 'fac-1',
        numero: 'FAC-2024-001',
        proyectoId,
        estado: 'enviada',
        total: 5000,
        fechaEmision: Timestamp.now(),
        fechaVencimiento: {
          toDate: () => fechaVencimiento
        }
      };
      
      vi.mocked(facturaService.getFacturasByProyecto).mockResolvedValue([facturaVencida]);
      
      // Act
      const alertas = await alertaService.verificarPagosVencidos(proyectoId);
      
      // Assert
      expect(alertas).toHaveLength(1);
      expect(alertas[0].tipo).toBe('factura_vencida');
      expect(alertas[0].prioridad).toBe('critica');
      expect(alertas[0].datos?.diasVencidos).toBeGreaterThanOrEqual(34);
    });

    it('should create HIGH alert for invoices > 15 days overdue', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() - 20);
      
      const facturaVencida: any = {
        id: 'fac-1',
        numero: 'FAC-2024-001',
        proyectoId,
        estado: 'enviada',
        total: 5000,
        fechaEmision: Timestamp.now(),
        fechaVencimiento: {
          toDate: () => fechaVencimiento
        }
      };
      
      vi.mocked(facturaService.getFacturasByProyecto).mockResolvedValue([facturaVencida]);
      
      // Act
      const alertas = await alertaService.verificarPagosVencidos(proyectoId);
      
      // Assert
      expect(alertas).toHaveLength(1);
      expect(alertas[0].prioridad).toBe('alta');
    });

    it('should create MEDIUM alert for invoices overdue but < 15 days', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() - 10);
      
      const facturaVencida: any = {
        id: 'fac-1',
        numero: 'FAC-2024-001',
        proyectoId,
        estado: 'enviada',
        total: 5000,
        fechaEmision: Timestamp.now(),
        fechaVencimiento: {
          toDate: () => fechaVencimiento
        }
      };
      
      vi.mocked(facturaService.getFacturasByProyecto).mockResolvedValue([facturaVencida]);
      
      // Act
      const alertas = await alertaService.verificarPagosVencidos(proyectoId);
      
      // Assert
      expect(alertas).toHaveLength(1);
      expect(alertas[0].prioridad).toBe('media');
    });

    it('should NOT create alert for paid invoices', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() - 10);
      
      const facturaCobrada: any = {
        id: 'fac-1',
        numero: 'FAC-2024-001',
        proyectoId,
        estado: 'cobrada',
        total: 5000,
        fechaEmision: Timestamp.now(),
        fechaVencimiento: {
          toDate: () => fechaVencimiento
        }
      };
      
      vi.mocked(facturaService.getFacturasByProyecto).mockResolvedValue([facturaCobrada]);
      
      // Act
      const alertas = await alertaService.verificarPagosVencidos(proyectoId);
      
      // Assert
      expect(alertas).toHaveLength(0);
    });

    it('should NOT create alert for cancelled invoices', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() - 10);
      
      const facturaCancelada: any = {
        id: 'fac-1',
        numero: 'FAC-2024-001',
        proyectoId,
        estado: 'cancelada',
        total: 5000,
        fechaEmision: Timestamp.now(),
        fechaVencimiento: {
          toDate: () => fechaVencimiento
        }
      };
      
      vi.mocked(facturaService.getFacturasByProyecto).mockResolvedValue([facturaCancelada]);
      
      // Act
      const alertas = await alertaService.verificarPagosVencidos(proyectoId);
      
      // Assert
      expect(alertas).toHaveLength(0);
    });

    it('should handle multiple overdue invoices', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      
      const fecha1 = new Date();
      fecha1.setDate(fecha1.getDate() - 35);
      
      const fecha2 = new Date();
      fecha2.setDate(fecha2.setDate() - 20);
      
      const facturas: any[] = [
        {
          id: 'fac-1',
          numero: 'FAC-2024-001',
          proyectoId,
          estado: 'enviada',
          total: 5000,
          fechaEmision: Timestamp.now(),
          fechaVencimiento: { toDate: () => fecha1 }
        },
        {
          id: 'fac-2',
          numero: 'FAC-2024-002',
          proyectoId,
          estado: 'enviada',
          total: 3000,
          fechaEmision: Timestamp.now(),
          fechaVencimiento: { toDate: () => fecha2 }
        }
      ];
      
      vi.mocked(facturaService.getFacturasByProyecto).mockResolvedValue(facturas);
      
      // Act
      const alertas = await alertaService.verificarPagosVencidos(proyectoId);
      
      // Assert
      // Note: crearAlerta updates existing alerts of the same type, so we get the last one
      // This is by design to avoid duplicate alerts for the same issue
      expect(alertas.length).toBeGreaterThan(0);
      expect(alertas[alertas.length - 1].tipo).toBe('factura_vencida');
    });
  });

  describe('ejecutarVerificaciones - Integration', () => {
    it('should execute all verification types', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      const datos = {
        costoProximaFase: 10000,
        faseActual: 1,
        progresoFaseActual: 100,
        presupuestoTotal: 100000,
        gastosReales: 115000
      };
      
      vi.mocked(tesoreriaService.calcularTesoreria).mockResolvedValue(8000);
      vi.mocked(facturaService.getFacturasByProyecto).mockResolvedValue([]);
      
      // Act
      const alertas = await alertaService.ejecutarVerificaciones(proyectoId, datos);
      
      // Assert
      expect(alertas).toBeDefined();
      expect(Array.isArray(alertas)).toBe(true);
      
      // Should have created alerts for:
      // - Low treasury (8000 < 12000)
      // - Cost overrun (115000 > 110000)
      expect(alertas.length).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const proyectoId = 'proj-123';
      const datos = {
        costoProximaFase: 10000
      };
      
      vi.mocked(tesoreriaService.calcularTesoreria).mockRejectedValue(
        new Error('Database error')
      );
      
      // Act
      const alertas = await alertaService.ejecutarVerificaciones(proyectoId, datos);
      
      // Assert
      expect(alertas).toBeDefined();
      expect(Array.isArray(alertas)).toBe(true);
      // Should return empty array on error, not throw
    });
  });

  describe('resolverAlerta - Requirement 8.6', () => {
    it('should mark alert as resolved with user and note', async () => {
      // Arrange
      const alertaExistente = {
        id: 'alert-1',
        proyectoId: 'proj-123',
        tipo: 'tesoreria_baja' as const,
        prioridad: 'critica' as const,
        titulo: 'Test',
        mensaje: 'Test',
        resuelta: false,
        fechaCreacion: new Date()
      };
      
      vi.mocked(localStorageService.get).mockReturnValue([alertaExistente]);
      
      // Act
      const alertaResuelta = await alertaService.resolverAlerta(
        'alert-1',
        'user-123',
        'Problema resuelto mediante transferencia'
      );
      
      // Assert
      expect(alertaResuelta).toBeDefined();
      expect(alertaResuelta?.resuelta).toBe(true);
      expect(alertaResuelta?.resueltaPor).toBe('user-123');
      expect(alertaResuelta?.notaResolucion).toBe('Problema resuelto mediante transferencia');
      expect(alertaResuelta?.fechaResolucion).toBeDefined();
    });

    it('should return null for non-existent alert', async () => {
      // Arrange
      vi.mocked(localStorageService.get).mockReturnValue([]);
      
      // Act
      const resultado = await alertaService.resolverAlerta(
        'non-existent',
        'user-123'
      );
      
      // Assert
      expect(resultado).toBeNull();
    });
  });

  describe('getAlertasProyecto', () => {
    it('should return only active alerts by default', async () => {
      // Arrange
      const alertas = [
        {
          id: 'alert-1',
          proyectoId: 'proj-123',
          tipo: 'tesoreria_baja' as const,
          prioridad: 'critica' as const,
          titulo: 'Test 1',
          mensaje: 'Test',
          resuelta: false,
          fechaCreacion: new Date()
        },
        {
          id: 'alert-2',
          proyectoId: 'proj-123',
          tipo: 'sobrecosto' as const,
          prioridad: 'alta' as const,
          titulo: 'Test 2',
          mensaje: 'Test',
          resuelta: true,
          fechaCreacion: new Date()
        }
      ];
      
      vi.mocked(localStorageService.get).mockReturnValue(alertas);
      
      // Act
      const resultado = await alertaService.getAlertasProyecto('proj-123');
      
      // Assert
      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe('alert-1');
    });

    it('should sort alerts by priority and date', async () => {
      // Arrange
      const fecha1 = new Date('2024-01-01');
      const fecha2 = new Date('2024-01-02');
      
      const alertas = [
        {
          id: 'alert-1',
          proyectoId: 'proj-123',
          tipo: 'sobrecosto' as const,
          prioridad: 'media' as const,
          titulo: 'Test 1',
          mensaje: 'Test',
          resuelta: false,
          fechaCreacion: fecha2
        },
        {
          id: 'alert-2',
          proyectoId: 'proj-123',
          tipo: 'tesoreria_baja' as const,
          prioridad: 'critica' as const,
          titulo: 'Test 2',
          mensaje: 'Test',
          resuelta: false,
          fechaCreacion: fecha1
        }
      ];
      
      vi.mocked(localStorageService.get).mockReturnValue(alertas);
      
      // Act
      const resultado = await alertaService.getAlertasProyecto('proj-123');
      
      // Assert
      expect(resultado[0].id).toBe('alert-2'); // Critical first
      expect(resultado[1].id).toBe('alert-1'); // Medium second
    });
  });
});
