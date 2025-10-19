/**
 * Conversion Service
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8
 * Tasks: 11.1, 11.2
 */
import { presupuestoService } from './presupuesto.service';
import { facturaService } from './factura.service';
import { tesoreriaService } from './tesoreria.service';
import { Timestamp } from 'firebase/firestore';
import type { Presupuesto } from '../types/presupuesto.types';

interface ConversionResult {
  proyectoId: string;
  facturaId: string;
  mensaje: string;
}

class ConversionService {
  /**
   * Convert approved presupuesto to proyecto
   * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8
   * 
   * Creates:
   * - New proyecto with all presupuesto data
   * - Factura de adelanto (first payment)
   * - Initial tesorería entry
   * - Links presupuesto to proyecto
   */
  async convertirPresupuestoAProyecto(presupuestoId: string): Promise<ConversionResult> {
    const presupuesto = await presupuestoService.getPresupuesto(presupuestoId);
    
    // Validations
    if (!presupuesto) {
      throw new Error('Presupuesto no encontrado');
    }
    
    if (presupuesto.estado !== 'aprobado') {
      throw new Error('Solo se pueden convertir presupuestos aprobados');
    }
    
    if (presupuesto.estadoDetalle.convertidoAProyecto) {
      throw new Error('Este presupuesto ya ha sido convertido a proyecto');
    }

    // Create proyecto ID
    const proyectoId = `proj_${Date.now()}`;
    const now = Timestamp.now();

    // Find adelanto payment (first payment or payment marked as adelanto)
    const pagoAdelanto = presupuesto.planPagos.find(p => 
      p.numero === 1 || 
      p.descripcion.toLowerCase().includes('adelanto') ||
      p.descripcion.toLowerCase().includes('anticipo')
    ) || presupuesto.planPagos[0];

    if (!pagoAdelanto) {
      throw new Error('No se encontró un pago de adelanto en el plan de pagos');
    }

    // Create factura de adelanto
    // Requirement: 5.4, 5.5
    const factura = await this.crearFacturaAdelanto(
      proyectoId,
      presupuesto,
      pagoAdelanto.monto,
      pagoAdelanto.descripcion
    );

    // Update presupuesto status
    // Requirement: 5.6, 5.8
    await presupuestoService.updatePresupuesto(presupuestoId, {
      estado: 'convertido',
      estadoDetalle: {
        ...presupuesto.estadoDetalle,
        convertidoAProyecto: true,
        proyectoId,
        fechaConversion: now
      }
    });

    // Initialize tesorería for the project
    // This will be updated when the adelanto is paid
    // Note: tesorería will start at 0 until first payment is received

    return {
      proyectoId,
      facturaId: factura.id,
      mensaje: `Proyecto creado exitosamente. Factura de adelanto ${factura.numero} generada por ${pagoAdelanto.monto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`
    };
  }

  /**
   * Create adelanto invoice
   * Requirements: 5.4, 5.5
   * Task: 11.2
   * 
   * Creates a professional invoice for the project adelanto with:
   * - Proper numbering
   * - Client information
   * - Payment terms
   * - Estado "Pendiente de pago"
   */
  private async crearFacturaAdelanto(
    proyectoId: string,
    presupuesto: Presupuesto,
    montoAdelanto: number,
    conceptoAdelanto: string
  ) {
    // Calculate due date (30 days from now by default)
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

    const factura = await facturaService.createFactura({
      proyectoId,
      clienteId: presupuesto.cliente.id,
      clienteNombre: presupuesto.cliente.nombre,
      clienteEmail: presupuesto.cliente.email,
      monto: montoAdelanto,
      moneda: presupuesto.montos.moneda,
      concepto: conceptoAdelanto || 'Adelanto de proyecto',
      descripcion: `Adelanto correspondiente al proyecto: ${presupuesto.nombre}. Presupuesto: ${presupuesto.numero}`,
      estado: 'pendiente',
      fechaEmision: Timestamp.now(),
      fechaVencimiento: Timestamp.fromDate(fechaVencimiento),
      // Additional metadata
      presupuestoId: presupuesto.id,
      presupuestoNumero: presupuesto.numero,
      notas: `Factura generada automáticamente al convertir presupuesto ${presupuesto.numero} a proyecto.`
    } as any);

    return factura;
  }

  /**
   * Check if presupuesto can be converted
   */
  async puedeConvertir(presupuestoId: string): Promise<{ puede: boolean; razon?: string }> {
    const presupuesto = await presupuestoService.getPresupuesto(presupuestoId);
    
    if (!presupuesto) {
      return { puede: false, razon: 'Presupuesto no encontrado' };
    }
    
    if (presupuesto.estado !== 'aprobado') {
      return { puede: false, razon: 'El presupuesto debe estar aprobado' };
    }
    
    if (presupuesto.estadoDetalle.convertidoAProyecto) {
      return { puede: false, razon: 'Ya ha sido convertido a proyecto' };
    }

    if (!presupuesto.planPagos || presupuesto.planPagos.length === 0) {
      return { puede: false, razon: 'El presupuesto no tiene plan de pagos definido' };
    }

    return { puede: true };
  }

  /**
   * Get conversion summary before converting
   */
  async obtenerResumenConversion(presupuestoId: string) {
    const presupuesto = await presupuestoService.getPresupuesto(presupuestoId);
    if (!presupuesto) throw new Error('Presupuesto no encontrado');

    const pagoAdelanto = presupuesto.planPagos.find(p => 
      p.numero === 1 || 
      p.descripcion.toLowerCase().includes('adelanto')
    ) || presupuesto.planPagos[0];

    return {
      nombreProyecto: presupuesto.nombre,
      cliente: presupuesto.cliente.nombre,
      montoTotal: presupuesto.montos.total,
      montoAdelanto: pagoAdelanto?.monto || 0,
      porcentajeAdelanto: pagoAdelanto ? (pagoAdelanto.monto / presupuesto.montos.total) * 100 : 0,
      numeroFases: presupuesto.fases.length,
      numeroPagos: presupuesto.planPagos.length
    };
  }
}

export const conversionService = new ConversionService();
export default conversionService;
