import React from 'react';
import { Eye, Edit, Trash2, User, Wrench, AlertCircle, Calendar, MapPin, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { Tool } from '../../types/tools';

interface ToolCardProps {
  tool: Tool;
  onView: (tool: Tool) => void;
  onEdit: (tool: Tool) => void;
  onDelete: (id: string) => void;
  onAssign: (tool: Tool) => void;
  onMaintenance: (tool: Tool) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  onView,
  onEdit,
  onDelete,
  onAssign,
  onMaintenance,
  isSelected = false,
  onSelect
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'retired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-3 h-3" />;
      case 'assigned':
        return <User className="w-3 h-3" />;
      case 'maintenance':
        return <Wrench className="w-3 h-3" />;
      case 'retired':
        return <Clock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'assigned':
        return 'Asignado';
      case 'maintenance':
        return 'En mantenimiento';
      case 'retired':
        return 'Retirado';
      default:
        return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const isMaintenanceDue = (item: Tool) => {
    if (!item.maintenanceSchedule?.nextMaintenance) return false;
    const today = new Date();
    const nextMaintenance = new Date(item.maintenanceSchedule.nextMaintenance);
    const daysUntilMaintenance = Math.ceil((nextMaintenance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilMaintenance <= 7;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(tool.id)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
              <p className="text-sm text-gray-600">{tool.brand} {tool.model}</p>
              <p className="text-xs text-gray-400 mt-1">ID: {tool.code}</p>
            </div>
          </div>
          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tool.status)}`}>
            {getStatusIcon(tool.status)}
            <span>{getStatusLabel(tool.status)}</span>
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Categoría</p>
            <p className="font-medium text-gray-900">{tool.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tipo</p>
            <p className="font-medium text-gray-900">{tool.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Valor</p>
            <p className="font-medium text-gray-900">{formatCurrency(tool.value)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ubicación</p>
            <p className="font-medium text-gray-900 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {tool.location || 'No especificada'}
            </p>
          </div>
        </div>

        {/* Assignment Info */}
        {tool.currentAssignment && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Asignación Actual</span>
            </div>
            <div className="text-sm text-blue-800">
              <p><strong>Proyecto:</strong> {tool.currentAssignment.projectName}</p>
              <p><strong>Asignado:</strong> {formatDate(tool.currentAssignment.assignedDate)}</p>
              {tool.currentAssignment.expectedReturnDate && (
                <p><strong>Retorno esperado:</strong> {formatDate(tool.currentAssignment.expectedReturnDate)}</p>
              )}
            </div>
          </div>
        )}

        {/* Maintenance Info */}
        {tool.maintenanceSchedule?.nextMaintenance && (
          <div className={`border rounded-lg p-3 ${
            isMaintenanceDue(tool) 
              ? 'bg-red-50 border-red-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className={`w-4 h-4 ${
                isMaintenanceDue(tool) ? 'text-red-600' : 'text-gray-600'
              }`} />
              <span className={`text-sm font-medium ${
                isMaintenanceDue(tool) ? 'text-red-900' : 'text-gray-900'
              }`}>
                Próximo Mantenimiento
              </span>
              {isMaintenanceDue(tool) && (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div className={`text-sm ${
              isMaintenanceDue(tool) ? 'text-red-800' : 'text-gray-700'
            }`}>
              <p><strong>Fecha:</strong> {formatDate(tool.maintenanceSchedule.nextMaintenance)}</p>
              <p><strong>Tipo:</strong> {tool.maintenanceSchedule.maintenanceType}</p>
              {isMaintenanceDue(tool) && (
                <p className="font-medium text-red-800 mt-1">¡Requiere atención inmediata!</p>
              )}
            </div>
          </div>
        )}

        {/* Specifications */}
        {tool.specifications && tool.specifications.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Especificaciones</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tool.specifications.map((spec, index) => (
                <div key={index} className="text-sm">
                  <span className="text-gray-600">{spec.name}:</span>
                  <span className="font-medium text-gray-900 ml-1">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Purchase Info */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Fecha de compra:</span>
              <span className="font-medium text-gray-900 ml-1">
                {tool.purchaseDate ? formatDate(tool.purchaseDate) : 'No especificada'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Proveedor:</span>
              <span className="font-medium text-gray-900 ml-1">
                {tool.supplier || 'No especificado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer - Action Buttons */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onView(tool)}
            className="flex-1 min-w-[80px] bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>Ver</span>
          </button>
          
          <button
            onClick={() => onEdit(tool)}
            className="flex-1 min-w-[80px] bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </button>
          
          <button
            onClick={() => onAssign(tool)}
            disabled={tool.status === 'retired'}
            className="flex-1 min-w-[80px] bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <User className="w-4 h-4" />
            <span>Asignar</span>
          </button>
          
          <button
            onClick={() => onMaintenance(tool)}
            className={`flex-1 min-w-[80px] px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
              isMaintenanceDue(tool)
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Mant.</span>
          </button>
          
          <button
            onClick={() => onDelete(tool.id)}
            className="flex-1 min-w-[80px] bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;