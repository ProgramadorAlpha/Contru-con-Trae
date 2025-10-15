import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, Eye, Edit, Trash2, Plus, Search, Filter, Download, Upload, Settings, User, Users, AlertTriangle, CheckCircle, XCircle, Clock, MapPin, Fingerprint, Mail, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  SecurityRole, 
  SecurityRule, 
  AccessLog, 
  DocumentCollaborator,
  Document
} from '@/types/documents';

interface DocumentAdvancedSecurityProps {
  document: Document;
  onSecurityUpdate?: (securityData: any) => void;
}

export const DocumentAdvancedSecurity: React.FC<DocumentAdvancedSecurityProps> = ({
  document,
  onSecurityUpdate
}) => {
  const [roles, setRoles] = useState<SecurityRole[]>([]);
  const [securityRules, setSecurityRules] = useState<SecurityRule[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [collaborators, setCollaborators] = useState<DocumentCollaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SecurityRole | null>(null);
  const [selectedRule, setSelectedRule] = useState<SecurityRule | null>(null);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [geoRestrictions, setGeoRestrictions] = useState(false);
  const [timeRestrictions, setTimeRestrictions] = useState(false);

  // Cargar datos de seguridad
  useEffect(() => {
    loadSecurityData();
  }, [document.id]);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRoles: SecurityRole[] = [
        {
          id: 'role-1',
          name: 'Administrador',
          level: 1,
          permissions: {
            documents: {
              view: true,
              create: true,
              edit: true,
              delete: true,
              share: true,
              annotate: true,
              version: true,
              export: true,
              print: true
            },
            admin: {
              manageUsers: true,
              manageRoles: true,
              manageSecurity: true,
              viewAuditLogs: true,
              manageIntegrations: true
            }
          },
          description: 'Acceso completo al sistema',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 'role-2',
          name: 'Gerente',
          level: 2,
          permissions: {
            documents: {
              view: true,
              create: true,
              edit: true,
              delete: false,
              share: true,
              annotate: true,
              version: true,
              export: true,
              print: true
            },
            admin: {
              manageUsers: true,
              manageRoles: false,
              manageSecurity: false,
              viewAuditLogs: true,
              manageIntegrations: false
            }
          },
          description: 'Acceso administrativo limitado',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 'role-3',
          name: 'Editor',
          level: 3,
          permissions: {
            documents: {
              view: true,
              create: true,
              edit: true,
              delete: false,
              share: false,
              annotate: true,
              version: true,
              export: false,
              print: true
            },
            admin: {
              manageUsers: false,
              manageRoles: false,
              manageSecurity: false,
              viewAuditLogs: false,
              manageIntegrations: false
            }
          },
          description: 'Puede editar documentos',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 'role-4',
          name: 'Visor',
          level: 4,
          permissions: {
            documents: {
              view: true,
              create: false,
              edit: false,
              delete: false,
              share: false,
              annotate: false,
              version: false,
              export: false,
              print: false
            },
            admin: {
              manageUsers: false,
              manageRoles: false,
              manageSecurity: false,
              viewAuditLogs: false,
              manageIntegrations: false
            }
          },
          description: 'Solo puede ver documentos',
          isActive: true,
          createdAt: new Date()
        }
      ];

      const mockRules: SecurityRule[] = [
        {
          id: 'rule-1',
          name: 'Restricción por Nivel de Seguridad',
          type: 'document',
          targetId: document.id,
          conditions: {
            userRoles: ['role-3', 'role-4'],
            securityLevels: ['confidential', 'restricted'],
            documentTypes: ['financial', 'legal'],
            timeRestrictions: {
              startTime: '09:00',
              endTime: '18:00',
              daysOfWeek: [1, 2, 3, 4, 5]
            }
          },
          actions: {
            allowAccess: false,
            requireApproval: true,
            requireMFA: true,
            encryptDocument: true,
            addWatermark: true,
            expireAfter: 86400,
            maxDownloads: 3
          },
          priority: 1,
          isActive: true,
          createdBy: 'admin',
          createdAt: new Date()
        },
        {
          id: 'rule-2',
          name: 'Acceso Geográfico Restringido',
          type: 'global',
          targetId: 'global',
          conditions: {
            locationRestrictions: {
              allowedCountries: ['ES', 'MX', 'AR'],
              blockedIPs: ['192.168.1.0/24']
            }
          },
          actions: {
            allowAccess: true,
            requireApproval: false,
            requireMFA: true,
            encryptDocument: false,
            addWatermark: true
          },
          priority: 2,
          isActive: true,
          createdBy: 'admin',
          createdAt: new Date()
        }
      ];

      const mockAccessLogs: AccessLog[] = [
        {
          id: 'log-1',
          documentId: document.id,
          userId: 'user-1',
          userName: 'Juan Pérez',
          userEmail: 'juan@example.com',
          action: 'view',
          timestamp: new Date(),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          location: {
            country: 'ES',
            city: 'Madrid',
            latitude: 40.4168,
            longitude: -3.7038
          },
          success: true
        },
        {
          id: 'log-2',
          documentId: document.id,
          userId: 'user-2',
          userName: 'María García',
          userEmail: 'maria@example.com',
          action: 'download',
          timestamp: new Date(Date.now() - 3600000),
          ipAddress: '192.168.1.101',
          userAgent: 'Chrome/91.0...',
          location: {
            country: 'ES',
            city: 'Barcelona',
            latitude: 41.3851,
            longitude: 2.1734
          },
          success: true
        }
      ];

      const mockCollaborators: DocumentCollaborator[] = [
        {
          id: 'collab-1',
          documentId: document.id,
          userId: 'user-1',
          userName: 'Juan Pérez',
          userEmail: 'juan@example.com',
          role: 'owner',
          permissions: {
            view: true,
            edit: true,
            delete: true,
            share: true,
            download: true,
            print: true,
            comment: true,
            annotate: true
          },
          grantedBy: 'system',
          grantedAt: new Date().toISOString(),
          isActive: true,
          status: 'active'
        }
      ];

      setRoles(mockRoles);
      setSecurityRules(mockRules);
      setAccessLogs(mockAccessLogs);
      setCollaborators(mockCollaborators);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData: Partial<SecurityRole>) => {
    const newRole: SecurityRole = {
      id: `role-${Date.now()}`,
      name: roleData.name || 'Nuevo Rol',
      level: roleData.level || 5,
      permissions: roleData.permissions || {
        documents: {
          view: false,
          create: false,
          edit: false,
          delete: false,
          share: false,
          annotate: false,
          version: false,
          export: false,
          print: false
        },
        admin: {
          manageUsers: false,
          manageRoles: false,
          manageSecurity: false,
          viewAuditLogs: false,
          manageIntegrations: false
        }
      },
      description: roleData.description || '',
      isActive: true,
      createdAt: new Date()
    };

    setRoles(prev => [...prev, newRole]);
    setShowRoleDialog(false);
  };

  const createSecurityRule = async (ruleData: Partial<SecurityRule>) => {
    const newRule: SecurityRule = {
      id: `rule-${Date.now()}`,
      name: ruleData.name || 'Nueva Regla',
      type: ruleData.type || 'document',
      targetId: ruleData.targetId || document.id,
      conditions: ruleData.conditions || {},
      actions: ruleData.actions || {
        allowAccess: true,
        requireApproval: false,
        requireMFA: false,
        encryptDocument: false,
        addWatermark: false
      },
      priority: ruleData.priority || 10,
      isActive: true,
      createdBy: 'current-user',
      createdAt: new Date()
    };

    setSecurityRules(prev => [...prev, newRule]);
    setShowRuleDialog(false);
  };

  const updateSecuritySettings = async () => {
    const securitySettings = {
      encryptionEnabled,
      watermarkEnabled,
      mfaRequired,
      geoRestrictions,
      timeRestrictions
    };

    if (onSecurityUpdate) {
      onSecurityUpdate(securitySettings);
    }
  };

  const filteredAccessLogs = accessLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.action === filterType;
    return matchesSearch && matchesType;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'edit':
        return <Edit className="h-4 w-4 text-yellow-500" />;
      case 'download':
        return <Download className="h-4 w-4 text-green-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />;
      default:
        return <Key className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'public':
        return 'bg-green-100 text-green-800';
      case 'internal':
        return 'bg-blue-100 text-blue-800';
      case 'confidential':
        return 'bg-yellow-100 text-yellow-800';
      case 'restricted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuración General de Seguridad */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configuración de Seguridad
            </CardTitle>
            <Badge className={getSecurityLevelColor(document.securityLevel)}>
              {document.securityLevel.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="encryption">Encriptación de Documento</Label>
                <Switch
                  id="encryption"
                  checked={encryptionEnabled}
                  onCheckedChange={setEncryptionEnabled}
                />
              </div>
              <p className="text-sm text-gray-600">
                Encripta el documento para protegerlo de accesos no autorizados
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="watermark">Marca de Agua</Label>
                <Switch
                  id="watermark"
                  checked={watermarkEnabled}
                  onCheckedChange={setWatermarkEnabled}
                />
              </div>
              <p className="text-sm text-gray-600">
                Añade marca de agua con información del usuario al documento
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="mfa">Autenticación Multi-Factor</Label>
                <Switch
                  id="mfa"
                  checked={mfaRequired}
                  onCheckedChange={setMfaRequired}
                />
              </div>
              <p className="text-sm text-gray-600">
                Requiere autenticación adicional para acceder al documento
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="geo">Restricciones Geográficas</Label>
                <Switch
                  id="geo"
                  checked={geoRestrictions}
                  onCheckedChange={setGeoRestrictions}
                />
              </div>
              <p className="text-sm text-gray-600">
                Restringe el acceso basado en la ubicación geográfica
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="time">Restricciones de Tiempo</Label>
                <Switch
                  id="time"
                  checked={timeRestrictions}
                  onCheckedChange={setTimeRestrictions}
                />
              </div>
              <p className="text-sm text-gray-600">
                Limita el acceso a ciertos horarios y días
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={updateSecuritySettings}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Roles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Roles y Permisos
            </CardTitle>
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Rol
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Rol</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roleName">Nombre del Rol</Label>
                    <Input id="roleName" placeholder="Ej: Supervisor" />
                  </div>
                  <div>
                    <Label htmlFor="roleLevel">Nivel</Label>
                    <Input id="roleLevel" type="number" placeholder="1-10" />
                  </div>
                  <div>
                    <Label htmlFor="roleDescription">Descripción</Label>
                    <Textarea id="roleDescription" placeholder="Descripción del rol" />
                  </div>
                  <Button onClick={() => createRole({})}>
                    Crear Rol
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roles.map(role => (
              <div key={role.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{role.name}</h4>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                  <Badge variant={role.isActive ? 'default' : 'secondary'}>
                    {role.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <strong>Documentos:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>Ver: {role.permissions.documents.view ? '✓' : '✗'}</li>
                      <li>Crear: {role.permissions.documents.create ? '✓' : '✗'}</li>
                      <li>Editar: {role.permissions.documents.edit ? '✓' : '✗'}</li>
                      <li>Eliminar: {role.permissions.documents.delete ? '✓' : '✗'}</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Compartir:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>Compartir: {role.permissions.documents.share ? '✓' : '✗'}</li>
                      <li>Exportar: {role.permissions.documents.export ? '✓' : '✗'}</li>
                      <li>Imprimir: {role.permissions.documents.print ? '✓' : '✗'}</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Colaboración:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>Anotar: {role.permissions.documents.annotate ? '✓' : '✗'}</li>
                      <li>Versionar: {role.permissions.documents.version ? '✓' : '✗'}</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Administración:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>Usuarios: {role.permissions.admin.manageUsers ? '✓' : '✗'}</li>
                      <li>Roles: {role.permissions.admin.manageRoles ? '✓' : '✗'}</li>
                      <li>Seguridad: {role.permissions.admin.manageSecurity ? '✓' : '✗'}</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Auditoría:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>Logs: {role.permissions.admin.viewAuditLogs ? '✓' : '✗'}</li>
                      <li>Integraciones: {role.permissions.admin.manageIntegrations ? '✓' : '✗'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reglas de Seguridad */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Reglas de Seguridad
            </CardTitle>
            <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Regla
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Regla de Seguridad</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ruleName">Nombre de la Regla</Label>
                    <Input id="ruleName" placeholder="Ej: Restricción por país" />
                  </div>
                  <div>
                    <Label htmlFor="ruleType">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Documento</SelectItem>
                        <SelectItem value="folder">Carpeta</SelectItem>
                        <SelectItem value="global">Global</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => createSecurityRule({})}>
                    Crear Regla
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityRules.map(rule => (
              <div key={rule.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-gray-600">Tipo: {rule.type} | Prioridad: {rule.priority}</p>
                  </div>
                  <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                    {rule.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Condiciones:</strong>
                    <ul className="mt-1 space-y-1">
                      {rule.conditions.userRoles && <li>Roles: {rule.conditions.userRoles.join(', ')}</li>}
                      {rule.conditions.securityLevels && <li>Niveles: {rule.conditions.securityLevels.join(', ')}</li>}
                      {rule.conditions.documentTypes && <li>Tipos: {rule.conditions.documentTypes.join(', ')}</li>}
                      {rule.conditions.timeRestrictions && <li>Horario restringido</li>}
                      {rule.conditions.locationRestrictions && <li>Restricción geográfica</li>}
                    </ul>
                  </div>
                  <div>
                    <strong>Acciones:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>Acceso: {rule.actions.allowAccess ? 'Permitido' : 'Denegado'}</li>
                      <li>Aprobación: {rule.actions.requireApproval ? 'Requerida' : 'No requerida'}</li>
                      <li>MFA: {rule.actions.requireMFA ? 'Requerido' : 'No requerido'}</li>
                      <li>Encriptación: {rule.actions.encryptDocument ? 'Sí' : 'No'}</li>
                      <li>Marca de agua: {rule.actions.addWatermark ? 'Sí' : 'No'}</li>
                      {rule.actions.expireAfter && <li>Expira en: {rule.actions.expireAfter / 3600}h</li>}
                      {rule.actions.maxDownloads && <li>Máx. descargas: {rule.actions.maxDownloads}</li>}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Registro de Auditoría */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Registro de Auditoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar en logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filtrar por acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="view">Ver</SelectItem>
                <SelectItem value="edit">Editar</SelectItem>
                <SelectItem value="download">Descargar</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredAccessLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getActionIcon(log.action)}
                  <div>
                    <div className="font-medium">{log.userName}</div>
                    <div className="text-sm text-gray-600">{log.userEmail}</div>
                    <div className="text-xs text-gray-500">
                      {log.action} - {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {log.success ? (
                      <span className="text-green-600">✓ Éxito</span>
                    ) : (
                      <span className="text-red-600">✗ Fallo</span>
                    )}
                  </div>
                  {log.location && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {log.location.city}, {log.location.country}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    IP: {log.ipAddress}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Colaboradores y Permisos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Colaboradores y Permisos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collaborators.map(collaborator => (
              <div key={collaborator.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium">{collaborator.userName}</div>
                    <div className="text-sm text-gray-600">{collaborator.userEmail}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{collaborator.role}</Badge>
                      <Badge variant={collaborator.isActive ? 'default' : 'secondary'}>
                        {collaborator.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    Concedido el {new Date(collaborator.grantedAt).toLocaleDateString()}
                  </div>
                  {collaborator.expiresAt && (
                    <div className="text-sm text-orange-600">
                      Expira: {new Date(collaborator.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Último acceso: {collaborator.lastAccess ? new Date(collaborator.lastAccess).toLocaleDateString() : 'Nunca'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};