import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, DollarSign, Settings, Wrench, Building, User, MapPin, Clock, AlertCircle } from 'lucide-react';
import { equipmentAPI } from '../lib/api';
import { Equipment, EquipmentStatus } from '../types/equipment';
import EquipmentForm from '../components/equipment/EquipmentForm';
import EquipmentDetails from '../components/equipment/EquipmentDetails';
import EquipmentAssignment from '../components/equipment/EquipmentAssignment';
import EquipmentMaintenance from '../components/equipment/EquipmentMaintenance';
import EquipmentStats from '../components/equipment/EquipmentStats';

const EquipmentPage: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadEquipment();
    loadCategories();
    loadStats();
  }, []);

  useEffect(() => {
    filterEquipment();
  }, [equipment, searchTerm, statusFilter, categoryFilter]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (categoryFilter !== 'all') filters.category = categoryFilter;
      if (searchTerm) filters.search = searchTerm;
      
      const data = await equipmentAPI.getAll(filters);
      setEquipment(data);
    } catch (error) {
      console.error('Error loading equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await equipmentAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await equipmentAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterEquipment = () => {
    let filtered = equipment;

    if (searchTerm) {
      filtered = filtered.filter(eq =>
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(eq => eq.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(eq => eq.category === categoryFilter);
    }

    setFilteredEquipment(filtered);
  };

  const handleCreate = () => {
    setSelectedEquipment(null);
    setShowForm(true);
  };

  const handleEdit = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowForm(true);
  };

  const handleView = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowDetails(true);
  };

  const handleAssign = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowAssignment(true);
  };

  const handleMaintenance = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowMaintenance(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este equipo?')) {
      try {
        await equipmentAPI.delete(id);
        loadEquipment();
        loadStats();
      } catch (error) {
        console.error('Error deleting equipment:', error);
        alert('Error al eliminar el equipo. Por favor, intente nuevamente.');
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedEquipment) {
        await equipmentAPI.update(selectedEquipment.id, data);
      } else {
        await equipmentAPI.create(data);
      }
      setShowForm(false);
      setSelectedEquipment(null);
      loadEquipment();
      loadStats();
    } catch (error) {
      console.error('Error saving equipment:', error);
      alert('Error al guardar el equipo. Por favor, intente nuevamente.');
    }
  };

  const getStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in_use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: EquipmentStatus) => {
    switch (status) {
      case 'available': return <div className="w-3 h-3 bg-green-500 rounded-full" />;
      case 'in_use': return <div className="w-3 h-3 bg-blue-500 rounded-full" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'retired': return <div className="w-3 h-3 bg-gray-500 rounded-full" />;
      default: return <div className="w-3 h-3 bg-gray-500 rounded-full" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Equipos</h1>
              <p className="mt-2 text-gray-600">
                Administra el inventario de equipos y maquinaria de construcción
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Equipo</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && <EquipmentStats stats={stats} />}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Búsqueda
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar equipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EquipmentStatus | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="available">Disponible</option>
                <option value="in_use">En uso</option>
                <option value="maintenance">En mantenimiento</option>
                <option value="retired">Retirado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Equipment List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Equipos ({filteredEquipment.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando equipos...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEquipment.length === 0 ? (
                <div className="p-8 text-center">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No se encontraron equipos</p>
                  <button
                    onClick={handleCreate}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Agregar tu primer equipo
                  </button>
                </div>
              ) : (
                filteredEquipment.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Settings className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-gray-600">{item.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Building className="w-4 h-4" />
                              <span>{item.brand} {item.model}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{item.location}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{formatCurrency(item.currentValue)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(item.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status === 'available' && 'Disponible'}
                            {item.status === 'in_use' && 'En uso'}
                            {item.status === 'maintenance' && 'En mantenimiento'}
                            {item.status === 'retired' && 'Retirado'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(item)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAssign(item)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Asignar"
                          >
                            <User className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMaintenance(item)}
                            className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                            title="Mantenimiento"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {item.currentAssignment && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-800">
                              Asignado a: <strong>{item.projectName}</strong>
                            </span>
                          </div>
                          <span className="text-blue-600">
                            Responsable: {item.assignedUserName}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <EquipmentForm
          equipment={selectedEquipment}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setSelectedEquipment(null);
          }}
          categories={categories}
        />
      )}

      {showDetails && selectedEquipment && (
        <EquipmentDetails
          equipment={selectedEquipment}
          onClose={() => {
            setShowDetails(false);
            setSelectedEquipment(null);
          }}
        />
      )}

      {showAssignment && selectedEquipment && (
        <EquipmentAssignment
          equipment={selectedEquipment}
          onClose={() => {
            setShowAssignment(false);
            setSelectedEquipment(null);
            loadEquipment();
            loadStats();
          }}
        />
      )}

      {showMaintenance && selectedEquipment && (
        <EquipmentMaintenance
          equipment={selectedEquipment}
          onClose={() => {
            setShowMaintenance(false);
            setSelectedEquipment(null);
          }}
        />
      )}
    </div>
  );
};

export default EquipmentPage;