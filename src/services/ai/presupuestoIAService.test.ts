/**
 * Presupuesto IA Service Tests
 * 
 * Requirements: 2.3, 2.6
 * Task: 4.3
 */

import { describe, it, expect } from 'vitest';
import { parsearRespuestaIA, validarPresupuestoIA } from './presupuestoIAService';
import { calcularTotales, validarPresupuesto } from '../../utils/presupuesto.utils';
import type { PresupuestoGenerado, Fase } from '../../types/presupuesto.types';

describe('PresupuestoIAService', () => {
  describe('parsearRespuestaIA', () => {
    it('should parse valid JSON response with fases and partidas', () => {
      const respuesta = `\`\`\`json
{
  "fases": [
    {
      "numero": 1,
      "nombre": "Trabajos Preliminares",
      "descripcion": "Preparación del terreno",
      "monto": 5000,
      "duracionEstimada": 15,
      "porcentajeCobro": 10,
      "partidas": [
        {
          "id": "P001",
          "codigo": "01.01",
          "nombre": "Limpieza del terreno",
          "unidad": "m²",
          "cantidad": 100,
          "precioUnitario": 50,
          "total": 5000
        }
      ]
    }
  ]
}
\`\`\``;

      const resultado = parsearRespuestaIA(respuesta);

      expect(resultado.fases).toHaveLength(1);
      expect(resultado.fases[0].nombre).toBe('Trabajos Preliminares');
      expect(resultado.fases[0].partidas).toHaveLength(1);
      expect(resultado.fases[0].partidas[0].total).toBe(5000);
    });

    it('should throw error for invalid JSON', () => {
      const respuesta = 'This is not JSON';

      expect(() => parsearRespuestaIA(respuesta)).toThrow();
    });
  });

  describe('calcularTotales', () => {
    it('should calculate totals correctly', () => {
      const fases: Fase[] = [
        {
          numero: 1,
          nombre: 'Fase 1',
          monto: 10000,
          duracionEstimada: 30,
          porcentajeCobro: 50,
          partidas: [
            {
              id: 'P001',
              codigo: '01.01',
              nombre: 'Partida 1',
              unidad: 'm²',
              cantidad: 100,
              precioUnitario: 100,
              total: 10000
            }
          ]
        }
      ];

      const montos = calcularTotales(fases);

      expect(montos.subtotal).toBe(10000);
      expect(montos.iva).toBe(2100); // 21% IVA
      expect(montos.total).toBe(12100);
    });
  });

  describe('validarPresupuestoIA', () => {
    it('should validate complete presupuesto', () => {
      const presupuesto: PresupuestoGenerado = {
        fases: [
          {
            numero: 1,
            nombre: 'Fase 1',
            monto: 10000,
            duracionEstimada: 30,
            porcentajeCobro: 100,
            partidas: [
              {
                id: 'P001',
                codigo: '01.01',
                nombre: 'Partida 1',
                unidad: 'm²',
                cantidad: 100,
                precioUnitario: 100,
                total: 10000
              }
            ]
          }
        ],
        montos: {
          subtotal: 10000,
          iva: 2100,
          total: 12100
        }
      };

      const resultado = validarPresupuestoIA(presupuesto);

      expect(resultado.valido).toBe(true);
      expect(resultado.errores).toHaveLength(0);
    });

    it('should detect missing fases', () => {
      const presupuesto: PresupuestoGenerado = {
        fases: [],
        montos: {
          subtotal: 0,
          iva: 0,
          total: 0
        }
      };

      const resultado = validarPresupuestoIA(presupuesto);

      expect(resultado.valido).toBe(false);
      expect(resultado.errores.length).toBeGreaterThan(0);
    });
  });
});
