import { useState, useEffect, useCallback } from 'react';
import { 
  MaintenanceRecord, 
  CreateMaintenanceDTO, 
  UpdateMaintenanceDTO,
  MaintenanceFilters,
  MaintenanceStats,
  MaintenanceSchedule,
  CreateMaintenanceScheduleDTO,
  UpdateMaintenanceScheduleDTO
} from '../types/tools';
import { maintenanceService } from '../services/maintenanceService';
import { useToast } from './useToast';

interface UseMaintenanceReturn {
  maintenanceRecords: MaintenanceRecord[];
  maintenanceSchedules: MaintenanceSchedule[];
  loading: boolean;
  error: string | null;
  stats: MaintenanceStats | null;
  filters: MaintenanceFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // CRUD Operations for Maintenance Records
  fetchMaintenanceRecords: (filters?: MaintenanceFilters) => Promise<void>;
  getMaintenanceRecordById: (id: string) => Promise<MaintenanceRecord | null>;
  createMaintenanceRecord: (data: CreateMaintenanceDTO) => Promise<MaintenanceRecord | null>;
  updateMaintenanceRecord: (id: string, data: UpdateMaintenanceDTO) => Promise<MaintenanceRecord | null>;
  deleteMaintenanceRecord: (id: string) => Promise<boolean>;
  
  // CRUD Operations for Maintenance Schedules
  fetchMaintenanceSchedules: (toolId?: string) => Promise<void>;
  getMaintenanceScheduleById: (id: string) => Promise<MaintenanceSchedule | null>;
  createMaintenanceSchedule: (data: CreateMaintenanceScheduleDTO) => Promise<MaintenanceSchedule | null>;
  updateMaintenanceSchedule: (id: string, data: UpdateMaintenanceScheduleDTO) => Promise<MaintenanceSchedule | null>;
  deleteMaintenanceSchedule: (id: string) => Promise<boolean>;
  
  // Maintenance-specific operations
  scheduleMaintenance: (toolId: string, data: CreateMaintenanceScheduleDTO) => Promise<MaintenanceSchedule | null>;
  completeMaintenance: (recordId: string, completionData: { completedDate: string; notes?: string; cost?: number }) => Promise<MaintenanceRecord | null>;
  getUpcomingMaintenance: (days?: number) => Promise<MaintenanceRecord[]>;
  getOverdueMaintenance: () => Promise<MaintenanceRecord[]>;
  getToolMaintenanceHistory: (toolId: string) => Promise<MaintenanceRecord[]>;
  generateToolMaintenanceReport: (toolId: string, dateRange: { startDate: string; endDate: string }) => Promise<any>;
  
  // Stats and Analytics
  fetchStats: () => Promise<void>;
  
  // Filtering and Pagination
  setFilters: (filters: Partial<MaintenanceFilters>) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  clearFilters: () => void;
}

const defaultFilters: MaintenanceFilters = {
  search: '',
  toolId: '',
  type: '',
  status: '',
  priority: '',
  assignedTo: '',
  dateRange: undefined,
  upcomingOnly: false,
  overdueOnly: false,
  completedOnly: false,
  sortBy: 'scheduledDate',
  sortOrder: 'asc'
};

