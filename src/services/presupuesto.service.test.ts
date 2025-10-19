/**
 * Presupuesto Service Tests
 * Requirements: 3.1, 3.2, 3.3, 3.5, 3.7
 * Task: 6.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { presupuestoService } from './presupuesto.service';
import { localStorageService } from './localStorage.service';
import { Timestamp } from 'firebase/firestore';
import type { Presupuesto } from '../types/presupuesto.types';

// Mock localStorage service
vi.mock('./localStorage.service', () => ({
  localStorageService: {
    get: vi.fn(),
    set: vi.fn()
  }
}));

describe('PresupuestoService', () => {
  const mockPresupuesto: Omit<Presupuesto, 'id' | 'numero' | 'createdAt' | 'updatedAt'> = {
    nombre: 'Reforma Integral',
    version: 1,
    cliente: {
      id: 'cli_1',
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      telefono: '600123456',
      direccion: {
        calle: 'Calle Mayor 1',
        ciudad: 'Madrid',
        provincia: 'Madrid',
        codigoPostal: '28001',
        pais: 'España'
      }
    },
    ubicacionObra: {
      direccion: 'Calle Obra 1, Madrid'
    },
    montos: {
      subtotal: 10000,
      iva: 2100,
      total: 12100,
      moneda: 'EUR',
      porFase: []
    },
    fases: [],
    planPagos: [],
    estado: 'borrador',
    estadoDetalle: {
      enviadoCliente: false,
      convertidoAProyecto: false
    },
    fechaCreacion: Timestamp.now(),
    fechaValidez: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    diasValidez: 30,
    creadoConIA: false,
    documentos: [],
    condiciones: [],
    firmas: [],
    creadoPor: 'user_1'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (localStorageService.get as any).mockReturnValue([]);
    (localStorageService.set as any).mockReturnValue(true);
  });

  describe('createPresupuesto', () => {
    it('should create presupuesto with estado "borrador"', async () => {
      const result = await presupuestoService.createPresupuesto(mockPresupuesto);

      expect(result.estado).toBe('borrador');
      expect(result.id).toBeDefined();
      expect(result.numero).toMatch(/PRE-\d{4}-\d{3}/);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should generate consecutive presupuesto numbers', async () => {
      (localStorageService.get as any).mockReturnValue([
        { ...mockPresupuesto, id: 'pres_1', numero: 'PRE-2025-001' }
      ]);

      const result = await presupuestoService.createPresupuesto(mockPresupuesto);

      expect(result.numero).toBe('PRE-2025-002');
    });
  });

  describe('enviarPresupuesto', () => {
    it('should update estado to "enviado" and set fechaEnvio', async () => {
      const existingPresupuesto = {
        ...mockPresupuesto,
        id: 'pres_1',
        numero: 'PRE-2025-001',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      (localStorageService.get as any).mockReturnValue([existingPresupuesto]);

      const result = await presupuestoService.enviarPresupuesto('pres_1');

      expect(result.estado).toBe('enviado');
      expect(result.estadoDetalle.enviadoCliente).toBe(true);
      expect(result.estadoDetalle.fechaEnvio).toBeDefined();
    });
  });

  describe('aprobarPresupuesto', () => {
    it('should update estado to "aprobado" and register fechaAprobacion', async () => {
      const existingPresupuesto = {
        ...mockPresupuesto,
        id: 'pres_1',
        numero: 'PRE-2025-001',
        estado: 'enviado' as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      (localStorageService.get as any).mockReturnValue([existingPresupuesto]);

      const result = await presupuestoService.aprobarPresupuesto('pres_1');

      expect(result.estado).toBe('aprobado');
      expect(result.estadoDetalle.fechaAprobacion).toBeDefined();
    });
  });

  describe('rechazarPresupuesto', () => {
    it('should update estado to "rechazado" with motivo', async () => {
      const existingPresupuesto = {
        ...mockPresupuesto,
        id: 'pres_1',
        numero: 'PRE-2025-001',
        estado: 'enviado' as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      (localStorageService.get as any).mockReturnValue([existingPresupuesto]);

      const motivo = 'Precio muy alto';
      const result = await presupuestoService.rechazarPresupuesto('pres_1', motivo);

      expect(result.estado).toBe('rechazado');
      expect(result.estadoDetalle.fechaRechazo).toBeDefined();
      expect(result.estadoDetalle.motivoRechazo).toBe(motivo);
    });
  });

  describe('verificarExpiracion', () => {
    it('should mark expired presupuestos as "expirado"', async () => {
      const expiredPresupuesto = {
        ...mockPresupuesto,
        id: 'pres_1',
        numero: 'PRE-2025-001',
        estado: 'enviado' as const,
        fechaValidez: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)), // Yesterday
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      (localStorageService.get as any).mockReturnValue([expiredPresupuesto]);

      await presupuestoService.verificarExpiracion();

      expect(localStorageService.set).toHaveBeenCalledWith(
        'presupuestos',
        expect.arrayContaining([
          expect.objectContaining({
            id: 'pres_1',
            estado: 'expirado'
          })
        ])
      );
    });

    it('should not mark non-expired presupuestos', async () => {
      const validPresupuesto = {
        ...mockPresupuesto,
        id: 'pres_1',
        numero: 'PRE-2025-001',
        estado: 'enviado' as const,
        fechaValidez: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      (localStorageService.get as any).mockReturnValue([validPresupuesto]);

      await presupuestoService.verificarExpiracion();

      expect(localStorageService.set).toHaveBeenCalledWith(
        'presupuestos',
        expect.arrayContaining([
          expect.objectContaining({
            id: 'pres_1',
            estado: 'enviado'
          })
        ])
      );
    });
  });

  describe('getPresupuesto', () => {
    it('should return presupuesto by id', async () => {
      const existingPresupuesto = {
        ...mockPresupuesto,
        id: 'pres_1',
        numero: 'PRE-2025-001',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      (localStorageService.get as any).mockReturnValue([existingPresupuesto]);

      const result = await presupuestoService.getPresupuesto('pres_1');

      expect(result).toEqual(existingPresupuesto);
    });

    it('should return null if presupuesto not found', async () => {
      (localStorageService.get as any).mockReturnValue([]);

      const result = await presupuestoService.getPresupuesto('nonexistent');

      expect(result).toBeNull();
    });
  });
});
