/**
 * useDocumentos Hook
 * 
 * Custom hook for managing documents data
 * Requirements: 6, 7B
 * Task: 16.2
 */

import { useState, useEffect, useCallback } from 'react';
import { proyectosApi } from '@/api/proyectos.api';
import { documentosApi } from '@/api/documentos.api';

interface UseDocumentosOptions {
  proyectoId?: string;
  tipo?: string;
  busqueda?: string;
  page?: number;
  pageSize?: number;
  autoLoad?: boolean;
}

interface UseDocumentosReturn {
  documentos: any[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  refetch: () => Promise<void>;
  search: (query: string) => void;
  setPage: (page: number) => void;
}

export function useDocumentos(options: UseDocumentosOptions = {}): UseDocumentosReturn {
  const {
    proyectoId,
    tipo,
    busqueda: initialBusqueda = '',
    page: initialPage = 1,
    pageSize = 50,
    autoLoad = true
  } = options;

  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [busqueda, setBusqueda] = useState(initialBusqueda);

  const fetchDocumentos = useCallback(async () => {
    if (!proyectoId) {
      setDocumentos([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await proyectosApi.getProyectoDocumentos(proyectoId, {
        tipo,
        busqueda,
        page,
        pageSize
      });

      if (response.success && response.data) {
        setDocumentos(response.data.data);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.error || 'Error al cargar documentos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [proyectoId, tipo, busqueda, page, pageSize]);

  useEffect(() => {
    if (autoLoad) {
      fetchDocumentos();
    }
  }, [autoLoad, fetchDocumentos]);

  const search = useCallback((query: string) => {
    setBusqueda(query);
    setPage(1); // Reset to first page on search
  }, []);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return {
    documentos,
    loading,
    error,
    total,
    page,
    totalPages,
    refetch: fetchDocumentos,
    search,
    setPage: handleSetPage
  };
}

export default useDocumentos;
