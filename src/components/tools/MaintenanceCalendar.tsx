import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, Wrench, AlertTriangle, CheckCircle, Filter, ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import { MaintenanceRecord, MaintenanceSchedule, Tool } from '../../types/tools';

interface MaintenanceCalendarProps {
  tools: Tool[];
  maintenanceRecords: MaintenanceRecord[];
  isOpen: boolean;
  onClose: () => void;
  onScheduleMaintenance: (toolId: string, schedule: Omit<MaintenanceSchedule, 'id'>) => void;
  onUpdateMaintenance: (recordId: string, updates: Partial<MaintenanceRecord>) => void;
  onDeleteMaintenance: (recordId: string) => void;
}

const MaintenanceCalendar: React.FC<MaintenanceCalendarProps> = ({
  tools,
  maintenanceRecords,
  isOpen,
  onClose,
  onScheduleMaintenance,
  onUpdateMaintenance,
  onDeleteMaintenance
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [selectedTool, setSelectedTool] = useState<string>('');

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

  const getMonthName = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getMaintenanceForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return maintenanceRecords.filter(record => {
      const recordDate = new Date(record.date).toISOString().split('T')[0];
      return recordDate === dateStr;
    });
  };

  const getUpcomingMaintenance = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return tools.filter(tool => tool.maintenanceSchedule?.nextMaintenance)
      .filter(tool => {
        const nextMaintenance = new Date(tool.maintenanceSchedule!.nextMaintenance);
        return nextMaintenance >= today && nextMaintenance <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.maintenanceSchedule!.nextMaintenance).getTime() - new Date(b.maintenanceSchedule!.nextMaintenance).getTime());
  };

  const getOverdueMaintenance = () => {
    const today = new Date();
    return tools.filter(tool => tool.maintenanceSchedule?.nextMaintenance)
      .filter(tool => new Date(tool.maintenanceSchedule!.nextMaintenance) < today)
      .sort((a, b) => new Date(a.maintenanceSchedule!.nextMaintenance).getTime() - new Date(b.maintenanceSchedule!.nextMaintenance).getTime());
  };

  const filteredRecords = useMemo(() => {
    let filtered = maintenanceRecords;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus);
    }

    if (selectedTool) {
      filtered = filtered.filter(record => record.toolId === selectedTool);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [maintenanceRecords, filterStatus, selectedTool]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getStatusColor = (status: string, isOverdue: boolean = false) => {
    if (isOverdue) return 'bg-red-100 text-red-800';
    
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'cancelled':
        return <X className="w-3 h-3" />;
      default:
        return <Wrench className="w-3 h-3" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Calendario de Mantenimiento</h2>
              <p className="text-sm text-gray-600">Gestión de mantenimiento de herramientas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            {/* View Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'month', label: 'Mes' },
                  { id: 'week', label: 'Semana' },
                  { id: 'list', label: 'Lista' }
                ].map(view => (
                  <button
                    key={view.id}
                    onClick={() => setViewMode(view.id as any)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === view.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {view.label}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              {viewMode === 'month' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-medium text-gray-900 min-w-[120px] text-center">
                    {getMonthName(currentDate)}
                  </span>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="completed">Completados</option>
                <option value="cancelled">Cancelados</option>
              </select>

              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las herramientas</option>
                {tools.map(tool => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name} - {tool.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {viewMode === 'month' && (
            <div className="space-y-6">
              {/* Calendar Grid */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-7 bg-gray-50">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {getDaysInMonth(currentDate).map((day, index) => (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border-r border-b border-gray-200 last:border-r-0 ${
                        day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                      }`}
                    >
                      {day && (
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {getMaintenanceForDate(day).slice(0, 2).map((record, idx) => (
                              <div
                                key={idx}
                                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(record.status)}`}
                              >
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(record.status)}
                                  <span className="truncate">
                                    {tools.find(tool => tool.id === record.toolId)?.name || 'Herramienta'}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {getMaintenanceForDate(day).length > 2 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{getMaintenanceForDate(day).length - 2} más
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Maintenance */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Mantenimiento Próximo (30 días)
                </h3>
                <div className="space-y-2">
                  {getUpcomingMaintenance().map(eq => (
                    <div key={eq.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <Wrench className="w-4 h-4 text-yellow-600" />
                        <div>
                          <p className="font-medium text-gray-900">{eq.name}</p>
                          <p className="text-sm text-gray-600">{eq.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-yellow-800">
                          {formatDate(eq.maintenanceSchedule!.nextMaintenance)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {eq.maintenanceSchedule!.maintenanceType}
                        </p>
                      </div>
                    </div>
                  ))}
                  {getUpcomingMaintenance().length === 0 && (
                    <p className="text-yellow-700 text-center py-4">No hay mantenimiento programado para los próximos 30 días</p>
                  )}
                </div>
              </div>

              {/* Overdue Maintenance */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Mantenimiento Vencido
                </h3>
                <div className="space-y-2">
                  {getOverdueMaintenance().map(eq => (
                    <div key={eq.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <div>
                          <p className="font-medium text-gray-900">{eq.name}</p>
                          <p className="text-sm text-gray-600">{eq.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-800">
                          Vencido: {formatDate(eq.maintenanceSchedule!.nextMaintenance)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {eq.maintenanceSchedule!.maintenanceType}
                        </p>
                      </div>
                    </div>
                  ))}
                  {getOverdueMaintenance().length === 0 && (
                    <p className="text-red-700 text-center py-4">No hay mantenimiento vencido</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredRecords.length > 0 ? (
                filteredRecords.map(record => {
                  const tool = tools.find(t => t.id === record.toolId);
                  const isOverdue = record.status === 'pending' && new Date(record.date) < new Date();
                  
                  return (
                    <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${getStatusColor(record.status, isOverdue)}`}>
                            {getStatusIcon(record.status)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{tool?.name || 'Herramienta no encontrada'}</h4>
                            <p className="text-sm text-gray-600">{tool?.code}</p>
                            <p className="text-sm text-gray-500">{record.type} - {formatDateTime(record.date)}</p>
                            {record.description && (
                              <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Costo: {record.cost}€</span>
                              <span>Técnico: {record.technician}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {record.status === 'pending' && (
                            <button
                              onClick={() => onUpdateMaintenance(record.id, { status: 'completed' })}
                              className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                              title="Marcar como completado"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onUpdateMaintenance(record.id, { status: 'cancelled' })}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Cancelar mantenimiento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay registros de mantenimiento</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCalendar;