/**
 * Document Categorization Service
 * 
 * Auto-categorizes documents using AI
 */

export interface CategorizationResult {
  suggestedFolder: string;
  confidence: number;
  extractedMetadata: {
    date?: string;
    parties?: string[];
    amount?: number;
    type?: string;
  };
  reasoning: string;
}

/**
 * Categoriza un documento automáticamente
 */
export async function categorizeDocument(
  file: File,
  content?: string
): Promise<CategorizationResult> {
  try {
    // Mock implementation
    if (process.env.NODE_ENV === 'development') {
      return mockCategorizeDocument(file.name);
    }

    const formData = new FormData();
    formData.append('file', file);
    if (content) {
      formData.append('content', content);
    }

    const response = await fetch('/api/claude/categorize-document', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Error al categorizar documento');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en categorizeDocument:', error);
    throw error;
  }
}

/**
 * Mock implementation
 */
function mockCategorizeDocument(filename: string): Promise<CategorizationResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let folder = 'Otros';
      let confidence = 0.5;

      if (filename.toLowerCase().includes('contrato')) {
        folder = 'Contratos';
        confidence = 0.92;
      } else if (filename.toLowerCase().includes('factura') || filename.toLowerCase().includes('recibo')) {
        folder = 'Facturas';
        confidence = 0.95;
      } else if (filename.toLowerCase().includes('plano')) {
        folder = 'Planos';
        confidence = 0.88;
      } else if (filename.toLowerCase().includes('permiso')) {
        folder = 'Permisos';
        confidence = 0.90;
      }

      resolve({
        suggestedFolder: folder,
        confidence,
        extractedMetadata: {
          date: new Date().toISOString().split('T')[0],
          type: folder
        },
        reasoning: `El documento parece ser un ${folder.toLowerCase()} basado en el nombre del archivo y contenido.`
      });
    }, 1500);
  });
}
