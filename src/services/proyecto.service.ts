/**
 * Proyecto Service
 * 
 * Service for managing projects and their document relationships.
 * Handles project retrieval, document statistics, and limit validation.
 * 
 * Requirements: 2, 3, 8
 * Task: 3.1, 3.2, 3.3
 */

import { mockProjects } from '../lib/mockData';
import { localStorageService } from './localStorage.service';

const STORAGE_KEY_DOCUMENTOS = 'documentos';

export interface Proyecto {
  id: string;
  nombre: string;
  codigo?: string;
  cliente?: string;
  direccion?: string;
  fecha_inicio?: string;
  fecha_fin_estimada?: string;
  presupuesto_total?: number;
  estado: string;
  limite_documentos?: number;
  limite_espacio_gb?: number;
  creado_por?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentoStats {
  total_documentos: number;
  total_carpetas: number;
  total_facturas: number;
  documentos_procesados_ia: number;
  documentos_compartidos: number;
  espacio_usado_bytes: number;
  espacio_usado_gb: number;
  porcentaje_espacio_usado: number;
  total_monto_facturas: number;
  docs_contratos: number;
  docs_planos: number;
  docs_facturas: number;
  docs_permisos: number;
  docs_reportes: number;
  docs_certificados: number;
  docs_otros: number;
  total_gastos_vinculados: number;
  ultimo_documento_fecha?: string;
  primer_documento_fecha?: string;
}

export interface ProyectoConDocumentos extends Proyecto {
  documentos?: any[];
  stats?: DocumentoStats;
}

export interface LimitValidation {
  valid: boolean;
  reason?: string;
  limite_documentos?: number;
  documentos_actuales?: number;
  limite_espacio_gb?: number;
  espacio_usado_gb?: number;
}

export interface ProyectoParaSugerencia extends Proyecto {
  historial_gastos_recientes?: any[];
  proveedores_frecuentes?: string[];
  score_relevancia?: number;
}

class ProyectoService {
  /**
   * Get all documents from localStorage
   */
  private getDocumentos(): any[] {
    return localStorageService.get<any[]>(STORAGE_KEY_DOCUMENTOS, []);
  }

  /**
   * Get all projects for a user
   * Requirement: 2
   */
  async getProyectosUsuario(userId?: string, filtro?: {
    estado?: string;
    activos?: boolean;
  }): Promise<Proyecto[]> {
    try {
      // In real implementation, this would query the database
      // For now, we'll use mock data
      let proyectos = [...mockProjects].map(p => ({
        id: p.id,
        nombre: p.name,
        codigo: p.id.toUpperCase(),
        cliente: p.client,
        direccion: p.location,
        fecha_inicio: p.startDate,
        fecha_fin_estimada: p.endDate,
        presupuesto_total: p.budget,
        estado: p.status === 'En Progreso' ? 'Activo' : p.status,
        limite_documentos: 10000,
        limite_espacio_gb: 100,
        created_at: p.startDate,
        updated_at: new Date().toISOString()
      }));

      // Apply filters
      if (filtro?.estado) {
        proyectos = proyectos.filter(p => p.estado === filtro.estado);
      }

      if (filtro?.activos) {
        proyectos = proyectos.filter(p => 
          p.estado === 'Activo' || p.estado === 'En Progreso'
        );
      }

      return proyectos;
    } catch (error) {
      console.error('Error getting projects:', error);
      throw new Error('Failed to retrieve projects');
    }
  }

  /**
   * Get documents for a specific project
   * Requirement: 2
   */
  async getDocumentosProyecto(proyectoId: string, filtros?: {
    tipo?: string;
    busqueda?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      // Get documents from localStorage
      let documentos = this.getDocumentos();

      // Filter by project
      documentos = documentos.filter(d => d.proyecto_id === proyectoId);

      // Apply filters
      if (filtros?.tipo) {
        documentos = documentos.filter(d => d.tipo === filtros.tipo);
      }

      if (filtros?.busqueda) {
        const search = filtros.busqueda.toLowerCase();
        documentos = documentos.filter(d =>
          d.nombre?.toLowerCase().includes(search) ||
          d.descripcion?.toLowerCase().includes(search) ||
          d.proveedor?.toLowerCase().includes(search)
        );
      }

      // Apply pagination
      const offset = filtros?.offset || 0;
      const limit = filtros?.limit || 50;
      documentos = documentos.slice(offset, offset + limit);

      return documentos;
    } catch (error) {
      console.error('Error getting project documents:', error);
      throw new Error('Failed to retrieve project documents');
    }
  }

