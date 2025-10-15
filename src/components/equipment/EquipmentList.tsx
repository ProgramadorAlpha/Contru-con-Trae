import React from 'react';
import { Edit, Trash2, Eye, User, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, Wrench } from 'lucide-react';
import { Equipment } from '../../types/equipment';

interface EquipmentListProps {
  equipment: Equipment[];
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: string) => void;
  onView: (equipment: Equipment) => void;
  onAssign: (equipment: Equipment) => void;
  onMaintenance: (equipment: Equipment) => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({
  equipment,
  onEdit,
  onDelete,
  onView,
  onAssign,
  onMaintenance
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in_use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'yellow-100 text-yellow-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'in_use': return <User className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'retired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'in_use': return 'En uso';
      case 'maintenance': return 'En mantenimiento';
      case 'retired': return 'Retirado';
      default: return 'Desconocido';
    }
  };

  const isMaintenanceDue = (equipment: Equipment) => {
    if (!equipment.maintenanceSchedule?.nextMaintenance) return false;
    const nextMaintenance = new Date(equipment.maintenanceSchedule.nextMaintenance);
    const today = new Date();
    const daysDiff = Math.ceil((nextMaintenance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7; // Due within 7 days
  };

  if (equipment.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay equipos registrados</h3>
          <p className="text-gray-600 mb-4">
            Comienza agregando el primer equipo a tu inventario.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipo
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
            {equipment.map((item) => (
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
                  <div className="text-sm text-gray-900">{formatCurrency(item.value)}</div>
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
        {equipment.map((item) => (
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
                <p className="font-medium">{formatCurrency(item.value)}</p>
              </div>
              <div>
                <p className="text-gray-600">Asignación:</p>
                <p className="font-medium">
                  {item.currentAssignment ? item.currentAssignment.projectName : 'No asignado'}
                </p>
              </div>
            </div>

            {item.maintenanceSchedule?.nextMaintenance && (
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
                      Próximo mantenimiento: {formatDate(item.maintenanceSchedule.nextMaintenance)}
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

export default EquipmentList;