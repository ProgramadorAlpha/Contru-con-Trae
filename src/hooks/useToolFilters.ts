import { useState, useCallback, useMemo } from 'react';
import { ToolFilters } from '../types/tools';

interface UseToolFiltersReturn {
  filters: ToolFilters;
  isActive: boolean;
  filterCount: number;
  
  // Filter setters
  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setType: (type: string) => void;
  setStatus: (status: string) => void;
  setLocation: (location: string) => void;
  setBrand: (brand: string) => void;
  setAssignedTo: (assignedTo: string) => void;
  setMinValue: (minValue: number | undefined) => void;
  setMaxValue: (maxValue: number | undefined) => void;
  setMaintenanceDue: (maintenanceDue: boolean) => void;
  setDateRange: (dateRange: { startDate: string; endDate: string } | undefined) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  
  // Filter operations
  clearAllFilters: () => void;
  clearFilter: (key: keyof ToolFilters) => void;
  setFilters: (filters: Partial<ToolFilters>) => void;
  
  // Filter validation and helpers
  validateFilters: () => boolean;
  getFilterSummary: () => string[];
  getActiveFilterCount: () => number;
  
  // Preset filters
  applyPreset: (preset: 'active' | 'available' | 'maintenance' | 'assigned' | 'high-value') => void;
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

const presetFilters = {
  active: {
    status: 'active',
    maintenanceDue: false
  },
  available: {
    status: 'available',
    assignedTo: ''
  },
  maintenance: {
    status: 'maintenance',
    maintenanceDue: true
  },
  assigned: {
    assignedTo: 'any',
    status: 'assigned'
  },
  'high-value': {
    minValue: 10000
  }
};

export const useToolFilters = (initialFilters?: Partial<ToolFilters>): UseToolFiltersReturn => {
  const [filters, setFiltersState] = useState<ToolFilters>({
    ...defaultFilters,
    ...initialFilters
  });

  // Check if any filters are active
  const isActive = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'sortBy' || key === 'sortOrder') return false;
      if (value === '' || value === undefined || value === false) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    });
  }, [filters]);

  // Get active filter count
  const getActiveFilterCount = useCallback((): number => {
    let count = 0;

    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.type) count++;
    if (filters.status) count++;
    if (filters.location) count++;
    if (filters.brand) count++;
    if (filters.assignedTo) count++;
    if (filters.minValue !== undefined) count++;
    if (filters.maxValue !== undefined) count++;
    if (filters.maintenanceDue) count++;
    if (filters.dateRange) count++;

    return count;
  }, [filters]);

  // Count active filters
  const filterCount = useMemo(() => {
    return getActiveFilterCount();
  }, [filters]);

  // Filter setters
  const setSearch = useCallback((search: string) => {
    setFiltersState(prev => ({ ...prev, search }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setFiltersState(prev => ({ ...prev, category }));
  }, []);

  const setType = useCallback((type: string) => {
    setFiltersState(prev => ({ ...prev, type }));
  }, []);

  const setStatus = useCallback((status: string) => {
    setFiltersState(prev => ({ ...prev, status }));
  }, []);

  const setLocation = useCallback((location: string) => {
    setFiltersState(prev => ({ ...prev, location }));
  }, []);

  const setBrand = useCallback((brand: string) => {
    setFiltersState(prev => ({ ...prev, brand }));
  }, []);

  const setAssignedTo = useCallback((assignedTo: string) => {
    setFiltersState(prev => ({ ...prev, assignedTo }));
  }, []);

  const setMinValue = useCallback((minValue: number | undefined) => {
    setFiltersState(prev => ({ ...prev, minValue }));
  }, []);

  const setMaxValue = useCallback((maxValue: number | undefined) => {
    setFiltersState(prev => ({ ...prev, maxValue }));
  }, []);

  const setMaintenanceDue = useCallback((maintenanceDue: boolean) => {
    setFiltersState(prev => ({ ...prev, maintenanceDue }));
  }, []);

  const setDateRange = useCallback((dateRange: { startDate: string; endDate: string } | undefined) => {
    setFiltersState(prev => ({ ...prev, dateRange }));
  }, []);

  const setSortBy = useCallback((sortBy: string) => {
    setFiltersState(prev => ({ ...prev, sortBy }));
  }, []);

  const setSortOrder = useCallback((sortOrder: 'asc' | 'desc') => {
    setFiltersState(prev => ({ ...prev, sortOrder }));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  // Clear specific filter
  const clearFilter = useCallback((key: keyof ToolFilters) => {
    setFiltersState(prev => {
      const defaultValue = defaultFilters[key];
      return { ...prev, [key]: defaultValue };
    });
  }, []);

  // Set multiple filters at once
  const setFilters = useCallback((newFilters: Partial<ToolFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Validate filters
  const validateFilters = useCallback((): boolean => {
    // Validate date range
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.startDate);
      const endDate = new Date(filters.dateRange.endDate);
      
      if (startDate > endDate) {
        return false;
      }
    }

    // Validate value range
    if (filters.minValue !== undefined && filters.maxValue !== undefined) {
      if (filters.minValue > filters.maxValue) {
        return false;
      }
    }

    return true;
  }, [filters]);

  // Get filter summary
  const getFilterSummary = useCallback((): string[] => {
    const summary: string[] = [];

    if (filters.search) {
      summary.push(`Búsqueda: "${filters.search}"`);
    }

    if (filters.category) {
      summary.push(`Categoría: ${filters.category}`);
    }

    if (filters.type) {
      summary.push(`Tipo: ${filters.type}`);
    }

    if (filters.status) {
      summary.push(`Estado: ${filters.status}`);
    }

    if (filters.location) {
      summary.push(`Ubicación: ${filters.location}`);
    }

    if (filters.brand) {
      summary.push(`Marca: ${filters.brand}`);
    }

    if (filters.assignedTo) {
      summary.push(filters.assignedTo === 'any' ? 'Asignado: Sí' : `Asignado a: ${filters.assignedTo}`);
    }

    if (filters.minValue !== undefined || filters.maxValue !== undefined) {
      if (filters.minValue !== undefined && filters.maxValue !== undefined) {
        summary.push(`Valor: $${filters.minValue.toLocaleString()} - $${filters.maxValue.toLocaleString()}`);
      } else if (filters.minValue !== undefined) {
        summary.push(`Valor mínimo: $${filters.minValue.toLocaleString()}`);
      } else {
        summary.push(`Valor máximo: $${filters.maxValue!.toLocaleString()}`);
      }
    }

    if (filters.maintenanceDue) {
      summary.push('Mantenimiento vencido');
    }

    if (filters.dateRange) {
      summary.push(`Fecha: ${new Date(filters.dateRange.startDate).toLocaleDateString()} - ${new Date(filters.dateRange.endDate).toLocaleDateString()}`);
    }

    return summary;
  }, [filters]);

  // Apply preset filters
  const applyPreset = useCallback((preset: 'active' | 'available' | 'maintenance' | 'assigned' | 'high-value') => {
    const presetData = presetFilters[preset];
    if (presetData) {
      setFiltersState(prev => ({ ...defaultFilters, ...presetData }));
    }
  }, []);

  return {
    filters,
    isActive,
    filterCount,
    setSearch,
    setCategory,
    setType,
    setStatus,
    setLocation,
    setBrand,
    setAssignedTo,
    setMinValue,
    setMaxValue,
    setMaintenanceDue,
    setDateRange,
    setSortBy,
    setSortOrder,
    clearAllFilters,
    clearFilter,
    setFilters,
    validateFilters,
    getFilterSummary,
    getActiveFilterCount,
    applyPreset
  };
};