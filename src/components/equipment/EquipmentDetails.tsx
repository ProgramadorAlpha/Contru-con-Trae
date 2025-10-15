import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, MapPin, Settings, User, Clock, FileText, History } from 'lucide-react';
import { Equipment } from '../../types/equipment';
import { equipmentAPI } from '../../lib/api';

interface EquipmentDetailsProps {
  equipment: Equipment;
  onClose: () => void;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipment, onClose }) => {
  const [equipmentDetails, setEquipmentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'maintenance'>('info');

  useEffect(() => {
    loadEquipmentDetails();
  }, [equipment.id]);

  const loadEquipmentDetails = async () => {
    try {
      setLoading(true);
      const details = await equipmentAPI.getById(equipment.id);
      setEquipmentDetails(details);
    } catch (error) {
      console.error('Error loading equipment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in_use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'preventive': return 'bg-purple-100 text-purple-800';
      case 'corrective': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'info', label: 'Información General', icon: Settings },
    { id: 'history', label: 'Historial de Asignaciones', icon: History },
    { id: 'maintenance', label: 'Mantenimiento', icon: FileText },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh]">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando detalles del equipo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Detalles del Equipo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{equipment.name}</h3>
                  <p className="text-gray-600">{equipment.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(equipment.status)}`}>
                      {equipment.status === 'available' && 'Disponible'}
                      {equipment.status === 'in_use' && 'En uso'}
                      {equipment.status === 'maintenance' && 'En mantenimiento'}
                      {equipment.status === 'retired' && 'Retirado'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {equipment.category} • {equipment.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Valor Actual</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(equipment.currentValue)}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Información General</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Marca/Modelo:</span>
                      <span className="font-medium">{equipment.brand} {equipment.model}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Número de Serie:</span>
                      <span className="font-medium font-mono">{equipment.serialNumber}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Ubicación:</span>
                      <span className="font-medium">{equipment.location}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Precio de Compra:</span>
                      <span className="font-medium">{formatCurrency(equipment.purchasePrice)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Fecha de Compra:</span>
                      <span className="font-medium">{formatDate(equipment.purchaseDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Especificaciones Técnicas</h4>
                  <div className="space-y-3">
                    {Object.entries(equipment.specifications || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="font-medium">{value as string}</span>
                      </div>
                    ))}
                    {(!equipment.specifications || Object.keys(equipment.specifications).length === 0) && (
                      <p className="text-gray-500 italic">No hay especificaciones técnicas disponibles</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Assignment */}
              {equipment.currentAssignment && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-blue-900 mb-3">Asignación Actual</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-blue-600">Proyecto</p>
                        <p className="font-medium text-blue-900">{equipment.projectName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-blue-600">Responsable</p>
                        <p className="font-medium text-blue-900">{equipment.assignedUserName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Historial de Asignaciones</h4>
              {equipmentDetails?.assignments && equipmentDetails.assignments.length > 0 ? (
                <div className="space-y-3">
                  {equipmentDetails.assignments.map((assignment: any) => (
                    <div key={assignment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                            {assignment.status === 'active' && 'Activa'}
                            {assignment.status === 'completed' && 'Completada'}
                          </span>
                          <span className="text-sm text-gray-600">
                            {assignment.projectName}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(assignment.startDate)}
                          {assignment.endDate && ` - ${formatDate(assignment.endDate)}`}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Asignado por:</p>
                          <p className="font-medium">{assignment.assignedByName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Asignado a:</p>
                          <p className="font-medium">{assignment.assignedToName}</p>
                        </div>
                      </div>
                      {assignment.notes && (
                        <div className="mt-3 p-2 bg-white rounded border">
                          <p className="text-sm text-gray-600">Notas:</p>
                          <p className="text-sm">{assignment.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay historial de asignaciones disponible</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Historial de Mantenimiento</h4>
              {equipmentDetails?.maintenanceHistory && equipmentDetails.maintenanceHistory.length > 0 ? (
                <div className="space-y-3">
                  {equipmentDetails.maintenanceHistory.map((maintenance: any) => (
                    <div key={maintenance.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(maintenance.type)}`}>
                            {maintenance.type === 'preventive' && 'Preventivo'}
                            {maintenance.type === 'corrective' && 'Correctivo'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(maintenance.status)}`}>
                            {maintenance.status === 'scheduled' && 'Programado'}
                            {maintenance.status === 'completed' && 'Completado'}
                            {maintenance.status === 'in_progress' && 'En progreso'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(maintenance.scheduledDate)}
                        </span>
                      </div>
                      <p className="font-medium mb-2">{maintenance.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Técnico:</p>
                          <p className="font-medium">{maintenance.technician}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Costo:</p>
                          <p className="font-medium">{formatCurrency(maintenance.cost)}</p>
                        </div>
                      </div>
                      {maintenance.notes && (
                        <div className="mt-3 p-2 bg-white rounded border">
                          <p className="text-sm text-gray-600">Notas:</p>
                          <p className="text-sm">{maintenance.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay registros de mantenimiento disponibles</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetails;