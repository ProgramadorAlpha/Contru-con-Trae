import { claudeService } from './claudeService';

export interface ExtractedReceiptData {
  total: number;
  date: string;
  supplier: string;
  items: string[];
  rfc?: string;
  invoiceNumber?: string;
}

export interface AnalyzeReceiptResponse {
  extractedData: ExtractedReceiptData;
  suggestedCategory: string;
  suggestedProject?: string;
  confidence: number;
}

/**
 * Convierte una imagen a base64
 */
export function imageToBase64(imageDataUrl: string): string {
  // Remover el prefijo data:image/jpeg;base64, si existe
  return imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
}

/**
 * Analiza un recibo usando Claude Vision API
 */
export async function analyzeReceipt(
  imageDataUrl: string,
  projectContext?: any[]
): Promise<AnalyzeReceiptResponse> {
  try {
    const base64Image = imageToBase64(imageDataUrl);
    
    // Por ahora, usamos mock data para desarrollo
    // En producción, esto llamará al endpoint real
    if (process.env.NODE_ENV === 'development') {
      return mockAnalyzeReceipt();
    }

    const response = await fetch('/api/claude/analyze-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        image: base64Image,
        projectContext: projectContext || []
      })
    });

    if (!response.ok) {
      throw new Error('Error al analizar el recibo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en analyzeReceipt:', error);
    throw error;
  }
}

/**
 * Mock implementation para desarrollo
 */
function mockAnalyzeReceipt(): Promise<AnalyzeReceiptResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        extractedData: {
          total: 1250.50,
          date: new Date().toISOString().split('T')[0],
          supplier: 'Ferretería El Constructor',
          items: [
            'Cemento gris 50kg x 10',
            'Arena fina 1m³',
            'Varilla 3/8" x 6m x 20'
          ],
          rfc: 'FEC850101ABC',
          invoiceNumber: 'A-12345'
        },
        suggestedCategory: 'materiales',
        suggestedProject: undefined,
        confidence: 0.92
      });
    }, 2000);
  });
}

/**
 * Categoriza una compra basándose en los items
 */
export function categorizePurchase(items: string[]): string {
  const itemsText = items.join(' ').toLowerCase();
  
  if (itemsText.includes('cemento') || itemsText.includes('arena') || 
      itemsText.includes('varilla') || itemsText.includes('block')) {
    return 'materiales';
  }
  
  if (itemsText.includes('mano de obra') || itemsText.includes('albañil') || 
      itemsText.includes('trabajador')) {
    return 'mano_de_obra';
  }
  
  if (itemsText.includes('renta') || itemsText.includes('equipo') || 
      itemsText.includes('maquinaria')) {
    return 'equipos';
  }
  
  if (itemsText.includes('transporte') || itemsText.includes('flete') || 
      itemsText.includes('gasolina')) {
    return 'transporte';
  }
  
  return 'otros';
}

/**
 * Intenta asociar el recibo con un proyecto
 */
export function matchProject(
  extractedData: ExtractedReceiptData,
  projectContext: any[]
): string | undefined {
  // Lógica simple: buscar coincidencias en la descripción
  const searchText = [
    extractedData.supplier,
    ...extractedData.items
  ].join(' ').toLowerCase();
  
  for (const project of projectContext) {
    if (searchText.includes(project.name.toLowerCase())) {
      return project.id;
    }
  }
  
  return undefined;
}
