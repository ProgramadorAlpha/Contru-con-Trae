import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, User, FileText, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Tool } from '../../types/tools';
import { toolAPI } from '../../lib/api';

interface ToolMaintenanceProps {
  tool: Tool;
  onClose: () => void;
}

const ToolMaintenance: React.FC<ToolMaintenanceProps> = ({ tool, onClose }) => {
  const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [formData, setFormData] = useState({
    type: 'preventive',
    description: '',
    scheduledDate: '',
    cost: '',
    technician: '',
    notes: ''
  });

  useEffect(() => {
    loadMaintenanceHistory();
  }, [tool.id]);

  const loadMaintenanceHistory = async () => {
    try {
      setLoading(true);
      const history = await toolAPI.getMaintenanceHistory(tool.id);
      setMaintenanceHistory(history);
    } catch (error) {
      console.error('Error loading maintenance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMaintenance = async () => {
    if (!formData.description || !formData.scheduledDate || !formData.technician) {
      alert('Por favor, complete todos los campos requeridos');
      return;
    }

    setScheduling(true);
    try {
      const maintenanceData = {
        ...formData,
        cost: formData.cost ? Number(formData.cost) : 0,
      };

      await toolAPI.scheduleMaintenance(tool.id, maintenanceData);
      setShowForm(false);
      setFormData({
        type: 'preventive',
        description: '',
        scheduledDate: '',
        cost: '',
        technician: '',
        notes: ''
      });
      loadMaintenanceHistory();
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      alert('Error al programar el mantenimiento. Por favor, intente nuevamente.');
    } finally {
      setScheduling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'preventive': return 'bg-purple-100 text-purple-800';
      case 'corrective': return 'bg-orange-100 text-orange-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const isOverdue = (scheduledDate: string, status: string) => {
    return status === 'scheduled' && new Date(scheduledDate) < new Date();
  };

  const upcomingMaintenance = maintenanceHistory.filter(m => {
    const scheduledDate = new Date(m.scheduledDate);
    const daysDiff = Math.ceil((scheduledDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return m.status === 'scheduled' && daysDiff <= 30 && daysDiff >= 0;
  });

  const overdueMaintenance = maintenanceHistory.filter(m => isOverdue(m.scheduledDate, m.status));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Mantenimiento de Herramienta
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Equipment Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                <p className="text-sm text-gray-600">
                  {tool.brand} {tool.model} • {tool.category}
                </p>
                <p className="text-sm text-gray-500">
                  Estado: {tool.status === 'available' ? 'Disponible' : 
                           tool.status === 'in_use' ? 'En uso' : 
                           tool.status === 'maintenance' ? 'En mantenimiento' : 'Retirado'}
                </p>
              </div>
            </div>
          </div>

          {/* Maintenance Alerts */}
          {(upcomingMaintenance.length > 0 || overdueMaintenance.length > 0) && (
            <div className="mb-6 space-y-4">
              {overdueMaintenance.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">Mantenimientos Vencidos</h3>
                  </div>
                  <p className="text-red-800 text-sm">
                    Hay {overdueMaintenance.length} mantenimiento(s) vencido(s) que requieren atención inmediata.
                  </p>
                </div>
              )}
              
              {upcomingMaintenance.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-900">Mantenimientos Próximos</h3>
                  </div>
                  <p className="text-yellow-800 text-sm">
                    Hay {upcomingMaintenance.length} mantenimiento(s) programado(s) para los próximos 30 días.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Historial de Mantenimiento</h3>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Programar Mantenimiento</span>
            </button>
          </div>

          {/* Maintenance List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando historial de mantenimiento...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceHistory.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay registros de mantenimiento disponibles</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Programar el primer mantenimiento
                  </button>
                </div>
              ) : (
                maintenanceHistory.map((maintenance) => (
                  <div key={maintenance.id} className={`border rounded-lg p-4 ${
                    isOverdue(maintenance.scheduledDate, maintenance.status) 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(maintenance.type)}`}>
                          {maintenance.type === 'preventive' && 'Preventivo'}
                          {maintenance.type === 'corrective' && 'Correctivo'}
                          {maintenance.type === 'emergency' && 'Emergencia'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(maintenance.status)}`}>
                          {maintenance.status === 'scheduled' && 'Programado'}
                          {maintenance.status === 'in_progress' && 'En Progreso'}
                          {maintenance.status === 'completed' && 'Completado'}
                        </span>
                        {isOverdue(maintenance.scheduledDate, maintenance.status) && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Vencido
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Programado</p>
                        <p className="font-medium">{formatDate(maintenance.scheduledDate)}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-1">{maintenance.description}</h4>
                      {maintenance.notes && (
                        <p className="text-sm text-gray-600">{maintenance.notes}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Técnico</p>
                          <p className="font-medium">{maintenance.technician}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Costo Estimado</p>
                          <p className="font-medium">{formatCurrency(maintenance.cost)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Estado</p>
                          <p className="font-medium">
                            {maintenance.status === 'scheduled' && 'Pendiente'}
                            {maintenance.status === 'in_progress' && 'En progreso'}
                            {maintenance.status === 'completed' && 'Completado'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {maintenance.completedDate && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-gray-600">Completado el</p>
                            <p className="font-medium text-green-700">{formatDate(maintenance.completedDate)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Schedule Maintenance Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Programar Mantenimiento
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Mantenimiento
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="preventive">Preventivo</option>
                      <option value="corrective">Correctivo</option>
                      <option value="emergency">Emergencia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Programada *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Técnico Responsable *
                    </label>
                    <input
                      type="text"
                      value={formData.technician}
                      onChange={(e) => setFormData(prev => ({ ...prev, technician: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre del técnico"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Costo Estimado (€)
                    </label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Descripción del trabajo de mantenimiento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Adicionales
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Notas adicionales..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    disabled={scheduling}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleScheduleMaintenance}
                    disabled={scheduling}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    {scheduling ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Programando...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span>Programar Mantenimiento</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolMaintenance;