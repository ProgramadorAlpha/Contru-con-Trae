/**
 * Integration Service
 * 
 * Connects AI features with existing system services
 */

import { expenseService } from '../expenseService';
import type { ExtractedReceiptData } from './receiptService';
import type { OCRExpenseDTO } from '@/types/expenses';

export interface SaveReceiptResult {
  success: boolean;
  expenseId?: string;
  documentId?: string;
  error?: string;
}

/**
 * Guarda un recibo escaneado en el sistema
 * Crea el gasto y guarda el documento asociado
 */
export async function saveScannedReceipt(
  extractedData: ExtractedReceiptData,
  formData: any,
  imageDataUrl: string
): Promise<SaveReceiptResult> {
  try {
    // 1. Preparar datos para crear el gasto
    // Convertir imagen a base64 puro (sin el prefijo data:image)
    const base64Image = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
    
    const ocrData: OCRExpenseDTO = {
      amount: formData.amount,
      date: formData.date,
      supplier: formData.supplier,
      description: formData.description,
      invoiceNumber: formData.invoiceNumber,
      taxAmount: 0, // Podría calcularse del total
      file: {
        name: `recibo-${Date.now()}.jpg`,
        data: base64Image,
        mimeType: 'image/jpeg'
      },
      ocrData: {
        rawText: extractedData.items.join('\n'),
        extractedFields: {
          amount: extractedData.total,
          date: extractedData.date,
          supplier: extractedData.supplier,
          invoiceNumber: extractedData.invoiceNumber || '',
          description: extractedData.items.join(', ')
        },
        confidence: 0.9,
        processedAt: new Date().toISOString(),
        ocrProvider: 'claude-vision'
      },
      projectId: formData.project,
      costCodeId: undefined, // Se auto-asignará basado en categoría
      supplierId: undefined // Se auto-asignará o creará
    };

    // 2. Crear el gasto usando el servicio existente
    const expense = await expenseService.createExpenseFromOCR(ocrData);

    // 3. Guardar la imagen como documento (esto se implementará cuando tengamos el servicio de documentos)
    // const documentId = await saveReceiptDocument(imageDataUrl, expense.id, formData);

    return {
      success: true,
      expenseId: expense.id,
      documentId: undefined // Por ahora
    };
  } catch (error) {
    console.error('Error al guardar recibo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Guarda la imagen del recibo como documento
 * TODO: Implementar cuando tengamos el servicio de documentos
 */
async function saveReceiptDocument(
  imageDataUrl: string,
  expenseId: string,
  formData: any
): Promise<string> {
  // Por ahora retornamos un ID mock
  // En producción, esto subiría la imagen a S3 o storage local
  // y crearía un registro en la tabla de documentos
  
  console.log('Guardando documento de recibo:', {
    expenseId,
    imageSize: imageDataUrl.length,
    supplier: formData.supplier
  });

  return `DOC-${Date.now()}`;
}

/**
 * Muestra una notificación de éxito
 */
export function showSuccessNotification(message: string) {
  // TODO: Integrar con el sistema de notificaciones/toasts
  console.log('✅ Éxito:', message);
  
  // Por ahora usamos alert, pero debería ser un toast
  if (typeof window !== 'undefined') {
    // Podríamos usar una librería como react-hot-toast
    alert(message);
  }
}

/**
 * Muestra una notificación de error
 */
export function showErrorNotification(message: string) {
  // TODO: Integrar con el sistema de notificaciones/toasts
  console.error('❌ Error:', message);
  
  // Por ahora usamos alert, pero debería ser un toast
  if (typeof window !== 'undefined') {
    alert(`Error: ${message}`);
  }
}
