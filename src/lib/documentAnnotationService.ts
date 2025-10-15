export interface Annotation {
  id: string;
  documentId: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'highlight' | 'comment' | 'drawing' | 'text' | 'stamp';
  content: string;
  color: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  resolved?: boolean;
  replies?: AnnotationReply[];
}

export interface AnnotationReply {
  id: string;
  annotationId: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface DrawingPath {
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
}

export interface AnnotationTool {
  id: string;
  name: string;
  type: 'highlight' | 'comment' | 'drawing' | 'text' | 'stamp';
  icon: string;
  color: string;
  shortcut?: string;
}

class DocumentAnnotationService {
  private annotations: Map<string, Annotation[]> = new Map();
  private currentUser = 'Usuario Actual'; // En producción vendría del sistema de autenticación

  // Herramientas de anotación disponibles
  public getAnnotationTools(): AnnotationTool[] {
    return [
      {
        id: 'highlight',
        name: 'Resaltar',
        type: 'highlight',
        icon: '🖍️',
        color: '#ffeb3b',
        shortcut: 'H'
      },
      {
        id: 'comment',
        name: 'Comentario',
        type: 'comment',
        icon: '💬',
        color: '#2196f3',
        shortcut: 'C'
      },
      {
        id: 'drawing',
        name: 'Dibujar',
        type: 'drawing',
        icon: '✏️',
        color: '#f44336',
        shortcut: 'D'
      },
      {
        id: 'text',
        name: 'Texto',
        type: 'text',
        icon: '📝',
        color: '#4caf50',
        shortcut: 'T'
      },
      {
        id: 'stamp',
        name: 'Sello',
        type: 'stamp',
        icon: '🔖',
        color: '#9c27b0',
        shortcut: 'S'
      }
    ];
  }

  // Obtener anotaciones de un documento
  public getAnnotations(documentId: string): Annotation[] {
    return this.annotations.get(documentId) || [];
  }

  // Crear nueva anotación
  public createAnnotation(documentId: string, annotation: Omit<Annotation, 'id' | 'author' | 'createdAt' | 'updatedAt'>): Annotation {
    const newAnnotation: Annotation = {
      ...annotation,
      id: this.generateId(),
      author: this.currentUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: []
    };

    const documentAnnotations = this.getAnnotations(documentId);
    documentAnnotations.push(newAnnotation);
    this.annotations.set(documentId, documentAnnotations);

    return newAnnotation;
  }

