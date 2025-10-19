/**
 * PDF Generator Utils - Task 8.1
 * Requirements: 13.1, 14.4, 14.5, 14.6, 11.9
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Presupuesto } from '../types/presupuesto.types';
import type { AnalisisRentabilidad } from '../types/rentabilidad.types';
import { formatearMoneda } from './presupuesto.utils';

/**
 * Generate PDF for presupuesto
 * Requirement: 13.1
 */
export async function generarPDFPresupuesto(presupuesto: Presupuesto): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94); // Green
  doc.text('PRESUPUESTO', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(presupuesto.numero, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;

  // Company info (left) and Client info (right)
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Company (mock data)
  doc.setFont('helvetica', 'bold');
  doc.text('CONSTRUCTPRO', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('CIF: B12345678', 15, yPos + 5);
  doc.text('Calle Empresa 123', 15, yPos + 10);
  doc.text('28001 Madrid, España', 15, yPos + 15);
  
  // Client
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE:', pageWidth - 80, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(presupuesto.cliente.nombre, pageWidth - 80, yPos + 5);
  if (presupuesto.cliente.empresa) {
    doc.text(presupuesto.cliente.empresa, pageWidth - 80, yPos + 10);
  }
  doc.text(presupuesto.cliente.email, pageWidth - 80, yPos + 15);
  doc.text(presupuesto.cliente.telefono, pageWidth - 80, yPos + 20);
  
  yPos += 35;

  // Project info
  doc.setFont('helvetica', 'bold');
  doc.text('PROYECTO:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(presupuesto.nombre, 15, yPos + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('UBICACIÓN:', 15, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(presupuesto.ubicacionObra.direccion, 15, yPos + 15);
  
  yPos += 30;

  // Fases and Partidas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DESGLOSE POR FASES', 15, yPos);
  yPos += 5;

  presupuesto.fases.forEach((fase, faseIndex) => {
    // Fase header
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos, pageWidth - 30, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`FASE ${fase.numero}: ${fase.nombre}`, 17, yPos + 5);
    yPos += 10;

    // Partidas table
    const partidasData = fase.partidas.map(p => [
      p.codigo,
      p.nombre,
      p.cantidad.toString(),
      p.unidad,
      formatearMoneda(p.precioUnitario, presupuesto.montos.moneda),
      formatearMoneda(p.total, presupuesto.montos.moneda)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Código', 'Descripción', 'Cantidad', 'Unidad', 'P. Unit.', 'Total']],
      body: partidasData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 60 },
        2: { cellWidth: 20, halign: 'right' },
        3: { cellWidth: 20 },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' }
      },
      margin: { left: 15, right: 15 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 5;

    // Fase total
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Fase ${fase.numero}:`, pageWidth - 60, yPos);
    doc.text(formatearMoneda(fase.monto, presupuesto.montos.moneda), pageWidth - 20, yPos, { align: 'right' });
    yPos += 10;

    // Check if we need a new page
    if (yPos > 250 && faseIndex < presupuesto.fases.length - 1) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Plan de Pagos
  if (presupuesto.planPagos.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('PLAN DE PAGOS', 15, yPos);
    yPos += 5;

    const pagosData = presupuesto.planPagos.map(p => [
      p.numero.toString(),
      p.descripcion,
      `${p.porcentaje.toFixed(2)}%`,
      formatearMoneda(p.monto, presupuesto.montos.moneda),
      p.estado
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Descripción', '%', 'Monto', 'Estado']],
      body: pagosData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 80 },
        2: { cellWidth: 20, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 25 }
      },
      margin: { left: 15, right: 15 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Totals
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFillColor(240, 240, 240);
  doc.rect(pageWidth - 80, yPos, 65, 25, 'F');
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Subtotal:', pageWidth - 75, yPos + 5);
  doc.text(formatearMoneda(presupuesto.montos.subtotal, presupuesto.montos.moneda), pageWidth - 20, yPos + 5, { align: 'right' });
  
  doc.text('IVA (21%):', pageWidth - 75, yPos + 12);
  doc.text(formatearMoneda(presupuesto.montos.iva, presupuesto.montos.moneda), pageWidth - 20, yPos + 12, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', pageWidth - 75, yPos + 20);
  doc.text(formatearMoneda(presupuesto.montos.total, presupuesto.montos.moneda), pageWidth - 20, yPos + 20, { align: 'right' });

  yPos += 35;

  // Condiciones
  if (presupuesto.condiciones.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('CONDICIONES:', 15, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    presupuesto.condiciones.forEach((condicion, index) => {
      doc.text(`${index + 1}. ${condicion}`, 15, yPos);
      yPos += 4;
    });
  }

  // Footer
  const fechaValidez = presupuesto.fechaValidez.toDate ? presupuesto.fechaValidez.toDate() : new Date(presupuesto.fechaValidez as any);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Válido hasta: ${fechaValidez.toLocaleDateString('es-ES')}`, pageWidth / 2, 285, { align: 'center' });

  return doc.output('blob');
}

/**
 * Generate PDF for presupuesto with signatures
 * Requirements: 14.4, 14.5, 14.6
 * 
 * Generates a complete PDF including:
 * - Full presupuesto details
 * - Signatures page with all digital signatures
 * - Signature metadata (name, date, IP)
 */
export async function generarPDFPresupuestoFirmado(presupuesto: Presupuesto): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // ===== PRESUPUESTO CONTENT (Same as generarPDFPresupuesto) =====
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94);
  doc.text('PRESUPUESTO', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(presupuesto.numero, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;

  // Company and Client info
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  doc.setFont('helvetica', 'bold');
  doc.text('CONSTRUCTPRO', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('CIF: B12345678', 15, yPos + 5);
  doc.text('Calle Empresa 123', 15, yPos + 10);
  doc.text('28001 Madrid, España', 15, yPos + 15);
  
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE:', pageWidth - 80, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(presupuesto.cliente.nombre, pageWidth - 80, yPos + 5);
  if (presupuesto.cliente.empresa) {
    doc.text(presupuesto.cliente.empresa, pageWidth - 80, yPos + 10);
  }
  doc.text(presupuesto.cliente.email, pageWidth - 80, yPos + 15);
  doc.text(presupuesto.cliente.telefono, pageWidth - 80, yPos + 20);
  
  yPos += 35;

  // Project info
  doc.setFont('helvetica', 'bold');
  doc.text('PROYECTO:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(presupuesto.nombre, 15, yPos + 5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('UBICACIÓN:', 15, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(presupuesto.ubicacionObra.direccion, 15, yPos + 15);
  
  yPos += 30;

  // Fases
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DESGLOSE POR FASES', 15, yPos);
  yPos += 5;

  presupuesto.fases.forEach((fase, faseIndex) => {
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos, pageWidth - 30, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`FASE ${fase.numero}: ${fase.nombre}`, 17, yPos + 5);
    yPos += 10;

    const partidasData = fase.partidas.map(p => [
      p.codigo,
      p.nombre,
      p.cantidad.toString(),
      p.unidad,
      formatearMoneda(p.precioUnitario, presupuesto.montos.moneda),
      formatearMoneda(p.total, presupuesto.montos.moneda)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Código', 'Descripción', 'Cantidad', 'Unidad', 'P. Unit.', 'Total']],
      body: partidasData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 60 },
        2: { cellWidth: 20, halign: 'right' },
        3: { cellWidth: 20 },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' }
      },
      margin: { left: 15, right: 15 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 5;

    doc.setFont('helvetica', 'bold');
    doc.text(`Total Fase ${fase.numero}:`, pageWidth - 60, yPos);
    doc.text(formatearMoneda(fase.monto, presupuesto.montos.moneda), pageWidth - 20, yPos, { align: 'right' });
    yPos += 10;

    if (yPos > 250 && faseIndex < presupuesto.fases.length - 1) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Plan de Pagos
  if (presupuesto.planPagos.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('PLAN DE PAGOS', 15, yPos);
    yPos += 5;

    const pagosData = presupuesto.planPagos.map(p => [
      p.numero.toString(),
      p.descripcion,
      `${p.porcentaje.toFixed(2)}%`,
      formatearMoneda(p.monto, presupuesto.montos.moneda),
      p.estado
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Descripción', '%', 'Monto', 'Estado']],
      body: pagosData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 80 },
        2: { cellWidth: 20, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 25 }
      },
      margin: { left: 15, right: 15 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Totals
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFillColor(240, 240, 240);
  doc.rect(pageWidth - 80, yPos, 65, 25, 'F');
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Subtotal:', pageWidth - 75, yPos + 5);
  doc.text(formatearMoneda(presupuesto.montos.subtotal, presupuesto.montos.moneda), pageWidth - 20, yPos + 5, { align: 'right' });
  
  doc.text('IVA (21%):', pageWidth - 75, yPos + 12);
  doc.text(formatearMoneda(presupuesto.montos.iva, presupuesto.montos.moneda), pageWidth - 20, yPos + 12, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', pageWidth - 75, yPos + 20);
  doc.text(formatearMoneda(presupuesto.montos.total, presupuesto.montos.moneda), pageWidth - 20, yPos + 20, { align: 'right' });

  yPos += 35;

  // Condiciones
  if (presupuesto.condiciones.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('CONDICIONES:', 15, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    presupuesto.condiciones.forEach((condicion, index) => {
      doc.text(`${index + 1}. ${condicion}`, 15, yPos);
      yPos += 4;
    });
  }

  // ===== SIGNATURES PAGE =====
  
  if (presupuesto.firmas && presupuesto.firmas.length > 0) {
    doc.addPage();
    yPos = 20;
    
    // Signatures header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text('FIRMAS DIGITALES', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Este documento ha sido firmado digitalmente por las siguientes partes:', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Add each signature
    presupuesto.firmas.forEach((firma, index) => {
      // Check if we need a new page
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      // Signature box
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(15, yPos, pageWidth - 30, 70);
      
      // Signature type badge
      const badgeColor = firma.tipo === 'empresa' ? [34, 197, 94] : [59, 130, 246];
      doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
      doc.rect(20, yPos + 5, 40, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(firma.tipo === 'empresa' ? 'EMPRESA' : 'CLIENTE', 40, yPos + 10, { align: 'center' });
      
      // Signature details
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(firma.firmadoPor, 20, yPos + 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const fechaFirma = firma.fecha.toDate ? firma.fecha.toDate() : new Date(firma.fecha as any);
      doc.text(`Fecha: ${fechaFirma.toLocaleString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 20, yPos + 28);
      
      doc.text(`Dirección IP: ${firma.ip}`, 20, yPos + 35);
      
      // Signature image
      if (firma.firma) {
        try {
          doc.addImage(firma.firma, 'PNG', pageWidth - 90, yPos + 10, 70, 35);
        } catch (error) {
          console.error('Error adding signature image:', error);
          doc.setTextColor(150, 150, 150);
          doc.setFontSize(8);
          doc.text('[Firma digital]', pageWidth - 55, yPos + 30, { align: 'center' });
        }
      }
      
      // Verification hash (simplified)
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(7);
      const hash = `${firma.firmadoPor}-${firma.fecha}-${firma.ip}`.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0).toString(16).toUpperCase();
      doc.text(`Hash de verificación: ${hash}`, 20, yPos + 65);
      
      yPos += 80;
    });

    // Legal notice
    yPos += 10;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(250, 250, 250);
    doc.rect(15, yPos, pageWidth - 30, 30, 'F');
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const legalText = 'Este documento ha sido firmado digitalmente de acuerdo con la normativa vigente. Las firmas digitales tienen la misma validez legal que las firmas manuscritas. La información de fecha, hora e IP ha sido registrada para garantizar la autenticidad e integridad del documento.';
    const splitText = doc.splitTextToSize(legalText, pageWidth - 40);
    doc.text(splitText, 20, yPos + 5);
  }

  // Footer on last page
  const totalPages = doc.getNumberOfPages();
  doc.setPage(totalPages);
  const fechaValidez = presupuesto.fechaValidez.toDate ? presupuesto.fechaValidez.toDate() : new Date(presupuesto.fechaValidez as any);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Documento generado el ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 285, { align: 'center' });

  return doc.output('blob');
}

/**
 * Generate PDF for rentabilidad analysis
 * Requirement: 11.9
 */
export async function generarPDFAnalisisRentabilidad(analisis: AnalisisRentabilidad): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(18);
  doc.setTextColor(34, 197, 94);
  doc.text('ANÁLISIS DE RENTABILIDAD', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Project info
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Proyecto ID: ${analisis.proyectoId}`, 15, yPos);
  doc.text(`Presupuesto ID: ${analisis.presupuestoId}`, 15, yPos + 5);
  yPos += 20;

  // Ingresos
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('INGRESOS', 15, yPos);
  yPos += 5;

  const ingresosData = [
    ['Presupuesto Original', formatearMoneda(analisis.ingresos.presupuestoOriginal)],
    ['Cambios Aprobados', formatearMoneda(analisis.ingresos.cambiosAprobados)],
    ['Total Facturado', formatearMoneda(analisis.ingresos.totalFacturado)],
    ['Total Cobrado', formatearMoneda(analisis.ingresos.totalCobrado)]
  ];

  autoTable(doc, {
    startY: yPos,
    body: ingresosData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 40, halign: 'right' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Costos Directos
  doc.setFont('helvetica', 'bold');
  doc.text('COSTOS DIRECTOS', 15, yPos);
  yPos += 5;

  const costosData = [
    ['Subcontratistas', formatearMoneda(analisis.costosDirectos.subcontratistas)],
    ['Materiales', formatearMoneda(analisis.costosDirectos.materiales)],
    ['Maquinaria', formatearMoneda(analisis.costosDirectos.maquinaria)],
    ['Otros', formatearMoneda(analisis.costosDirectos.otros)],
    ['TOTAL', formatearMoneda(analisis.costosDirectos.total)]
  ];

  autoTable(doc, {
    startY: yPos,
    body: costosData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 40, halign: 'right' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Gastos Operativos
  doc.setFont('helvetica', 'bold');
  doc.text('GASTOS OPERATIVOS', 15, yPos);
  yPos += 5;

  const gastosData = [
    ['Personal Propio', formatearMoneda(analisis.gastosOperativos.personalPropio)],
    ['Transporte', formatearMoneda(analisis.gastosOperativos.transporte)],
    ['Permisos y Licencias', formatearMoneda(analisis.gastosOperativos.permisosLicencias)],
    ['Otros', formatearMoneda(analisis.gastosOperativos.otros)],
    ['TOTAL', formatearMoneda(analisis.gastosOperativos.total)]
  ];

  autoTable(doc, {
    startY: yPos,
    body: gastosData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 40, halign: 'right' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Resultados
  doc.setFillColor(34, 197, 94);
  doc.rect(15, yPos, pageWidth - 30, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  
  doc.text('MARGEN BRUTO:', 20, yPos + 10);
  doc.text(formatearMoneda(analisis.margenBruto), pageWidth - 20, yPos + 10, { align: 'right' });
  doc.text(`(${analisis.margenBrutoPorcentaje.toFixed(2)}%)`, pageWidth - 20, yPos + 15, { align: 'right' });
  
  doc.text('UTILIDAD NETA:', 20, yPos + 25);
  doc.text(formatearMoneda(analisis.utilidadNeta), pageWidth - 20, yPos + 25, { align: 'right' });
  doc.text(`(${analisis.utilidadNetaPorcentaje.toFixed(2)}%)`, pageWidth - 20, yPos + 30, { align: 'right' });
  
  doc.text('ROI:', 20, yPos + 35);
  doc.text(`${analisis.roi.toFixed(2)}%`, pageWidth - 20, yPos + 35, { align: 'right' });

  yPos += 50;

  // Comparativa
  if (analisis.comparativa.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('COMPARATIVA PRESUPUESTO VS REAL', 15, yPos);
    yPos += 5;

    const comparativaData = analisis.comparativa.map(item => [
      item.concepto,
      formatearMoneda(item.presupuestado),
      formatearMoneda(item.real),
      formatearMoneda(item.variacion),
      `${item.variacionPorcentaje.toFixed(2)}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Concepto', 'Presupuestado', 'Real', 'Variación', '%']],
      body: comparativaData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30, halign: 'right' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 20, halign: 'right' }
      }
    });
  }

  return doc.output('blob');
}