  /**
   * Get document statistics for a project
   * Requirement: 3
   */
  async getEstadisticasDocumentos(proyectoId: string): Promise<DocumentoStats> {
    try {
      // Get documents from localStorage
      const allDocumentos = this.getDocumentos();
      const documentos = allDocumentos.filter(d => d.proyecto_id === proyectoId);

      // Calculate statistics
      const stats: DocumentoStats = {
        total_documentos: documentos.length,
        total_carpetas: 0,
        total_facturas: 0,
        documentos_procesados_ia: 0,
        documentos_compartidos: 0,
        espacio_usado_bytes: 0,
        espacio_usado_gb: 0,
        porcentaje_espacio_usado: 0,
        total_monto_facturas: 0,
        docs_contratos: 0,
        docs_planos: 0,
        docs_facturas: 0,
        docs_permisos: 0,
        docs_reportes: 0,
        docs_certificados: 0,
        docs_otros: 0,
        total_gastos_vinculados: 0
      };

      // Count by type and calculate totals
      const tiposUnicos = new Set<string>();
      
      documentos.forEach(doc => {
        // Count by type
        tiposUnicos.add(doc.tipo);
        
        switch (doc.tipo) {
          case 'Contratos':
            stats.docs_contratos++;
            break;
          case 'Planos':
            stats.docs_planos++;
            break;
          case 'Facturas':
            stats.docs_facturas++;
            break;
          case 'Permisos':
            stats.docs_permisos++;
            break;
          case 'Reportes':
            stats.docs_reportes++;
            break;
          case 'Certificados':
            stats.docs_certificados++;
            break;
          default:
            stats.docs_otros++;
        }

        // Count invoices
        if (doc.es_factura) {
          stats.total_facturas++;
          if (doc.monto_factura) {
            stats.total_monto_facturas += doc.monto_factura;
          }
        }

        // Count AI processed
        if (doc.procesado_ia) {
          stats.documentos_procesados_ia++;
        }

        // Count shared
        if (doc.compartido_con && doc.compartido_con.length > 0) {
          stats.documentos_compartidos++;
        }

        // Calculate storage
        if (doc.archivo_size) {
          stats.espacio_usado_bytes += doc.archivo_size;
        }
      });

      stats.total_carpetas = tiposUnicos.size;
      stats.espacio_usado_gb = stats.espacio_usado_bytes / 1073741824;

      // Calculate percentage (assuming 100GB limit)
      const limiteGb = 100;
      stats.porcentaje_espacio_usado = (stats.espacio_usado_gb / limiteGb) * 100;

      // Get date range
      if (documentos.length > 0) {
        const fechas = documentos
          .map(d => d.created_at)
          .filter(f => f)
          .sort();
        
        if (fechas.length > 0) {
          stats.primer_documento_fecha = fechas[0];
          stats.ultimo_documento_fecha = fechas[fechas.length - 1];
        }
      }

      return stats;
    } catch (error) {
      console.error('Error getting document statistics:', error);
      throw new Error('Failed to retrieve document statistics');
    }
  }

  /**
   * Validate project limits before uploading a document
   * Requirement: 8
   */
  async validarLimites(
    proyectoId: string,
    nuevoDocumentoSize: number
  ): Promise<LimitValidation> {
    try {
      // Get project
      const proyectos = await this.getProyectosUsuario();
      const proyecto = proyectos.find(p => p.id === proyectoId);

      if (!proyecto) {
        return {
          valid: false,
          reason: 'Project not found'
        };
      }

      // Get current statistics
      const stats = await this.getEstadisticasDocumentos(proyectoId);

      // Check document count limit
      const limiteDocumentos = proyecto.limite_documentos || 10000;
      if (stats.total_documentos >= limiteDocumentos) {
        return {
          valid: false,
          reason: `Document limit reached (${limiteDocumentos} documents)`,
          limite_documentos: limiteDocumentos,
          documentos_actuales: stats.total_documentos
        };
      }

      // Check storage limit
      const limiteEspacioGb = proyecto.limite_espacio_gb || 100;
      const nuevoEspacioGb = stats.espacio_usado_gb + (nuevoDocumentoSize / 1073741824);
      
      if (nuevoEspacioGb > limiteEspacioGb) {
        return {
          valid: false,
          reason: `Storage limit would be exceeded (${limiteEspacioGb} GB)`,
          limite_espacio_gb: limiteEspacioGb,
          espacio_usado_gb: stats.espacio_usado_gb
        };
      }

      // All checks passed
      return {
        valid: true,
        limite_documentos: limiteDocumentos,
        documentos_actuales: stats.total_documentos,
        limite_espacio_gb: limiteEspacioGb,
        espacio_usado_gb: stats.espacio_usado_gb
      };
    } catch (error) {
      console.error('Error validating limits:', error);
      throw new Error('Failed to validate project limits');
    }
  }

  /**
   * Get active projects for AI suggestion
   * Includes recent expense history and frequent suppliers
   * Requirements: 4, 11
   */
  async getProyectosActivosParaSugerencia(
    userId?: string
  ): Promise<ProyectoParaSugerencia[]> {
    try {
      // Get active projects
      const proyectos = await this.getProyectosUsuario(userId, { activos: true });

      // Enhance with additional data for AI suggestion
      const proyectosConContexto: ProyectoParaSugerencia[] = await Promise.all(
        proyectos.map(async (proyecto) => {
          // In real implementation, would query recent expenses and suppliers
          // For now, return basic project info
          return {
            ...proyecto,
            historial_gastos_recientes: [],
            proveedores_frecuentes: [],
            score_relevancia: 0
          };
        })
      );

      // Sort by relevance (most recent activity first)
      proyectosConContexto.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0);
        const dateB = new Date(b.updated_at || b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      });

      return proyectosConContexto;
    } catch (error) {
      console.error('Error getting projects for suggestion:', error);
      throw new Error('Failed to retrieve projects for suggestion');
    }
  }

  /**
   * Get project by ID
   */
  async getProyectoById(proyectoId: string): Promise<Proyecto | null> {
    try {
      const proyectos = await this.getProyectosUsuario();
      return proyectos.find(p => p.id === proyectoId) || null;
    } catch (error) {
      console.error('Error getting project by ID:', error);
      throw new Error('Failed to retrieve project');
    }
  }

  /**
   * Get project with full document information
   */
  async getProyectoCompleto(proyectoId: string): Promise<ProyectoConDocumentos | null> {
    try {
      const proyecto = await this.getProyectoById(proyectoId);
      if (!proyecto) return null;

      const documentos = await this.getDocumentosProyecto(proyectoId);
      const stats = await this.getEstadisticasDocumentos(proyectoId);

      return {
        ...proyecto,
        documentos,
        stats
      };
    } catch (error) {
      console.error('Error getting complete project:', error);
      throw new Error('Failed to retrieve complete project information');
    }
  }
}

// Export singleton instance
export const proyectoService = new ProyectoService();
export default proyectoService;
