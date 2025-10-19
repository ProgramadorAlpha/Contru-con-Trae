/**
 * Conversion Service Tests
 * Requirements: 5.1, 5.2, 5.4
 * Task: 11.4
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { conversionService } from './conversion.service';
import { presupuestoService } from './presupuesto.service';
import { facturaService } from './factura.service';
import { localStorageService } from './localStorage.service';
import { Timestamp } from 'firebase/firestore';
import type { Presupuesto } from '../types/presupuesto.types';

// Mock the services
vi.mock('./presupuesto.service', () => ({
  presupuestoService: {
    getPresupuesto: vi.fn(),
    updatePresupuesto: vi.fn()
  }
}));

vi.mock('./factura.service', () => ({
  facturaService: {
    createFactura: vi.fn()
  }
}));

describe('ConversionService', () => {
  const mockPresupuesto: Presupuesto = {
    id: 'pres_1',
    numero: 'PRE-2025-001',
    nombre: 'Reforma Integral Vivienda',
    version: 1,
    cliente: {
      id: 'cli_1',
      nombre: 'Juan Pérez',
      empresa: 'Construcciones ABC',
      email: 'juan@abc.com',
      telefono: '+34 600 123 456',
      direccion: {
        calle: 'Calle Mayor 123',
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
      subtotal: 100000,
      iva: 21000,
      total: 121000,
      moneda: 'EUR',
      porFase: [
        { fase: 1, nombre: 'Fase 1', monto: 40000 },
        { fase: 2, nombre: 'Fase 2', monto: 60000 }
      ]
    },
    fases: [
      {
        numero: 1,
        nombre: 'Cimentación',
        descripcion: 'Trabajos de cimentación',
        monto: 40000,
        duracionEstimada: 30,
        porcentajeCobro: 30,
        partidas: []
      },
      {
        numero: 2,
        nombre: 'Estructura',
        descripcion: 'Trabajos de estructura',
        monto: 60000,
        duracionEstimada: 45,
        porcentajeCobro: 50,
        partidas: []
      }
    ],
    planPagos: [
      {
        numero: 1,
        descripcion: 'Adelanto',
        porcentaje: 30,
        monto: 36300,
        estado: 'pendiente'
      },
      {
        numero: 2,
        descripcion: 'Fin Fase 1',
        porcentaje: 30,
        monto: 36300,
        estado: 'pendiente',
        vinculadoAFase: 1
      },
      {
        numero: 3,
        descripcion: 'Fin Fase 2',
        porcentaje: 40,
        monto: 48400,
        estado: 'pendiente',
        vinculadoAFase: 2
      }
    ],
    estado: 'aprobado',
    estadoDetalle: {
      enviadoCliente: true,
      fechaEnvio: Timestamp.now(),
      fechaAprobacion: Timestamp.now(),
      convertidoAProyecto: false
    },
    fechaCreacion: Timestamp.now(),
    fechaValidez: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    diasValidez: 30,
    creadoConIA: false,
    documentos: [],
    condiciones: [],
    firmas: [],
    creadoPor: 'user_1',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageService.remove('presupuestos');
    localStorageService.remove('facturas');
  });

  describe('convertirPresupuestoAProyecto', () => {
    it('should create proyecto with correct data from presupuesto', async () => {
      // Requirement: 5.1, 5.2
      (presupuestoService.getPresupuesto as any).mockResolvedValue(mockPresupuesto);
      (presupuestoService.updatePresupuesto as any).mockResolvedValue({
        ...mockPresupuesto,
        estado: 'convertido',
        estadoDetalle: {
          ...mockPresupuesto.estadoDetalle,
          convertidoAProyecto: true,
          proyectoId: expect.any(String),
          fechaConversion: expect.any(Object)
        }
      });
      (facturaService.createFactura as any).mockResolvedValue({
        id: 'fac_1',
        numero: 'FAC-2025-001',
        proyectoId: expect.any(String),
        estado: 'pendiente'
      });

      const result = await conversionService.convertirPresupuestoAProyecto('pres_1');

      expect(result).toBeDefined();
      expect(result.proyectoId).toBeDefined();
      expect(result.proyectoId).toMatch(/^proj_\d+$/);
      expect(result.facturaId).toBeDefined();
      expect(result.mensaje).toContain('Proyecto creado exitosamente');

      // Verify presupuesto was fetched
      expect(presupuestoService.getPresupuesto).toHaveBeenCalledWith('pres_1');
    });

    it('should create factura de adelanto with correct amount', async () => {
      // Requirement: 5.4
      (presupuestoService.getPresupuesto as any).mockResolvedValue(mockPresupuesto);
      (presupuestoService.updatePresupuesto as any).mockResolvedValue({
        ...mockPresupuesto,
        estado: 'convertido'
      });
      
      const mockFactura = {
        id: 'fac_1',
        numero: 'FAC-2025-001',
        proyectoId: 'proj_123',
        monto: 36300,
        estado: 'pendiente'
      };
      (facturaService.createFactura as any).mockResolvedValue(mockFactura);

      const result = await conversionService.convertirPresupuestoAProyecto('pres_1');

      expect(facturaService.createFactura).toHaveBeenCalled();
      
      const facturaCall = (facturaService.createFactura as any).mock.calls[0][0];
      expect(facturaCall.monto).toBe(36300); // Adelanto amount
      expect(facturaCall.estado).toBe('pendiente');
      expect(facturaCall.concepto).toContain('Adelanto');
      expect(facturaCall.clienteId).toBe(mockPresupuesto.cliente.id);
      expect(facturaCall.clienteNombre).toBe(mockPresupuesto.cliente.nombre);
      expect(facturaCall.presupuestoId).toBe(mockPresupuesto.id);
      expect(facturaCall.presupuestoNumero).toBe(mockPresupuesto.numero);
      
      expect(result.facturaId).toBe(mockFactura.id);
    });

    it('should update presupuesto estado to "convertido"', async () => {
      // Requirement: 5.2
      (presupuestoService.getPresupuesto as any).mockResolvedValue(mockPresupuesto);
      (presupuestoService.updatePresupuesto as any).mockResolvedValue({
        ...mockPresupuesto,
        estado: 'convertido',
        estadoDetalle: {
          ...mockPresupuesto.estadoDetalle,
          convertidoAProyecto: true,
          proyectoId: 'proj_123',
          fechaConversion: Timestamp.now()
        }
      });
      (facturaService.createFactura as any).mockResolvedValue({
        id: 'fac_1',
        numero: 'FAC-2025-001'
      });

      await conversionService.convertirPresupuestoAProyecto('pres_1');

      expect(presupuestoService.updatePresupuesto).toHaveBeenCalledWith(
        'pres_1',
        expect.objectContaining({
          estado: 'convertido',
          estadoDetalle: expect.objectContaining({
            convertidoAProyecto: true,
            proyectoId: expect.any(String),
            fechaConversion: expect.any(Object)
          })
        })
      );
    });

    it('should not allow converting presupuesto that is already converted', async () => {
      // Requirement: 5.1
      // Note: The presupuesto must be in 'aprobado' state to pass the first check
      const convertedPresupuesto = {
        ...mockPresupuesto,
        estado: 'aprobado' as const, // Keep as aprobado to pass first validation
        estadoDetalle: {
          ...mockPresupuesto.estadoDetalle,
          convertidoAProyecto: true,
          proyectoId: 'proj_existing'
        }
      };

      (presupuestoService.getPresupuesto as any).mockResolvedValue(convertedPresupuesto);

      await expect(
        conversionService.convertirPresupuestoAProyecto('pres_1')
      ).rejects.toThrow('Este presupuesto ya ha sido convertido a proyecto');

      // Should not create factura or update presupuesto
      expect(facturaService.createFactura).not.toHaveBeenCalled();
      expect(presupuestoService.updatePresupuesto).not.toHaveBeenCalled();
    });

    it('should throw error if presupuesto not found', async () => {
      (presupuestoService.getPresupuesto as any).mockResolvedValue(null);

      await expect(
        conversionService.convertirPresupuestoAProyecto('invalid_id')
      ).rejects.toThrow('Presupuesto no encontrado');
    });

    it('should throw error if presupuesto is not approved', async () => {
      const unapprovedPresupuesto = {
        ...mockPresupuesto,
        estado: 'enviado' as const
      };

      (presupuestoService.getPresupuesto as any).mockResolvedValue(unapprovedPresupuesto);

      await expect(
        conversionService.convertirPresupuestoAProyecto('pres_1')
      ).rejects.toThrow('Solo se pueden convertir presupuestos aprobados');
    });

    it('should throw error if plan de pagos is missing', async () => {
      const presupuestoSinPlan = {
        ...mockPresupuesto,
        planPagos: []
      };

      (presupuestoService.getPresupuesto as any).mockResolvedValue(presupuestoSinPlan);

      await expect(
        conversionService.convertirPresupuestoAProyecto('pres_1')
      ).rejects.toThrow('No se encontró un pago de adelanto en el plan de pagos');
    });
  });

  describe('puedeConvertir', () => {
    it('should return true for valid presupuesto', async () => {
      (presupuestoService.getPresupuesto as any).mockResolvedValue(mockPresupuesto);

      const result = await conversionService.puedeConvertir('pres_1');

      expect(result.puede).toBe(true);
      expect(result.razon).toBeUndefined();
    });

    it('should return false if presupuesto not found', async () => {
      (presupuestoService.getPresupuesto as any).mockResolvedValue(null);

      const result = await conversionService.puedeConvertir('invalid_id');

      expect(result.puede).toBe(false);
      expect(result.razon).toBe('Presupuesto no encontrado');
    });

    it('should return false if presupuesto is not approved', async () => {
      const unapprovedPresupuesto = {
        ...mockPresupuesto,
        estado: 'borrador' as const
      };

      (presupuestoService.getPresupuesto as any).mockResolvedValue(unapprovedPresupuesto);

      const result = await conversionService.puedeConvertir('pres_1');

      expect(result.puede).toBe(false);
      expect(result.razon).toBe('El presupuesto debe estar aprobado');
    });

    it('should return false if already converted', async () => {
      const convertedPresupuesto = {
        ...mockPresupuesto,
        estadoDetalle: {
          ...mockPresupuesto.estadoDetalle,
          convertidoAProyecto: true
        }
      };

      (presupuestoService.getPresupuesto as any).mockResolvedValue(convertedPresupuesto);

      const result = await conversionService.puedeConvertir('pres_1');

      expect(result.puede).toBe(false);
      expect(result.razon).toBe('Ya ha sido convertido a proyecto');
    });

    it('should return false if plan de pagos is missing', async () => {
      const presupuestoSinPlan = {
        ...mockPresupuesto,
        planPagos: []
      };

      (presupuestoService.getPresupuesto as any).mockResolvedValue(presupuestoSinPlan);

      const result = await conversionService.puedeConvertir('pres_1');

      expect(result.puede).toBe(false);
      expect(result.razon).toBe('El presupuesto no tiene plan de pagos definido');
    });
  });

  describe('obtenerResumenConversion', () => {
    it('should return conversion summary with correct data', async () => {
      (presupuestoService.getPresupuesto as any).mockResolvedValue(mockPresupuesto);

      const resumen = await conversionService.obtenerResumenConversion('pres_1');

      expect(resumen).toBeDefined();
      expect(resumen.nombreProyecto).toBe(mockPresupuesto.nombre);
      expect(resumen.cliente).toBe(mockPresupuesto.cliente.nombre);
      expect(resumen.montoTotal).toBe(mockPresupuesto.montos.total);
      expect(resumen.montoAdelanto).toBe(36300);
      expect(resumen.porcentajeAdelanto).toBe(30);
      expect(resumen.numeroFases).toBe(2);
      expect(resumen.numeroPagos).toBe(3);
    });

    it('should throw error if presupuesto not found', async () => {
      (presupuestoService.getPresupuesto as any).mockResolvedValue(null);

      await expect(
        conversionService.obtenerResumenConversion('invalid_id')
      ).rejects.toThrow('Presupuesto no encontrado');
    });
  });
});
