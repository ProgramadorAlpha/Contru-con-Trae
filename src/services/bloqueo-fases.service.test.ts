/**
 * BloqueoFasesService Tests
 * Task: 13.3
 * Requirements: 7.1, 7.3, 7.5
 * 
 * Tests for phase blocking based on payment status
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { bloqueoFasesService } from './bloqueo-fases.service';
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

describe('BloqueoFasesService', () => {
  const proyectoId = 'test-proyecto-1';

  beforeEach(() => {
    Object.keys(storage).forEach(key => delete storage[key]);
  });

  afterEach(() => {
    Object.keys(storage).forEach(key => delete storage[key]);
  });

  describe('validarInicioFase', () => {
    it('should allow Fase 1 to start with adelanto cobrado', async () => {
      // Requirement: 7.1
      // Fase 1 can always start (adelanto is checked elsewhere)
      const resultado = await bloqueoFasesService.validarInicioFase(proyectoId, 1);

      expect(resultado.puedeIniciar).toBe(true);
      expect(resultado.motivo).toBeUndefined();
    });

    it('should block Fase 2 if Fase 1 not cobrada', async () => {
      // Requirement: 7.3
      // Setup: No factura cobrada for Fase 1
      localStorageService.set('facturas', []);

      const resultado = await bloqueoFasesService.validarInicioFase(proyectoId, 2);

      expect(resultado.puedeIniciar).toBe(false);
      expect(resultado.motivo).toBe('Pendiente cobro Fase 1');
    });

    it('should allow Fase 2 when Fase 1 is cobrada', async () => {
      // Requirement: 7.5
      // Setup: Create cobrada factura for Fase 1
      const now = Timestamp.now();
      const facturas: Factura[] = [
        {
          id: 'factura-1',
          numero: 'FAC-2025-001',
          proyectoId,
          presupuestoId: 'pres-1',
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
          moneda: 'EUR',
          fechaEmision: now,
          fechaVencimiento: now,
          fechaCobro: now,
          estado: 'cobrada',
          creadoPor: 'user-1',
          createdAt: now,
          updatedAt: now
        }
      ];

      localStorageService.set('facturas', facturas);

      const resultado = await bloqueoFasesService.validarInicioFase(proyectoId, 2);

      expect(resultado.puedeIniciar).toBe(true);
      expect(resultado.motivo).toBeUndefined();
    });

    it('should block Fase 3 if Fase 2 not cobrada', async () => {
      // Setup: Fase 1 cobrada, Fase 2 not cobrada
      const now = Timestamp.now();
      const facturas: Factura[] = [
        {
          id: 'factura-1',
          numero: 'FAC-2025-001',
          proyectoId,
          presupuestoId: 'pres-1',
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
          moneda: 'EUR',
          fechaEmision: now,
          fechaVencimiento: now,
          fechaCobro: now,
          estado: 'cobrada',
          creadoPor: 'user-1',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'factura-2',
          numero: 'FAC-2025-002',
          proyectoId,
          presupuestoId: 'pres-1',
          planPagoNumero: 2,
          faseVinculada: 2,
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
          fechaEmision: now,
          fechaVencimiento: now,
          estado: 'enviada', // Not cobrada
          creadoPor: 'user-1',
          createdAt: now,
          updatedAt: now
        }
      ];

      localStorageService.set('facturas', facturas);

      const resultado = await bloqueoFasesService.validarInicioFase(proyectoId, 3);

      expect(resultado.puedeIniciar).toBe(false);
      expect(resultado.motivo).toBe('Pendiente cobro Fase 2');
    });
  });

  describe('bloquearFase', () => {
    it('should block a phase with motivo', async () => {
      const bloqueo = await bloqueoFasesService.bloquearFase(
        proyectoId,
        2,
        'Pendiente cobro Fase 1',
        'sistema'
      );

      expect(bloqueo.proyectoId).toBe(proyectoId);
      expect(bloqueo.faseNumero).toBe(2);
      expect(bloqueo.bloqueada).toBe(true);
      expect(bloqueo.motivo).toBe('Pendiente cobro Fase 1');
      expect(bloqueo.bloqueadoPor).toBe('sistema');
      expect(bloqueo.fechaBloqueo).toBeDefined();
    });

    it('should update existing block', async () => {
      await bloqueoFasesService.bloquearFase(proyectoId, 2, 'Motivo 1', 'sistema');
      await bloqueoFasesService.bloquearFase(proyectoId, 2, 'Motivo 2', 'usuario');

      const estado = await bloqueoFasesService.estaFaseBloqueada(proyectoId, 2);

      expect(estado.bloqueada).toBe(true);
      expect(estado.motivo).toBe('Motivo 2');
    });
  });

  describe('desbloquearFase', () => {
    it('should unblock a blocked phase', async () => {
      await bloqueoFasesService.bloquearFase(proyectoId, 2, 'Test', 'sistema');
      
      const resultado = await bloqueoFasesService.desbloquearFase(proyectoId, 2);

      expect(resultado).toBe(true);

      const estado = await bloqueoFasesService.estaFaseBloqueada(proyectoId, 2);
      expect(estado.bloqueada).toBe(false);
    });

    it('should return false when phase is not blocked', async () => {
      const resultado = await bloqueoFasesService.desbloquearFase(proyectoId, 2);

      expect(resultado).toBe(false);
    });

    it('should register audit trail when forced', async () => {
      await bloqueoFasesService.bloquearFase(proyectoId, 2, 'Test', 'sistema');
      
      await bloqueoFasesService.desbloquearFase(proyectoId, 2, 'admin-user', true);

      const auditoria = await bloqueoFasesService.getAuditoriaProyecto(proyectoId);

      expect(auditoria).toHaveLength(1);
      expect(auditoria[0].faseNumero).toBe(2);
      expect(auditoria[0].usuario).toBe('admin-user');
      expect(auditoria[0].forzado).toBe(true);
    });
  });

  describe('verificarYBloquearFases', () => {
    it('should block next phase when completed phase has no invoice', async () => {
      // Setup: No factura for Fase 1
      localStorageService.set('facturas', []);

      await bloqueoFasesService.verificarYBloquearFases(proyectoId, 1);

      const estado = await bloqueoFasesService.estaFaseBloqueada(proyectoId, 2);

      expect(estado.bloqueada).toBe(true);
      expect(estado.motivo).toContain('Pendiente cobro Fase 1');
    });

    it('should block next phase when invoice exists but not paid', async () => {
      // Setup: Factura enviada but not cobrada
      const now = Timestamp.now();
      const facturas: Factura[] = [
        {
          id: 'factura-1',
          numero: 'FAC-2025-001',
          proyectoId,
          presupuestoId: 'pres-1',
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
          moneda: 'EUR',
          fechaEmision: now,
          fechaVencimiento: now,
          estado: 'enviada',
          creadoPor: 'user-1',
          createdAt: now,
          updatedAt: now
        }
      ];

      localStorageService.set('facturas', facturas);

      await bloqueoFasesService.verificarYBloquearFases(proyectoId, 1);

      const estado = await bloqueoFasesService.estaFaseBloqueada(proyectoId, 2);

      expect(estado.bloqueada).toBe(true);
    });

    it('should not block next phase when invoice is cobrada', async () => {
      // Setup: Factura cobrada
      const now = Timestamp.now();
      const facturas: Factura[] = [
        {
          id: 'factura-1',
          numero: 'FAC-2025-001',
          proyectoId,
          presupuestoId: 'pres-1',
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
          moneda: 'EUR',
          fechaEmision: now,
          fechaVencimiento: now,
          fechaCobro: now,
          estado: 'cobrada',
          creadoPor: 'user-1',
          createdAt: now,
          updatedAt: now
        }
      ];

      localStorageService.set('facturas', facturas);

      await bloqueoFasesService.verificarYBloquearFases(proyectoId, 1);

      const estado = await bloqueoFasesService.estaFaseBloqueada(proyectoId, 2);

      expect(estado.bloqueada).toBe(false);
    });
  });

  describe('desbloquearSiguienteFaseSiCorresponde', () => {
    it('should unblock next phase when invoice is paid', async () => {
      // Requirement: 7.5
      // Setup: Block Fase 2 due to Fase 1
      await bloqueoFasesService.bloquearFase(
        proyectoId,
        2,
        'Pendiente cobro Fase 1',
        'sistema'
      );

      // Simulate payment of Fase 1
      await bloqueoFasesService.desbloquearSiguienteFaseSiCorresponde(proyectoId, 1);

      const estado = await bloqueoFasesService.estaFaseBloqueada(proyectoId, 2);

      expect(estado.bloqueada).toBe(false);
    });

    it('should not unblock if motivo does not match', async () => {
      // Setup: Block Fase 2 for different reason
      await bloqueoFasesService.bloquearFase(
        proyectoId,
        2,
        'Otro motivo',
        'usuario'
      );

      await bloqueoFasesService.desbloquearSiguienteFaseSiCorresponde(proyectoId, 1);

      const estado = await bloqueoFasesService.estaFaseBloqueada(proyectoId, 2);

      // Should still be blocked
      expect(estado.bloqueada).toBe(true);
    });
  });

  describe('forzarDesbloqueo', () => {
    it('should force unblock and register in audit', async () => {
      await bloqueoFasesService.bloquearFase(proyectoId, 2, 'Test', 'sistema');

      const resultado = await bloqueoFasesService.forzarDesbloqueo(
        proyectoId,
        2,
        'admin-user',
        'Urgencia del cliente'
      );

      expect(resultado).toBe(true);

      const estado = await bloqueoFasesService.estaFaseBloqueada(proyectoId, 2);
      expect(estado.bloqueada).toBe(false);

      const auditoria = await bloqueoFasesService.getAuditoriaProyecto(proyectoId);
      expect(auditoria).toHaveLength(1);
      expect(auditoria[0].motivo).toBe('Urgencia del cliente');
      expect(auditoria[0].forzado).toBe(true);
    });
  });

  describe('getFasesBloqueadas', () => {
    it('should return all blocked phases for a project', async () => {
      await bloqueoFasesService.bloquearFase(proyectoId, 2, 'Motivo 1', 'sistema');
      await bloqueoFasesService.bloquearFase(proyectoId, 3, 'Motivo 2', 'sistema');
      await bloqueoFasesService.bloquearFase('otro-proyecto', 2, 'Motivo 3', 'sistema');

      const bloqueadas = await bloqueoFasesService.getFasesBloqueadas(proyectoId);

      expect(bloqueadas).toHaveLength(2);
      expect(bloqueadas.every(b => b.proyectoId === proyectoId)).toBe(true);
    });
  });

  describe('limpiarBloqueosProyecto', () => {
    it('should clear all blocks for a project', async () => {
      await bloqueoFasesService.bloquearFase(proyectoId, 2, 'Test', 'sistema');
      await bloqueoFasesService.bloquearFase(proyectoId, 3, 'Test', 'sistema');

      await bloqueoFasesService.limpiarBloqueosProyecto(proyectoId);

      const bloqueadas = await bloqueoFasesService.getFasesBloqueadas(proyectoId);

      expect(bloqueadas).toHaveLength(0);
    });
  });
});
