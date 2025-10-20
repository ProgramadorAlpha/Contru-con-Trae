/**
 * Presupuesto Utilities
 * 
 * Utility functions for presupuesto calculations and validations.
 * 
 * Requirements: 2.6, 2.7, 12.1
 * Task: 4.2
 */

import type { Presupuesto, Fase, PlanPago, MontosPresupuesto } from '../types/presupuesto.types';

/**
 * Calculate totals for a presupuesto
 * Requirement: 2.6
 */
export function calcularTotales(fases: Fase[]): MontosPresupuesto {
  // Calculate subtotal from all fases
  const subtotal = fases.reduce((sum, fase) => {
    const faseMonto = fase.partidas.reduce((faseSum, partida) => {
      return faseSum + partida.total;
    }, 0);
    return sum + faseMonto;
  }, 0);

  // Calculate IVA (21% in Spain for construction)
  const iva = subtotal * 0.21;

  // Calculate total
  const total = subtotal + iva;

  // Calculate per-fase breakdown
  const porFase = fases.map(fase => {
    const faseMonto = fase.partidas.reduce((sum, partida) => sum + partida.total, 0);
    return {
      fase: fase.numero,
      nombre: fase.nombre,
      monto: faseMonto
    };
  });

  return {
    subtotal: Number(subtotal.toFixed(2)),
    iva: Number(iva.toFixed(2)),
    total: Number(total.toFixed(2)),
    moneda: 'EUR',
    porFase
  };
}

/**
 * Validate presupuesto completeness and consistency
 * Requirement: 2.6
 */
export function validarPresupuesto(presupuesto: Partial<Presupuesto>): {
  valido: boolean;
  errores: string[];
  advertencias: string[];
} {
  const errores: string[] = [];
  const advertencias: string[] = [];

  // Validate basic fields
  if (!presupuesto.nombre || presupuesto.nombre.trim() === '') {
    errores.push('El presupuesto debe tener un nombre');
  }

  if (!presupuesto.cliente) {
    errores.push('El presupuesto debe tener un cliente asignado');
  }

  // Validate fases
  if (!presupuesto.fases || presupuesto.fases.length === 0) {
    errores.push('El presupuesto debe tener al menos una fase');
  } else {
    presupuesto.fases.forEach((fase, index) => {
      if (!fase.nombre || fase.nombre.trim() === '') {
        errores.push(`La fase ${index + 1} no tiene nombre`);
      }

      if (!fase.partidas || fase.partidas.length === 0) {
        errores.push(`La fase "${fase.nombre}" no tiene partidas`);
      } else {
        fase.partidas.forEach((partida, pIndex) => {
          if (partida.cantidad <= 0) {
            errores.push(`La partida ${pIndex + 1} de la fase "${fase.nombre}" tiene cantidad inválida`);
          }

          if (partida.precioUnitario < 0) {
            errores.push(`La partida ${pIndex + 1} de la fase "${fase.nombre}" tiene precio unitario inválido`);
          }

          // Check if total matches calculation
          const calculatedTotal = partida.cantidad * partida.precioUnitario;
          if (Math.abs(partida.total - calculatedTotal) > 0.01) {
            advertencias.push(`La partida "${partida.nombre}" tiene un total que no coincide con cantidad × precio`);
          }
        });
      }
    });
  }

  // Validate plan de pagos
  if (presupuesto.planPagos && presupuesto.planPagos.length > 0) {
    const totalPorcentaje = presupuesto.planPagos.reduce((sum, pago) => sum + pago.porcentaje, 0);
    
    if (Math.abs(totalPorcentaje - 100) > 0.01) {
      errores.push(`Los porcentajes del plan de pagos deben sumar 100% (actual: ${totalPorcentaje.toFixed(2)}%)`);
    }

    // Validate montos match percentages
    if (presupuesto.montos) {
      presupuesto.planPagos.forEach((pago, index) => {
        const montoEsperado = (presupuesto.montos!.total * pago.porcentaje) / 100;
        if (Math.abs(pago.monto - montoEsperado) > 0.01) {
          advertencias.push(`El pago ${index + 1} tiene un monto que no coincide con su porcentaje`);
        }
      });
    }
  } else {
    advertencias.push('El presupuesto no tiene un plan de pagos definido');
  }

  // Validate montos
  if (presupuesto.montos) {
    if (presupuesto.montos.total <= 0) {
      errores.push('El monto total debe ser mayor a 0');
    }

    // Validate IVA calculation
    const ivaEsperado = presupuesto.montos.subtotal * 0.21;
    if (Math.abs(presupuesto.montos.iva - ivaEsperado) > 0.01) {
      advertencias.push('El IVA no coincide con el 21% del subtotal');
    }

    // Validate total calculation
    const totalEsperado = presupuesto.montos.subtotal + presupuesto.montos.iva;
    if (Math.abs(presupuesto.montos.total - totalEsperado) > 0.01) {
      advertencias.push('El total no coincide con subtotal + IVA');
    }
  }

  // Validate fechas
  if (presupuesto.fechaValidez && presupuesto.fechaCreacion) {
    const fechaCreacion = toDate(presupuesto.fechaCreacion);
    const fechaValidez = toDate(presupuesto.fechaValidez);
    
    if (fechaValidez <= fechaCreacion) {
      errores.push('La fecha de validez debe ser posterior a la fecha de creación');
    }
  }

  return {
    valido: errores.length === 0,
    errores,
    advertencias
  };
}

