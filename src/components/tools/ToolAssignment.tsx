import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Building, Mail, Phone, MapPin, AlertTriangle, CheckCircle, Save, UserPlus } from 'lucide-react';
import { Tool, ToolAssignment } from '../../types/tools';

interface ToolAssignmentProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assignment: Omit<ToolAssignment, 'id'>) => void;
  onUnassign: (toolId: string) => void;
  availableProjects: Array<{ id: string; name: string; location: string; manager: string }>;
  availableUsers: Array<{ id: string; name: string; email: string; phone: string; role: string }>;
}

const ToolAssignmentModal: React.FC<ToolAssignmentProps> = ({
  tool,
  isOpen,
  onClose,
  onAssign,
  onUnassign,
  availableProjects,
  availableUsers
}) => {
  const [assignmentType, setAssignmentType] = useState<'project' | 'user'>('project');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [assignmentDate, setAssignmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [customUserName, setCustomUserName] = useState('');
  const [customUserEmail, setCustomUserEmail] = useState('');
  const [customUserPhone, setCustomUserPhone] = useState('');
  const [useCustomUser, setUseCustomUser] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setAssignmentType('project');
      setSelectedProject('');
      setSelectedUser('');
      setAssignmentDate(new Date().toISOString().split('T')[0]);
      setExpectedReturnDate('');
      setNotes('');
      setCustomUserName('');
      setCustomUserEmail('');
      setCustomUserPhone('');
      setUseCustomUser(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let assignedTo = '';
    let projectName = '';

    if (assignmentType === 'project') {
      const project = availableProjects.find(p => p.id === selectedProject);
      if (project) {
        assignedTo = project.manager;
        projectName = project.name;
      }
    } else {
      if (useCustomUser) {
        assignedTo = customUserName;
      } else {
        const user = availableUsers.find(u => u.id === selectedUser);
        if (user) {
          assignedTo = user.name;
        }
      }
      projectName = assignedTo;
    }

    const assignment: Omit<ToolAssignment, 'id'> = {
      toolId: tool.id,
      projectId: assignmentType === 'project' ? selectedProject : undefined,
      projectName,
      assignedTo,
      assignedDate: assignmentDate,
      expectedReturnDate: expectedReturnDate || undefined,
      status: 'active',
      notes: notes || '',
      assignedBy: 'current_user',
      startDate: assignmentDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAssign(assignment);
    onClose();
  };

  const handleUnassign = () => {
    if (window.confirm(`¿Está seguro de que desea desasignar la herramienta ${tool.name}?`)) {
      onUnassign(tool.id);
      onClose();
    }
  };

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

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {tool.currentAssignment ? 'Gestión de Asignación' : 'Asignar Herramienta'}
              </h2>
              <p className="text-sm text-gray-600">{tool.name} - {tool.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Assignment Info */}
        {tool.currentAssignment && (
          <div className="p-6 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Asignación Actual</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-blue-800">
                    <Building className="w-4 h-4 inline mr-1" />
                    Proyecto: {tool.currentAssignment.projectName}
                  </p>
                  <p className="text-blue-800">
                    <User className="w-4 h-4 inline mr-1" />
                    Responsable: {tool.currentAssignment.assignedTo}
                  </p>
                  <p className="text-blue-800">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Desde: {formatDate(tool.currentAssignment.assignedDate)}
                  </p>
                  {tool.currentAssignment.expectedReturnDate && (
                    <p className="text-blue-800">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Retorno esperado: {formatDate(tool.currentAssignment.expectedReturnDate)}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleUnassign}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Desasignar
              </button>
            </div>
          </div>
        )}

        {/* Assignment Form */}
        {!tool.currentAssignment && (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-6">
              {/* Assignment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Asignación
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="assignmentType"
                      value="project"
                      checked={assignmentType === 'project'}
                      onChange={(e) => setAssignmentType(e.target.value as 'project' | 'user')}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Asignar a Proyecto</div>
                      <div className="text-sm text-gray-600">Asignar herramienta a un proyecto específico</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="assignmentType"
                      value="user"
                      checked={assignmentType === 'user'}
                      onChange={(e) => setAssignmentType(e.target.value as 'project' | 'user')}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Asignar a Usuario</div>
                      <div className="text-sm text-gray-600">Asignar herramienta a un responsable específico</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Project Selection */}
              {assignmentType === 'project' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Seleccionar Proyecto
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccione un proyecto...</option>
                    {availableProjects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {project.location}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* User Selection */}
              {assignmentType === 'user' && (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={useCustomUser}
                        onChange={(e) => setUseCustomUser(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        <UserPlus className="w-4 h-4 inline mr-1" />
                        Usar responsable personalizado
                      </span>
                    </label>
                  </div>

                  {useCustomUser ? (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre del Responsable *
                        </label>
                        <input
                          type="text"
                          value={customUserName}
                          onChange={(e) => setCustomUserName(e.target.value)}
                          required
                          placeholder="Ingrese el nombre completo..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          value={customUserEmail}
                          onChange={(e) => setCustomUserEmail(e.target.value)}
                          placeholder="correo@ejemplo.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={customUserPhone}
                          onChange={(e) => setCustomUserPhone(e.target.value)}
                          placeholder="+1 234 567 8900"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccionar Usuario
                      </label>
                      <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleccione un usuario...</option>
                        {availableUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} - {user.role}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Assignment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha de Asignación *
                </label>
                <input
                  type="date"
                  value={assignmentDate}
                  onChange={(e) => setAssignmentDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Expected Return Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha de Retorno Esperada (Opcional)
                </label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  min={assignmentDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (Opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Ingrese cualquier información adicional sobre la asignación..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Alerts */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Importante</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Una vez asignada, la herramienta no estará disponible para otras asignaciones hasta que sea devuelta o desasignada.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Asignar Herramienta</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ToolAssignmentModal;