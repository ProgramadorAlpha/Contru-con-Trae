import React, { useState, useEffect } from 'react';
import { 
  Upload, Search, Filter, Grid, List, Download, Eye, 
  Trash2, Plus, X, Settings, Share2, Users, 
  Shield, History, Edit3, MessageSquare, FileText,
  Lock, Key, EyeOff, AlertTriangle, CheckCircle,
  Clock, User, Copy, Ban, Check
} from 'lucide-react';
import { documentAPI } from '../api/documentAPI';
import { 
  documentVersionAPI, 
  documentAnnotationAPI,
  documentSharingAPI,
  documentSecurityAPI,
  documentIntegrationAPI 
} from '../api/documentAdvancedAPI';
import DocumentCard from './documents/DocumentCard';
import DocumentList from './documents/DocumentList';
import DocumentFilters from './documents/DocumentFilters';
import DocumentUpload from './documents/DocumentUpload';
import DocumentPreview from './documents/DocumentPreview';
import DocumentUploadAdvanced from './documents/DocumentUploadAdvanced';
import { DocumentAnnotationEditor } from './documents/DocumentAnnotationEditor';
import { AdvancedSearch } from './documents/AdvancedSearch';
import { SearchResults } from './documents/SearchResults';
import { DocumentSharing } from './documents/DocumentSharing';
import { DocumentVersionControl } from './documents/DocumentVersionControl';
import { DocumentSecurity } from './documents/DocumentSecurity';
import { Document, DocumentVersion, DocumentAnnotation, DocumentCollaborator, SearchFilters, SearchResult } from '../types/documents';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);
  const [showAnnotationEditor, setShowAnnotationEditor] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [showVersionControl, setShowVersionControl] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'versions' | 'annotations' | 'sharing' | 'security'>('documents');
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  const [documentAnnotations, setDocumentAnnotations] = useState<DocumentAnnotation[]>([]);
  const [documentCollaborators, setDocumentCollaborators] = useState<DocumentCollaborator[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [securityRules, setSecurityRules] = useState<any[]>([]);

  // Filtros
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    category: '',
    type: '',
    project: '',
    dateRange: { start: '', end: '' },
    tags: []
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [docsData, categoriesData, typesData, projectsData] = await Promise.all([
        documentAPI.getAll(),
        documentAPI.getCategories(),
        documentAPI.getTypes(),
        documentAPI.getProjects()
      ]);
      
      setDocuments(docsData);
      setCategories(categoriesData);
      setTypes(typesData);
      setProjects(projectsData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentDetails = async (documentId: string) => {
    try {
      const [versions, annotations, collaborators, logs, rules] = await Promise.all([
        documentVersionAPI.getVersions(documentId),
        documentAnnotationAPI.getAnnotations(documentId),
        documentSharingAPI.getCollaborators(documentId),
        documentSecurityAPI.getAccessLogs(documentId),
        documentSecurityAPI.getSecurityRules(documentId)
      ]);
      
      setDocumentVersions(versions);
      setDocumentAnnotations(annotations);
      setDocumentCollaborators(collaborators);
      setAccessLogs(logs);
      setSecurityRules(rules);
    } catch (err) {
      console.error('Error loading document details:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchLower) ||
        doc.category.toLowerCase().includes(searchLower) ||
        doc.type.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(doc => doc.category === filters.category);
    }

    if (filters.type) {
      filtered = filtered.filter(doc => doc.type === filters.type);
    }

    if (filters.project) {
      filtered = filtered.filter(doc => doc.projectId === filters.project);
    }

    if (filters.dateRange?.start && filters.dateRange?.end) {
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.uploadDate);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        return docDate >= startDate && docDate <= endDate;
      });
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(doc => 
        filters.tags!.some(tag => doc.tags?.includes(tag))
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm });
    setUseAdvancedSearch(false);
  };

  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);
    setUseAdvancedSearch(true);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    loadInitialData();
  };

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('¿Está seguro de eliminar este documento?')) {
      try {
        await documentAPI.delete(documentId);
        loadInitialData();
      } catch (err) {
        setError('Error al eliminar el documento');
      }
    }
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      await documentAPI.download(document.id);
      // Registrar acceso
      await documentSecurityAPI.logAccess(document.id, 'download');
    } catch (err) {
      setError('Error al descargar el documento');
    }
  };

  const handlePreviewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
    // Cargar detalles del documento
    loadDocumentDetails(document.id);
  };

  const handleAnnotateDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowAnnotationEditor(true);
  };

  const handleShareDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowSharingModal(true);
  };

  const handleVersionControl = (document: Document) => {
    setSelectedDocument(document);
    setShowVersionControl(true);
  };

  const handleSecuritySettings = (document: Document) => {
    setSelectedDocument(document);
    setShowSecurityModal(true);
  };

  const handlePermissionsUpdate = async (permissions: any) => {
    if (!selectedDocument) return;
    
    try {
      await documentSecurityAPI.updatePermissions(selectedDocument.id, permissions);
      // Actualizar documento local
      setDocuments(prev => prev.map(doc => 
        doc.id === selectedDocument.id ? { ...doc, permissions } : doc
      ));
    } catch (err) {
      setError('Error al actualizar permisos');
    }
  };

  const handleCollaboratorAdd = async (collaborator: DocumentCollaborator) => {
    if (!selectedDocument) return;
    
    try {
      await documentSharingAPI.addCollaborator(selectedDocument.id, collaborator);
      setDocumentCollaborators(prev => [...prev, collaborator]);
    } catch (err) {
      setError('Error al agregar colaborador');
    }
  };

  const handleCollaboratorRemove = async (collaboratorId: string) => {
    if (!selectedDocument) return;
    
    try {
      await documentSharingAPI.removeCollaborator(selectedDocument.id, collaboratorId);
      setDocumentCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
    } catch (err) {
      setError('Error al eliminar colaborador');
    }
  };

  const handleAnnotationSave = async (annotations: DocumentAnnotation[]) => {
    if (!selectedDocument) return;
    
    try {
      await Promise.all(annotations.map(annotation => 
        documentAnnotationAPI.addAnnotation(selectedDocument.id, annotation)
      ));
      setDocumentAnnotations(prev => [...prev, ...annotations]);
    } catch (err) {
      setError('Error al guardar anotaciones');
    }
  };

  const handleVersionRestore = async (versionId: string) => {
    if (!selectedDocument) return;
    
    try {
      await documentVersionAPI.restoreVersion(selectedDocument.id, versionId);
      loadInitialData();
    } catch (err) {
      setError('Error al restaurar versión');
    }
  };

  const handleVersionCompare = async (versionIds: string[]) => {
    console.log('Comparando versiones:', versionIds);
    // Implementar lógica de comparación
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  const displayDocuments = useAdvancedSearch ? searchResults.map(result => result.document) : filteredDocuments;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Documentos</h1>
                <p className="text-sm text-gray-500">Administra y organiza tus documentos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleUpload}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" />
                <span>Subir Documento</span>
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <AdvancedSearch 
                onSearchResults={handleSearchResults}
                onClear={() => setUseAdvancedSearch(false)}
              />
            </div>
            <div className="flex items-center space-x-3">
              <DocumentFilters
                onSearch={handleSearch}
                categories={categories}
                types={types}
                projects={projects}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            {useAdvancedSearch ? (
              <>Mostrando {searchResults.length} resultados de búsqueda</>
            ) : (
              <>Mostrando {filteredDocuments.length} de {documents.length} documentos</>
            )}
          </div>
          {useAdvancedSearch && (
            <button
              onClick={() => setUseAdvancedSearch(false)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>

        {/* Documents Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onPreview={() => handlePreviewDocument(document)}
                onDownload={() => handleDownloadDocument(document)}
                onDelete={() => handleDeleteDocument(document.id)}
                onAnnotate={() => handleAnnotateDocument(document)}
                onShare={() => handleShareDocument(document)}
                onVersionControl={() => handleVersionControl(document)}
                onSecurity={() => handleSecuritySettings(document)}
              />
            ))}
          </div>
        ) : (
          <DocumentList
            documents={displayDocuments}
            onPreview={handlePreviewDocument}
            onDownload={handleDownloadDocument}
            onDelete={handleDeleteDocument}
            onAnnotate={handleAnnotateDocument}
            onShare={handleShareDocument}
            onVersionControl={handleVersionControl}
            onSecurity={handleSecuritySettings}
          />
        )}

        {displayDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
            <p className="text-gray-500 mb-4">
              {useAdvancedSearch ? 'No se encontraron documentos con los criterios de búsqueda.' : 'Comienza subiendo tu primer documento.'}
            </p>
            {!useAdvancedSearch && (
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Subir Documento
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showUploadModal && (
        <DocumentUploadAdvanced
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadSuccess}
          categories={categories}
          projectId={undefined}
          enableAutoClassification={true}
        />
      )}

      {showPreviewModal && selectedDocument && (
        <DocumentPreview
          document={selectedDocument}
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          onDownload={() => handleDownloadDocument(selectedDocument)}
        />
      )}

      {showAnnotationEditor && selectedDocument && (
        <DocumentAnnotationEditor
          document={selectedDocument}
          isOpen={showAnnotationEditor}
          onClose={() => setShowAnnotationEditor(false)}
          onSave={handleAnnotationSave}
        />
      )}

      {showSharingModal && selectedDocument && (
        <DocumentSharing
          document={selectedDocument}
          isOpen={showSharingModal}
          onClose={() => setShowSharingModal(false)}
          collaborators={documentCollaborators}
          onCollaboratorAdd={handleCollaboratorAdd}
          onCollaboratorRemove={handleCollaboratorRemove}
        />
      )}

      {showVersionControl && selectedDocument && (
        <DocumentVersionControl
          document={selectedDocument}
          isOpen={showVersionControl}
          onClose={() => setShowVersionControl(false)}
          versions={documentVersions}
          onVersionRestore={handleVersionRestore}
          onVersionCompare={handleVersionCompare}
        />
      )}

      {showSecurityModal && selectedDocument && (
        <DocumentSecurity
          document={selectedDocument}
          isOpen={showSecurityModal}
          onClose={() => setShowSecurityModal(false)}
          onPermissionsUpdate={handlePermissionsUpdate}
          onCollaboratorAdd={handleCollaboratorAdd}
          onCollaboratorRemove={handleCollaboratorRemove}
        />
      )}
    </div>
  );
};

export default DocumentsPage;