/**
 * Documento Service
 * 
 * Service for managing documents, including upload, scanning, search,
 * and linking with expenses.
 * 
 * Requirements: 4, 5, 6, 10, 14
 * Task: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { proyectoService } from './proyecto.service';
import { localStorageService } from './localStorage.service';

const STORAGE_KEY = 'documentos';

export interface Documento {
  id: string;
  proyecto_id: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  archivo_url: string;
  archivo_size: number;
  mime_type: string;
  
  // AI Processing
  procesado_ia?: boolean;
  metadatos_ia?: any;
  confianza_ia?: number;
  
  // Invoice fields
  es_factura?: boolean;
  monto_factura?: number;
  fecha_factura?: string;
  proveedor?: string;
  folio?: string;
  rfc?: string;
  
  // Version control
  version?: number;
  documento_padre_id?: string;
  
  // Collaboration
  compartido_con?: string[];
  anotaciones?: any;
  
  // Audit
  creado_por?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentoConGasto extends Documento {
  gasto?: any;
}

export interface SugerenciaProyecto {
  proyecto_id: string;
  proyecto_nombre: string;
  confianza: number;
  razon: string;
  alternativas?: Array<{
    proyecto_id: string;
    proyecto_nombre: string;
    confianza: number;
  }>;
}

export interface ResultadoBusqueda {
  documento: Documento;
  relevancia: number;
  razon_relevancia: string;
}

class DocumentoService {
  /**
   * Get all documents from localStorage
   */
  private getDocumentos(): Documento[] {
    return localStorageService.get<Documento[]>(STORAGE_KEY, []);
  }

  /**
   * Save documents to localStorage
   */
  private saveDocumentos(documentos: Documento[]): void {
    localStorageService.set(STORAGE_KEY, documentos);
  }

  /**
   * Upload a document
   * Requirement: 5
   */
  async subirDocumento(data: {
    proyecto_id: string;
    nombre: string;
    tipo: string;
    archivo: File;
    descripcion?: string;
    es_factura?: boolean;
    monto_factura?: number;
    fecha_factura?: string;
    proveedor?: string;
    folio?: string;
    usuario_id?: string;
  }): Promise<Documento> {
    try {
      // Validate project limits
      const limitValidation = await proyectoService.validarLimites(
        data.proyecto_id,
        data.archivo.size
      );

      if (!limitValidation.valid) {
        throw new Error(limitValidation.reason || 'Project limits exceeded');
      }

      // In real implementation, would upload file to storage
      // For now, create mock document
      const documento: Documento = {
        id: `doc-${Date.now()}`,
        proyecto_id: data.proyecto_id,
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        archivo_url: `/storage/${data.proyecto_id}/${data.tipo}/${data.archivo.name}`,
        archivo_size: data.archivo.size,
        mime_type: data.archivo.type,
        es_factura: data.es_factura || false,
        monto_factura: data.monto_factura,
        fecha_factura: data.fecha_factura,
        proveedor: data.proveedor,
        folio: data.folio,
        version: 1,
        creado_por: data.usuario_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to localStorage
      const documentos = this.getDocumentos();
      documentos.push(documento);
      this.saveDocumentos(documentos);
      
      console.log('✅ Document uploaded and persisted:', documento);

      return documento;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Scan receipt and create document + expense
   * Requirement: 4, 5
   */
  async escanearRecibo(data: {
    archivo: File;
    proyecto_id?: string;
    usuario_id?: string;
  }): Promise<{
    documento: Documento;
    gasto: any;
    sugerencia_proyecto?: SugerenciaProyecto;
  }> {
    try {
      // Step 1: Analyze receipt with AI (would call ClaudeService)
      const analisisIA = {
        proveedor: 'Proveedor Ejemplo',
        monto: 1500.00,
        fecha: new Date().toISOString().split('T')[0],
        folio: 'FAC-001',
        items: [],
        confianza: 85
      };

      // Step 2: Suggest project if not provided
      let proyectoId = data.proyecto_id;
      let sugerenciaProyecto: SugerenciaProyecto | undefined;

      if (!proyectoId) {
        sugerenciaProyecto = await this.sugerirProyecto({
          proveedor: analisisIA.proveedor,
          monto: analisisIA.monto,
          fecha: analisisIA.fecha,
          usuario_id: data.usuario_id
        });

        // Auto-select if confidence > 80%
        if (sugerenciaProyecto.confianza > 80) {
          proyectoId = sugerenciaProyecto.proyecto_id;
        }
      }

      if (!proyectoId) {
        throw new Error('Project ID required');
      }

      // Step 3: Create document
      const documento = await this.subirDocumento({
        proyecto_id: proyectoId,
        nombre: `Factura ${analisisIA.proveedor} - ${analisisIA.fecha}`,
        tipo: 'Factura',
        archivo: data.archivo,
        es_factura: true,
        monto_factura: analisisIA.monto,
        fecha_factura: analisisIA.fecha,
        proveedor: analisisIA.proveedor,
        folio: analisisIA.folio,
        usuario_id: data.usuario_id
      });

      // Mark as AI processed
      documento.procesado_ia = true;
      documento.metadatos_ia = analisisIA;
      documento.confianza_ia = analisisIA.confianza;

      // Step 4: Create expense
      const gasto = {
        id: `gasto-${Date.now()}`,
        proyecto_id: proyectoId,
        documento_id: documento.id,
        categoria: 'Materiales',
        concepto: `Compra a ${analisisIA.proveedor}`,
        monto: analisisIA.monto,
        fecha: analisisIA.fecha,
        proveedor: analisisIA.proveedor,
        folio: analisisIA.folio,
        created_at: new Date().toISOString()
      };

      // Save document to localStorage (gasto would be saved by its own service)
      const documentos = this.getDocumentos();
      documentos.push(documento);
      this.saveDocumentos(documentos);
      
      console.log('✅ Receipt scanned and persisted:', { documento, gasto });

      return {
        documento,
        gasto,
        sugerencia_proyecto: sugerenciaProyecto
      };
    } catch (error) {
      console.error('Error scanning receipt:', error);
      // Rollback would happen here in real implementation
      throw error;
    }
  }

  /**
   * Suggest project for a document based on context
   * Requirements: 4, 11
   */
  async sugerirProyecto(contexto: {
    proveedor?: string;
    monto?: number;
    fecha?: string;
    descripcion?: string;
    usuario_id?: string;
  }): Promise<SugerenciaProyecto> {
    try {
      // Get active projects with context
      const proyectos = await proyectoService.getProyectosActivosParaSugerencia(
        contexto.usuario_id
      );

      if (proyectos.length === 0) {
        throw new Error('No active projects found');
      }

      // In real implementation, would use AI to analyze context
      // For now, return most recent project
      const proyectoSugerido = proyectos[0];
      const alternativas = proyectos.slice(1, 4).map(p => ({
        proyecto_id: p.id,
        proyecto_nombre: p.nombre,
        confianza: 50
      }));

      return {
        proyecto_id: proyectoSugerido.id,
        proyecto_nombre: proyectoSugerido.nombre,
        confianza: 75,
        razon: 'Proyecto más reciente con actividad',
        alternativas
      };
    } catch (error) {
      console.error('Error suggesting project:', error);
      throw error;
    }
  }

  /**
   * Get complete document with linked expense
   * Requirement: 6
   */
  async getDocumentoCompleto(documentoId: string): Promise<DocumentoConGasto | null> {
    try {
      const documentos = this.getDocumentos();
      const documento = documentos.find(d => d.id === documentoId);
      
      if (!documento) {
        return null;
      }

      // In real implementation, would also fetch linked expense
      return documento as DocumentoConGasto;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  /**
   * Search documents with semantic search
   * Requirement: 6
   */
  async buscarDocumentos(query: {
    proyecto_id?: string;
    busqueda: string;
    tipo?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    semantica?: boolean;
  }): Promise<ResultadoBusqueda[]> {
    try {
      // Get all documents from localStorage
      let documentos = this.getDocumentos();

      // Filter by project
      if (query.proyecto_id) {
        documentos = documentos.filter(d => d.proyecto_id === query.proyecto_id);
      }

      // Filter by type
      if (query.tipo) {
        documentos = documentos.filter(d => d.tipo === query.tipo);
      }

      // Filter by search term
      if (query.busqueda) {
        const search = query.busqueda.toLowerCase();
        documentos = documentos.filter(d =>
          d.nombre?.toLowerCase().includes(search) ||
          d.descripcion?.toLowerCase().includes(search) ||
          d.proveedor?.toLowerCase().includes(search)
        );
      }

      // Filter by date range
      if (query.fecha_desde) {
        documentos = documentos.filter(d => 
          d.fecha_factura && d.fecha_factura >= query.fecha_desde!
        );
      }

      if (query.fecha_hasta) {
        documentos = documentos.filter(d => 
          d.fecha_factura && d.fecha_factura <= query.fecha_hasta!
        );
      }

      // In real implementation, would use AI for semantic search
      // For now, return simple text matching
      const resultados: ResultadoBusqueda[] = documentos.map(doc => ({
        documento: doc,
        relevancia: 100,
        razon_relevancia: 'Coincidencia exacta en nombre'
      }));

      return resultados;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  /**
   * Link document to expense
   * Requirement: 10
   */
  async vincularConGasto(documentoId: string, gastoId: string): Promise<void> {
    try {
      // Validate document is an invoice
      const documento = await this.getDocumentoCompleto(documentoId);
      
      if (!documento) {
        throw new Error('Document not found');
      }

      if (!documento.es_factura) {
        throw new Error('Only invoices can be linked to expenses');
      }

      // In real implementation, would update both tables
      console.log(`Linking document ${documentoId} to expense ${gastoId}`);
    } catch (error) {
      console.error('Error linking document to expense:', error);
      throw error;
    }
  }

  /**
   * Export project documents as ZIP
   * Requirement: 14
   */
  async exportarDocumentosProyecto(proyectoId: string): Promise<Blob> {
    try {
      // Get all documents for project
      const documentos = await proyectoService.getDocumentosProyecto(proyectoId);

      // In real implementation, would:
      // 1. Download all files
      // 2. Create Excel index
      // 3. Create ZIP with files + index
      // 4. Return ZIP blob

      // For now, return empty blob
      return new Blob([], { type: 'application/zip' });
    } catch (error) {
      console.error('Error exporting documents:', error);
      throw error;
    }
  }

  /**
   * Delete document
   */
  async eliminarDocumento(documentoId: string): Promise<void> {
    try {
      const documentos = this.getDocumentos();
      const index = documentos.findIndex(d => d.id === documentoId);
      
      if (index === -1) {
        throw new Error('Document not found');
      }

      // Remove from array
      documentos.splice(index, 1);
      
      // Save to localStorage
      this.saveDocumentos(documentos);
      
      console.log(`✅ Document deleted: ${documentoId}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Get documents by folder/type
   */
  async getDocumentosPorCarpeta(
    proyectoId: string,
    tipo: string
  ): Promise<Documento[]> {
    try {
      const documentos = this.getDocumentos();
      return documentos.filter(d => 
        d.proyecto_id === proyectoId && d.tipo === tipo
      );
    } catch (error) {
      console.error('Error getting documents by folder:', error);
      throw error;
    }
  }

  /**
   * Get folder statistics
   */
  async getEstadisticasCarpetas(proyectoId: string): Promise<Record<string, number>> {
    try {
      const documentos = this.getDocumentos();
      const proyectoDocumentos = documentos.filter(d => d.proyecto_id === proyectoId);
      
      const stats: Record<string, number> = {
        'Contratos': 0,
        'Planos': 0,
        'Facturas': 0,
        'Permisos': 0,
        'Reportes': 0,
        'Certificados': 0,
        'Otros': 0
      };

      proyectoDocumentos.forEach(doc => {
        if (stats[doc.tipo] !== undefined) {
          stats[doc.tipo]++;
        } else {
          stats['Otros']++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting folder statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const documentoService = new DocumentoService();
export default documentoService;