export const useMaintenance = (): UseMaintenanceReturn => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [filters, setFiltersState] = useState<MaintenanceFilters>(defaultFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const { showToast } = useToast();

  // Fetch maintenance records with current filters
  const fetchMaintenanceRecords = useCallback(async (customFilters?: MaintenanceFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const effectiveFilters = customFilters || filters;
      const response = await maintenanceService.getMaintenanceRecords({
        ...effectiveFilters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      setMaintenanceRecords(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: Math.ceil(response.total / prev.limit)
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar registros de mantenimiento';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, showToast]);

  // Get maintenance record by ID
  const getMaintenanceRecordById = useCallback(async (id: string): Promise<MaintenanceRecord | null> => {
    try {
      setLoading(true);
      const record = await maintenanceService.getMaintenanceRecordById(id);
      return record;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar registro de mantenimiento';
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

  // Create new maintenance record
  const createMaintenanceRecord = useCallback(async (data: CreateMaintenanceDTO): Promise<MaintenanceRecord | null> => {
    try {
      setLoading(true);
      const newRecord = await maintenanceService.createMaintenanceRecord(data);
      
      // Refresh maintenance records list
      await fetchMaintenanceRecords();
      
      showToast({
        type: 'success',
        message: 'Registro de mantenimiento creado exitosamente'
      });
      
      return newRecord;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear registro de mantenimiento';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchMaintenanceRecords, showToast]);

  // Update maintenance record
  const updateMaintenanceRecord = useCallback(async (id: string, data: UpdateMaintenanceDTO): Promise<MaintenanceRecord | null> => {
    try {
      setLoading(true);
      const updatedRecord = await maintenanceService.updateMaintenanceRecord(id, data);
      
      // Update local state
      setMaintenanceRecords(prev => prev.map(record => 
        record.id === id ? updatedRecord : record
      ));
      
      showToast({
        type: 'success',
        message: 'Registro de mantenimiento actualizado exitosamente'
      });
      
      return updatedRecord;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar registro de mantenimiento';
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

  // Delete maintenance record
  const deleteMaintenanceRecord = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await maintenanceService.deleteMaintenanceRecord(id);
      
      // Remove from local state
      setMaintenanceRecords(prev => prev.filter(record => record.id !== id));
      
      showToast({
        type: 'success',
        message: 'Registro de mantenimiento eliminado exitosamente'
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar registro de mantenimiento';
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

  // Fetch maintenance schedules
  const fetchMaintenanceSchedules = useCallback(async (toolId?: string) => {
    try {
      setLoading(true);
      const schedules = await maintenanceService.getMaintenanceSchedules(toolId);
      setMaintenanceSchedules(schedules);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar programaciones de mantenimiento';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Get maintenance schedule by ID
  const getMaintenanceScheduleById = useCallback(async (id: string): Promise<MaintenanceSchedule | null> => {
    try {
      setLoading(true);
      const schedule = await maintenanceService.getMaintenanceScheduleById(id);
      return schedule;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar programación de mantenimiento';
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

  // Create maintenance schedule
  const createMaintenanceSchedule = useCallback(async (data: CreateMaintenanceScheduleDTO): Promise<MaintenanceSchedule | null> => {
    try {
      setLoading(true);
      const newSchedule = await maintenanceService.createMaintenanceSchedule(data);
      
      // Refresh schedules list
      await fetchMaintenanceSchedules();
      
      showToast({
        type: 'success',
        message: 'Programación de mantenimiento creada exitosamente'
      });
      
      return newSchedule;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear programación de mantenimiento';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchMaintenanceSchedules, showToast]);

  // Update maintenance schedule
  const updateMaintenanceSchedule = useCallback(async (id: string, data: UpdateMaintenanceScheduleDTO): Promise<MaintenanceSchedule | null> => {
    try {
      setLoading(true);
      const updatedSchedule = await maintenanceService.updateMaintenanceSchedule(id, data);
      
      // Update local state
      setMaintenanceSchedules(prev => prev.map(schedule => 
        schedule.id === id ? updatedSchedule : schedule
      ));
      
      showToast({
        type: 'success',
        message: 'Programación de mantenimiento actualizada exitosamente'
      });
      
      return updatedSchedule;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar programación de mantenimiento';
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

  // Delete maintenance schedule
  const deleteMaintenanceSchedule = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await maintenanceService.deleteMaintenanceSchedule(id);
      
      // Remove from local state
      setMaintenanceSchedules(prev => prev.filter(schedule => schedule.id !== id));
      
      showToast({
        type: 'success',
        message: 'Programación de mantenimiento eliminada exitosamente'
      });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar programación de mantenimiento';
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

  // Schedule maintenance
  const scheduleMaintenance = useCallback(async (toolId: string, data: CreateMaintenanceScheduleDTO): Promise<MaintenanceSchedule | null> => {
    try {
      setLoading(true);
      const schedule = await maintenanceService.scheduleMaintenance(toolId, data);
      
      // Refresh schedules list
      await fetchMaintenanceSchedules();
      
      showToast({
        type: 'success',
        message: 'Mantenimiento programado exitosamente'
      });
      
      return schedule;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al programar mantenimiento';
      setError(message);
      showToast({
        type: 'error',
        message: message
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchMaintenanceSchedules, showToast]);

  // Complete maintenance
  const completeMaintenance = useCallback(async (recordId: string, completionData: { completedDate: string; notes?: string; cost?: number }): Promise<MaintenanceRecord | null> => {
    try {
      setLoading(true);
      const completedRecord = await maintenanceService.completeMaintenance(recordId, completionData);
      
      // Update local state
      setMaintenanceRecords(prev => prev.map(record => 
        record.id === recordId ? completedRecord : record
      ));
      
      showToast({
        type: 'success',
        message: 'Mantenimiento completado exitosamente'
      });
      
      return completedRecord;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al completar mantenimiento';
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

  // Get upcoming maintenance
  const getUpcomingMaintenance = useCallback(async (days: number = 30): Promise<MaintenanceRecord[]> => {
    try {
      setLoading(true);
      const upcoming = await maintenanceService.getUpcomingMaintenance(days);
      return upcoming;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar mantenimiento próximo';
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

  // Get overdue maintenance
  const getOverdueMaintenance = useCallback(async (): Promise<MaintenanceRecord[]> => {
    try {
      setLoading(true);
      const overdue = await maintenanceService.getOverdueMaintenance();
      return overdue;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar mantenimiento vencido';
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

  // Get tool maintenance history
  const getToolMaintenanceHistory = useCallback(async (toolId: string): Promise<MaintenanceRecord[]> => {
    try {
      setLoading(true);
      const history = await maintenanceService.getToolMaintenanceHistory(toolId);
      return history;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar historial de mantenimiento';
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

  // Generate tool maintenance report
  const generateToolMaintenanceReport = useCallback(async (toolId: string, dateRange: { startDate: string; endDate: string }) => {
    try {
      setLoading(true);
      const report = await maintenanceService.generateToolMaintenanceReport(toolId, dateRange);
      return report;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al generar reporte de mantenimiento';
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

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await maintenanceService.getMaintenanceStats();
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
  const setFilters = useCallback((newFilters: Partial<MaintenanceFilters>) => {
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

  // Auto-fetch maintenance records when filters or pagination changes
  useEffect(() => {
    fetchMaintenanceRecords();
  }, [fetchMaintenanceRecords]);

  // Fetch stats and schedules on mount
  useEffect(() => {
    fetchStats();
    fetchMaintenanceSchedules();
  }, [fetchStats, fetchMaintenanceSchedules]);

  return {
    maintenanceRecords,
    maintenanceSchedules,
    loading,
    error,
    stats,
    filters,
    pagination,
    fetchMaintenanceRecords,
    getMaintenanceRecordById,
    createMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    fetchMaintenanceSchedules,
    getMaintenanceScheduleById,
    createMaintenanceSchedule,
    updateMaintenanceSchedule,
    deleteMaintenanceSchedule,
    scheduleMaintenance,
    completeMaintenance,
    getUpcomingMaintenance,
    getOverdueMaintenance,
    getToolMaintenanceHistory,
    generateToolMaintenanceReport,
    fetchStats,
    setFilters,
    setPage,
    setLimit,
    clearFilters
  };
};