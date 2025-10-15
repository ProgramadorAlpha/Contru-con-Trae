import React, { useState, useEffect } from 'react';
import { X, User, Calendar, MapPin, Plus, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Equipment } from '../../types/equipment';
import { equipmentAPI } from '../../lib/api';

interface EquipmentAssignmentProps {
  equipment: Equipment;
  onClose: () => void;
}

const EquipmentAssignment: React.FC<EquipmentAssignmentProps> = ({ equipment, onClose }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [unassigning, setUnassigning] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    projectId: '',
    assignedTo: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);

  useEffect(() => {
    loadData();
    checkCurrentAssignment();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Cargar proyectos y miembros del equipo
      // Esto debería venir de APIs reales en producción
      const mockProjects = [
        { id: 'proj-1', name: 'Proyecto Girassol', location: 'Lisboa' },
        { id: 'proj-2', name: 'Edificio Aurora', location: 'Porto' },
        { id: 'proj-3', name: 'Complejo Verde', location: 'Braga' }
      ];
      
      const mockTeamMembers = [
        { id: 'team-1', name: 'Carlos Rodriguez', role: 'Director de Proyecto' },
        { id: 'team-2', name: 'Ana Silva', role: 'Arquitecta' },
        { id: 'team-3', name: 'João Santos', role: 'Ingeniero Civil' }
      ];

      setProjects(mockProjects);
      setTeamMembers(mockTeamMembers);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentAssignment = () => {
    if (equipment.currentAssignment) {
      setCurrentAssignment(equipment.currentAssignment);
    }
  };

  const handleAssign = async () => {
    if (!assignmentData.projectId || !assignmentData.assignedTo) {
      alert('Por favor, complete todos los campos requeridos');
      return;
    }

    setAssigning(true);
    try {
      await equipmentAPI.assign(equipment.id, assignmentData);
      setShowAssignmentForm(false);
      setAssignmentData({
        projectId: '',
        assignedTo: '',
        startDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      // Recargar datos o cerrar modal
      onClose();
    } catch (error) {
      console.error('Error assigning equipment:', error);
      alert('Error al asignar el equipo. Por favor, intente nuevamente.');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    if (!window.confirm('¿Está seguro de que desea finalizar esta asignación?')) {
      return;
    }

    setUnassigning(true);
    try {
      await equipmentAPI.unassign(equipment.id);
      setCurrentAssignment(null);
      // Recargar datos o cerrar modal
      onClose();
    } catch (error) {
      console.error('Error unassigning equipment:', error);
      alert('Error al finalizar la asignación. Por favor, intente nuevamente.');
    } finally {
      setUnassigning(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh]">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando información...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Asignación de Equipo
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
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{equipment.name}</h3>
                <p className="text-sm text-gray-600">
                  {equipment.brand} {equipment.model} • {equipment.category}
                </p>
                <p className="text-sm text-gray-500">
                  Estado: {equipment.status === 'available' ? 'Disponible' : 
                           equipment.status === 'in_use' ? 'En uso' : 
                           equipment.status === 'maintenance' ? 'En mantenimiento' : 'Retirado'}
                </p>
              </div>
            </div>
          </div>

          {/* Current Assignment */}
          {currentAssignment && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-blue-900 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Asignación Actual</span>
                </h3>
                <button
                  onClick={handleUnassign}
                  disabled={unassigning}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {unassigning ? 'Finalizando...' : 'Finalizar Asignación'}
                </button>
              </div>
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
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Fecha de Asignación</p>
                    <p className="font-medium text-blue-900">{formatDate(currentAssignment.startDate)}</p>
                  </div>
                </div>
                {currentAssignment.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-blue-600">Notas</p>
                    <p className="font-medium text-blue-900">{currentAssignment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* New Assignment Form */}
          {!currentAssignment && !showAssignmentForm && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Equipo Disponible</h3>
              <p className="text-gray-600 mb-4">
                Este equipo está disponible para ser asignado a un proyecto.
              </p>
              <button
                onClick={() => setShowAssignmentForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 mx-auto transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Asignar Equipo</span>
              </button>
            </div>
          )}

          {showAssignmentForm && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Nueva Asignación</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proyecto *
                  </label>
                  <select
                    value={assignmentData.projectId}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, projectId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar proyecto</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {project.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsable *
                  </label>
                  <select
                    value={assignmentData.assignedTo}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar responsable</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    value={assignmentData.startDate}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas
                  </label>
                  <textarea
                    value={assignmentData.notes}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Notas adicionales sobre la asignación..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAssignmentForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  disabled={assigning}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assigning}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors disabled:opacity-50"
                >
                  {assigning ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Asignando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Asignar Equipo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentAssignment;