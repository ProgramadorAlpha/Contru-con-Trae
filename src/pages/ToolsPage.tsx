import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw, Download, Upload, BarChart3, Settings } from 'lucide-react';
import { useTools } from '../hooks/useTools';
import { useToolFilters } from '../hooks/useToolFilters';
import { useToast } from '../hooks/useToast';
import { Tool } from '../types/tools';
import ToolList from '../components/tools/ToolList';
import ToolForm from '../components/tools/ToolForm';
import ToolDetail from '../components/tools/ToolDetail';
import ToolFilters from '../components/tools/ToolFilters';
import ToolAssignmentModal from '../components/tools/ToolAssignment';
import ToolMaintenance from '../components/tools/ToolMaintenance';
import DocumentUpload from '../components/tools/DocumentUpload';
import { assignmentService } from '../services/assignmentService';

const ToolsPage: React.FC = () => {
  // Hooks
  const {
    tools,
    loading,
    stats,
    filters,
    pagination,
    fetchTools,
    fetchStats,
    createTool,
    updateTool,
    deleteTool,
    bulkDelete,
    exportTools,
    importTools,
    setPage,
    setLimit
  } = useTools();

  const {
    filters: toolFilters,
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
    filterCount,
    setFilters
  } = useToolFilters();

  const { showToast } = useToast();

  // State
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [showMaintenanceCalendar, setShowMaintenanceCalendar] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [availableProjects, setAvailableProjects] = useState<Array<{ id: string; name: string; location: string; manager: string }>>([]);
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; email: string; phone: string; role: string }>>([]);

  // Effects
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Apply filters to fetch tools
    fetchTools(toolFilters);
  }, [toolFilters, pagination.page, pagination.limit]);

  // Methods
  const loadInitialData = async () => {
    try {
      await Promise.all([
        fetchTools(),
        fetchStats()
      ]);
    } catch (error) {
      showToast({ type: 'error', message: 'Error al cargar los datos iniciales' });
    }
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchTools(),
        fetchStats()
      ]);
      showToast({ type: 'success', message: 'Datos actualizados correctamente' });
    } catch (error) {
      showToast({ type: 'error', message: 'Error al actualizar los datos' });
    }
  };

  const handleCreate = () => {
    setEditingTool(null);
    setShowForm(true);
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setShowForm(true);
  };

  const handleView = (tool: Tool) => {
    setSelectedTool(tool);
    setShowDetails(true);
  };

  const handleAssign = (tool: Tool) => {
    setSelectedTool(tool);
    setShowAssignment(true);
  };

  const handleMaintenance = (tool: Tool) => {
    setSelectedTool(tool);
    setShowMaintenanceCalendar(true);
  };

  const handleDocuments = (tool: Tool) => {
    setSelectedTool(tool);
    setShowDocumentUpload(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingTool) {
        await updateTool(editingTool.id, data);
        showToast({ type: 'success', message: 'Herramienta actualizada correctamente' });
      } else {
        await createTool(data);
        showToast({ type: 'success', message: 'Herramienta creada correctamente' });
      }
      setShowForm(false);
      setEditingTool(null);
      await fetchStats();
    } catch (error) {
      showToast({ type: 'error', message: 'Error al guardar la herramienta' });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta herramienta?')) {
      try {
        await deleteTool(id);
        showToast({ type: 'success', message: 'Herramienta eliminada correctamente' });
        await fetchStats();
      } catch (error) {
        showToast({ type: 'error', message: 'Error al eliminar la herramienta' });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      showToast({ type: 'warning', message: 'Seleccione al menos una herramienta' });
      return;
    }

    if (window.confirm(`¿Está seguro de que desea eliminar ${selectedIds.length} herramientas?`)) {
      try {
        await bulkDelete(selectedIds);
        showToast({ type: 'success', message: `${selectedIds.length} herramientas eliminadas correctamente` });
        setSelectedIds([]);
        await fetchStats();
      } catch (error) {
        showToast({ type: 'error', message: 'Error al eliminar las herramientas' });
      }
    }
  };

  const handleExport = async () => {
    try {
      await exportTools('csv');
      showToast({ type: 'success', message: 'Herramientas exportadas correctamente' });
    } catch (error) {
      showToast({ type: 'error', message: 'Error al exportar las herramientas' });
    }
  };

  const handleImport = async (file: File) => {
    try {
      await importTools(file);
      showToast({ type: 'success', message: 'Herramientas importadas correctamente' });
      await fetchStats();
    } catch (error) {
      showToast({ type: 'error', message: 'Error al importar las herramientas' });
      throw error;
    }
  };

  const handlePageChange = (page: number) => {
    // This is handled by the useTools hook
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    // This is handled by the useTools hook
  };

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handleFilterApply = (filters: any) => {
    // Apply filters through the useToolFilters hook
    Object.keys(filters).forEach(key => {
      switch (key) {
        case 'search':
          setSearch(filters[key]);
          break;
        case 'category':
          setCategory(filters[key]);
          break;
        case 'status':
          setStatus(filters[key]);
          break;
        case 'location':
          setLocation(filters[key]);
          break;
        case 'brand':
          setBrand(filters[key]);
          break;
        case 'assignedTo':
          setAssignedTo(filters[key]);
          break;
        case 'minValue':
          setMinValue(filters[key]);
          break;
        case 'maxValue':
          setMaxValue(filters[key]);
          break;
        case 'maintenanceDue':
          setMaintenanceDue(filters[key]);
          break;
        case 'dateRange':
          setDateRange(filters[key]);
          break;
        case 'sortBy':
          setSortBy(filters[key]);
          break;
        case 'sortOrder':
          setSortOrder(filters[key]);
          break;
      }
    });
    setShowFilters(false);
  };

  // Listas disponibles para filtros
  const availableCategories = Array.from(new Set((tools || []).map(t => t.category).filter(Boolean))) as string[];
  const availableTypes = Array.from(new Set((tools || []).map(t => t.type).filter(Boolean))) as string[];
  const availableLocations = Array.from(new Set((tools || []).map(t => t.location).filter(Boolean))) as string[];
  const availableBrands = Array.from(new Set((tools || []).map(t => t.brand).filter(Boolean))) as string[];
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Herramientas</h1>
              <p className="mt-2 text-gray-600">
                Administra el inventario de herramientas y maquinaria de construcción
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Actualizar"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowFilters(true)}
                className={`p-2 border rounded-lg transition-colors ${
                  filterCount > 0
                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
                title={`Filtros (${filterCount})`}
              >
                <Filter className="w-5 h-5" />
                {filterCount > 0 && (
                  <span className="ml-1 text-xs font-medium">{filterCount}</span>
                )}
              </button>
              <button
                onClick={handleExport}
                className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Exportar"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Nueva Herramienta</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Herramientas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disponibles</p>
                  <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Uso</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.assigned}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(stats.totalValue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tool List */}
        <ToolList
          tools={tools}
          loading={loading}
          onEdit={handleEdit}
          onView={handleView}
          onAssign={handleAssign}
          onMaintenance={handleMaintenance}
          onDelete={handleDelete}
          pagination={{
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            totalItems: pagination.total,
            itemsPerPage: pagination.limit,
            onPageChange: setPage
          }}
          filters={toolFilters}
        />

        {/* Modals */}
        {showForm && (
          <ToolForm
            tool={editingTool || undefined}
            isOpen={true}
            onClose={() => {
              setShowForm(false);
              setEditingTool(null);
            }}
            onSave={handleFormSubmit}
            mode={editingTool ? 'edit' : 'create'}
          />
        )}

        {showDetails && selectedTool && (
          <ToolDetail
            tool={selectedTool}
            isOpen={true}
            onClose={() => {
              setShowDetails(false);
              setSelectedTool(null);
            }}
            onEdit={(t) => {
              setShowDetails(false);
              handleEdit(t);
            }}
            onAssign={(t) => {
              setShowDetails(false);
              handleAssign(t);
            }}
            onMaintenance={(t) => {
              setShowDetails(false);
              handleMaintenance(t);
            }}
            onUploadDocument={async (toolId, file) => {
              showToast({ type: 'info', message: 'Subida de documento iniciada' });
            }}
            onDownloadDocument={(documentId) => {
              showToast({ type: 'info', message: 'Descarga de documento iniciada' });
            }}
          />
        )}

        {showFilters && (
          <ToolFilters
            filters={toolFilters}
            onFiltersChange={(updated) => setFilters(updated)}
            onClearFilters={clearAllFilters}
            availableCategories={availableCategories}
            availableTypes={availableTypes}
            availableLocations={availableLocations}
            availableBrands={availableBrands}
            isOpen={true}
            onClose={() => setShowFilters(false)}
          />
        )}

        {showAssignment && selectedTool && (
          <ToolAssignmentModal
            tool={selectedTool}
            isOpen={true}
            onClose={() => {
              setShowAssignment(false);
              setSelectedTool(null);
              loadInitialData(); // Refresh data after assignment changes
            }}
            availableProjects={availableProjects}
            availableUsers={availableUsers}
            onAssign={async (assignment) => {
              if (!selectedTool) return;
              const dto = {
                toolName: selectedTool.name,
                assignedTo: assignment.assignedTo,
                assignedToType: assignment.assignedToType || 'user',
                assignedToName: assignment.assignedToName,
                assignedBy: assignment.assignedBy,
                assignedByName: assignment.assignedByName,
                startDate: typeof assignment.startDate === 'string' ? assignment.startDate : (assignment.startDate as Date).toISOString(),
                endDate: assignment.endDate ? (typeof assignment.endDate === 'string' ? assignment.endDate : (assignment.endDate as Date).toISOString()) : undefined,
                type: assignment.type,
                purpose: assignment.purpose,
                location: assignment.location,
                notes: assignment.notes,
                priority: assignment.priority,
                status: assignment.status as any
              };
              await assignmentService.assignTool(selectedTool.id, dto);
              showToast({ type: 'success', message: 'Asignación creada correctamente' });
              setShowAssignment(false);
            }}
            onUnassign={async (toolId: string) => {
              showToast({ type: 'success', message: 'Herramienta desasignada correctamente' });
            }}
          />
        )}

        {showMaintenanceCalendar && selectedTool && (
          <ToolMaintenance
            tool={selectedTool}
            onClose={() => {
              setShowMaintenanceCalendar(false);
              setSelectedTool(null);
            }}
          />
        )}

        {showDocumentUpload && selectedTool && (
          <DocumentUpload
            toolId={selectedTool.id}
            currentDocuments={selectedTool.documents}
            isOpen={true}
            onClose={() => {
              setShowDocumentUpload(false);
              setSelectedTool(null);
            }}
            onUpload={async (toolId, file, documentType, description) => {
              showToast({ type: 'success', message: 'Documento subido correctamente' });
            }}
            onDownload={(documentId) => {
              showToast({ type: 'info', message: 'Descarga iniciada' });
            }}
            onDelete={(documentId) => {
              showToast({ type: 'success', message: 'Documento eliminado' });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ToolsPage;