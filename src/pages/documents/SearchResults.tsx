import React from 'react';
import { Search, FileText, Calendar, Folder, Tag, Download, Eye, Trash2 } from 'lucide-react';
import { SearchResult } from '../../types/documents';
import { Document } from '../../types/documents';

interface SearchResultsProps {
  results: SearchResult[];
  onPreview: (document: Document) => void;
  onDownload: (document: Document) => void;
  onDelete: (document: Document) => void;
  onAnnotate?: (document: Document) => void;
  viewMode?: 'grid' | 'list';
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onPreview,
  onDownload,
  onDelete,
  onAnnotate,
  viewMode = 'grid'
}) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'jpg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Search className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron documentos</h3>
        <p className="text-gray-500">
          Intenta ajustar tus criterios de búsqueda o filtros.
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map((result, index) => {
          const document = result.document;
          
          return (
            <div
              key={`${document.id}-${index}`}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {/* Icono y nombre */}
              <div className="flex items-start space-x-3 mb-3">
                <div className="text-2xl">{getFileIcon(document.type)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {document.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(document.size)} • {document.type.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Información del documento */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(document.uploadDate.toString())}
                </div>

                {document.category && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Folder className="w-4 h-4 mr-1" />
                    {document.category}
                  </div>
                )}

                {document.tags && document.tags.length > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Tag className="w-4 h-4 mr-1" />
                    <div className="flex flex-wrap gap-1">
                      {document.tags.slice(0, 2).map((tag: string, idx: number) => (
                        <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {document.tags.length > 2 && (
                        <span className="text-xs text-gray-400">+{document.tags.length - 2}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Score de relevancia */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Relevancia</span>
                  <span className="font-medium text-blue-600">
                    {Math.round(result.score * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${result.score * 100}%` }}
                  />
                </div>
              </div>

              {/* Acciones */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onPreview(document)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver</span>
                </button>
                <button
                  onClick={() => onDownload(document)}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  title="Descargar"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(document)}
                  className="p-2 text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vista de lista
  return (
    <div className="space-y-2">
      {results.map((result, index) => {
        const document = result.document;
        
        return (
          <div
            key={`${document.id}-${index}`}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="text-2xl">{getFileIcon(document.type)}</div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{document.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{formatFileSize(document.size)}</span>
                    <span>{document.type.toUpperCase()}</span>
                    <span>{formatDate(document.uploadDate.toString())}</span>
                    {document.category && (
                      <span className="flex items-center">
                        <Folder className="w-3 h-3 mr-1" />
                        {document.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Relevancia:</span>
                  <span className="font-medium text-blue-600">
                    {Math.round(result.score * 100)}%
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${result.score * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onPreview(document)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver</span>
                </button>
                <button
                  onClick={() => onDownload(document)}
                  className="p-1 text-gray-600 hover:text-gray-800"
                  title="Descargar"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(document)}
                  className="p-1 text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};