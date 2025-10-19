/**
 * useCarpetasProyecto Hook
 * 
 * Custom hook for managing project folders/categories
 * Requirements: 7B
 * Task: 16.3
 */

import { useState, useEffect, useCallback } from 'react';
import { proyectosApi } from '@/api/proyectos.api';
import { documentoService } from '@/services/documento.service';

interface CarpetaInfo {
  tipo: string;
  nombre: string;
  count: number;
  hasAI: boolean;
  icon: string;
  color: string;
}

interface UseCarpetasProyectoReturn {
  carpetas: CarpetaInfo[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getCarpetaByTipo: (tipo: string) => CarpetaInfo | undefined;
}

const CARPETAS_CONFIG: Omit<CarpetaInfo, 'count' | 'hasAI'>[] = [
  {
    tipo: 'Contrato',
    nombre: 'Contratos',
    icon: '📄',
    color: 'blue'
  },
  {
    tipo: 'Plano',
    nombre: 'Planos',
    icon: '📐',
    color: 'purple'
  },
  {
    tipo: 'Factura',
    nombre: 'Facturas',
    icon: '🧾',
    color: 'green'
  },
  {
    tipo: 'Permiso',
    nombre: 'Permisos',
    icon: '✅',
    color: 'yellow'
  },
  {
    tipo: 'Reporte',
    nombre: 'Reportes',
    icon: '📊',
    color: 'indigo'
  },
  {
    tipo: 'Certificado',
    nombre: 'Certificados',
    icon: '🏆',
    color: 'orange'
  },
  {
    tipo: 'Otro',
    nombre: 'Otros',
    icon: '📁',
    color: 'gray'
  }
];

export function useCarpetasProyecto(proyectoId?: string): UseCarpetasProyectoReturn {
  const [carpetas, setCarpetas] = useState<CarpetaInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCarpetas = useCallback(async () => {
    if (!proyectoId) {
      setCarpetas(CARPETAS_CONFIG.map(c => ({ ...c, count: 0, hasAI: false })));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get folder statistics
      const statsResponse = await proyectosApi.getProyectoCarpetas(proyectoId);
      
      if (statsResponse.success && statsResponse.data) {
        const stats = statsResponse.data;
        
        // Get document statistics to check for AI processing
        const docStatsResponse = await proyectosApi.getProyectoDocumentosStats(proyectoId);
        const hasAIProcessed = docStatsResponse.success && 
          docStatsResponse.data && 
          docStatsResponse.data.documentos_procesados_ia > 0;

        // Map to carpetas with counts
        const carpetasWithCounts = CARPETAS_CONFIG.map(config => {
          const count = stats[config.nombre] || 0;
          
          return {
            ...config,
            count,
            hasAI: hasAIProcessed && count > 0
          };
        });

        setCarpetas(carpetasWithCounts);
      } else {
        setError(statsResponse.error || 'Error al cargar carpetas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [proyectoId]);

  useEffect(() => {
    fetchCarpetas();
  }, [fetchCarpetas]);

  const getCarpetaByTipo = useCallback((tipo: string) => {
    return carpetas.find(c => c.tipo === tipo);
  }, [carpetas]);

  return {
    carpetas,
    loading,
    error,
    refetch: fetchCarpetas,
    getCarpetaByTipo
  };
}

export default useCarpetasProyecto;
