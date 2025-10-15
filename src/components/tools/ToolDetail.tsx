import React, { useState } from 'react';
import { X, Edit, Calendar, DollarSign, MapPin, User, Wrench, Package, Tag, FileText, Download, Upload, History, AlertTriangle, CheckCircle, Clock, Mail, Phone, Building } from 'lucide-react';
import { Tool, MaintenanceRecord, ToolAssignment } from '../../types/tools';

interface ToolDetailProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (tool: Tool) => void;
  onAssign: (tool: Tool) => void;
  onMaintenance: (tool: Tool) => void;
  onUploadDocument: (toolId: string, file: File) => void;
  onDownloadDocument: (documentId: string) => void;
}

const ToolDetail: React.FC<ToolDetailProps> = ({
  tool,
  isOpen,
  onClose,
  onEdit,
  onAssign,
  onMaintenance,
  onUploadDocument,
  onDownloadDocument
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'assignments' | 'documents'>('overview');
  const [uploadingFile, setUploadingFile] = useState(false);

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
        return <CheckCircle className="w-4 h-4" />;
      case 'assigned':
        return <User className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      case 'retired':
        return <Clock className="w-4 h-4" />;
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
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const formatDateTime = (date: string | Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const isMaintenanceDue = () => {
    if (!tool.maintenanceSchedule?.nextMaintenance) return false;
    const today = new Date();
    const nextMaintenance = new Date(tool.maintenanceSchedule.nextMaintenance);
    const daysUntilMaintenance = Math.ceil((nextMaintenance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilMaintenance <= 7;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      await onUploadDocument(tool.id, file);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{tool.name}</h2>
              <p className="text-gray-600">{tool.brand} {tool.model}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-500">ID: {tool.code}</span>
                <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tool.status)}`}>
                  {getStatusIcon(tool.status)}
                  <span>{getStatusLabel(tool.status)}</span>
                </span>
                {isMaintenanceDue() && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Mantenimiento Próximo</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-3 bg-white border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onEdit(tool)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Editar</span>
            </button>
            
            <button
              onClick={() => onAssign(tool)}
              disabled={tool.status === 'retired'}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Asignar</span>
            </button>
            
            <button
              onClick={() => onMaintenance(tool)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <Wrench className="w-4 h-4" />
              <span>Mantenimiento</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-6">
            {[
              { id: 'overview', label: 'General', icon: Package },
              { id: 'maintenance', label: 'Mantenimiento', icon: Wrench },
              { id: 'assignments', label: 'Asignaciones', icon: User },
              { id: 'documents', label: 'Documentos', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Categoría</p>
                    <p className="font-medium text-gray-900 capitalize">{tool.category.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo</p>
                    <p className="font-medium text-gray-900 capitalize">{tool.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Marca</p>
                    <p className="font-medium text-gray-900">{tool.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Modelo</p>
                    <p className="font-medium text-gray-900">{tool.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Número de Serie</p>
                    <p className="font-medium text-gray-900">{tool.serialNumber || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ubicación</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {tool.location || 'No especificada'}
                    </p>
                  </div>
                </div>
                {tool.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Descripción</p>
                    <p className="text-gray-900 mt-1">{tool.description}</p>
                  </div>
                )}
              </div>

              {/* Financial Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Información Financiera
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Valor</p>
                    <p className="font-medium text-gray-900">{formatCurrency(tool.value)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Compra</p>
                    <p className="font-medium text-gray-900">
                      {tool.purchaseDate ? formatDate(tool.purchaseDate) : 'No especificada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vencimiento de Garantía</p>
                    <p className="font-medium text-gray-900">
                      {tool.warrantyExpiry ? formatDate(tool.warrantyExpiry) : 'No especificada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Proveedor</p>
                    <p className="font-medium text-gray-900">{tool.supplier || 'No especificado'}</p>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              {tool.specifications && tool.specifications.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Especificaciones
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tool.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <span className="text-sm text-gray-600">{spec.name}</span>
                        <span className="font-medium text-gray-900">
                          {spec.value} {spec.unit && <span className="text-gray-500">{spec.unit}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              {/* Current Maintenance Schedule */}
              {tool.maintenanceSchedule && (
                <div className={`p-6 rounded-lg border-2 ${
                  isMaintenanceDue() 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-4">
                    {isMaintenanceDue() ? (
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    ) : (
                      <Calendar className="w-6 h-6 text-blue-600" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isMaintenanceDue() ? '¡Mantenimiento Requerido!' : 'Próximo Mantenimiento Programado'}
                      </h3>
                      <p className={`text-sm ${
                        isMaintenanceDue() ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {formatDateTime(tool.maintenanceSchedule.nextMaintenance)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tipo de Mantenimiento</p>
                      <p className="font-medium text-gray-900">{tool.maintenanceSchedule.maintenanceType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Frecuencia</p>
                      <p className="font-medium text-gray-900">{tool.maintenanceSchedule.frequency}</p>
                    </div>
                  </div>
                  {tool.maintenanceSchedule.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Notas</p>
                      <p className="text-gray-900 mt-1">{tool.maintenanceSchedule.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Maintenance History */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Historial de Mantenimiento
                </h3>
                {tool.maintenanceHistory && tool.maintenanceHistory.length > 0 ? (
                  <div className="space-y-4">
                    {tool.maintenanceHistory.map((record, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Wrench className="w-4 h-4 text-gray-600" />
                              <span className="font-medium text-gray-900">{record.type}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === 'completed' ? 'bg-green-100 text-green-800' :
                                record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {record.status === 'completed' ? 'Completado' :
                                 record.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Fecha:</span>
                                <span className="font-medium text-gray-900 ml-1">{formatDate(record.date)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Costo:</span>
                                <span className="font-medium text-gray-900 ml-1">{formatCurrency(record.cost)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Responsable:</span>
                                <span className="font-medium text-gray-900 ml-1">{record.technician}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay registros de mantenimiento</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-6">
              {/* Current Assignment */}
              {tool.currentAssignment && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Asignación Actual
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Proyecto</p>
                      <p className="font-medium text-gray-900">{tool.currentAssignment.projectName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Asignación</p>
                      <p className="font-medium text-gray-900">{formatDate(tool.currentAssignment.assignedDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Responsable</p>
                      <p className="font-medium text-gray-900">{tool.currentAssignment.assignedTo}</p>
                    </div>
                    {tool.currentAssignment.expectedReturnDate && (
                      <div>
                        <p className="text-sm text-gray-600">Fecha de Retorno Esperada</p>
                        <p className="font-medium text-gray-900">{formatDate(tool.currentAssignment.expectedReturnDate)}</p>
                      </div>
                    )}
                  </div>
                  {tool.currentAssignment.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Notas</p>
                      <p className="text-gray-900 mt-1">{tool.currentAssignment.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Assignment History */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Historial de Asignaciones
                </h3>
                {tool.assignmentHistory && tool.assignmentHistory.length > 0 ? (
                  <div className="space-y-4">
                    {tool.assignmentHistory.map((assignment, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Building className="w-4 h-4 text-gray-600" />
                              <span className="font-medium text-gray-900">{assignment.projectName}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Asignado:</span>
                                <span className="font-medium text-gray-900 ml-1">{formatDate(assignment.assignedDate)}</span>
                              </div>
                              {assignment.returnDate && (
                                <div>
                                  <span className="text-gray-600">Retornado:</span>
                                  <span className="font-medium text-gray-900 ml-1">{formatDate(assignment.returnDate)}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-600">Responsable:</span>
                                <span className="font-medium text-gray-900 ml-1">{assignment.assignedTo}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay asignaciones anteriores</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Documentos
                </h3>
                <div className="relative">
                  <input
                    type="file"
                    id="document-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="document-upload"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploadingFile ? 'Subiendo...' : 'Subir Documento'}</span>
                  </label>
                </div>
              </div>

              {tool.documents && tool.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tool.documents.map((document, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <FileText className="w-8 h-8 text-gray-600" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{document.name}</p>
                            <p className="text-sm text-gray-600">{document.type}</p>
                            <p className="text-xs text-gray-500">{formatDate(document.uploadDate)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onDownloadDocument(document.id)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay documentos adjuntos</p>
                  <p className="text-sm text-gray-500 mt-2">Sube documentos como manuales, facturas o certificados</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolDetail;