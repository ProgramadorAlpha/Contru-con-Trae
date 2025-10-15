import React, { useState } from 'react';
import { 
  X, Shield, Users, Key, Eye, Edit3, Download, Lock, AlertTriangle, 
  CheckCircle, Clock, UserPlus, Settings, Filter, Search, Trash2, 
  EyeOff, Ban, UserCheck, Activity, FileText, Calendar, Hash 
} from 'lucide-react';

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  type: 'encryption' | 'access' | 'watermark' | 'expiry' | 'password';
  isEnabled: boolean;
  config: any;
  createdAt: string;
  updatedAt: string;
}

interface UserPermission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer' | 'restricted';
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    share: boolean;
    download: boolean;
    print: boolean;
    annotate: boolean;
  };
  grantedAt: string;
  expiresAt?: string;
  grantedBy: string;
}

interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  action: 'view' | 'download' | 'edit' | 'share' | 'delete' | 'print' | 'annotate';
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: string;
}

interface DocumentSecurityProps {
  document: any;
  isOpen: boolean;
  onClose: () => void;
  onSecurityUpdate: (settings: any) => void;
}

const DocumentSecurity: React.FC<DocumentSecurityProps> = ({
  document,
  isOpen,
  onClose,
  onSecurityUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'permissions' | 'rules' | 'audit' | 'settings'>('permissions');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<SecurityRule | null>(null);

  const [users, setUsers] = useState<UserPermission[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'Carlos Rodríguez',
      userEmail: 'carlos@constructpro.com',
      role: 'owner',
      permissions: {
        read: true,
        write: true,
        delete: true,
        share: true,
        download: true,
        print: true,
        annotate: true
      },
      grantedAt: '2024-01-01T00:00:00Z',
      grantedBy: 'system'
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'María García',
      userEmail: 'maria@constructpro.com',
      role: 'admin',
      permissions: {
        read: true,
        write: true,
        delete: false,
        share: true,
        download: true,
        print: true,
        annotate: true
      },
      grantedAt: '2024-01-15T10:30:00Z',
      grantedBy: 'Carlos Rodríguez'
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Juan Pérez',
      userEmail: 'juan@constructpro.com',
      role: 'editor',
      permissions: {
        read: true,
        write: true,
        delete: false,
        share: false,
        download: true,
        print: true,
        annotate: true
      },
      grantedAt: '2024-01-20T14:20:00Z',
      grantedBy: 'María García'
    }
  ]);

  const [securityRules, setSecurityRules] = useState<SecurityRule[]>([
    {
      id: '1',
      name: 'Encriptación de Documento',
      description: 'Encripta el documento con AES-256',
      type: 'encryption',
      isEnabled: true,
      config: { algorithm: 'AES-256', keyRotation: '30d' },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Control de Acceso',
      description: 'Restringe el acceso según roles y permisos',
      type: 'access',
      isEnabled: true,
      config: { requireAuthentication: true, sessionTimeout: 3600 },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '3',
      name: 'Marca de Agua',
      description: 'Agrega marca de agua con información del usuario',
      type: 'watermark',
      isEnabled: false,
      config: { text: 'CONFIDENCIAL - {username} - {timestamp}', position: 'diagonal' },
      createdAt: '2024-01-10T16:00:00Z',
      updatedAt: '2024-01-10T16:00:00Z'
    }
  ]);

  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([
    {
      id: '1',
      userId: 'user2',
      userName: 'María García',
      action: 'view',
      timestamp: '2024-01-20T15:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      success: true,
      details: 'Vista previa del documento'
    },
    {
      id: '2',
      userId: 'user3',
      userName: 'Juan Pérez',
      action: 'download',
      timestamp: '2024-01-20T14:45:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0...',
      success: true,
      details: 'Descarga con marca de agua'
    },
    {
      id: '3',
      userId: 'user4',
      userName: 'Usuario Desconocido',
      action: 'edit',
      timestamp: '2024-01-20T13:20:00Z',
      ipAddress: '10.0.0.50',
      userAgent: 'Mozilla/5.0...',
      success: false,
      details: 'Intento de edición sin permisos'
    }
  ]);

  const [securitySettings, setSecuritySettings] = useState({
    requireApproval: false,
    autoLock: true,
    lockAfter: 30,
    notifyAccess: true,
    auditEnabled: true,
    ipWhitelist: '',
    geoRestrictions: false,
    allowedCountries: ['ES', 'MX', 'AR']
  });

  const [newUser, setNewUser] = useState({
    email: '',
    role: 'viewer' as 'viewer' | 'editor' | 'admin' | 'restricted',
    permissions: {
      read: true,
      write: false,
      delete: false,
      share: false,
      download: true,
      print: true,
      annotate: false
    }
  });

  const roleConfig = {
    owner: { icon: Shield, label: 'Propietario', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    admin: { icon: UserCheck, label: 'Administrador', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    editor: { icon: Edit3, label: 'Editor', color: 'text-green-600', bgColor: 'bg-green-50' },
    viewer: { icon: Eye, label: 'Visualizador', color: 'text-gray-600', bgColor: 'bg-gray-50' },
    restricted: { icon: Ban, label: 'Restringido', color: 'text-red-600', bgColor: 'bg-red-50' }
  };

  const actionConfig = {
    view: { icon: Eye, label: 'Ver', color: 'text-blue-600' },
    download: { icon: Download, label: 'Descargar', color: 'text-green-600' },
    edit: { icon: Edit3, label: 'Editar', color: 'text-yellow-600' },
    share: { icon: Share2, label: 'Compartir', color: 'text-purple-600' },
    delete: { icon: Trash2, label: 'Eliminar', color: 'text-red-600' },
    print: { icon: FileText, label: 'Imprimir', color: 'text-gray-600' },
    annotate: { icon: Edit3, label: 'Anotar', color: 'text-indigo-600' }
  };

  const addUser = () => {
    if (!newUser.email) return;

    const user: UserPermission = {
      id: Date.now().toString(),
      userId: `user_${Date.now()}`,
      userName: newUser.email.split('@')[0],
      userEmail: newUser.email,
      role: newUser.role,
      permissions: newUser.permissions,
      grantedAt: new Date().toISOString(),
      grantedBy: 'Usuario Actual'
    };

    setUsers([...users, user]);
    setNewUser({
      email: '',
      role: 'viewer',
      permissions: {
        read: true,
        write: false,
        delete: false,
        share: false,
        download: true,
        print: true,
        annotate: false
      }
    });
  };

  const updateUserRole = (userId: string, role: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: role as any } : user
    ));
  };

  const updateUserPermission = (userId: string, permission: string, value: boolean) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, permissions: { ...user.permissions, [permission]: value } }
        : user
    ));
  };

  const removeUser = (userId: string) => {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const toggleRule = (ruleId: string) => {
    setSecurityRules(securityRules.map(rule => 
      rule.id === ruleId ? { ...rule, isEnabled: !rule.isEnabled } : rule
    ));
  };

  const filteredUsers = users.filter(user => 
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = accessLogs.filter(log => 
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-red-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Seguridad y Permisos</h2>
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

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar usuarios, acciones, logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Permisos ({users.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Reglas ({securityRules.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Auditoría ({accessLogs.length})</span>
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
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              {/* Add User */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Agregar Usuario</h3>
                <div className="flex space-x-3">
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="viewer">Visualizador</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Administrador</option>
                    <option value="restricted">Restringido</option>
                  </select>
                  <button
                    onClick={addUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>

              {/* Users List */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Usuarios con Acceso ({filteredUsers.length})</h3>
                <div className="space-y-3">
                  {filteredUsers.map((user) => {
                    const RoleIcon = roleConfig[user.role].icon;
                    return (
                      <div key={user.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                              <div className="text-xs text-gray-500">{user.userEmail}</div>
                              <div className="text-xs text-gray-400">
                                Acceso otorgado: {formatDate(user.grantedAt)} por {user.grantedBy}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${roleConfig[user.role].bgColor} ${roleConfig[user.role].color}`}>
                              <RoleIcon className="w-3 h-3" />
                              <span>{roleConfig[user.role].label}</span>
                            </span>
                            <button
                              onClick={() => removeUser(user.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Permissions Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(user.permissions).map(([permission, granted]) => {
                            const actionConfigItem = actionConfig[permission as keyof typeof actionConfig];
                            const ActionIcon = actionConfigItem?.icon || FileText;
                            return (
                              <label key={permission} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={granted}
                                  onChange={(e) => updateUserPermission(user.id, permission, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <ActionIcon className={`w-3 h-3 ${actionConfigItem?.color || 'text-gray-600'}`} />
                                <span className="text-xs text-gray-700 capitalize">{permission}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">Reglas de Seguridad</h3>
                <button
                  onClick={() => setShowRuleDialog(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Nueva Regla</span>
                </button>
              </div>

              <div className="grid gap-4">
                {securityRules.map((rule) => (
                  <div key={rule.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          rule.type === 'encryption' ? 'bg-green-100' :
                          rule.type === 'access' ? 'bg-blue-100' :
                          rule.type === 'watermark' ? 'bg-yellow-100' :
                          rule.type === 'expiry' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          {rule.type === 'encryption' && <Lock className="w-4 h-4 text-green-600" />}
                          {rule.type === 'access' && <Key className="w-4 h-4 text-blue-600" />}
                          {rule.type === 'watermark' && <FileText className="w-4 h-4 text-yellow-600" />}
                          {rule.type === 'expiry' && <Clock className="w-4 h-4 text-red-600" />}
                          {rule.type === 'password' && <Shield className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{rule.name}</h4>
                          <p className="text-xs text-gray-500">{rule.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.isEnabled}
                            onChange={() => toggleRule(rule.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        <button
                          onClick={() => setSelectedRule(rule)}
                          className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Creada: {formatDate(rule.createdAt)} | Actualizada: {formatDate(rule.updatedAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">Registro de Auditoría</h3>
                <button
                  onClick={() => setAccessLogs([])}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                >
                  Limpiar Logs
                </button>
              </div>

              <div className="space-y-2">
                {filteredLogs.map((log) => {
                  const ActionIcon = actionConfig[log.action]?.icon || FileText;
                  return (
                    <div key={log.id} className={`p-3 border rounded-lg ${
                      log.success ? 'border-gray-200' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <ActionIcon className={`w-4 h-4 ${
                            log.success 
                              ? (actionConfig[log.action]?.color || 'text-gray-600')
                              : 'text-red-600'
                          }`} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.userName} - {actionConfig[log.action]?.label || log.action}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(log.timestamp)} | IP: {log.ipAddress}
                            </div>
                            {log.details && (
                              <div className="text-xs text-gray-600 mt-1">{log.details}</div>
                            )}
                          </div>
                        </div>
                        <div className={`flex items-center space-x-1 text-xs ${
                          log.success ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {log.success ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>Éxito</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3" />
                              <span>Falló</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Configuración General</h3>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={securitySettings.requireApproval}
                      onChange={(e) => setSecuritySettings({...securitySettings, requireApproval: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Requerir aprobación para cambios</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={securitySettings.autoLock}
                      onChange={(e) => setSecuritySettings({...securitySettings, autoLock: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Bloqueo automático</span>
                  </label>

                  {securitySettings.autoLock && (
                    <div className="ml-6">
                      <label className="block text-sm text-gray-700 mb-1">
                        Bloquear después de (minutos)
                      </label>
                      <input
                        type="number"
                        value={securitySettings.lockAfter}
                        onChange={(e) => setSecuritySettings({...securitySettings, lockAfter: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max="1440"
                      />
                    </div>
                  )}

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={securitySettings.notifyAccess}
                      onChange={(e) => setSecuritySettings({...securitySettings, notifyAccess: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Notificar accesos</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Auditoría</h3>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={securitySettings.auditEnabled}
                      onChange={(e) => setSecuritySettings({...securitySettings, auditEnabled: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Habilitar auditoría</span>
                  </label>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Lista blanca de IP (separadas por comas)
                    </label>
                    <textarea
                      value={securitySettings.ipWhitelist}
                      onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="192.168.1.0/24, 10.0.0.0/8"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    onSecurityUpdate({
                      users,
                      securityRules,
                      settings: securitySettings
                    });
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Guardar Configuración
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Última actualización: {formatDate(new Date().toISOString())}
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

export default DocumentSecurity;