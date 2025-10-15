import React, { useState, useMemo } from 'react';
import { Eye, Edit, Trash2, User, Wrench, AlertCircle, Calendar, Search, Filter, Grid, List, Download, Upload, ChevronLeft, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import { Tool, ToolFilters, ToolStatus } from '../../types/tools';

interface ToolListProps {
  tools: Tool[];
  onEdit: (tool: Tool) => void;
  onDelete: (id: string) => void;
  onView: (tool: Tool) => void;
  onAssign: (tool: Tool) => void;
  onMaintenance: (tool: Tool) => void;
  onExport?: (format: 'csv' | 'pdf' | 'excel') => void;
  onImport?: () => void;
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  filters?: ToolFilters;
  onFilterChange?: (filters: ToolFilters) => void;
}

const ToolList: React.FC<ToolListProps> = ({
  tools,
  onEdit,
  onDelete,
  onView,
  onAssign,
  onMaintenance,
  onExport,
  onImport,
  loading = false,
  pagination,
  filters
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'purchaseDate' | 'currentValue' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showFilters, setShowFilters] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: ToolStatus) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_use': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'repair': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'retired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: ToolStatus) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'in_use': return <User className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'repair': return <AlertCircle className="w-4 h-4" />;
      case 'retired': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: ToolStatus) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'in_use': return 'En uso';
      case 'maintenance': return 'En mantenimiento';
      case 'repair': return 'En reparación';
      case 'retired': return 'Retirado';
      default: return 'Desconocido';
    }
  };

  const isMaintenanceDue = (tool: Tool) => {
    if (!tool.maintenanceSchedule?.nextMaintenanceDate) return false;
    const nextMaintenance = new Date(tool.maintenanceSchedule.nextMaintenanceDate);
    const today = new Date();
    const daysDiff = Math.ceil((nextMaintenance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7; // Due within 7 days
  };

  const isMaintenanceOverdue = (tool: Tool) => {
    if (!tool.maintenanceSchedule?.nextMaintenanceDate) return false;
    const nextMaintenance = new Date(tool.maintenanceSchedule.nextMaintenanceDate);
    const today = new Date();
    return nextMaintenance < today;
  };

  const getAssignmentInfo = (tool: Tool) => {
    // Mock assignment data - will be replaced with real data from props/API
    if (tool.status === 'in_use') {
      return {
        projectName: 'Proyecto Central Park',
        assignedDate: '2024-01-15',
        assignedUser: 'Juan Pérez'
      };
    }
    return null;
  };

  const sortedTools = useMemo(() => {
    return [...tools].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'purchaseDate':
          aValue = new Date(a.purchaseDate).getTime();
          bValue = new Date(b.purchaseDate).getTime();
          break;
        case 'currentValue':
          aValue = a.currentValue;
          bValue = b.currentValue;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [tools, sortBy, sortOrder]);

  const filteredTools = useMemo(() => {
    return sortedTools.filter(item => {
      const searchLower = filters?.search?.toLowerCase() || '';
      const matchesSearch = !searchLower || 
        item.name.toLowerCase().includes(searchLower) ||
        (item.code && item.code.toLowerCase().includes(searchLower)) ||
        item.brand.toLowerCase().includes(searchLower) ||
        item.model.toLowerCase().includes(searchLower);
      const matchesCategory = !filters?.category || item.category === filters.category;
      const matchesStatus = !filters?.status || item.status === filters.status;
      const matchesType = !filters?.type || item.type === filters.type;
      return matchesSearch && matchesCategory && matchesStatus && matchesType;
    });
  }, [sortedTools, filters]);

  const handleSort = (field: 'name' | 'purchaseDate' | 'currentValue' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedTools.length === tools.length) {
      setSelectedTools([]);
    } else {
      setSelectedTools(tools.map(tool => tool.id));
    }
  };

  const handleSelectTool = (id: string) => {
    setSelectedTools(prev => 
      prev.includes(id) 
        ? prev.filter(toolId => toolId !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedTools.length > 0 && window.confirm(`¿Está seguro de que desea eliminar ${selectedTools.length} herramientas?`)) {
      selectedTools.forEach(id => onDelete(id));
      setSelectedTools([]);
    }
  };

  const handleBulkExport = (format: 'csv' | 'pdf' | 'excel') => {
    if (onExport) {
      onExport(format);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay herramientas registradas</h3>
          <p className="text-gray-600 mb-4">
            {filters?.search ? `No se encontraron herramientas que coincidan con "${filters.search}"` : 'Comienza agregando la primera herramienta a tu inventario.'}
          </p>
          {!filters?.search && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('createTool'))}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
            >
              <Wrench className="w-4 h-4" />
              <span>Agregar Primera Herramienta</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar herramientas..."
                value={filters?.search || ''}
                onChange={(e) => onFilterChange?.({ ...(filters || {}), search: e.target.value })}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded ${viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Vista tabla"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded ${viewMode === 'card' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Vista cuadrícula"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
            
            {selectedTools.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedTools.length} seleccionados
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
                <button
                  onClick={handleBulkExport}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
              </div>
            )}
            
            <button
              onClick={onImport}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Importar</span>
            </button>
            
            <button
              onClick={onExport}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={filters?.category || ''}
                  onChange={(e) => onFilterChange({ ...filters, category: e.target.value || undefined })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas las categorías</option>
                  <option value="heavy">Maquinaria Pesada</option>
                  <option value="tools">Herramientas</option>
                  <option value="vehicles">Vehículos</option>
                  <option value="safety">Seguridad</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filters?.status || ''}
                  onChange={(e) => onFilterChange({ ...filters, status: e.target.value as ToolStatus || undefined })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="available">Disponible</option>
                  <option value="assigned">Asignado</option>
                  <option value="maintenance">En mantenimiento</option>
                  <option value="retired">Retirado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor mínimo</label>
                <input
                  type="number"
                  value={filters?.minValue || ''}
                  onChange={(e) => onFilterChange({ ...filters, minValue: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor máximo</label>
                <input
                  type="number"
                  value={filters?.maxValue || ''}
                  onChange={(e) => onFilterChange({ ...filters, maxValue: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="999999"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => onFilterChange({})}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Limpiar filtros
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Herramienta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría/Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asignación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Próximo Mant.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTools.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.brand} {item.model}</div>
                    <div className="text-xs text-gray-400">ID: {item.code}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">{item.category}</div>
                    <div className="text-sm text-gray-500">{item.type}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    <span>{getStatusLabel(item.status)}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatCurrency(item.currentValue)}</div>
                  <div className="text-xs text-gray-500">
                    {item.purchaseDate && `Comprado: ${formatDate(item.purchaseDate)}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.currentAssignment ? (
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span>{item.currentAssignment.projectName}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Asignado: {formatDate(item.currentAssignment.assignedDate)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No asignado</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.maintenanceSchedule?.nextMaintenance ? (
                    <div>
                      <div className={`text-sm ${
                        isMaintenanceDue(item) ? 'text-red-600 font-medium' : 'text-gray-900'
                      }`}>
                        {formatDate(item.maintenanceSchedule.nextMaintenance)}
                      </div>
                      {isMaintenanceDue(item) && (
                        <div className="text-xs text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Próximo</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No programado</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onView(item)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onAssign(item)}
                      className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                      title="Asignar"
                      disabled={item.status === 'retired'}
                    >
                      <User className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onMaintenance(item)}
                      className={`p-1 rounded ${
                        isMaintenanceDue(item)
                          ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                          : 'text-orange-600 hover:text-orange-900 hover:bg-orange-50'
                      }`}
                      title="Mantenimiento"
                    >
                      <Wrench className="w-4 h-4" />
                    </button>
                    <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Mobile Cards */}
  <div className="md:hidden divide-y divide-gray-200">
    {filteredTools.map((item) => (
      <div key={item.id} className="p-4 hover:bg-gray-50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.brand} {item.model}</p>
            <p className="text-xs text-gray-400">ID: {item.code}</p>
          </div>
          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
            {getStatusIcon(item.status)}
            <span>{getStatusLabel(item.status)}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
          <div>
            <p className="text-gray-600">Categoría:</p>
            <p className="font-medium">{item.category}</p>
          </div>
          <div>
            <p className="text-gray-600">Tipo:</p>
            <p className="font-medium">{item.type}</p>
          </div>
          <div>
            <p className="text-gray-600">Valor:</p>
            <p className="font-medium">{formatCurrency(item.currentValue)}</p>
          </div>
          <div>
            <p className="text-gray-600">Asignación:</p>
            <p className="font-medium">
              {item.currentAssignment ? item.currentAssignment.projectName : 'No asignado'}
            </p>
          </div>
        </div>

        {item.maintenanceSchedule?.nextMaintenanceDate && (
          <div className={`mb-3 p-2 rounded-lg ${
            isMaintenanceDue(item) ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2">
              <Calendar className={`w-4 h-4 ${
                isMaintenanceDue(item) ? 'text-red-600' : 'text-gray-400'
              }`} />
              <div>
                <p className={`text-sm font-medium ${
                  isMaintenanceDue(item) ? 'text-red-900' : 'text-gray-900'
                }`}>
                  Próximo mantenimiento: {formatDate(item.maintenanceSchedule.nextMaintenanceDate)}
                </p>
                {isMaintenanceDue(item) && (
                  <p className="text-xs text-red-600">¡Requiere atención!</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(item)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>Ver</span>
          </button>
          <button
            onClick={() => onEdit(item)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </button>
          <button
            onClick={() => onAssign(item)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            disabled={item.status === 'retired'}
          >
            <User className="w-4 h-4" />
            <span>Asignar</span>
          </button>
          <button
            onClick={() => onMaintenance(item)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
              isMaintenanceDue(item)
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Mant.</span>
          </button>
        </div>
      </div>
    ))}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {filteredTools.map((item) => (
          <div key={item.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.brand} {item.model}</p>
                <p className="text-xs text-gray-400">ID: {item.code}</p>
              </div>
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {getStatusIcon(item.status)}
                <span>{getStatusLabel(item.status)}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
              <div>
                <p className="text-gray-600">Categoría:</p>
                <p className="font-medium">{item.category}</p>
              </div>
              <div>
                <p className="text-gray-600">Tipo:</p>
                <p className="font-medium">{item.type}</p>
              </div>
              <div>
                <p className="text-gray-600">Valor:</p>
                <p className="font-medium">{formatCurrency(item.currentValue)}</p>
              </div>
              <div>
                <p className="text-gray-600">Asignación:</p>
                <p className="font-medium">
                  {item.currentAssignment ? item.currentAssignment.projectName : 'No asignado'}
                </p>
              </div>
            </div>

            {item.maintenanceSchedule?.nextMaintenanceDate && (
              <div className={`mb-3 p-2 rounded-lg ${
                isMaintenanceDue(item) ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-2">
                  <Calendar className={`w-4 h-4 ${
                    isMaintenanceDue(item) ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      isMaintenanceDue(item) ? 'text-red-900' : 'text-gray-900'
                    }`}>
                      Próximo mantenimiento: {formatDate(item.maintenanceSchedule.nextMaintenanceDate)}
                    </p>
                    {isMaintenanceDue(item) && (
                      <p className="text-xs text-red-600">¡Requiere atención!</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onView(item)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>Ver</span>
              </button>
              <button
                onClick={() => onEdit(item)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => onAssign(item)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                disabled={item.status === 'retired'}
              >
                <User className="w-4 h-4" />
                <span>Asignar</span>
              </button>
              <button
                onClick={() => onMaintenance(item)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
                  isMaintenanceDue(item)
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Mant.</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolList;