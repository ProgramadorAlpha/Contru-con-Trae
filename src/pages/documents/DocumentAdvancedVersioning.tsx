import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  GitMerge, 
  GitCommit, 
  Tag, 
  Clock, 
  User, 
  Download, 
  Upload, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ArrowLeftRight,
  Plus,
  Settings,
  Filter,
  Search,
  History,
  RotateCcw,
  GitCompare,
  FileText,
  Share2,
  Lock,
  Unlock,
  Star,
  Copy,
  Trash2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Document, 
  DocumentVersion, 
  VersionBranch, 
  VersionMerge, 
  MergeConflict, 
  VersionTag 
} from '@/types/documents';

interface DocumentAdvancedVersioningProps {
  document: Document;
  onVersionUpdate?: (versions: DocumentVersion[]) => void;
  onBranchUpdate?: (branches: VersionBranch[]) => void;
}

interface MergeRequest {
  id: string;
  sourceBranch: string;
  targetBranch: string;
  status: 'pending' | 'approved' | 'rejected' | 'merged';
  requestedBy: string;
  requestedAt: Date;
  conflicts: MergeConflict[];
}

export const DocumentAdvancedVersioning: React.FC<DocumentAdvancedVersioningProps> = ({
  document,
  onVersionUpdate,
  onBranchUpdate
}) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [branches, setBranches] = useState<VersionBranch[]>([]);
  const [tags, setTags] = useState<VersionTag[]>([]);
  const [mergeRequests, setMergeRequests] = useState<MergeRequest[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<VersionBranch | null>(null);
  const [showCreateBranch, setShowCreateBranch] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [mergeSourceBranch, setMergeSourceBranch] = useState('');
  const [mergeTargetBranch, setMergeTargetBranch] = useState('');
  const [compareVersion1, setCompareVersion1] = useState('');
  const [compareVersion2, setCompareVersion2] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    loadVersionData();
  }, [document.id]);

  const loadVersionData = async () => {
    // Simular carga de datos
    const mockVersions: DocumentVersion[] = [
      {
        id: 'v1',
        documentId: document.id,
        version: '1.0.0',
        title: 'Versión inicial',
        description: 'Primera versión del documento',
        author: 'Juan Pérez',
        authorEmail: 'juan@example.com',
        createdAt: new Date('2024-01-01'),
        fileSize: 1024000,
        fileHash: 'abc123',
        status: 'active',
        type: 'pdf',
        parentVersionId: null,
        branch: 'main'
      },
      {
        id: 'v2',
        documentId: document.id,
        version: '1.1.0',
        title: 'Actualización de contenido',
        description: 'Se agregaron nuevas secciones',
        author: 'María García',
        authorEmail: 'maria@example.com',
        createdAt: new Date('2024-01-15'),
        fileSize: 1536000,
        fileHash: 'def456',
        status: 'active',
        type: 'pdf',
        parentVersionId: 'v1',
        branch: 'main'
      },
      {
        id: 'v3',
        documentId: document.id,
        version: '2.0.0-beta',
        title: 'Versión beta',
        description: 'Versión beta con nuevas características',
        author: 'Carlos López',
        authorEmail: 'carlos@example.com',
        createdAt: new Date('2024-02-01'),
        fileSize: 2048000,
        fileHash: 'ghi789',
        status: 'draft',
        type: 'pdf',
        parentVersionId: 'v2',
        branch: 'feature/new-design'
      }
    ];

    const mockBranches: VersionBranch[] = [
      {
        id: 'branch-1',
        name: 'main',
        documentId: document.id,
        isProtected: true,
        isDefault: true,
        lastCommit: 'v2',
        createdAt: new Date('2024-01-01'),
        createdBy: 'Juan Pérez',
        description: 'Rama principal de desarrollo'
      },
      {
        id: 'branch-2',
        name: 'feature/new-design',
        documentId: document.id,
        isProtected: false,
        isDefault: false,
        lastCommit: 'v3',
        createdAt: new Date('2024-01-20'),
        createdBy: 'Carlos López',
        description: 'Nuevo diseño de interfaz'
      },
      {
        id: 'branch-3',
        name: 'hotfix/critical-bug',
        documentId: document.id,
        isProtected: false,
        isDefault: false,
        lastCommit: 'v1',
        createdAt: new Date('2024-01-25'),
        createdBy: 'Ana Martínez',
        description: 'Corrección de error crítico'
      }
    ];

    const mockTags: VersionTag[] = [
      {
        id: 'tag-1',
        name: 'v1.0.0',
        description: 'Primera versión estable',
        versionId: 'v1',
        documentId: document.id,
        createdAt: new Date('2024-01-01'),
        createdBy: 'Juan Pérez'
      },
      {
        id: 'tag-2',
        name: 'release-candidate',
        description: 'Candidato a versión final',
        versionId: 'v2',
        documentId: document.id,
        createdAt: new Date('2024-01-15'),
        createdBy: 'María García'
      }
    ];

    const mockMergeRequests: MergeRequest[] = [
      {
        id: 'mr-1',
        sourceBranch: 'feature/new-design',
        targetBranch: 'main',
        status: 'pending',
        requestedBy: 'Carlos López',
        requestedAt: new Date('2024-02-02'),
        conflicts: []
      }
    ];

    setVersions(mockVersions);
    setBranches(mockBranches);
    setTags(mockTags);
    setMergeRequests(mockMergeRequests);

    if (onVersionUpdate) {
      onVersionUpdate(mockVersions);
    }
    if (onBranchUpdate) {
      onBranchUpdate(mockBranches);
    }
  };

  const createNewBranch = async () => {
    if (!newBranchName.trim()) return;

    const newBranch: VersionBranch = {
      id: `branch-${Date.now()}`,
      name: newBranchName,
      documentId: document.id,
      isProtected: false,
      isDefault: false,
      lastCommit: versions[0]?.id || '',
      createdAt: new Date(),
      createdBy: 'Usuario Actual',
      description: `Nueva rama: ${newBranchName}`
    };

    setBranches(prev => [...prev, newBranch]);
    setNewBranchName('');
    setShowCreateBranch(false);
  };

  const createNewTag = async () => {
    if (!newTagName.trim() || !selectedVersion) return;

    const newTag: VersionTag = {
      id: `tag-${Date.now()}`,
      name: newTagName,
      description: newTagDescription,
      versionId: selectedVersion.id,
      documentId: document.id,
      createdAt: new Date(),
      createdBy: 'Usuario Actual'
    };

    setTags(prev => [...prev, newTag]);
    setNewTagName('');
    setNewTagDescription('');
    setShowCreateTag(false);
    setSelectedVersion(null);
  };

  const requestMerge = async () => {
    if (!mergeSourceBranch || !mergeTargetBranch) return;

    const newMergeRequest: MergeRequest = {
      id: `mr-${Date.now()}`,
      sourceBranch: mergeSourceBranch,
      targetBranch: mergeTargetBranch,
      status: 'pending',
      requestedBy: 'Usuario Actual',
      requestedAt: new Date(),
      conflicts: [] // En producción, aquí se detectarían conflictos
    };

    setMergeRequests(prev => [...prev, newMergeRequest]);
    setMergeSourceBranch('');
    setMergeTargetBranch('');
    setShowMergeDialog(false);
  };

  const approveMergeRequest = (requestId: string) => {
    setMergeRequests(prev => prev.map(request => {
      if (request.id === requestId) {
        return { ...request, status: 'approved' as const };
      }
      return request;
    }));
  };

  const rejectMergeRequest = (requestId: string) => {
    setMergeRequests(prev => prev.map(request => {
      if (request.id === requestId) {
        return { ...request, status: 'rejected' as const };
      }
      return request;
    }));
  };

  const performMerge = async (requestId: string) => {
    const request = mergeRequests.find(mr => mr.id === requestId);
    if (!request || request.status !== 'approved') return;

    // Simular merge
    setMergeRequests(prev => prev.map(mr => {
      if (mr.id === requestId) {
        return { ...mr, status: 'merged' as const };
      }
      return mr;
    }));

    // Actualizar branches
    setBranches(prev => prev.map(branch => {
      if (branch.name === request.targetBranch) {
        return { ...branch, lastCommit: request.sourceBranch };
      }
      return branch;
    }));
  };

  const rollbackToVersion = async (versionId: string) => {
    // Simular rollback
    console.log(`Realizando rollback a versión: ${versionId}`);
  };

  const compareVersions = () => {
    if (!compareVersion1 || !compareVersion2) return;
    
    setShowCompareDialog(true);
  };

  const getVersionStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Activo</Badge>;
      case 'draft':
        return <Badge variant="outline">Borrador</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archivado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMergeStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100">Pendiente</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-blue-500">Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazado</Badge>;
      case 'merged':
        return <Badge variant="default" className="bg-green-500">Fusionado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredVersions = versions.filter(version => {
    const matchesSearch = searchTerm === '' || 
      version.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      version.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      version.version.includes(searchTerm);
    
    const matchesBranch = filterBranch === '' || version.branch === filterBranch;
    const matchesAuthor = filterAuthor === '' || version.author === filterAuthor;
    const matchesStatus = !showOnlyActive || version.status === 'active';

    return matchesSearch && matchesBranch && matchesAuthor && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado con estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Control Avanzado de Versiones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{versions.length}</div>
              <div className="text-sm text-gray-600">Versiones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{branches.length}</div>
              <div className="text-sm text-gray-600">Ramas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{tags.length}</div>
              <div className="text-sm text-gray-600">Etiquetas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{mergeRequests.length}</div>
              <div className="text-sm text-gray-600">Merge Requests</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="versions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="versions">Versiones</TabsTrigger>
          <TabsTrigger value="branches">Ramas</TabsTrigger>
          <TabsTrigger value="tags">Etiquetas</TabsTrigger>
          <TabsTrigger value="merges">Merge Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestión de Versiones</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar versiones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Select value={filterBranch} onValueChange={setFilterBranch}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Todas las ramas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las ramas</SelectItem>
                      {branches.map(branch => (
                        <SelectItem key={branch.id} value={branch.name}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="showOnlyActive"
                      checked={showOnlyActive}
                      onCheckedChange={setShowOnlyActive}
                    />
                    <Label htmlFor="showOnlyActive" className="text-sm">Solo activas</Label>
                  </div>
                  <Button onClick={() => setShowCompareDialog(true)}>
                    <GitCompare className="h-4 w-4 mr-2" />
                    Comparar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredVersions.map(version => (
                  <div key={version.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{version.title}</h4>
                            {getVersionStatusBadge(version.status)}
                            <Badge variant="outline">{version.version}</Badge>
                            <Badge variant="outline">{version.branch}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{version.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {version.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(version.createdAt).toLocaleDateString()}
                            </span>
                            <span>{(version.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => rollbackToVersion(version.id)}>
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Rollback
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedVersion(version)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestión de Ramas</CardTitle>
                <Button onClick={() => setShowCreateBranch(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Rama
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {branches.map(branch => (
                  <div key={branch.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <GitBranch className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{branch.name}</h4>
                            {branch.isDefault && <Badge variant="default" className="bg-blue-500">Default</Badge>}
                            {branch.isProtected && <Badge variant="outline"><Lock className="h-3 w-3 mr-1" />Protegida</Badge>}
                          </div>
                          <p className="text-sm text-gray-600">{branch.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {branch.createdBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(branch.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitCommit className="h-3 w-3" />
                              Último: {branch.lastCommit}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setMergeSourceBranch(branch.name);
                          setShowMergeDialog(true);
                        }}>
                          <GitMerge className="h-4 w-4 mr-1" />
                          Merge
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedBranch(branch)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestión de Etiquetas</CardTitle>
                <Button onClick={() => setShowCreateTag(true)}>
                  <Tag className="h-4 w-4 mr-2" />
                  Nueva Etiqueta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tags.map(tag => (
                  <div key={tag.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Tag className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{tag.name}</h4>
                            <Badge variant="outline">{tag.versionId}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{tag.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {tag.createdBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(tag.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="merges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Merge Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mergeRequests.map(request => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <GitMerge className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {request.sourceBranch} → {request.targetBranch}
                            </h4>
                            {getMergeStatusBadge(request.status)}
                            {request.conflicts.length > 0 && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {request.conflicts.length} conflictos
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {request.requestedBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(request.requestedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => approveMergeRequest(request.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => rejectMergeRequest(request.id)}>
                              <XCircle className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <Button size="sm" onClick={() => performMerge(request.id)}>
                            <GitMerge className="h-4 w-4 mr-1" />
                            Fusionar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogos modales */}
      <Dialog open={showCreateBranch} onOpenChange={setShowCreateBranch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Rama</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="branchName">Nombre de la rama</Label>
              <Input
                id="branchName"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="feature/nueva-funcionalidad"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBranch(false)}>
              Cancelar
            </Button>
            <Button onClick={createNewBranch}>
              Crear Rama
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateTag} onOpenChange={setShowCreateTag}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Etiqueta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tagName">Nombre de la etiqueta</Label>
              <Input
                id="tagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="v1.0.0"
              />
            </div>
            <div>
              <Label htmlFor="tagDescription">Descripción</Label>
              <Textarea
                id="tagDescription"
                value={newTagDescription}
                onChange={(e) => setNewTagDescription(e.target.value)}
                placeholder="Descripción de la etiqueta..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTag(false)}>
              Cancelar
            </Button>
            <Button onClick={createNewTag}>
              Crear Etiqueta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Merge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sourceBranch">Rama origen</Label>
              <Select value={mergeSourceBranch} onValueChange={setMergeSourceBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rama origen" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.name}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="targetBranch">Rama destino</Label>
              <Select value={mergeTargetBranch} onValueChange={setMergeTargetBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rama destino" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.name}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={requestMerge}>
              Solicitar Merge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Comparar Versiones</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="compareVersion1">Versión 1</Label>
                <Select value={compareVersion1} onValueChange={setCompareVersion1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar versión" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map(version => (
                      <SelectItem key={version.id} value={version.id}>
                        {version.version} - {version.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="compareVersion2">Versión 2</Label>
                <Select value={compareVersion2} onValueChange={setCompareVersion2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar versión" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map(version => (
                      <SelectItem key={version.id} value={version.id}>
                        {version.version} - {version.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {compareVersion1 && compareVersion2 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Comparación de cambios</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Se agregaron 3 páginas nuevas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Se modificaron 5 páginas existentes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Se eliminaron 1 página</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompareDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};