/**
 * Generate automatic payment plan based on fases
 * Requirement: 2.7
 */
export function generarPlanPagosAutomatico(
  fases: Fase[],
  montoTotal: number,
  incluirAdelanto: boolean = true
): PlanPago[] {
  const planPagos: PlanPago[] = [];
  let numeroPago = 1;

  // Add adelanto (advance payment) if requested
  if (incluirAdelanto) {
    const porcentajeAdelanto = 30; // 30% adelanto
    planPagos.push({
      numero: numeroPago++,
      descripcion: 'Adelanto al inicio del proyecto',
      porcentaje: porcentajeAdelanto,
      monto: Number(((montoTotal * porcentajeAdelanto) / 100).toFixed(2)),
      vinculadoAFase: undefined,
      estado: 'pendiente'
    });
  }

  // Calculate remaining percentage
  const porcentajeRestante = incluirAdelanto ? 70 : 100;

  // Distribute remaining percentage across fases
  const totalFases = fases.length;
  fases.forEach((fase, index) => {
    // Calculate percentage for this fase based on its monto relative to total
    const totalFasesMonto = fases.reduce((sum, f) => sum + f.monto, 0);
    const porcentajeFase = (fase.monto / totalFasesMonto) * porcentajeRestante;

    planPagos.push({
      numero: numeroPago++,
      descripcion: `Pago al completar ${fase.nombre}`,
      porcentaje: Number(porcentajeFase.toFixed(2)),
      monto: Number(((montoTotal * porcentajeFase) / 100).toFixed(2)),
      vinculadoAFase: fase.numero,
      estado: 'pendiente'
    });
  });

  // Adjust last payment to ensure total is exactly 100%
  const totalPorcentaje = planPagos.reduce((sum, p) => sum + p.porcentaje, 0);
  if (Math.abs(totalPorcentaje - 100) > 0.01) {
    const diferencia = 100 - totalPorcentaje;
    const ultimoPago = planPagos[planPagos.length - 1];
    ultimoPago.porcentaje = Number((ultimoPago.porcentaje + diferencia).toFixed(2));
    ultimoPago.monto = Number(((montoTotal * ultimoPago.porcentaje) / 100).toFixed(2));
  }

  return planPagos;
}

/**
 * Generate presupuesto number
 * Format: PRE-YYYY-NNN
 * Requirement: 12.1
 */
export function generarNumeroPresupuesto(ultimoNumero?: string): string {
  const year = new Date().getFullYear();
  
  if (!ultimoNumero) {
    return `PRE-${year}-001`;
  }

  // Extract number from last presupuesto
  const match = ultimoNumero.match(/PRE-(\d{4})-(\d{3})/);
  
  if (!match) {
    return `PRE-${year}-001`;
  }

  const lastYear = parseInt(match[1]);
  const lastNumber = parseInt(match[2]);

  // If new year, reset counter
  if (lastYear < year) {
    return `PRE-${year}-001`;
  }

  // Increment counter
  const newNumber = lastNumber + 1;
  return `PRE-${year}-${String(newNumber).padStart(3, '0')}`;
}

