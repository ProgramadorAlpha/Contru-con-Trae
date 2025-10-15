export interface SearchOptions {
  query: string;
  searchInContent?: boolean;
  searchInMetadata?: boolean;
  filters?: {
    category?: string[];
    type?: string[];
    project?: string[];
    dateRange?: {
      start?: Date;
      end?: Date;
    };
    sizeRange?: {
      min?: number;
      max?: number;
    };
    tags?: string[];
  };
  sortBy?: 'relevance' | 'date' | 'name' | 'size';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  document: any;
  score: number;
  highlights: {
    content?: string[];
    metadata?: string[];
  };
  matchedFields: string[];
}

export interface OCRContent {
  text: string;
  confidence: number;
  pages?: {
    page: number;
    text: string;
    confidence: number;
  }[];
}

class DocumentSearchService {
  private searchHistory: string[] = [];
  private savedFilters: Map<string, SearchOptions> = new Map();

  // Simulación de OCR para documentos
  private simulateOCR(document: any): OCRContent {
    const baseContent = [
      "Este documento contiene información técnica sobre el proyecto",
      "Especificaciones de construcción y materiales",
      "Planos arquitectónicos y estructurales",
      "Presupuesto y costos del proyecto",
      "Cronograma de actividades",
      "Permisos y licencias",
      "Actas de reunión y comunicaciones",
      "Informes de avance y calidad"
    ];

    const randomContent = baseContent[Math.floor(Math.random() * baseContent.length)];
    const additionalText = document.name.toLowerCase().includes('presupuesto') ? 
      ' Presupuesto total: $' + (Math.random() * 1000000).toFixed(2) :
      document.name.toLowerCase().includes('plano') ?
      ' Dimensiones: ' + (Math.random() * 100).toFixed(2) + 'm x ' + (Math.random() * 100).toFixed(2) + 'm' :
      ' Fecha: ' + new Date().toLocaleDateString();

    return {
      text: randomContent + additionalText,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confianza
      pages: [
        {
          page: 1,
          text: randomContent + additionalText,
          confidence: Math.random() * 0.3 + 0.7
        }
      ]
    };
  }

  // Extraer metadatos del documento
  private extractMetadata(document: any): Record<string, string> {
    return {
      name: document.name,
      type: document.type,
      category: document.category,
      project: document.projectName || '',
      uploadDate: document.uploadDate,
      size: document.size.toString(),
      tags: (document.tags || []).join(' '),
      description: document.description || ''
    };
  }

  // Calcular relevancia de una coincidencia
  private calculateRelevance(
    document: any,
    query: string,
    searchInContent: boolean = true,
    searchInMetadata: boolean = true
  ): { score: number; highlights: any; matchedFields: string[] } {
    const queryLower = query.toLowerCase();
    let score = 0;
    let highlights: any = { content: [], metadata: [] };
    let matchedFields: string[] = [];

    // Búsqueda en metadatos
    if (searchInMetadata) {
      const metadata = this.extractMetadata(document);
      
      Object.entries(metadata).forEach(([key, value]) => {
        const valueLower = value.toLowerCase();
        if (valueLower.includes(queryLower)) {
          score += key === 'name' ? 10 : 5; // Mayor peso para el nombre
          matchedFields.push(key);
          
          // Crear resaltado
          const regex = new RegExp(`(${query})`, 'gi');
          const highlighted = value.replace(regex, '<mark>$1</mark>');
          highlights.metadata.push({ field: key, text: highlighted });
        }
      });
    }

    // Búsqueda en contenido (OCR simulado)
    if (searchInContent && (document.type === 'pdf' || document.type === 'doc' || document.type === 'docx')) {
      const ocrContent = this.simulateOCR(document);
      const contentLower = ocrContent.text.toLowerCase();
      
      if (contentLower.includes(queryLower)) {
        score += 3; // Menor peso que metadatos pero significativo
        matchedFields.push('content');
        
        // Crear resaltado de contenido
        const sentences = ocrContent.text.split(/[.!?]/);
        const matchingSentences = sentences.filter(sentence => 
          sentence.toLowerCase().includes(queryLower)
        ).slice(0, 3); // Máximo 3 frases
        
        highlights.content = matchingSentences.map(sentence => {
          const regex = new RegExp(`(${query})`, 'gi');
          return sentence.replace(regex, '<mark>$1</mark>');
        });
      }
    }

    // Búsqueda en tags
    if (document.tags) {
      document.tags.forEach((tag: string) => {
        if (tag.toLowerCase().includes(queryLower)) {
          score += 7;
          matchedFields.push('tags');
        }
      });
    }

    return { score, highlights, matchedFields };
  }

