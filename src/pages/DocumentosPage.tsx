/**
 * DocumentosPage - Redesigned
 * 
 * Main page for document management with project integration
 * Requirements: 2, 3, 6, 7B
 * Task: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7
 */

import { useState } from 'react';
import { Search, Upload, Camera, Sparkles, FileText, Folder, HardDrive, Users } from 'lucide-react';
import ProyectoSelector from '@/components/documentos/ProyectoSelector';
import CarpetasProyectoGrid from '@/components/documentos/CarpetasProyectoGrid';
import DocumentoListItem from '@/components/documentos/DocumentoListItem';
import { useProyectos } from '@/hooks/useProyectos';
import { useDocumentos } from '@/hooks/useDocumentos';
import { proyectosApi } from '@/api/proyectos.api';
import { formatFileSize } from '@/utils/documentos.utils';

export default function DocumentosPage() {
  const [selectedProyecto, setSelectedProyecto] = useState<string>('');
  const [selectedCarpeta, setSelectedCarpeta] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);

  // Load projects
  const { proyectos, loading: loadingProyectos } = useProyectos({ activos: true });

  // Load documents for selected project and folder
  const { 
    documentos, 
    loading: loadingDocumentos,
    search 
  } = useDocumentos({
    proyectoId: selectedProyecto,
    tipo: selectedCarpeta || undefined,
    autoLoad: !!selectedProyecto
  });

  // Load project statistics
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Load stats when project changes
  const loadStats = async (proyectoId: string) => {
    if (!proyectoId) {
      setStats(null);
      return;
    }

    setLoadingStats(true);
    try {
      const response = await proyectosApi.getProyectoDocumentosStats(proyectoId);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Handle project selection
  const handleProyectoChange = (proyectoId: string) => {
    setSelectedProyecto(proyectoId);
    setSelectedCarpeta(null);
    setSearchQuery('');
    loadStats(proyectoId);
  };

  // Handle folder click
  const handleCarpetaClick = (tipo: string) => {
    setSelectedCarpeta(tipo);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    search(query);
  };

  // Get selected project info
  const selectedProyectoInfo = proyectos.find(p => p.id === selectedProyecto);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            {/* Title and Description */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
              <p className="mt-1 text-gray-600">
                Gestiona todos los documentos de tus proyectos en un solo lugar
              </p>
            </div>

            {/* Project Selector */}
            <div className="max-w-md">
              <ProyectoSelector
                value={selectedProyecto}
                onChange={handleProyectoChange}
                proyectos={proyectos}
                loading={loadingProyectos}
                placeholder="Selecciona un proyecto"
                showAllOption={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedProyecto ? (
          /* Empty State */
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <Folder className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecciona un proyecto
            </h3>
            <p className="text-gray-600">
              Elige un proyecto para ver y gestionar sus documentos
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Project Info Card */}
            {selectedProyectoInfo && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">
                      {selectedProyectoInfo.nombre}
                    </h2>
                    {selectedProyectoInfo.cliente && (
                      <p className="text-blue-100">
                        Cliente: {selectedProyectoInfo.cliente}
                      </p>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {selectedProyectoInfo.estado}
                  </span>
                </div>
              </div>
            )}

            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Documents */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-8 h-8 text-blue-500" />
                    {stats.documentos_procesados_ia > 0 && (
                      <Sparkles className="w-5 h-5 text-purple-500" />
                    )}
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total_documentos}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Total Documentos</p>
                </div>

                {/* Folders */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <Folder className="w-8 h-8 text-purple-500 mb-2" />
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total_carpetas}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Carpetas Proyecto</p>
                </div>

                {/* Storage Used */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <HardDrive className="w-8 h-8 text-green-500 mb-2" />
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.espacio_usado_gb.toFixed(1)} GB
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Espacio Usado</p>
                  {stats.porcentaje_espacio_usado > 0 && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(stats.porcentaje_espacio_usado, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Shared Documents */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <Users className="w-8 h-8 text-orange-500 mb-2" />
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.documentos_compartidos}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Compartidos</p>
                </div>
              </div>
            )}

            {/* Folders or Documents View */}
            {!selectedCarpeta ? (
              /* Folders Grid View */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Carpetas del Proyecto
                  </h3>
                </div>
                <CarpetasProyectoGrid
                  proyectoId={selectedProyecto}
                  onCarpetaClick={handleCarpetaClick}
                />
              </div>
            ) : (
              /* Documents List View */
              <div>
                {/* Breadcrumb and Search */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => setSelectedCarpeta(null)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Carpetas
                    </button>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900 font-medium">{selectedCarpeta}</span>
                  </div>

                  {/* Search */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Buscar documentos..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Documents List */}
                {loadingDocumentos ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : documentos.length > 0 ? (
                  <div className="space-y-3">
                    {documentos.map((doc) => (
                      <DocumentoListItem
                        key={doc.id}
                        documento={doc}
                        onView={(doc) => console.log('View:', doc)}
                        onDownload={(doc) => console.log('Download:', doc)}
                        onLinkToExpense={(doc) => console.log('Link:', doc)}
                        onViewExpense={(id) => console.log('View expense:', id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay documentos
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery 
                        ? 'No se encontraron documentos con ese término de búsqueda'
                        : 'Esta carpeta está vacía. Sube tu primer documento.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* AI Quick Actions Footer */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3">
              <button
                onClick={() => setShowScanModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span className="font-medium">Escanear Factura</span>
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">Subir Documento</span>
              </button>

              <button
                onClick={() => handleSearch('')}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">Buscar Inteligente</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
