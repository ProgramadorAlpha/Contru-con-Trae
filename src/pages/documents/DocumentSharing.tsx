import React, { useState, useEffect } from 'react';
import { 
  X, Share2, Copy, Mail, Clock, Users, Shield, 
  Eye, Edit3, Download, Trash2, Link, CheckCircle, Send,
  Settings, Bell, Search, Filter, ChevronDown, UserPlus
} from 'lucide-react';
import { Document, DocumentCollaborator, ShareSettings } from '../../types/documents';

interface DocumentSharingProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onShare?: (settings: ShareSettings) => void;
  collaborators?: DocumentCollaborator[];
  onCollaboratorAdd?: (collaborator: DocumentCollaborator) => void;
  onCollaboratorRemove?: (collaboratorId: string) => void;
}

export const DocumentSharing: React.FC<DocumentSharingProps> = ({
  document,
  isOpen,
  onClose,
  onShare,
  collaborators: externalCollaborators = [],
  onCollaboratorAdd,
  onCollaboratorRemove
}) => {
  const [collaborators, setCollaborators] = useState<DocumentCollaborator[]>([]);
  const [shareLink, setShareLink] = useState('');
  const [linkSettings, setLinkSettings] = useState({
    expiresIn: '7d',
    permission: 'view',
    allowDownload: true,
    password: ''
  });
  const [emailInvite, setEmailInvite] = useState('');
  const [emailPermission, setEmailPermission] = useState<'view' | 'edit' | 'comment'>('view');
  const [notifications, setNotifications] = useState({
    onView: false,
    onEdit: true,
    onComment: true,
    onDownload: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showLinkSettings, setShowLinkSettings] = useState(false);

  // Cargar colaboradores
  useEffect(() => {
    if (isOpen && document) {
      if (externalCollaborators.length > 0) {
        setCollaborators(externalCollaborators);
      } else {
        const sampleCollaborators: DocumentCollaborator[] = [
          {
            id: '1',
            documentId: document.id,
            email: 'juan.perez@constructora.com',
            name: 'Juan Pérez',
            role: 'editor',
            permission: 'edit',
            avatar: 'JP',
            status: 'active',
            lastAccess: new Date(Date.now() - 2 * 60 * 60 * 1000), // hace 2 horas
            invitedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // hace 7 días
            addedBy: 'current-user'
          },
          {
            id: '2',
            documentId: document.id,
            email: 'maria.gomez@constructora.com',
            name: 'María Gómez',
            role: 'viewer',
            permission: 'view',
            avatar: 'MG',
            status: 'pending',
            invitedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // hace 1 día
            addedBy: 'current-user'
          }
        ];
        setCollaborators(sampleCollaborators);
      }
      setShareLink(`https://constructora.com/share/${document.id}/abc123`);
    }
  }, [isOpen, document, externalCollaborators]);

  const generateShareLink = () => {
    const newLink = `https://constructora.com/share/${document.id}/${Math.random().toString(36).substr(2, 9)}`;
    setShareLink(newLink);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      alert('Enlace copiado al portapapeles');
    } catch (error) {
      console.error('Error al copiar el enlace:', error);
    }
  };

  const sendEmailInvite = () => {
    if (!emailInvite.trim()) return;

    const newCollaborator: DocumentCollaborator = {
      id: Date.now().toString(),
      documentId: document.id,
      email: emailInvite,
      name: emailInvite.split('@')[0],
      role: emailPermission === 'view' ? 'viewer' : 'editor',
      permission: emailPermission,
      avatar: emailInvite.substring(0, 2).toUpperCase(),
      status: 'pending',
      invitedAt: new Date(),
      addedBy: 'current-user'
    };

    setCollaborators([...collaborators, newCollaborator]);
    setEmailInvite('');
  };

  const updateCollaboratorPermission = (collaboratorId: string, permission: 'view' | 'edit' | 'comment') => {
    setCollaborators(collaborators.map(collab => 
      collab.id === collaboratorId 
        ? { ...collab, permission, role: permission === 'view' ? 'viewer' : 'editor' }
        : collab
    ));
  };

  const removeCollaborator = (collaboratorId: string) => {
    if (confirm('¿Está seguro de eliminar este colaborador?')) {
      if (onCollaboratorRemove) {
        onCollaboratorRemove(collaboratorId);
      } else {
        setCollaborators(collaborators.filter(collab => collab.id !== collaboratorId));
      }
    }
  };

  const resendInvitation = (collaboratorId: string) => {
    // Simular reenvío de invitación
    alert('Invitación reenviada exitosamente');
  };

  const handleShare = () => {
    const settings: ShareSettings = {
      documentId: document.id,
      shareLink,
      collaborators,
      permissions: {
        linkPermission: linkSettings.permission as 'view' | 'edit' | 'comment',
        allowDownload: linkSettings.allowDownload,
        expiresAt: new Date(Date.now() + parseExpirationTime(linkSettings.expiresIn))
      },
      notifications
    };
    onShare(settings);
  };

  const parseExpirationTime = (expiresIn: string): number => {
    const units = { 'h': 60 * 60 * 1000, 'd': 24 * 60 * 60 * 1000, 'w': 7 * 24 * 60 * 60 * 1000 };
    const value = parseInt(expiresIn);
    const unit = expiresIn.slice(-1) as 'h' | 'd' | 'w';
    return value * units[unit];
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'view': return <Eye className="w-4 h-4" />;
      case 'edit': return <Edit3 className="w-4 h-4" />;
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'view': return 'Ver';
      case 'edit': return 'Editar';
      case 'comment': return 'Comentar';
      default: return 'Ver';
    }
  };

  const filteredCollaborators = collaborators.filter(collaborator =>
    collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collaborator.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Share2 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold">Compartir documento</h2>
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

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Panel izquierdo - Compartir por enlace */}
            <div className="p-6 border-r space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                  <Link className="w-5 h-5 text-blue-600" />
                  <span>Compartir por enlace</span>
                </h3>

                {/* Configuración del enlace */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Enlace de acceso</p>
                      <p className="text-xs text-gray-500">Cualquiera con el enlace puede acceder</p>
                    </div>
                    <button
                      onClick={generateShareLink}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Generar
                    </button>
                  </div>

                  {shareLink && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={shareLink}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                        />
                        <button
                          onClick={copyShareLink}
                          className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                          title="Copiar enlace"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Configuraciones del enlace */}
                      <div className="space-y-3">
                        <button
                          onClick={() => setShowLinkSettings(!showLinkSettings)}
                          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Configuración del enlace</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${showLinkSettings ? 'rotate-180' : ''}`} />
                        </button>

                        {showLinkSettings && (
                          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Permisos</label>
                              <select
                                value={linkSettings.permission}
                                onChange={(e) => setLinkSettings({...linkSettings, permission: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              >
                                <option value="view">Ver</option>
                                <option value="comment">Comentar</option>
                                <option value="edit">Editar</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Expira en</label>
                              <select
                                value={linkSettings.expiresIn}
                                onChange={(e) => setLinkSettings({...linkSettings, expiresIn: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              >
                                <option value="1h">1 hora</option>
                                <option value="24h">24 horas</option>
                                <option value="7d">7 días</option>
                                <option value="30d">30 días</option>
                                <option value="never">Nunca</option>
                              </select>
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="allowDownload"
                                checked={linkSettings.allowDownload}
                                onChange={(e) => setLinkSettings({...linkSettings, allowDownload: e.target.checked})}
                                className="rounded border-gray-300"
                              />
                              <label htmlFor="allowDownload" className="text-sm text-gray-700">
                                Permitir descarga
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notificaciones */}
              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span>Notificaciones</span>
                </h4>
                <div className="space-y-2">
                  {[
                    { key: 'onView', label: 'Al ver el documento' },
                    { key: 'onEdit', label: 'Al editar el documento' },
                    { key: 'onComment', label: 'Al comentar' },
                    { key: 'onDownload', label: 'Al descargar' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notifications[key as keyof typeof notifications]}
                        onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel derecho - Colaboradores */}
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Colaboradores</span>
                </h3>

                {/* Invitar por email */}
                <div className="space-y-3 mb-6">
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={emailInvite}
                      onChange={(e) => setEmailInvite(e.target.value)}
                      placeholder="Correo electrónico"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <select
                      value={emailPermission}
                      onChange={(e) => setEmailPermission(e.target.value as 'view' | 'edit' | 'comment')}
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="view">Ver</option>
                      <option value="comment">Comentar</option>
                      <option value="edit">Editar</option>
                    </select>
                  </div>
                  <button
                    onClick={sendEmailInvite}
                    disabled={!emailInvite.trim()}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar invitación</span>
                  </button>
                </div>

                {/* Búsqueda */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar colaboradores..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>

                {/* Lista de colaboradores */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredCollaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {collaborator.avatar}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{collaborator.name}</p>
                          <p className="text-xs text-gray-500">{collaborator.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {collaborator.status === 'pending' ? (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Pendiente
                              </span>
                            ) : (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Activo
                              </span>
                            )}
                            {collaborator.lastAccess && (
                              <span className="text-xs text-gray-500">
                                Último acceso: {collaborator.lastAccess.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="relative group">
                          <button className="flex items-center space-x-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                            {getPermissionIcon(collaborator.permission)}
                            <span>{getPermissionLabel(collaborator.permission)}</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            {['view', 'comment', 'edit'].map((permission) => (
                              <button
                                key={permission}
                                onClick={() => updateCollaboratorPermission(collaborator.id, permission as 'view' | 'edit' | 'comment')}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-left hover:bg-gray-50"
                              >
                                {getPermissionIcon(permission)}
                                <span>{getPermissionLabel(permission)}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {collaborator.status === 'pending' && (
                          <button
                            onClick={() => resendInvitation(collaborator.id)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Reenviar invitación"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => removeCollaborator(collaborator.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Eliminar colaborador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            {collaborators.length} colaborador{collaborators.length !== 1 ? 'es' : ''}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};