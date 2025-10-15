import React, { useState } from 'react';
import { 
  X, Copy, Mail, Link, Clock, Shield, Users, UserPlus, Settings, 
  Eye, Edit3, Download, Trash2, MessageSquare, Bell, CheckCircle 
} from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  avatar?: string;
  addedAt: string;
  lastAccess?: string;
}

interface ShareLink {
  id: string;
  url: string;
  permissions: 'view' | 'comment' | 'edit';
  expiresAt?: string;
  password?: string;
  isActive: boolean;
  createdAt: string;
  accessCount: number;
}

interface ShareSettings {
  allowDownload: boolean;
  allowPrint: boolean;
  allowComment: boolean;
  notifyChanges: boolean;
  requireApproval: boolean;
  watermark: boolean;
}

interface DocumentSharingProps {
  document: any;
  isOpen: boolean;
  onClose: () => void;
  onShare: (settings: any) => void;
}

const DocumentSharing: React.FC<DocumentSharingProps> = ({
  document,
  isOpen,
  onClose,
  onShare
}) => {
  const [activeTab, setActiveTab] = useState<'collaborators' | 'links' | 'settings'>('collaborators');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan@constructpro.com',
      role: 'admin',
      addedAt: '2024-01-15T10:30:00Z',
      lastAccess: '2024-01-20T14:25:00Z'
    },
    {
      id: '2',
      name: 'María García',
      email: 'maria@constructpro.com',
      role: 'editor',
      addedAt: '2024-01-16T09:15:00Z',
      lastAccess: '2024-01-19T16:40:00Z'
    }
  ]);

  const [shareLinks, setShareLinks] = useState<ShareLink[]>([
    {
      id: '1',
      url: 'https://constructpro.com/share/doc/abc123',
      permissions: 'view',
      expiresAt: '2024-02-15T23:59:59Z',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      accessCount: 5
    }
  ]);

  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    allowDownload: true,
    allowPrint: true,
    allowComment: true,
    notifyChanges: true,
    requireApproval: false,
    watermark: false
  });

  const [newCollaborator, setNewCollaborator] = useState({
    email: '',
    role: 'viewer' as 'viewer' | 'editor' | 'admin'
  });

  const [newLinkSettings, setNewLinkSettings] = useState({
    permissions: 'view' as 'view' | 'comment' | 'edit',
    expiresIn: '7' as string,
    password: '',
    requirePassword: false
  });

  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const rolePermissions = {
    viewer: { icon: Eye, label: 'Ver', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    editor: { icon: Edit3, label: 'Editar', color: 'text-green-600', bgColor: 'bg-green-50' },
    admin: { icon: Shield, label: 'Admin', color: 'text-purple-600', bgColor: 'bg-purple-50' }
  };

  const addCollaborator = () => {
    if (!newCollaborator.email) return;

    const collaborator: Collaborator = {
      id: Date.now().toString(),
      name: newCollaborator.email.split('@')[0],
      email: newCollaborator.email,
      role: newCollaborator.role,
      addedAt: new Date().toISOString(),
      lastAccess: undefined
    };

    setCollaborators([...collaborators, collaborator]);
    setNewCollaborator({ email: '', role: 'viewer' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const updateCollaboratorRole = (id: string, role: 'viewer' | 'editor' | 'admin') => {
    setCollaborators(collaborators.map(c => 
      c.id === id ? { ...c, role } : c
    ));
  };

  const removeCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
  };

  const createShareLink = () => {
    const expiresAt = newLinkSettings.expiresIn === 'never' 
      ? undefined 
      : new Date(Date.now() + parseInt(newLinkSettings.expiresIn) * 24 * 60 * 60 * 1000).toISOString();

    const newLink: ShareLink = {
      id: Date.now().toString(),
      url: `https://constructpro.com/share/doc/${document.id}/${Date.now()}`,
      permissions: newLinkSettings.permissions,
      expiresAt,
      password: newLinkSettings.requirePassword ? newLinkSettings.password : undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      accessCount: 0
    };

    setShareLinks([...shareLinks, newLink]);
    setCopiedLink(newLink.url);
    navigator.clipboard.writeText(newLink.url);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const toggleLinkStatus = (id: string) => {
    setShareLinks(shareLinks.map(link => 
      link.id === id ? { ...link, isActive: !link.isActive } : link
    ));
  };

  const deleteLink = (id: string) => {
    setShareLinks(shareLinks.filter(link => link.id !== id));
  };

  const sendInvitations = () => {
    // Simular envío de invitaciones
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Compartir Documento</h2>
              <p className="text-sm text-gray-500">{document?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">Acción realizada con éxito</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'collaborators'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Colaboradores</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {collaborators.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'links'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Link className="w-4 h-4" />
              <span>Enlaces</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {shareLinks.filter(l => l.isActive).length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'collaborators' && (
            <div className="space-y-6">
              {/* Add Collaborator */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Agregar Colaborador</h3>
                <div className="flex space-x-3">
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={newCollaborator.email}
                    onChange={(e) => setNewCollaborator({...newCollaborator, email: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={newCollaborator.role}
                    onChange={(e) => setNewCollaborator({...newCollaborator, role: e.target.value as any})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="viewer">Ver</option>
                    <option value="editor">Editar</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={addCollaborator}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>

              {/* Collaborators List */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Colaboradores ({collaborators.length})</h3>
                <div className="space-y-3">
                  {collaborators.map((collaborator) => {
                    const RoleIcon = rolePermissions[collaborator.role].icon;
                    return (
                      <div key={collaborator.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{collaborator.name}</div>
                            <div className="text-xs text-gray-500">{collaborator.email}</div>
                            <div className="text-xs text-gray-400">
                              Agregado: {formatDate(collaborator.addedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={collaborator.role}
                            onChange={(e) => updateCollaboratorRole(collaborator.id, e.target.value as any)}
                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="viewer">Ver</option>
                            <option value="editor">Editar</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => removeCollaborator(collaborator.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Send Invitations */}
              <div className="flex justify-end">
                <button
                  onClick={sendInvitations}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Enviar Invitaciones</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-6">
              {/* Create New Link */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Crear Enlace de Compartir</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <select
                    value={newLinkSettings.permissions}
                    onChange={(e) => setNewLinkSettings({...newLinkSettings, permissions: e.target.value as any})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="view">Solo ver</option>
                    <option value="comment">Comentar</option>
                    <option value="edit">Editar</option>
                  </select>
                  <select
                    value={newLinkSettings.expiresIn}
                    onChange={(e) => setNewLinkSettings({...newLinkSettings, expiresIn: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">1 día</option>
                    <option value="7">7 días</option>
                    <option value="30">30 días</option>
                    <option value="90">90 días</option>
                    <option value="never">Nunca</option>
                  </select>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requirePassword"
                      checked={newLinkSettings.requirePassword}
                      onChange={(e) => setNewLinkSettings({...newLinkSettings, requirePassword: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="requirePassword" className="text-sm text-gray-700">
                      Requerir contraseña
                    </label>
                  </div>
                </div>
                {newLinkSettings.requirePassword && (
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={newLinkSettings.password}
                    onChange={(e) => setNewLinkSettings({...newLinkSettings, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                  />
                )}
                <button
                  onClick={createShareLink}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <Link className="w-4 h-4" />
                  <span>Crear Enlace</span>
                </button>
              </div>

              {/* Share Links List */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Enlaces Activos ({shareLinks.length})</h3>
                <div className="space-y-3">
                  {shareLinks.map((link) => (
                    <div key={link.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Link className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 truncate flex-1">
                            {link.url}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleLinkStatus(link.id)}
                            className={`px-2 py-1 text-xs rounded ${
                              link.isActive 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {link.isActive ? 'Activo' : 'Inactivo'}
                          </button>
                          <button
                            onClick={() => copyLink(link.url)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            title="Copiar enlace"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteLink(link.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            title="Eliminar enlace"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>Permisos: {link.permissions}</span>
                          {link.expiresAt && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Expira: {formatDate(link.expiresAt)}</span>
                            </span>
                          )}
                          {link.password && (
                            <span className="flex items-center space-x-1 text-yellow-600">
                              <Shield className="w-3 h-3" />
                              <span>Con contraseña</span>
                            </span>
                          )}
                        </div>
                        <span>{link.accessCount} accesos</span>
                      </div>
                      {copiedLink === link.url && (
                        <div className="mt-2 text-xs text-green-600 flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>¡Enlace copiado!</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Permisos Generales</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={shareSettings.allowDownload}
                        onChange={(e) => setShareSettings({...shareSettings, allowDownload: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Permitir descarga</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={shareSettings.allowPrint}
                        onChange={(e) => setShareSettings({...shareSettings, allowPrint: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Permitir impresión</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={shareSettings.allowComment}
                        onChange={(e) => setShareSettings({...shareSettings, allowComment: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Permitir comentarios</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Seguridad</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={shareSettings.watermark}
                        onChange={(e) => setShareSettings({...shareSettings, watermark: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Agregar marca de agua</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={shareSettings.requireApproval}
                        onChange={(e) => setShareSettings({...shareSettings, requireApproval: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Requerir aprobación para cambios</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={shareSettings.notifyChanges}
                      onChange={(e) => setShareSettings({...shareSettings, notifyChanges: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Notificar cambios a colaboradores</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    onShare({
                      collaborators,
                      shareLinks,
                      settings: shareSettings
                    });
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Guardar Configuración</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Última actualización: {formatDateTime(new Date().toISOString())}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSharing;