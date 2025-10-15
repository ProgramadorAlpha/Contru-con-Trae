import React, { useState } from 'react';
import { X, Download, FileText, Eye, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string | Date;
  projectId?: string;
  category: string;
  url?: string;
}

interface DocumentPreviewProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (document: Document) => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  isOpen,
  onClose,
  onDownload
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    onDownload(document);
  };

  const isImageFile = (type: string) => {
    return ['JPG', 'JPEG', 'PNG', 'GIF', 'BMP'].includes(type.toUpperCase());
  };

  const isPDFFile = (type: string) => {
    return type.toUpperCase() === 'PDF';
  };

  const getFileIcon = (type: string) => {
    const iconClass = "w-16 h-16";
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className={`${iconClass} text-red-500`} />;
      case 'dwg':
        return <FileText className={`${iconClass} text-blue-500`} />;
      case 'xlsx':
      case 'xls':
        return <FileText className={`${iconClass} text-green-500`} />;
      case 'docx':
      case 'doc':
        return <FileText className={`${iconClass} text-blue-600`} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileText className={`${iconClass} text-purple-500`} />;
      case 'zip':
      case 'rar':
        return <FileText className={`${iconClass} text-yellow-500`} />;
      default:
        return <FileText className={`${iconClass} text-gray-500`} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>

        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${
          isFullscreen ? 'sm:max-w-7xl sm:w-full' : 'sm:max-w-4xl sm:w-full'
        }`}>
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8">
                  {getFileIcon(document.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {document.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {document.type} • {formatFileSize(document.size)} • Subido el {formatDate(document.uploadDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Control Buttons */}
                <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Alejar"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-xs text-gray-500 min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Acercar"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRotate}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Rotar"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Restablecer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Descargar"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-50 px-6 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              {isImageFile(document.type) ? (
                <div className="relative" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}>
                  <img
                    src={document.url || `https://via.placeholder.com/600x400?text=${document.type}`}
                    alt={document.name}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                </div>
              ) : isPDFFile(document.type) ? (
                <div className="w-full h-[500px] bg-white rounded-lg shadow-lg overflow-hidden">
                  {document.url ? (
                    <iframe
                      src={document.url}
                      className="w-full h-full border-0"
                      title={document.name}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Vista previa no disponible</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Descarga el archivo para ver su contenido
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
                    {getFileIcon(document.type)}
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Vista previa no disponible
                  </h4>
                  <p className="text-gray-500 mb-4">
                    Este tipo de archivo no se puede previsualizar en el navegador.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar archivo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Document Info */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-6">
                <span><strong>Categoría:</strong> {document.category}</span>
                <span><strong>Proyecto:</strong> {document.projectId}</span>
              </div>
              <div className="flex items-center space-x-6">
                <span><strong>Tamaño:</strong> {formatFileSize(document.size)}</span>
                <span><strong>Tipo:</strong> {document.type}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;