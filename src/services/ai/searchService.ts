/**
 * Semantic Search Service
 * 
 * Provides AI-powered semantic search capabilities for documents
 */

export interface SemanticSearchResult {
  documentId: string;
  documentName: string;
  relevance: number;
  highlights: string[];
  snippet: string;
}

export interface SemanticSearchResponse {
  results: SemanticSearchResult[];
  totalResults: number;
  processingTime: number;
}

/**
 * Realiza una búsqueda semántica en documentos
 */
export async function semanticSearch(
  query: string,
  filters?: {
    projectId?: string;
    folder?: string;
    dateRange?: { from: string; to: string };
  }
): Promise<SemanticSearchResponse> {
  try {
    // Mock implementation para desarrollo
    if (process.env.NODE_ENV === 'development') {
      return mockSemanticSearch(query);
    }

    const response = await fetch('/api/claude/semantic-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ query, filters })
    });

    if (!response.ok) {
      throw new Error('Error en la búsqueda semántica');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en semanticSearch:', error);
    throw error;
  }
}

/**
 * Mock implementation
 */
function mockSemanticSearch(query: string): Promise<SemanticSearchResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        results: [
          {
            documentId: 'doc-1',
            documentName: 'Contrato Electricidad - Proyecto Casa Azul.pdf',
            relevance: 0.95,
            highlights: ['instalaciones eléctricas', 'proyecto casa azul'],
            snippet: 'Contrato para instalaciones eléctricas en el proyecto casa azul...'
          },
          {
            documentId: 'doc-2',
            documentName: 'Presupuesto Materiales Eléctricos.xlsx',
            relevance: 0.87,
            highlights: ['materiales eléctricos', 'cables', 'interruptores'],
            snippet: 'Presupuesto detallado de materiales eléctricos incluyendo cables...'
          }
        ],
        totalResults: 2,
        processingTime: 450
      });
    }, 1000);
  });
}