  // Actualizar anotación existente
  public updateAnnotation(documentId: string, annotationId: string, updates: Partial<Annotation>): Annotation | null {
    const documentAnnotations = this.getAnnotations(documentId);
    const index = documentAnnotations.findIndex(a => a.id === annotationId);
    
    if (index === -1) return null;

    const updatedAnnotation = {
      ...documentAnnotations[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    documentAnnotations[index] = updatedAnnotation;
    this.annotations.set(documentId, documentAnnotations);

    return updatedAnnotation;
  }

  // Eliminar anotación
  public deleteAnnotation(documentId: string, annotationId: string): boolean {
    const documentAnnotations = this.getAnnotations(documentId);
    const filteredAnnotations = documentAnnotations.filter(a => a.id !== annotationId);
    
    if (filteredAnnotations.length === documentAnnotations.length) return false;
    
    this.annotations.set(documentId, filteredAnnotations);
    return true;
  }

  // Agregar respuesta a una anotación
  public addReply(documentId: string, annotationId: string, content: string): AnnotationReply | null {
    const documentAnnotations = this.getAnnotations(documentId);
    const annotation = documentAnnotations.find(a => a.id === annotationId);
    
    if (!annotation) return null;

    const reply: AnnotationReply = {
      id: this.generateId(),
      annotationId,
      content,
      author: this.currentUser,
      createdAt: new Date().toISOString()
    };

    if (!annotation.replies) {
      annotation.replies = [];
    }
    annotation.replies.push(reply);
    annotation.updatedAt = new Date().toISOString();

    this.annotations.set(documentId, documentAnnotations);
    return reply;
  }

  // Marcar anotación como resuelta
  public resolveAnnotation(documentId: string, annotationId: string): boolean {
    const annotation = this.updateAnnotation(documentId, annotationId, { resolved: true });
    return annotation !== null;
  }

  // Obtener estadísticas de anotaciones
  public getAnnotationStats(documentId: string): {
    total: number;
    byType: Record<string, number>;
    unresolved: number;
    byAuthor: Record<string, number>;
  } {
    const annotations = this.getAnnotations(documentId);
    
    const stats = {
      total: annotations.length,
      byType: {} as Record<string, number>,
      unresolved: annotations.filter(a => !a.resolved).length,
      byAuthor: {} as Record<string, number>
    };

    annotations.forEach(annotation => {
      // Contar por tipo
      stats.byType[annotation.type] = (stats.byType[annotation.type] || 0) + 1;
      
      // Contar por autor
      stats.byAuthor[annotation.author] = (stats.byAuthor[annotation.author] || 0) + 1;
    });

    return stats;
  }

  // Exportar anotaciones
  public exportAnnotations(documentId: string, format: 'json' | 'csv' = 'json'): string {
    const annotations = this.getAnnotations(documentId);
    
    if (format === 'json') {
      return JSON.stringify(annotations, null, 2);
    }

    // CSV export
    const headers = ['ID', 'Página', 'Tipo', 'Contenido', 'Autor', 'Fecha', 'Resuelto'];
    const rows = annotations.map(annotation => [
      annotation.id,
      annotation.page.toString(),
      annotation.type,
      `"${annotation.content.replace(/"/g, '""')}"`,
      annotation.author,
      annotation.createdAt,
      annotation.resolved ? 'Sí' : 'No'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // Importar anotaciones
  public importAnnotations(documentId: string, data: string, format: 'json' | 'csv' = 'json'): boolean {
    try {
      if (format === 'json') {
        const annotations = JSON.parse(data) as Annotation[];
        this.annotations.set(documentId, annotations);
        return true;
      }

      // CSV import (implementación básica)
      const lines = data.split('\n');
      const headers = lines[0].split(',');
      const annotations: Annotation[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 7) {
          const annotation: Annotation = {
            id: values[0].replace(/"/g, ''),
            documentId,
            page: parseInt(values[1]),
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            type: values[2].replace(/"/g, '') as any,
            content: values[3].replace(/"/g, ''),
            color: '#2196f3',
            author: values[4].replace(/"/g, ''),
            createdAt: values[5].replace(/"/g, ''),
            updatedAt: new Date().toISOString(),
            resolved: values[6].replace(/"/g, '') === 'Sí'
          };
          annotations.push(annotation);
        }
      }

      this.annotations.set(documentId, annotations);
      return true;
    } catch (error) {
      console.error('Error importing annotations:', error);
      return false;
    }
  }

  // Generar ID único
  private generateId(): string {
    return 'annotation-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Simular carga de anotaciones de ejemplo
  public loadSampleAnnotations(documentId: string): void {
    const sampleAnnotations: Annotation[] = [
      {
        id: 'anno-1',
        documentId,
        page: 1,
        x: 100,
        y: 150,
        width: 200,
        height: 30,
        type: 'highlight',
        content: 'Importante: Revisar especificaciones técnicas',
        color: '#ffeb3b',
        author: 'Juan Pérez',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        resolved: false,
        replies: [
          {
            id: 'reply-1',
            annotationId: 'anno-1',
            content: 'Las especificaciones ya fueron revisadas por el equipo técnico.',
            author: 'María García',
            createdAt: '2024-01-15T11:00:00Z'
          }
        ]
      },
      {
        id: 'anno-2',
        documentId,
        page: 2,
        x: 50,
        y: 200,
        width: 150,
        height: 100,
        type: 'comment',
        content: 'Este plano necesita actualización con los últimos cambios del cliente.',
        color: '#2196f3',
        author: 'Carlos López',
        createdAt: '2024-01-14T15:45:00Z',
        updatedAt: '2024-01-14T15:45:00Z',
        resolved: true
      },
      {
        id: 'anno-3',
        documentId,
        page: 1,
        x: 300,
        y: 100,
        width: 80,
        height: 25,
        type: 'text',
        content: 'APROBADO',
        color: '#4caf50',
        author: 'Ana Martínez',
        createdAt: '2024-01-13T09:20:00Z',
        updatedAt: '2024-01-13T09:20:00Z',
        resolved: false
      }
    ];

    this.annotations.set(documentId, sampleAnnotations);
  }
}

export const documentAnnotationService = new DocumentAnnotationService();