  // Búsqueda principal
  public async search(documents: any[], options: SearchOptions): Promise<SearchResult[]> {
    const {
      query,
      searchInContent = true,
      searchInMetadata = true,
      filters = {},
      sortBy = 'relevance',
      sortOrder = 'desc',
      limit = 50,
      offset = 0
    } = options;

    // Aplicar filtros primero
    let filteredDocuments = this.applyFilters(documents, filters);

    // Si no hay query, devolver documentos filtrados
    if (!query.trim()) {
      return filteredDocuments.map(doc => ({
        document: doc,
        score: 1,
        highlights: { content: [], metadata: [] },
        matchedFields: []
      }));
    }

    // Realizar búsqueda
    const results: SearchResult[] = [];
    
    filteredDocuments.forEach(document => {
      const relevance = this.calculateRelevance(
        document,
        query,
        searchInContent,
        searchInMetadata
      );

      if (relevance.score > 0) {
        results.push({
          document,
          score: relevance.score,
          highlights: relevance.highlights,
          matchedFields: relevance.matchedFields
        });
      }
    });

    // Ordenar resultados
    this.sortResults(results, sortBy, sortOrder);

    // Paginar
    const paginatedResults = results.slice(offset, offset + limit);

    // Actualizar historial de búsqueda
    this.updateSearchHistory(query);

    return paginatedResults;
  }

  // Aplicar filtros
  private applyFilters(documents: any[], filters: SearchOptions['filters']): any[] {
    if (!filters) return documents;

    return documents.filter(document => {
      // Filtro por categoría
      if (filters.category && filters.category.length > 0) {
        if (!filters.category.includes(document.category)) {
          return false;
        }
      }

      // Filtro por tipo
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(document.type)) {
          return false;
        }
      }

      // Filtro por proyecto
      if (filters.project && filters.project.length > 0) {
        if (!filters.project.includes(document.projectId)) {
          return false;
        }
      }

      // Filtro por fecha
      if (filters.dateRange) {
        const uploadDate = new Date(document.uploadDate);
        if (filters.dateRange.start && uploadDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && uploadDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }

      // Filtro por tamaño
      if (filters.sizeRange) {
        if (filters.sizeRange.min && document.size < filters.sizeRange.min) {
          return false;
        }
        if (filters.sizeRange.max && document.size > filters.sizeRange.max) {
          return false;
        }
      }

      // Filtro por tags
      if (filters.tags && filters.tags.length > 0) {
        const documentTags = document.tags || [];
        const hasMatchingTag = filters.tags.some(tag => 
          documentTags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }

  // Ordenar resultados
  private sortResults(results: SearchResult[], sortBy: string, sortOrder: string): void {
    results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = b.score - a.score;
          break;
        case 'date':
          comparison = new Date(b.document.uploadDate).getTime() - 
                       new Date(a.document.uploadDate).getTime();
          break;
        case 'name':
          comparison = a.document.name.localeCompare(b.document.name);
          break;
        case 'size':
          comparison = b.document.size - a.document.size;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  // Actualizar historial de búsqueda
  private updateSearchHistory(query: string): void {
    if (!this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query);
      if (this.searchHistory.length > 10) {
        this.searchHistory.pop();
      }
    }
  }

  // Obtener historial de búsqueda
  public getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  // Guardar filtro
  public saveFilter(name: string, options: SearchOptions): void {
    this.savedFilters.set(name, { ...options });
  }

  // Obtener filtros guardados
  public getSavedFilters(): Array<{ name: string; options: SearchOptions }> {
    return Array.from(this.savedFilters.entries()).map(([name, options]) => ({
      name,
      options
    }));
  }

  // Eliminar filtro guardado
  public deleteFilter(name: string): boolean {
    return this.savedFilters.delete(name);
  }

  // Sugerencias de búsqueda
  public getSearchSuggestions(query: string, documents: any[]): string[] {
    if (!query.trim()) return [];

    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    // Sugerencias de nombres de documentos
    documents.forEach(doc => {
      if (doc.name.toLowerCase().includes(queryLower)) {
        suggestions.add(doc.name);
      }
    });

    // Sugerencias de categorías
    const categories = [...new Set(documents.map(doc => doc.category))];
    categories.forEach(category => {
      if (category.toLowerCase().includes(queryLower)) {
        suggestions.add(category);
      }
    });

    // Sugerencias de tags
    const allTags = documents.flatMap(doc => doc.tags || []);
    allTags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.add(tag);
      }
    });

    return Array.from(suggestions).slice(0, 10);
  }
}

export const documentSearchService = new DocumentSearchService();