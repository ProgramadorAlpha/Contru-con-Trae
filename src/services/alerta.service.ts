/**
 * Alerta Service - Task 16.1
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.6
 * 
 * Service for managing financial alerts and warnings
 */

import { localStorageService } from './localStorage.service';
import { tesoreriaService } from './tesoreria.service';
import { facturaService } from './factura.service';
import type { Factura } from '../types/factura.types';

export type PrioridadAlerta = 'critica' | 'alta' | 'media' | 'baja';
export type TipoAlerta = 
  | 'tesoreria_baja' 
  | 'cobro_pendiente' 
  | 'sobrecosto' 
  | 'pago_vencido'
  | 'fase_bloqueada'
  | 'factura_vencida';

export interface Alerta {
  id: string;
  proyectoId: string;
  tipo: TipoAlerta;
  prioridad: PrioridadAlerta;
  titulo: string;
  mensaje: string;
  accionRecomendada?: string;
  datos?: Record<string, any>;
  resuelta: boolean;
  notaResolucion?: string;
  fechaCreacion: Date;
  fechaResolucion?: Date;
  resueltaPor?: string;
}

const STORAGE_KEY_ALERTAS = 'alertas';

class AlertaService {
  /**
   * Get all alerts
   */
  private getAlertas(): Alerta[] {
    return localStorageService.get<Alerta[]>(STORAGE_KEY_ALERTAS, []);
  }

  /**
   * Save alerts
   */
  private saveAlertas(alertas: Alerta[]): boolean {
    return localStorageService.set(STORAGE_KEY_ALERTAS, alertas);
  }

