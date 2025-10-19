/**
 * ProyectoService Tests
 * 
 * Unit tests for ProyectoService
 * Task: 3.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { proyectoService } from './proyecto.service';

describe('ProyectoService', () => {
  describe('getProyectosUsuario', () => {
    it('should return all projects', async () => {
      const proyectos = await proyectoService.getProyectosUsuario();
      expect(proyectos).toBeDefined();
      expect(Array.isArray(proyectos)).toBe(true);
    });

    it('should filter projects by estado', async () => {
      const proyectos = await proyectoService.getProyectosUsuario(undefined, {
        estado: 'Activo'
      });
      expect(proyectos.every(p => p.estado === 'Activo')).toBe(true);
    });

    it('should filter active projects', async () => {
      const proyectos = await proyectoService.getProyectosUsuario(undefined, {
        activos: true
      });
      expect(proyectos.every(p => 
        p.estado === 'Activo' || p.estado === 'En Progreso'
      )).toBe(true);
    });
  });

  describe('getDocumentosProyecto', () => {
    it('should return documents for a project', async () => {
      const documentos = await proyectoService.getDocumentosProyecto('proj-1');
      expect(documentos).toBeDefined();
      expect(Array.isArray(documentos)).toBe(true);
    });

    it('should filter documents by tipo', async () => {
      const documentos = await proyectoService.getDocumentosProyecto('proj-1', {
        tipo: 'Factura'
      });
      expect(documentos.every(d => d.tipo === 'Factura')).toBe(true);
    });

    it('should apply pagination', async () => {
      const documentos = await proyectoService.getDocumentosProyecto('proj-1', {
        limit: 10,
        offset: 0
      });
      expect(documentos.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getEstadisticasDocumentos', () => {
    it('should return document statistics', async () => {
      const stats = await proyectoService.getEstadisticasDocumentos('proj-1');
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('total_documentos');
      expect(stats).toHaveProperty('total_carpetas');
      expect(stats).toHaveProperty('espacio_usado_gb');
    });

    it('should return numeric values', async () => {
      const stats = await proyectoService.getEstadisticasDocumentos('proj-1');
      expect(typeof stats.total_documentos).toBe('number');
      expect(typeof stats.espacio_usado_gb).toBe('number');
    });
  });

  describe('validarLimites', () => {
    it('should validate document count limit', async () => {
      const result = await proyectoService.validarLimites('proj-1', 1000000);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('valid');
      expect(typeof result.valid).toBe('boolean');
    });

    it('should return false for non-existent project', async () => {
      const result = await proyectoService.validarLimites('invalid-id', 1000000);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('not found');
    });

    it('should include limit information', async () => {
      const result = await proyectoService.validarLimites('proj-1', 1000000);
      if (result.valid) {
        expect(result).toHaveProperty('limite_documentos');
        expect(result).toHaveProperty('documentos_actuales');
        expect(result).toHaveProperty('limite_espacio_gb');
      }
    });
  });

  describe('getProyectosActivosParaSugerencia', () => {
    it('should return active projects', async () => {
      const proyectos = await proyectoService.getProyectosActivosParaSugerencia();
      expect(proyectos).toBeDefined();
      expect(Array.isArray(proyectos)).toBe(true);
    });

    it('should include context for AI suggestion', async () => {
      const proyectos = await proyectoService.getProyectosActivosParaSugerencia();
      if (proyectos.length > 0) {
        expect(proyectos[0]).toHaveProperty('historial_gastos_recientes');
        expect(proyectos[0]).toHaveProperty('proveedores_frecuentes');
      }
    });

    it('should sort by relevance', async () => {
      const proyectos = await proyectoService.getProyectosActivosParaSugerencia();
      // Verify projects are sorted (most recent first)
      for (let i = 1; i < proyectos.length; i++) {
        const prevDate = new Date(proyectos[i - 1].updated_at || proyectos[i - 1].created_at || 0);
        const currDate = new Date(proyectos[i].updated_at || proyectos[i].created_at || 0);
        expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
      }
    });
  });

  describe('getProyectoById', () => {
    it('should return project by ID', async () => {
      const proyecto = await proyectoService.getProyectoById('proj-1');
      expect(proyecto).toBeDefined();
      expect(proyecto?.id).toBe('proj-1');
    });

    it('should return null for non-existent project', async () => {
      const proyecto = await proyectoService.getProyectoById('invalid-id');
      expect(proyecto).toBeNull();
    });
  });

  describe('getProyectoCompleto', () => {
    it('should return project with documents and stats', async () => {
      const proyecto = await proyectoService.getProyectoCompleto('proj-1');
      expect(proyecto).toBeDefined();
      expect(proyecto).toHaveProperty('documentos');
      expect(proyecto).toHaveProperty('stats');
    });

    it('should return null for non-existent project', async () => {
      const proyecto = await proyectoService.getProyectoCompleto('invalid-id');
      expect(proyecto).toBeNull();
    });
  });
});