/**
 * Calculate fase monto from partidas
 */
export function calcularMontoFase(fase: Fase): number {
  return fase.partidas.reduce((sum, partida) => sum + partida.total, 0);
}

/**
 * Calculate partida total
 */
export function calcularTotalPartida(cantidad: number, precioUnitario: number): number {
  return Number((cantidad * precioUnitario).toFixed(2));
}

/**
 * Format currency amount
 */
export function formatearMoneda(monto: number, moneda: 'EUR' | 'USD' = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: moneda
  }).format(monto);
}

/**
 * Calculate percentage of total
 */
export function calcularPorcentaje(parte: number, total: number): number {
  if (total === 0) return 0;
  return Number(((parte / total) * 100).toFixed(2));
}

/**
 * Validate plan de pagos consistency
 */
export function validarPlanPagos(planPagos: PlanPago[], montoTotal: number): {
  valido: boolean;
  errores: string[];
} {
  const errores: string[] = [];

  if (planPagos.length === 0) {
    errores.push('El plan de pagos está vacío');
    return { valido: false, errores };
  }

  // Check percentages sum to 100
  const totalPorcentaje = planPagos.reduce((sum, p) => sum + p.porcentaje, 0);
  if (Math.abs(totalPorcentaje - 100) > 0.01) {
    errores.push(`Los porcentajes deben sumar 100% (actual: ${totalPorcentaje.toFixed(2)}%)`);
  }

  // Check montos sum to total
  const totalMontos = planPagos.reduce((sum, p) => sum + p.monto, 0);
  if (Math.abs(totalMontos - montoTotal) > 0.01) {
    errores.push(`Los montos deben sumar ${formatearMoneda(montoTotal)} (actual: ${formatearMoneda(totalMontos)})`);
  }

  // Check each pago monto matches percentage
  planPagos.forEach((pago, index) => {
    const montoEsperado = (montoTotal * pago.porcentaje) / 100;
    if (Math.abs(pago.monto - montoEsperado) > 0.01) {
      errores.push(`El pago ${index + 1} tiene un monto inconsistente con su porcentaje`);
    }
  });

  return {
    valido: errores.length === 0,
    errores
  };
}

/**
 * Check if presupuesto is expired
 */
export function estaExpirado(presupuesto: Presupuesto): boolean {
  if (!presupuesto.fechaValidez) return false;
  
  const fechaValidez = toDate(presupuesto.fechaValidez);
  const hoy = new Date();
  
  return fechaValidez < hoy;
}

/**
 * Convert any date format to Date object
 * Handles: ISO strings, Firestore Timestamps, and Date objects
 */
export function toDate(date: any): Date {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  if (date.toDate && typeof date.toDate === 'function') return date.toDate();
  return new Date(date);
}

/**
 * Calculate days until expiration
 */
export function diasHastaExpiracion(presupuesto: Presupuesto): number {
  if (!presupuesto.fechaValidez) return 0;
  
  const fechaValidez = toDate(presupuesto.fechaValidez);
  const hoy = new Date();
  const diffTime = fechaValidez.getTime() - hoy.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get presupuesto status color
 */
export function getEstadoColor(estado: Presupuesto['estado']): string {
  const colors = {
    borrador: 'gray',
    enviado: 'blue',
    aprobado: 'green',
    rechazado: 'red',
    expirado: 'orange',
    convertido: 'purple'
  };
  
  return colors[estado] || 'gray';
}

/**
 * Get presupuesto status label
 */
export function getEstadoLabel(estado: Presupuesto['estado']): string {
  const labels = {
    borrador: 'Borrador',
    enviado: 'Enviado',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    expirado: 'Expirado',
    convertido: 'Convertido a Proyecto'
  };
  
  return labels[estado] || estado;
}

// Export all utilities
export const presupuestoUtils = {
  calcularTotales,
  validarPresupuesto,
  generarPlanPagosAutomatico,
  generarNumeroPresupuesto,
  calcularMontoFase,
  calcularTotalPartida,
  formatearMoneda,
  calcularPorcentaje,
  validarPlanPagos,
  estaExpirado,
  diasHastaExpiracion,
  getEstadoColor,
  getEstadoLabel
};

export default presupuestoUtils;