  /**
   * Create a new alert
   */
  private async crearAlerta(
    proyectoId: string,
    tipo: TipoAlerta,
    prioridad: PrioridadAlerta,
    titulo: string,
    mensaje: string,
    accionRecomendada?: string,
    datos?: Record<string, any>
  ): Promise<Alerta> {
    const alertas = this.getAlertas();

    // Check if similar alert already exists and is not resolved
    const alertaExistente = alertas.find(
      a => a.proyectoId === proyectoId && 
           a.tipo === tipo && 
           !a.resuelta
    );

    if (alertaExistente) {
      // Update existing alert
      alertaExistente.mensaje = mensaje;
      alertaExistente.datos = datos;
      alertaExistente.fechaCreacion = new Date();
      this.saveAlertas(alertas);
      return alertaExistente;
    }

    // Create new alert
    const nuevaAlerta: Alerta = {
      id: `alerta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      proyectoId,
      tipo,
      prioridad,
      titulo,
      mensaje,
      accionRecomendada,
      datos,
      resuelta: false,
      fechaCreacion: new Date()
    };

    alertas.push(nuevaAlerta);
    this.saveAlertas(alertas);

    return nuevaAlerta;
  }

  /**
   * Verify treasury and create alert if low
   * Requirement: 8.1
   * 
   * Creates critical alert when treasury < 120% of next phase cost
   */
  async verificarTesoreria(
    proyectoId: string,
    costoProximaFase: number
  ): Promise<Alerta | null> {
    try {
      const tesoreria = await tesoreriaService.calcularTesoreria(proyectoId);
      const umbralCritico = costoProximaFase * 1.2; // 120% of next phase

      if (tesoreria < umbralCritico) {
        const deficit = umbralCritico - tesoreria;
        const porcentajeDisponible = (tesoreria / costoProximaFase) * 100;

        return await this.crearAlerta(
          proyectoId,
          'tesoreria_baja',
          'critica',
          'Tesorería Insuficiente',
          `La tesorería actual (€${tesoreria.toFixed(2)}) es insuficiente para cubrir la próxima fase. Se requiere al menos €${umbralCritico.toFixed(2)} (120% del costo de la fase).`,
          'Gestionar cobros pendientes o ajustar planificación de fase',
          {
            tesoreria,
            costoProximaFase,
            umbralCritico,
            deficit,
            porcentajeDisponible: porcentajeDisponible.toFixed(1)
          }
        );
      }

      // If treasury is sufficient, resolve any existing alerts
      await this.resolverAlertasPorTipo(proyectoId, 'tesoreria_baja', 'Sistema', 'Tesorería recuperada');

      return null;
    } catch (error) {
      console.error('Error verifying treasury:', error);
      return null;
    }
  }

  /**
   * Verify pending collections and create alert
   * Requirement: 8.2
   * 
   * Creates high priority alert when phase is 100% complete but invoice not paid
   */
  async verificarCobrosPendientes(
    proyectoId: string,
    faseNumero: number,
    progresoFase: number
  ): Promise<Alerta | null> {
    try {
      // Only check if phase is 100% complete
      if (progresoFase < 100) {
        return null;
      }

      // Check if there's an unpaid invoice for this phase
      const facturas = await facturaService.getFacturasByProyecto(proyectoId);
      const facturaFase = facturas.find(
        f => f.faseVinculada === faseNumero && f.estado !== 'cobrada'
      );

      if (facturaFase) {
        const diasPendientes = Math.floor(
          (Date.now() - facturaFase.fechaEmision.toDate().getTime()) / (1000 * 60 * 60 * 24)
        );

        return await this.crearAlerta(
          proyectoId,
          'cobro_pendiente',
          'alta',
          'Cobro Pendiente de Fase Completada',
          `La Fase ${faseNumero} está completada al 100% pero la factura ${facturaFase.numero} aún no ha sido cobrada (${diasPendientes} días pendiente).`,
          'Enviar recordatorio de pago al cliente o generar factura si no existe',
          {
            faseNumero,
            facturaId: facturaFase.id,
            facturaNumero: facturaFase.numero,
            monto: facturaFase.total,
            diasPendientes
          }
        );
      }

      return null;
    } catch (error) {
      console.error('Error verifying pending collections:', error);
      return null;
    }
  }

  /**
   * Detect cost overruns and create alert
   * Requirement: 8.3
   * 
   * Creates high priority alert when actual costs exceed budget by more than 10%
   */
  async detectarSobrecostos(
    proyectoId: string,
    presupuestoTotal: number,
    gastosReales: number
  ): Promise<Alerta | null> {
    try {
      const umbralSobrecosto = presupuestoTotal * 1.1; // 110% of budget

      if (gastosReales > umbralSobrecosto) {
        const sobrecosto = gastosReales - presupuestoTotal;
        const porcentajeSobrecosto = ((gastosReales / presupuestoTotal) - 1) * 100;

        return await this.crearAlerta(
          proyectoId,
          'sobrecosto',
          'alta',
          'Sobrecosto Detectado',
          `Los gastos reales (€${gastosReales.toFixed(2)}) superan el presupuesto (€${presupuestoTotal.toFixed(2)}) en un ${porcentajeSobrecosto.toFixed(1)}%.`,
          'Revisar gastos y ajustar presupuesto o reducir costos',
          {
            presupuestoTotal,
            gastosReales,
            sobrecosto,
            porcentajeSobrecosto: porcentajeSobrecosto.toFixed(1)
          }
        );
      }

      // If costs are within budget, resolve any existing alerts
      await this.resolverAlertasPorTipo(proyectoId, 'sobrecosto', 'Sistema', 'Costos controlados');

      return null;
    } catch (error) {
      console.error('Error detecting cost overruns:', error);
      return null;
    }
  }

  /**
   * Verify overdue payments and create alert
   * Requirement: 8.4
   * 
   * Creates alert for invoices past their due date
   */
  async verificarPagosVencidos(proyectoId: string): Promise<Alerta[]> {
    try {
      const alertas: Alerta[] = [];
      const facturas = await facturaService.getFacturasByProyecto(proyectoId);
      const hoy = new Date();

      for (const factura of facturas) {
        // Skip if already paid or cancelled
        if (factura.estado === 'cobrada' || factura.estado === 'cancelada') {
          continue;
        }

        const fechaVencimiento = factura.fechaVencimiento.toDate();
        
        if (fechaVencimiento < hoy) {
          const diasVencidos = Math.floor(
            (hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Determine priority based on days overdue
          let prioridad: PrioridadAlerta = 'media';
          if (diasVencidos > 30) {
            prioridad = 'critica';
          } else if (diasVencidos > 15) {
            prioridad = 'alta';
          }

          const alerta = await this.crearAlerta(
            proyectoId,
            'factura_vencida',
            prioridad,
            'Factura Vencida',
            `La factura ${factura.numero} está vencida desde hace ${diasVencidos} días (vencimiento: ${fechaVencimiento.toLocaleDateString()}).`,
            'Enviar recordatorio urgente de pago al cliente',
            {
              facturaId: factura.id,
              facturaNumero: factura.numero,
              monto: factura.total,
              fechaVencimiento: fechaVencimiento.toISOString(),
              diasVencidos
            }
          );

          alertas.push(alerta);
        }
      }

      return alertas;
    } catch (error) {
      console.error('Error verifying overdue payments:', error);
      return [];
    }
  }

  /**
   * Get all active alerts for a project
   */
  async getAlertasProyecto(proyectoId: string, soloActivas: boolean = true): Promise<Alerta[]> {
    const alertas = this.getAlertas();
    let alertasProyecto = alertas.filter(a => a.proyectoId === proyectoId);

    if (soloActivas) {
      alertasProyecto = alertasProyecto.filter(a => !a.resuelta);
    }

    // Sort by priority and date
    const prioridadOrden: Record<PrioridadAlerta, number> = {
      critica: 0,
      alta: 1,
      media: 2,
      baja: 3
    };

    return alertasProyecto.sort((a, b) => {
      const prioridadDiff = prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
      if (prioridadDiff !== 0) return prioridadDiff;
      return b.fechaCreacion.getTime() - a.fechaCreacion.getTime();
    });
  }

  /**
   * Get all active alerts across all projects
   */
  async getAlertasActivas(): Promise<Alerta[]> {
    const alertas = this.getAlertas();
    return alertas.filter(a => !a.resuelta);
  }

  /**
   * Resolve an alert
   * Requirement: 8.6
   */
  async resolverAlerta(
    alertaId: string,
    usuario: string,
    nota?: string
  ): Promise<Alerta | null> {
    const alertas = this.getAlertas();
    const index = alertas.findIndex(a => a.id === alertaId);

    if (index === -1) {
      return null;
    }

    alertas[index] = {
      ...alertas[index],
      resuelta: true,
      fechaResolucion: new Date(),
      resueltaPor: usuario,
      notaResolucion: nota
    };

    this.saveAlertas(alertas);
    return alertas[index];
  }

  /**
   * Resolve all alerts of a specific type for a project
   */
  private async resolverAlertasPorTipo(
    proyectoId: string,
    tipo: TipoAlerta,
    usuario: string,
    nota: string
  ): Promise<void> {
    const alertas = this.getAlertas();
    let cambios = false;

    for (let i = 0; i < alertas.length; i++) {
      if (alertas[i].proyectoId === proyectoId && 
          alertas[i].tipo === tipo && 
          !alertas[i].resuelta) {
        alertas[i] = {
          ...alertas[i],
          resuelta: true,
          fechaResolucion: new Date(),
          resueltaPor: usuario,
          notaResolucion: nota
        };
        cambios = true;
      }
    }

    if (cambios) {
      this.saveAlertas(alertas);
    }
  }

  /**
   * Get alert statistics
   */
  async getEstadisticasAlertas(proyectoId?: string): Promise<{
    total: number;
    criticas: number;
    altas: number;
    medias: number;
    bajas: number;
    porTipo: Record<TipoAlerta, number>;
  }> {
    let alertas = this.getAlertas().filter(a => !a.resuelta);

    if (proyectoId) {
      alertas = alertas.filter(a => a.proyectoId === proyectoId);
    }

    const stats = {
      total: alertas.length,
      criticas: alertas.filter(a => a.prioridad === 'critica').length,
      altas: alertas.filter(a => a.prioridad === 'alta').length,
      medias: alertas.filter(a => a.prioridad === 'media').length,
      bajas: alertas.filter(a => a.prioridad === 'baja').length,
      porTipo: {
        tesoreria_baja: alertas.filter(a => a.tipo === 'tesoreria_baja').length,
        cobro_pendiente: alertas.filter(a => a.tipo === 'cobro_pendiente').length,
        sobrecosto: alertas.filter(a => a.tipo === 'sobrecosto').length,
        pago_vencido: alertas.filter(a => a.tipo === 'pago_vencido').length,
        fase_bloqueada: alertas.filter(a => a.tipo === 'fase_bloqueada').length,
        factura_vencida: alertas.filter(a => a.tipo === 'factura_vencida').length
      }
    };

    return stats;
  }

  /**
   * Run all verifications for a project
   * Requirement: 8.1, 8.2, 8.3, 8.4
   * 
   * This should be called periodically or after significant events
   */
  async ejecutarVerificaciones(
    proyectoId: string,
    datos: {
      costoProximaFase?: number;
      faseActual?: number;
      progresoFaseActual?: number;
      presupuestoTotal?: number;
      gastosReales?: number;
    }
  ): Promise<Alerta[]> {
    const alertasGeneradas: Alerta[] = [];

    try {
      // Verify treasury
      if (datos.costoProximaFase) {
        const alertaTesoreria = await this.verificarTesoreria(
          proyectoId,
          datos.costoProximaFase
        );
        if (alertaTesoreria) {
          alertasGeneradas.push(alertaTesoreria);
        }
      }

      // Verify pending collections
      if (datos.faseActual && datos.progresoFaseActual) {
        const alertaCobro = await this.verificarCobrosPendientes(
          proyectoId,
          datos.faseActual,
          datos.progresoFaseActual
        );
        if (alertaCobro) {
          alertasGeneradas.push(alertaCobro);
        }
      }

      // Detect cost overruns
      if (datos.presupuestoTotal && datos.gastosReales) {
        const alertaSobrecosto = await this.detectarSobrecostos(
          proyectoId,
          datos.presupuestoTotal,
          datos.gastosReales
        );
        if (alertaSobrecosto) {
          alertasGeneradas.push(alertaSobrecosto);
        }
      }

      // Verify overdue payments
      const alertasVencidas = await this.verificarPagosVencidos(proyectoId);
      alertasGeneradas.push(...alertasVencidas);

      return alertasGeneradas;
    } catch (error) {
      console.error('Error running verifications:', error);
      return alertasGeneradas;
    }
  }

  /**
   * Clear all alerts for a project (for testing/admin)
   */
  async limpiarAlertasProyecto(proyectoId: string): Promise<void> {
    const alertas = this.getAlertas();
    const alertasActualizadas = alertas.filter(a => a.proyectoId !== proyectoId);
    this.saveAlertas(alertasActualizadas);
  }
}

export const alertaService = new AlertaService();
export default alertaService;
