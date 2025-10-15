import { useState, useEffect, useCallback } from 'react';
import { 
  ToolAssignment, 
  CreateAssignmentDTO, 
  UpdateAssignmentDTO,
  AssignmentFilters,
  AssignmentStats 
} from '../types/tools';
import { assignmentService } from '../services/assignmentService';
import { useToast } from './useToast';

interface UseAssignmentsReturn {
  assignments: ToolAssignment[];
  loading: boolean;
  error: string | null;
  stats: AssignmentStats | null;
  filters: AssignmentFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // CRUD Operations
  fetchAssignments: (filters?: AssignmentFilters) => Promise<void>;
  getAssignmentById: (id: string) => Promise<ToolAssignment | null>;
  createAssignment: (data: CreateAssignmentDTO) => Promise<ToolAssignment | null>;
  updateAssignment: (id: string, data: UpdateAssignmentDTO) => Promise<ToolAssignment | null>;
  deleteAssignment: (id: string) => Promise<boolean>;
  
  // Assignment-specific operations
  assignTool: (toolId: string, data: CreateAssignmentDTO) => Promise<ToolAssignment | null>;
  unassignTool: (assignmentId: string, notes?: string) => Promise<boolean>;
  extendAssignment: (assignmentId: string, newEndDate: string, notes?: string) => Promise<ToolAssignment | null>;
  getCurrentToolAssignments: (toolId: string) => Promise<ToolAssignment[]>;
  getUserAssignments: (userId: string) => Promise<ToolAssignment[]>;
  getProjectAssignments: (projectId: string) => Promise<ToolAssignment[]>;
  
  // Stats and Analytics
  fetchStats: () => Promise<void>;
  
  // Filtering and Pagination
  setFilters: (filters: Partial<AssignmentFilters>) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  clearFilters: () => void;
}

const defaultFilters: AssignmentFilters = {
  search: '',
  toolId: '',
  userId: '',
  projectId: '',
  status: '',
  type: '',
  dateRange: undefined,
  activeOnly: true,
  overdueOnly: false,
  sortBy: 'startDate',
  sortOrder: 'desc'
};

export const useAssignments = (): UseAssignmentsReturn => {
  const [assignments, setAssignments] = useState<ToolAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [filters, setFiltersState] = useState<AssignmentFilters>(defaultFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const { showToast } = useToast();

  // Fetch assignments with current filters
  const fetchAssignments = useCallback(async (customFilters?: AssignmentFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const effectiveFilters = customFilters || filters;
      const response = await assignmentService.getAssignments({
        ...effectiveFilters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      setAssignments(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: Math.ceil(response.total / prev.limit)
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar asignaciones';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, showToast]);

  // Get assignment by ID
  const getAssignmentById = useCallback(async (id: string): Promise<ToolAssignment | null> => {
    try {
      setLoading(true);
      const assignment = await assignmentService.getAssignmentById(id);
      return assignment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar asignación';
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

  // Create new assignment
  const createAssignment = useCallback(async (data: CreateAssignmentDTO): Promise<ToolAssignment | null> => {
    try {
      setLoading(true);
      const newAssignment = await assignmentService.createAssignment(data);
      
      // Refresh assignments list
      await fetchAssignments();
      
      showToast({
        type: 'success',
        message: 'Asignación creada exitosamente'
      });
      
      return newAssignment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear asignación';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAssignments, showToast]);

  // Update assignment
  const updateAssignment = useCallback(async (id: string, data: UpdateAssignmentDTO): Promise<ToolAssignment | null> => {
    try {
      setLoading(true);
      const updatedAssignment = await assignmentService.updateAssignment(id, data);
      
      // Update local state
      setAssignments(prev => prev.map(assignment => 
        assignment.id === id ? updatedAssignment : assignment
      ));
      
      showToast({
        type: 'success',
        message: 'Asignación actualizada exitosamente'
      });
      
      return updatedAssignment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar asignación';
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

  // Delete assignment
  const deleteAssignment = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await assignmentService.deleteAssignment(id);
      
      // Remove from local state
      setAssignments(prev => prev.filter(assignment => assignment.id !== id));
      
      showToast({
        type: 'success',
        message: 'Asignación eliminada exitosamente'
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar asignación';
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

  // Assign tool
  const assignTool = useCallback(async (toolId: string, data: CreateAssignmentDTO): Promise<ToolAssignment | null> => {
    try {
      setLoading(true);
      const newAssignment = await assignmentService.assignTool(toolId, data);
      
      // Refresh assignments list
      await fetchAssignments();
      
      showToast({
        type: 'success',
        message: 'Herramienta asignada exitosamente'
      });
      
      return newAssignment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al asignar herramienta';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAssignments, showToast]);

  // Unassign tool
  const unassignTool = useCallback(async (assignmentId: string, notes?: string): Promise<boolean> => {
    try {
      setLoading(true);
      await assignmentService.unassignTool(assignmentId, notes);
      
      // Update local state
      setAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, status: 'completed', actualEndDate: new Date().toISOString(), notes }
          : assignment
      ));
      
      showToast({
        type: 'success',
        message: 'Herramienta desasignada exitosamente'
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al desasignar herramienta';
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

  // Extend assignment
  const extendAssignment = useCallback(async (assignmentId: string, newEndDate: string, notes?: string): Promise<ToolAssignment | null> => {
    try {
      setLoading(true);
      const updatedAssignment = await assignmentService.extendAssignment(assignmentId, newEndDate, notes);
      
      // Update local state
      setAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId ? updatedAssignment : assignment
      ));
      
      showToast({
        type: 'success',
        message: 'Asignación extendida exitosamente'
      });
      
      return updatedAssignment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al extender asignación';
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

  // Get current assignments for tool
  const getCurrentToolAssignments = useCallback(async (toolId: string): Promise<ToolAssignment[]> => {
    try {
      setLoading(true);
      const assignments = await assignmentService.getCurrentToolAssignments(toolId);
      return assignments;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar asignaciones actuales';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Get assignments for user
  const getUserAssignments = useCallback(async (userId: string): Promise<ToolAssignment[]> => {
    try {
      setLoading(true);
      const assignments = await assignmentService.getUserAssignments(userId);
      return assignments;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar asignaciones de usuario';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Get assignments for project
  const getProjectAssignments = useCallback(async (projectId: string): Promise<ToolAssignment[]> => {
    try {
      setLoading(true);
      const assignments = await assignmentService.getProjectAssignments(projectId);
      return assignments;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar asignaciones de proyecto';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await assignmentService.getAssignmentStats();
      setStats(statsData);
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
  const setFilters = useCallback((newFilters: Partial<AssignmentFilters>) => {
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

  // Auto-fetch assignments when filters or pagination changes
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    assignments,
    loading,
    error,
    stats,
    filters,
    pagination,
    fetchAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    assignTool,
    unassignTool,
    extendAssignment,
    getCurrentToolAssignments,
    getUserAssignments,
    getProjectAssignments,
    fetchStats,
    setFilters,
    setPage,
    setLimit,
    clearFilters
  };
};