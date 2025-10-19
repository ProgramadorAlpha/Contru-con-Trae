/**
 * useProyectos Hook
 * 
 * Custom hook for managing projects data
 * Requirements: 2
 * Task: 16.1
 */

import { useState, useEffect, useCallback } from 'react';
import { proyectosApi } from '@/api/proyectos.api';
import type { Proyecto } from '@/services/proyecto.service';

interface UseProyectosOptions {
  estado?: string;
  activos?: boolean;
  autoLoad?: boolean;
}

interface UseProyectosReturn {
  proyectos: Proyecto[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getProyectoById: (id: string) => Proyecto | undefined;
}

export function useProyectos(options: UseProyectosOptions = {}): UseProyectosReturn {
  const { estado, activos = true, autoLoad = true } = options;
  
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProyectos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await proyectosApi.getProyectos({
        estado,
        activos
      });

      if (response.success && response.data) {
        setProyectos(response.data);
        
        // Cache in session storage
        sessionStorage.setItem('proyectos_cache', JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }));
      } else {
        setError(response.error || 'Error al cargar proyectos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [estado, activos]);

  // Load from cache first, then fetch
  useEffect(() => {
    if (!autoLoad) return;

    // Try to load from cache
    const cached = sessionStorage.getItem('proyectos_cache');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Cache valid for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setProyectos(data);
        }
      } catch (e) {
        // Invalid cache, ignore
      }
    }

    // Fetch fresh data
    fetchProyectos();
  }, [autoLoad, fetchProyectos]);

  const getProyectoById = useCallback((id: string) => {
    return proyectos.find(p => p.id === id);
  }, [proyectos]);

  return {
    proyectos,
    loading,
    error,
    refetch: fetchProyectos,
    getProyectoById
  };
}

export default useProyectos;
