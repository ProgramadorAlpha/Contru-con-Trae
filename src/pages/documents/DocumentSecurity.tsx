import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Lock, Unlock, Eye, EyeOff, Users, UserPlus, 
  Settings, AlertTriangle, CheckCircle, Clock, Download,
  Upload, FileText, Key, Mail, Bell, History, Filter
} from 'lucide-react';
import { Document, DocumentPermissions, DocumentCollaborator } from '../../types/documents';

interface DocumentSecurityProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onPermissionsUpdate: (permissions: DocumentPermissions) => void;
  onCollaboratorAdd: (collaborator: DocumentCollaborator) => void;
  onCollaboratorRemove: (collaboratorId: string) => void;
}

export const DocumentSecurity: React.FC<DocumentSecurityProps> = ({
  document,
  isOpen,
  onClose,
  onPermissionsUpdate,
  onCollaboratorAdd,
  onCollaboratorRemove
}) => {
  const [permissions, setPermissions] = useState<DocumentPermissions>({
    canView: [],
    canEdit: [],
    canDelete: [],
    canShare: [],
    canDownload: [],
    canAnnotate: [],
    isPublic: false,
    requireApproval: false,
    encryptionLevel: 'none'
  });

  const [collaborators, setCollaborators] = useState<DocumentCollaborator[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState({
    email: '',
    role: 'viewer' as 'viewer' | 'editor' | 'admin' | 'owner',
    permissions: {
      canView: true,
      canEdit: false,
      canDelete: false,
      canShare: false,
      canDownload: true,
      canAnnotate: false
    }
  });
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [accessPassword, setAccessPassword] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    onAccess: true,
    onEdit: true,
    onShare: true,
    onDownload: true,
    emailNotifications: true
  });

  // Cargar datos de ejemplo
  useEffect(() => {
    if (isOpen && document) {
      // Permisos de ejemplo
      setPermissions({
        canView: ['user1', 'user2', 'group1'],
        canEdit: ['user1', 'user3'],
        canDelete: ['user1'],
        canShare: ['user1', 'user3'],
        canDownload: ['user1', 'user2', 'user3'],
        canAnnotate: ['user1', 'user2'],
        isPublic: false,
        requireApproval: true,
        encryptionLevel: 'medium'
      });

      // Colaboradores de ejemplo
      const sampleCollaborators: DocumentCollaborator[] = [
        {
          id: 'user1',
          email: 'carlos.rodriguez@constructora.com',
          name: 'Carlos Rodríguez',
          role: 'owner',
          avatar: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=3b82f6&color=fff',
          permissions: {
            canView: true,
            canEdit: true,
            canDelete: true,
            canShare: true,
            canDownload: true,
            canAnnotate: true
          },
          addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastAccess: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          id: 'user2',
          email: 'ana.martinez@constructora.com',
          name: 'Ana Martínez',
          role: 'editor',
          avatar: 'https://ui-avatars.com/api/?name=Ana+Martinez&background=10b981&color=fff',
          permissions: {
            canView: true,
            canEdit: true,
            canDelete: false,
            canShare: false,
            canDownload: true,
            canAnnotate: true
          },
          addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          lastAccess: new Date(Date.now() - 8 * 60 * 60 * 1000),
          status: 'active'
        },
        {
          id: 'user3',
          email: 'pedro.sanchez@constructora.com',
          name: 'Pedro Sánchez',
          role: 'viewer',
          avatar: 'https://ui-avatars.com/api/?name=Pedro+Sanchez&background=f59e0b&color=fff',
          permissions: {
            canView: true,
            canEdit: false,
            canDelete: false,
            canShare: false,
            canDownload: true,
            canAnnotate: false
          },
          addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          lastAccess: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 'active'
        }
      ];
      setCollaborators(sampleCollaborators);

      // Registro de auditoría de ejemplo
      const sampleAuditLog = [
        {
          id: 'audit1',
          userId: 'user1',
          userName: 'Carlos Rodríguez',
          action: 'document.viewed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          details: 'Documento visualizado',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...'
        },
        {
          id: 'audit2',
          userId: 'user2',
          userName: 'Ana Martínez',
          action: 'document.edited',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          details: 'Sección de especificaciones actualizada',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0...'
        },
        {
          id: 'audit3',
          userId: 'user3',
          userName: 'Pedro Sánchez',
          action: 'document.downloaded',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          details: 'Documento descargado',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0...'
        }
      ];
      setAuditLog(sampleAuditLog);
    }
  }, [isOpen, document]);

  const handlePermissionChange = (permission: keyof DocumentPermissions, value: any) => {
    const updatedPermissions = { ...permissions, [permission]: value };
    setPermissions(updatedPermissions);
    onPermissionsUpdate(updatedPermissions);
  };

  const handleAddCollaborator = () => {
    if (!newCollaborator.email.trim()) return;

    const collaborator: DocumentCollaborator = {
      id: `user_${Date.now()}`,
      email: newCollaborator.email,
      name: newCollaborator.email.split('@')[0],
      role: newCollaborator.role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newCollaborator.email)}&background=6366f1&color=fff`,
      permissions: newCollaborator.permissions,
      addedAt: new Date(),
      lastAccess: null,
      status: 'pending'
    };

    setCollaborators([...collaborators, collaborator]);
    onCollaboratorAdd(collaborator);
    
    // Reset form
    setNewCollaborator({
      email: '',
      role: 'viewer',
      permissions: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canShare: false,
        canDownload: true,
        canAnnotate: false
      }
    });
    setShowAddCollaborator(false);
  };

  const handleRemoveCollaborator = (collaboratorId: string) => {
    if (confirm('¿Está seguro de eliminar este colaborador?')) {
      setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
      onCollaboratorRemove(collaboratorId);
    }
  };

  const handleCollaboratorPermissionChange = (collaboratorId: string, permission: string, value: boolean) => {
    const updatedCollaborators = collaborators.map(collaborator => {
      if (collaborator.id === collaboratorId) {
        return {
          ...collaborator,
          permissions: {
            ...collaborator.permissions,
            [permission]: value
          }
        };
      }
      return collaborator;
    });
    setCollaborators(updatedCollaborators);
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'document.viewed': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'document.edited': return <FileText className="w-4 h-4 text-green-600" />;
      case 'document.downloaded': return <Download className="w-4 h-4 text-purple-600" />;
      case 'document.shared': return <Users className="w-4 h-4 text-orange-600" />;
      default: return <History className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold">Seguridad y Permisos</h2>
              <p className="text-sm text-gray-500">{document.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-80 border-r bg-gray-50">
              <div className="p-4 space-y-4">
                {/* Security Level */}
                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="font-medium text-gray-900 mb-3">Nivel de Seguridad</h3>
                  <div className="space-y-3">
                    <select
                      value={securityLevel}
                      onChange={(e) => setSecurityLevel(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="low">Bajo</option>
                      <option value="medium">Medio</option>
                      <option value="high">Alto</option>
                      <option value="critical">Crítico</option>
                    </select>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getSecurityLevelColor(securityLevel)}`}>
                      {securityLevel === 'low' && 'Acceso público permitido'}
                      {securityLevel === 'medium' && 'Control de acceso básico'}
                      {securityLevel === 'high' && 'Control de acceso estricto'}
                      {securityLevel === 'critical' && 'Acceso restringido y auditado'}
                    </span>
                  </div>
                </div>

                {/* Quick Settings */}
                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="font-medium text-gray-900 mb-3">Configuración Rápida</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={permissions.isPublic}
                        onChange={(e) => handlePermissionChange('isPublic', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Acceso público</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={permissions.requireApproval}
                        onChange={(e) => handlePermissionChange('requireApproval', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Requerir aprobación</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={encryptionEnabled}
                        onChange={(e) => setEncryptionEnabled(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Encriptación</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={watermarkEnabled}
                        onChange={(e) => setWatermarkEnabled(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Marca de agua</span>
                    </label>
                  </div>
                </div>

                {/* Access Control */}
                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="font-medium text-gray-900 mb-3">Control de Acceso</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña de acceso</label>
                      <input
                        type="password"
                        value={accessPassword}
                        onChange={(e) => setAccessPassword(e.target.value)}
                        placeholder="Opcional"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de expiración</label>
                      <input
                        type="date"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="font-medium text-gray-900 mb-3">Notificaciones</h3>
                  <div className="space-y-2">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotificationSettings({...notificationSettings, [key]: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <span className="text-xs text-gray-700">
                          {key === 'onAccess' && 'En acceso'}
                          {key === 'onEdit' && 'En edición'}
                          {key === 'onShare' && 'En compartir'}
                          {key === 'onDownload' && 'En descarga'}
                          {key === 'emailNotifications' && 'Email'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div className="p-6">
                  {/* Collaborators */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Colaboradores</h3>
                      <button
                        onClick={() => setShowAddCollaborator(true)}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Agregar</span>
                      </button>
                    </div>

                    {/* Add Collaborator Form */}
                    {showAddCollaborator && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              value={newCollaborator.email}
                              onChange={(e) => setNewCollaborator({...newCollaborator, email: e.target.value})}
                              placeholder="usuario@empresa.com"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                            <select
                              value={newCollaborator.role}
                              onChange={(e) => setNewCollaborator({...newCollaborator, role: e.target.value as any})}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            >
                              <option value="viewer">Visualizador</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Administrador</option>
                              <option value="owner">Propietario</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-end space-x-3 mt-4">
                          <button
                            onClick={() => setShowAddCollaborator(false)}
                            className="px-3 py-2 text-gray-700 border border-gray-300 rounded text-sm hover:bg-gray-50"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleAddCollaborator}
                            className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Collaborators List */}
                    <div className="space-y-3">
                      {collaborators.map((collaborator) => (
                        <div key={collaborator.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={collaborator.avatar}
                              alt={collaborator.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{collaborator.name}</div>
                              <div className="text-sm text-gray-500">{collaborator.email}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  collaborator.role === 'owner' ? 'bg-red-100 text-red-800' :
                                  collaborator.role === 'admin' ? 'bg-orange-100 text-orange-800' :
                                  collaborator.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {collaborator.role}
                                </span>
                                {collaborator.status === 'pending' && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                    Pendiente
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            {/* Permissions */}
                            <div className="flex items-center space-x-2">
                              {Object.entries(collaborator.permissions).map(([permission, hasAccess]) => (
                                <button
                                  key={permission}
                                  onClick={() => handleCollaboratorPermissionChange(collaborator.id, permission, !hasAccess)}
                                  className={`p-2 rounded ${
                                    hasAccess ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                  }`}
                                  title={permission.replace('can', '').toLowerCase()}
                                >
                                  {permission === 'canView' && <Eye className="w-4 h-4" />}
                                  {permission === 'canEdit' && <FileText className="w-4 h-4" />}
                                  {permission === 'canDelete' && <Trash2 className="w-4 h-4" />}
                                  {permission === 'canShare' && <Users className="w-4 h-4" />}
                                  {permission === 'canDownload' && <Download className="w-4 h-4" />}
                                  {permission === 'canAnnotate' && <Settings className="w-4 h-4" />}
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() => handleRemoveCollaborator(collaborator.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                              title="Eliminar colaborador"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audit Log */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Registro de Auditoría</h3>
                      <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        <span>Filtrar</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {auditLog.map((log) => (
                        <div key={log.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                          <div className="flex-shrink-0 mt-1">
                            {getActionIcon(log.action)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-gray-900">{log.userName}</div>
                              <div className="text-sm text-gray-500">
                                {log.timestamp.toLocaleString()}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{log.details}</div>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Key className="w-3 h-3" />
                                <span>{log.ipAddress}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>Hace {Math.floor((Date.now() - log.timestamp.getTime()) / (1000 * 60 * 60))}h</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};