import React, { useState, useEffect } from 'react';
import { 
  X, Clock, RotateCcw, Download, Upload, 
  CheckCircle, AlertCircle, GitBranch, GitMerge,
  Eye, FileText, User, Calendar, Tag, Plus, Trash2, ArrowLeftRight
} from 'lucide-react';
import { Document, DocumentVersion } from '../../types/documents';

interface DocumentVersionControlProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onVersionRestore: (versionId: string) => void;
  onVersionCompare: (versionIds: string[]) => void;
  versions?: DocumentVersion[];
  onVersionUpload?: (file: File, notes: string, versionType: 'major' | 'minor') => void;
}

export const DocumentVersionControl: React.FC<DocumentVersionControlProps> = ({
  document,
  isOpen,
  onClose,
  onVersionRestore,
  onVersionCompare,
  versions: externalVersions = [],
  onVersionUpload
}) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'compare'>('list');
  const [filter, setFilter] = useState<'all' | 'major' | 'minor' | 'draft'>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [newVersionNotes, setNewVersionNotes] = useState('');
  const [newVersionType, setNewVersionType] = useState<'major' | 'minor'>('minor');

  // Cargar versiones
  useEffect(() => {
    if (isOpen && document) {
      if (externalVersions.length > 0) {
        setVersions(externalVersions);
      } else {
        const sampleVersions: DocumentVersion[] = [
          {
            id: 'v1.2.0',
            documentId: document.id,
            version: '1.2.0',
            type: 'major',
            title: 'Versión final con aprobaciones',
            description: 'Versión final del documento con todas las aprobaciones completadas',
            author: 'Carlos Rodríguez',
            authorEmail: 'carlos.rodriguez@constructora.com',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            fileSize: 2457600,
            fileHash: 'sha256:abc123def456',
            changes: [
              'Agregadas firmas digitales',
              'Completado proceso de aprobación',
              'Actualizadas referencias normativas'
            ],
            tags: ['final', 'aprobado', 'firma-digital'],
            isCurrent: true,
            status: 'published'
          },
          {
            id: 'v1.1.3',
            documentId: document.id,
            version: '1.1.3',
            type: 'minor',
            title: 'Correcciones de revisión',
            description: 'Correcciones menores basadas en feedback del equipo',
            author: 'Ana Martínez',
            authorEmail: 'ana.martinez@constructora.com',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            fileSize: 2380800,
            fileHash: 'sha256:def456ghi789',
            changes: [
              'Corregidos errores tipográficos',
              'Actualizadas fechas de referencia',
              'Mejorada claridad en secciones técnicas'
            ],
            tags: ['revision', 'correcciones'],
            isCurrent: false,
            status: 'published',
            parentVersionId: 'v1.1.2'
          },
          {
            id: 'v1.1.2',
            documentId: document.id,
            version: '1.1.2',
            type: 'minor',
            title: 'Actualización de especificaciones',
            description: 'Actualización de especificaciones técnicas según nuevas normativas',
            author: 'Pedro Sánchez',
            authorEmail: 'pedro.sanchez@constructora.com',
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            fileSize: 2355200,
            fileHash: 'sha256:ghi789jkl012',
            changes: [
              'Actualizadas especificaciones de materiales',
              'Agregados nuevos estándares de calidad',
              'Actualizados precios de referencia'
            ],
            tags: ['especificaciones', 'normativas'],
            isCurrent: false,
            status: 'published',
            parentVersionId: 'v1.1.1'
          },
          {
            id: 'v1.1.1',
            documentId: document.id,
            version: '1.1.1',
            type: 'minor',
            title: 'Revisión inicial',
            description: 'Primera revisión con correcciones básicas',
            author: 'Laura González',
            authorEmail: 'laura.gonzalez@constructora.com',
            createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            fileSize: 2329600,
            fileHash: 'sha256:jkl012mno345',
            changes: [
              'Corregidos formatos de tabla',
              'Agregados números de página',
              'Mejorada estructura de secciones'
            ],
            tags: ['revision', 'inicial'],
            isCurrent: false,
            status: 'published',
            parentVersionId: 'v1.1.0'
          },
          {
            id: 'v1.1.0',
            documentId: document.id,
            version: '1.1.0',
            type: 'major',
            title: 'Versión beta',
            description: 'Primera versión completa con todas las secciones desarrolladas',
            author: 'Juan Pérez',
            authorEmail: 'juan.perez@constructora.com',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            fileSize: 2304000,
            fileHash: 'sha256:mno345pqr678',
            changes: [
              'Completado contenido principal',
              'Agregadas todas las secciones requeridas',
              'Incluidos diagramas y tablas'
            ],
            tags: ['beta', 'completo'],
            isCurrent: false,
            status: 'published',
            parentVersionId: 'v1.0.0'
          },
          {
            id: 'v1.0.0',
            documentId: document.id,
            version: '1.0.0',
            type: 'major',
            title: 'Versión inicial',
            description: 'Primera versión del documento',
            author: 'María García',
            authorEmail: 'maria.garcia@constructora.com',
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            fileSize: 2097152,
            fileHash: 'sha256:pqr678stu901',
            changes: [
              'Creación inicial del documento',
              'Estructura básica definida',
              'Secciones principales esbozadas'
            ],
            tags: ['inicial', 'borrador'],
            isCurrent: false,
            status: 'published'
          }
        ];
        setVersions(sampleVersions);
      }
    }
  }, [isOpen, document, externalVersions]);

  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
    }
  };

  const handleRestoreVersion = (versionId: string) => {
    if (confirm('¿Está seguro de restaurar esta versión? Se creará una nueva versión con el contenido restaurado.')) {
      onVersionRestore(versionId);
    }
  };

  const handleCompareVersions = () => {
    if (selectedVersions.length === 2) {
      onVersionCompare(selectedVersions);
    }
  };

  const handleUploadVersion = () => {
    if (!newVersionFile) return;

    if (onVersionUpload) {
      onVersionUpload(newVersionFile, newVersionNotes, newVersionType);
    } else {
      const newVersion: DocumentVersion = {
        id: `v${newVersionType === 'major' ? document.version + 1 : document.version}.0.${Date.now()}`,
        documentId: document.id,
        version: newVersionType === 'major' ? `${parseInt(document.version.toString()) + 1}.0.0` : `${document.version}.${Date.now()}`,
        type: newVersionType,
        title: newVersionNotes || `Nueva versión ${newVersionType}`,
        description: newVersionNotes,
        author: 'Usuario Actual',
        authorEmail: 'usuario@constructora.com',
        createdAt: new Date(),
        fileSize: newVersionFile.size,
        fileHash: 'sha256:new-hash-' + Date.now(),
        changes: newVersionNotes ? [newVersionNotes] : ['Nueva versión subida'],
        tags: ['nueva'],
        isCurrent: false,
        status: 'draft'
      };

      setVersions([newVersion, ...versions]);
    }
    
    setShowUploadDialog(false);
    setNewVersionFile(null);
    setNewVersionNotes('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'bg-red-100 text-red-800';
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'archived': return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default: return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  const filteredVersions = versions.filter(version => {
    if (filter === 'all') return true;
    return version.type === filter;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <GitBranch className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold">Control de versiones</h2>
              <p className="text-sm text-gray-500">{document.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {selectedVersions.length === 2 && (
              <button
                onClick={handleCompareVersions}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Comparar</span>
              </button>
            )}
            <button
              onClick={() => setShowUploadDialog(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            >
              <Upload className="w-4 h-4" />
              <span>Nueva versión</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            {/* Vista */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Vista:</span>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'list' | 'timeline' | 'compare')}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="list">Lista</option>
                <option value="timeline">Cronología</option>
                <option value="compare">Comparar</option>
              </select>
            </div>

            {/* Filtro */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filtro:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'major' | 'minor' | 'draft')}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="all">Todas</option>
                <option value="major">Mayores</option>
                <option value="minor">Menores</option>
                <option value="draft">Borradores</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {filteredVersions.length} versión{filteredVersions.length !== 1 ? 'es' : ''}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {/* Vista de Lista */}
            {viewMode === 'list' && (
              <div className="space-y-4 p-6">
                {filteredVersions.map((version) => (
                  <div
                    key={version.id}
                    className={`border rounded-lg p-4 ${
                      version.isCurrent ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                    } ${selectedVersions.includes(version.id) ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedVersions.includes(version.id)}
                          onChange={() => handleVersionSelect(version.id)}
                          className="mt-1 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{version.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getVersionTypeColor(version.type)}`}>
                              v{version.version}
                            </span>
                            {getStatusIcon(version.status)}
                            {version.isCurrent && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Actual
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{version.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{version.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{version.createdAt.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="w-4 h-4" />
                              <span>{formatFileSize(version.fileSize)}</span>
                            </div>
                          </div>

                          {/* Tags */}
                          {version.tags && version.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {version.tags.map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Cambios */}
                          {version.changes && version.changes.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Cambios:</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {version.changes.map((change, index) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span>{change}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`/api/documents/${document.id}/versions/${version.id}/download`, '_blank')}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                          title="Descargar versión"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/api/documents/${document.id}/versions/${version.id}/preview`, '_blank')}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                          title="Previsualizar versión"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!version.isCurrent && (
                          <button
                            onClick={() => handleRestoreVersion(version.id)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                            title="Restaurar versión"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Vista de Cronología */}
            {viewMode === 'timeline' && (
              <div className="p-6">
                <div className="relative">
                  {/* Línea de tiempo */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                  
                  {filteredVersions.map((version, index) => (
                    <div key={version.id} className="relative flex items-start space-x-4 mb-8">
                      {/* Punto de tiempo */}
                      <div className={`relative z-10 w-4 h-4 rounded-full border-2 ${
                        version.isCurrent ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-400'
                      }`}></div>
                      
                      {/* Contenido */}
                      <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{version.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getVersionTypeColor(version.type)}`}>
                              v{version.version}
                            </span>
                            {getStatusIcon(version.status)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {version.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{version.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{version.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{formatFileSize(version.fileSize)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Dialog */}
        {showUploadDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Subir nueva versión</h3>
                <button
                  onClick={() => setShowUploadDialog(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Archivo</label>
                  <input
                    type="file"
                    onChange={(e) => setNewVersionFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de versión</label>
                  <select
                    value={newVersionType}
                    onChange={(e) => setNewVersionType(e.target.value as 'major' | 'minor')}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="minor">Menor (1.1.x)</option>
                    <option value="major">Mayor (2.x.x)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notas de versión</label>
                  <textarea
                    value={newVersionNotes}
                    onChange={(e) => setNewVersionNotes(e.target.value)}
                    placeholder="Describa los cambios en esta versión..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUploadDialog(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUploadVersion}
                  disabled={!newVersionFile}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Subir versión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};