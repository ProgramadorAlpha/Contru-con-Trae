import React from 'react';
import { 
  Download, Eye, Trash2, Edit3, Share2, History, Shield, Clock, User, FileText, AlertTriangle, CheckCircle, EyeOff, Lock 
} from 'lucide-react';
import { formatFileSize, formatDate } from '../../utils/formatters';
import { Document } from '../../types/documents';

interface DocumentCardProps {
  document: Document;
  onPreview: (document: Document) => void;
  onDownload: (document: Document) => void;
  onDelete: (documentId: string) => void;
  onAnnotate?: (document: Document) => void;
  onShare?: (document: Document) => void;
  onVersionControl?: (document: Document) => void;
  onSecurity?: (document: Document) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPreview,
  onDownload,
  onDelete,
  onAnnotate,
  onShare,
  onVersionControl,
  onSecurity
}) => {
  const getFileIcon = (type: string) => {
    const iconClass = "w-8 h-8";
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className={`${iconClass} text-red-600`} />;
      case 'image':
        return <FileText className={`${iconClass} text-blue-600`} />;
      case 'video':
        return <FileText className={`${iconClass} text-purple-600`} />;
      case 'document':
        return <FileText className={`${iconClass} text-green-600`} />;
      case 'spreadsheet':
        return <FileText className={`${iconClass} text-emerald-600`} />;
      case 'presentation':
        return <FileText className={`${iconClass} text-orange-600`} />;
      case 'drawing':
        return <FileText className={`${iconClass} text-indigo-600`} />;
      case 'contract':
        return <FileText className={`${iconClass} text-gray-600`} />;
      case 'permit':
        return <FileText className={`${iconClass} text-yellow-600`} />;
      case 'report':
        return <FileText className={`${iconClass} text-teal-600`} />;
      default:
        return <FileText className={`${iconClass} text-gray-600`} />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'technical': 'bg-blue-100 text-blue-800',
      'financial': 'bg-green-100 text-green-800',
      'legal': 'bg-red-100 text-red-800',
      'administrative': 'bg-purple-100 text-purple-800',
      'safety': 'bg-yellow-100 text-yellow-800',
      'quality': 'bg-indigo-100 text-indigo-800',
      'environmental': 'bg-emerald-100 text-emerald-800',
      'planning': 'bg-orange-100 text-orange-800'
    };
    return colors[category.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSecurityBadge = (securityLevel: string) => {
    switch (securityLevel) {
      case 'public':
        return null;
      case 'internal':
        return (
          <div className="flex items-center space-x-1 text-xs text-blue-600">
            <EyeOff className="w-3 h-3" />
            <span>Interno</span>
          </div>
        );
      case 'confidential':
        return (
          <div className="flex items-center space-x-1 text-xs text-yellow-600">
            <Lock className="w-3 h-3" />
            <span>Confidencial</span>
          </div>
        );
      case 'restricted':
        return (
          <div className="flex items-center space-x-1 text-xs text-red-600">
            <AlertTriangle className="w-3 h-3" />
            <span>Restringido</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <CheckCircle className="w-3 h-3" />
            <span>Aprobado</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center space-x-1 text-xs text-yellow-600">
            <Clock className="w-3 h-3" />
            <span>Pendiente</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center space-x-1 text-xs text-red-600">
            <AlertTriangle className="w-3 h-3" />
            <span>Rechazado</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getFileIcon(document.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate" title={document.name}>
                {document.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  {formatFileSize(document.size)}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {formatDate(document.uploadDate)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}>
              {document.category}
            </span>
            {getSecurityBadge(document.securityLevel)}
            {getStatusBadge(document.status)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Project Info */}
        {document.projectName && (
          <div className="mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <User className="w-3 h-3" />
              <span className="font-medium">Proyecto:</span>
              <span>{document.projectName}</span>
            </div>
          </div>
        )}

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {document.tags.slice(0, 3).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {document.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{document.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-500">Versiones</div>
            <div className="text-sm font-medium text-gray-900">{document.version || 1}</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-500">Anotaciones</div>
            <div className="text-sm font-medium text-gray-900">{document.annotationCount || 0}</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-500">Compartido</div>
            <div className="text-sm font-medium text-gray-900">{document.sharedWith || 0}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onPreview(document)}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            title="Vista previa"
          >
            <Eye className="w-3 h-3" />
            <span>Ver</span>
          </button>
          
          <button
            onClick={() => onDownload(document)}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            title="Descargar"
          >
            <Download className="w-3 h-3" />
            <span>Descargar</span>
          </button>

          {onAnnotate && (
            <button
              onClick={() => onAnnotate(document)}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
              title="Anotar"
            >
              <Edit3 className="w-3 h-3" />
              <span>Anotar</span>
            </button>
          )}

          {onShare && (
            <button
              onClick={() => onShare(document)}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
              title="Compartir"
            >
              <Share2 className="w-3 h-3" />
              <span>Compartir</span>
            </button>
          )}

          {onVersionControl && (
            <button
              onClick={() => onVersionControl(document)}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
              title="Control de versiones"
            >
              <History className="w-3 h-3" />
              <span>Versiones</span>
            </button>
          )}

          {onSecurity && (
            <button
              onClick={() => onSecurity(document)}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
              title="Seguridad"
            >
              <Shield className="w-3 h-3" />
              <span>Seguridad</span>
            </button>
          )}

          <button
            onClick={() => onDelete(document.id)}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            title="Eliminar"
          >
            <Trash2 className="w-3 h-3" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;