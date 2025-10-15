import { useState, useEffect, useCallback } from 'react';
import { 
  Tool, 
  CreateToolDTO, 
  UpdateToolDTO, 
  ToolFilters,
  ToolStats 
} from '../types/tools';
import { toolService } from '../services/toolService';
import { useToast } from './useToast';

interface UseToolsReturn {
  tools: Tool[];
  loading: boolean;
  error: string | null;
  stats: ToolStats | null;
  filters: ToolFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // CRUD Operations
  fetchTools: (filters?: ToolFilters) => Promise<void>;
  getToolById: (id: string) => Promise<Tool | null>;
  createTool: (data: CreateToolDTO) => Promise<Tool | null>;
  updateTool: (id: string, data: UpdateToolDTO) => Promise<Tool | null>;
  deleteTool: (id: string) => Promise<boolean>;
  
  // Stats and Analytics
  fetchStats: () => Promise<void>;
  
  // Filtering and Pagination
  setFilters: (filters: Partial<ToolFilters>) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  clearFilters: () => void;
  
  // Bulk Operations
  bulkDelete: (ids: string[]) => Promise<boolean>;
  bulkUpdateStatus: (ids: string[], status: string) => Promise<boolean>;
  
  // Export Operations
  exportTools: (format: 'csv' | 'pdf' | 'excel') => Promise<void>;
  importTools: (file: File) => Promise<boolean>;
}

const defaultFilters: ToolFilters = {
  search: '',
  category: '',
  type: '',
  status: '',
  location: '',
  brand: '',
  minValue: undefined,
  maxValue: undefined,
  assignedTo: '',
  maintenanceDue: false,
  dateRange: undefined,
  sortBy: 'name',
  sortOrder: 'asc'
};

export const useTools = (): UseToolsReturn => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ToolStats | null>(null);
  const [filters, setFiltersState] = useState<ToolFilters>(defaultFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const { showToast } = useToast();

  // Fetch tools with current filters
  const fetchTools = useCallback(async (customFilters?: ToolFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const effectiveFilters = customFilters || filters;
      const response = await toolService.getTools({
        ...effectiveFilters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      setTools(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: Math.ceil(response.total / prev.limit)
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar herramientas';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, showToast]);

  // Get tool by ID
  const getToolById = useCallback(async (id: string): Promise<Tool | null> => {
    try {
      setLoading(true);
      const tool = await toolService.getToolById(id);
      return tool;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar herramienta';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Create new tool
  const createTool = useCallback(async (data: CreateToolDTO): Promise<Tool | null> => {
    try {
      setLoading(true);
      const newTool = await toolService.createTool(data);
      
      // Refresh tool list
      await fetchTools();
      
      showToast({
        type: 'success',
        message: 'Herramienta creada exitosamente'
      });
      
      return newTool;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear herramienta';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTools, showToast]);

  // Update tool
  const updateTool = useCallback(async (id: string, data: UpdateToolDTO): Promise<Tool | null> => {
    try {
      setLoading(true);
      const updatedTool = await toolService.updateTool(id, data);
      
      // Update local state
      setTools(prev => prev.map(tool => tool.id === id ? updatedTool : tool));
      
      showToast({
        type: 'success',
        message: 'Herramienta actualizada exitosamente'
      });
      
      return updatedTool;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar herramienta';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Delete tool
  const deleteTool = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await toolService.deleteTool(id);
      
      // Remove from local state
      setTools(prev => prev.filter(tool => tool.id !== id));
      
      showToast({
        type: 'success',
        message: 'Herramienta eliminada exitosamente'
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar herramienta';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const toolStats = await toolService.getToolStats();
      setStats(toolStats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
    }
  }, [showToast]);

  // Filter management
  const setFilters = useCallback((newFilters: Partial<ToolFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page: Math.max(1, page) }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit: Math.max(1, limit), page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Bulk operations
  const bulkDelete = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      setLoading(true);
      await toolService.bulkDeleteTools(ids);
      
      // Remove from local state
      setTools(prev => prev.filter(tool => !ids.includes(tool.id)));
      
      showToast({
        type: 'success',
        message: `${ids.length} herramientas eliminadas exitosamente`
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar herramientas';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const bulkUpdateStatus = useCallback(async (ids: string[], status: string): Promise<boolean> => {
    try {
      setLoading(true);
      await toolService.bulkUpdateStatus(ids, status);
      
      // Update local state
      setTools(prev => prev.map(tool => 
        ids.includes(tool.id) ? { ...tool, status } : tool
      ));
      
      showToast({
        type: 'success',
        message: `Estado actualizado para ${ids.length} herramientas`
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar estados';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Export operations
  const exportTools = useCallback(async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      setLoading(true);
      await toolService.exportTools(format);
      
      showToast({
        type: 'success',
        message: `Herramientas exportadas como ${format.toUpperCase()}`
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al exportar herramientas';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const importTools = useCallback(async (file: File): Promise<boolean> => {
    try {
      setLoading(true);
      await toolService.importTools(file);
      
      // Refresh tool list
      await fetchTools();
      
      showToast({
        type: 'success',
        message: 'Herramientas importadas exitosamente'
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al importar herramientas';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTools, showToast]);

  // Auto-fetch tools when filters or pagination changes
  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    tools,
    loading,
    error,
    stats,
    filters,
    pagination,
    fetchTools,
    getToolById,
    createTool,
    updateTool,
    deleteTool,
    fetchStats,
    setFilters,
    setPage,
    setLimit,
    clearFilters,
    bulkDelete,
    bulkUpdateStatus,
    exportTools,
    importTools
  };
};