/**
 * Factura Service - Task 14.1
 */
import { localStorageService } from './localStorage.service';
import { Timestamp } from 'firebase/firestore';
import type { Factura } from '../types/factura.types';
import { tesoreriaService } from './tesoreria.service';
import { bloqueoFasesService } from './bloqueo-fases.service';

const STORAGE_KEY = 'facturas';

class FacturaService {
  private getFacturas(): Factura[] {
    return localStorageService.get<Factura[]>(STORAGE_KEY, []);
  }

  private saveFacturas(facturas: Factura[]): boolean {
    return localStorageService.set(STORAGE_KEY, facturas);
  }

  async createFactura(data: Omit<Factura, 'id' | 'numero' | 'createdAt' | 'updatedAt'>): Promise<Factura> {
    const facturas = this.getFacturas();
    const numero = `FAC-${new Date().getFullYear()}-${String(facturas.length + 1).padStart(3, '0')}`;
    
    const nuevaFactura: Factura = {
      ...data,
      id: `fac_${Date.now()}`,
      numero,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    facturas.push(nuevaFactura);
    this.saveFacturas(facturas);
    return nuevaFactura;
  }

  async enviarFactura(id: string): Promise<Factura> {
    const facturas = this.getFacturas();
    const index = facturas.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Factura no encontrada');

    facturas[index] = {
      ...facturas[index],
      estado: 'enviada',
      fechaEnvio: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    this.saveFacturas(facturas);
    return facturas[index];
  }

  /**
   * Register payment for an invoice
   * Task 14.3 - Requirement 9.7
   * 
   * When an invoice is marked as paid:
   * 1. Update invoice status to 'cobrada'
   * 2. Update project treasury (tesoreria.service)
   * 3. Unblock next phase if applicable (bloqueo-fases.service)
   * 4. Execute financial verifications (Task 16.3)
   */
  async registrarCobro(id: string, fechaCobro: Date, metodoPago: string): Promise<Factura> {
    const facturas = this.getFacturas();
    const index = facturas.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Factura no encontrada');

    const factura = facturas[index];

    // Update invoice status
    facturas[index] = {
      ...factura,
      estado: 'cobrada',
      fechaCobro: Timestamp.fromDate(fechaCobro),
      metodoPago,
      updatedAt: Timestamp.now()
    };

    this.saveFacturas(facturas);

    // Task 14.3: Update project treasury
    // Requirement 9.7: When invoice changes to "Cobrada", update project treasury
    try {
      await tesoreriaService.actualizarTesoreria(factura.proyectoId);
    } catch (error) {
      console.error('Error updating treasury:', error);
      // Don't fail the payment registration if treasury update fails
    }

    // Task 14.3: Unblock next phase if applicable
    // Requirement 7.5: When invoice linked to a phase is paid, unblock next phase
    if (factura.faseVinculada !== undefined) {
      try {
        await bloqueoFasesService.desbloquearSiguienteFaseSiCorresponde(
          factura.proyectoId,
          factura.faseVinculada
        );
      } catch (error) {
        console.error('Error unblocking next phase:', error);
        // Don't fail the payment registration if phase unblock fails
      }
    }

    // Task 16.3: Execute financial verifications after payment collection
    // Requirements: 8.1, 8.2, 8.3, 8.4
    try {
      // Import dynamically to avoid circular dependencies
      const { ejecutarVerificacionesAlRegistrarCobro } = await import('../utils/financial-verifications.utils');
      await ejecutarVerificacionesAlRegistrarCobro(factura.proyectoId, factura.total);
    } catch (error) {
      console.error('Error executing financial verifications:', error);
      // Don't fail the payment registration if verifications fail
    }

    return facturas[index];
  }

  async getFacturasAll(): Promise<Factura[]> {
    return this.getFacturas();
  }

  async getFacturasByProyecto(proyectoId: string): Promise<Factura[]> {
    const facturas = this.getFacturas();
    return facturas.filter(f => f.proyectoId === proyectoId);
  }

  async updateFacturaEstado(id: string, estado: Factura['estado']): Promise<Factura> {
    const facturas = this.getFacturas();
    const index = facturas.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Factura no encontrada');

    facturas[index] = {
      ...facturas[index],
      estado,
      updatedAt: Timestamp.now()
    };

    this.saveFacturas(facturas);
    return facturas[index];
  }

  /**
   * Generate automatic invoice for a completed phase
   * Task 14.4 - Requirement 9.2
   * 
   * When a phase reaches 100% completion, automatically generate an invoice
   * This should be called by the project service when phase progress = 100%
   */
  async generarFacturaFase(
    proyectoId: string,
    presupuestoId: string,
    faseNumero: number,
    montoFase: number,
    cliente: Factura['cliente'],
    creadoPor: string
  ): Promise<Factura> {
    // Calculate IVA (21% in Spain)
    const subtotal = montoFase;
    const iva = subtotal * 0.21;
    const total = subtotal + iva;

    // Set emission date to today
    const fechaEmision = Timestamp.now();
    
    // Set due date to 30 days from emission
    const fechaVencimiento = Timestamp.fromDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );

    // Create invoice data
    const facturaData: Omit<Factura, 'id' | 'numero' | 'createdAt' | 'updatedAt'> = {
      proyectoId,
      presupuestoId,
      faseVinculada: faseNumero,
      planPagoNumero: faseNumero, // Assuming plan pago matches fase numero
      cliente,
      subtotal,
      iva,
      total,
      moneda: 'EUR',
      fechaEmision,
      fechaVencimiento,
      estado: 'borrador',
      creadoPor
    };

    // Create the invoice
    const factura = await this.createFactura(facturaData);

    return factura;
  }
}

export const facturaService = new FacturaService();
export default facturaService;
