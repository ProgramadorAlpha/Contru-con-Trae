import React, { useState, useEffect } from 'react';
import { X, Filter, Search, Calendar, DollarSign, MapPin, Package, User, Wrench } from 'lucide-react';
import { ToolFilters as ToolFiltersType } from '../../types/tools';

interface ToolFiltersProps {
  filters: ToolFiltersType;
  onFiltersChange: (filters: ToolFiltersType) => void;
  onClearFilters: () => void;
  availableCategories: string[];
  availableTypes: string[];
  availableLocations: string[];
  availableBrands: string[];
  isOpen: boolean;
  onClose: () => void;
}

const ToolFilters: React.FC<ToolFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  availableCategories,
  availableTypes,
  availableLocations,
  availableBrands,
  isOpen,
  onClose
}) => {
  const [localFilters, setLocalFilters] = useState<ToolFiltersType>(filters);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof ToolFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    const newDateRange = { ...dateRange, [type]: value };
    setDateRange(newDateRange);
    
    if (newDateRange.start && newDateRange.end) {
      handleFilterChange('dateRange', {
        start: newDateRange.start,
        end: newDateRange.end
      });
    }
  };

  const handleClearAll = () => {
    setLocalFilters({
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
    });
    setDateRange({ start: '', end: '' });
    onClearFilters();
  };

  const hasActiveFilters = () => {
    return (
      localFilters.search ||
      localFilters.category ||
      localFilters.type ||
      localFilters.status ||
      localFilters.location ||
      localFilters.brand ||
      localFilters.minValue !== undefined ||
      localFilters.maxValue !== undefined ||
      localFilters.assignedTo ||
      localFilters.maintenanceDue ||
      localFilters.dateRange ||
      localFilters.sortBy !== 'name' ||
      localFilters.sortOrder !== 'asc'
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.category) count++;
    if (localFilters.type) count++;
    if (localFilters.status) count++;
    if (localFilters.location) count++;
    if (localFilters.brand) count++;
    if (localFilters.minValue !== undefined) count++;
    if (localFilters.maxValue !== undefined) count++;
    if (localFilters.assignedTo) count++;
    if (localFilters.maintenanceDue) count++;
    if (localFilters.dateRange) count++;
    if (localFilters.sortBy !== 'name') count++;
    if (localFilters.sortOrder !== 'asc') count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <Filter className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Filtros de Herramientas</h2>
            {hasActiveFilters() && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {getActiveFiltersCount()} activos
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Búsqueda
              </label>
              <input
                type="text"
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Buscar por nombre, marca, modelo o número de serie..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 inline mr-1" />
                  Categoría
                </label>
                <select
                  value={localFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas las categorías</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ').toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={localFilters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los tipos</option>
                  {availableTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={localFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="available">Disponible</option>
                  <option value="assigned">Asignado</option>
                  <option value="maintenance">En mantenimiento</option>
                  <option value="retired">Retirado</option>
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <select
                  value={localFilters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas las marcas</option>
                  {availableBrands.map(brand => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Ubicación
                </label>
                <select
                  value={localFilters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas las ubicaciones</option>
                  {availableLocations.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Asignado a
                </label>
                <input
                  type="text"
                  value={localFilters.assignedTo}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                  placeholder="Nombre del responsable..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Value Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Rango de Valor
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Valor mínimo</label>
                  <input
                    type="number"
                    value={localFilters.minValue || ''}
                    onChange={(e) => handleFilterChange('minValue', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Valor máximo</label>
                  <input
                    type="number"
                    value={localFilters.maxValue || ''}
                    onChange={(e) => handleFilterChange('maxValue', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="999999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Rango de Fechas
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fecha desde</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fecha hasta</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Special Filters */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenance-due"
                  checked={localFilters.maintenanceDue}
                  onChange={(e) => handleFilterChange('maintenanceDue', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenance-due" className="ml-2 text-sm text-gray-700">
                  <Wrench className="w-4 h-4 inline mr-1" />
                  Solo herramientas con mantenimiento próximo
                </label>
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={localFilters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Nombre</option>
                  <option value="brand">Marca</option>
                  <option value="model">Modelo</option>
                  <option value="value">Valor</option>
                  <option value="purchaseDate">Fecha de compra</option>
                  <option value="status">Estado</option>
                  <option value="category">Categoría</option>
                  <option value="location">Ubicación</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orden
                </label>
                <select
                  value={localFilters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClearAll}
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Limpiar todos los filtros
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolFilters;