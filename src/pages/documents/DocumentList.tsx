import React from 'react';
import { 
  Download, Eye, Trash2, Edit3, Share2, History, Shield, Clock, User, FileText, AlertTriangle, CheckCircle, EyeOff, Lock 
} from 'lucide-react';
import { formatFileSize, formatDate } from '../../utils/formatters';
import { Document } from '../../types/documents';

interface DocumentListProps {
  documents: Document[];
  onPreview: (document: Document) => void;
  onDownload: (document: Document) => void;
  onDelete: (documentId: string) => void;
  onAnnotate?: (document: Document) => void;
  onShare?: (document: Document) => void;
  onVersionControl?: (document: Document) => void;
  onSecurity?: (document: Document) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onPreview,
  onDownload,
  onDelete,
  onAnnotate,
  onShare,
  onVersionControl,
  onSecurity
}) => {
  const getFileIcon = (type: string) => {
    const iconClass = "w-5 h-5";
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proyecto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tamaño
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seguridad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estadísticas
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((document) => (
              <tr key={document.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getFileIcon(document.type)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900" title={document.name}>
                        {document.name.length > 30 
                          ? `${document.name.substring(0, 30)}...` 
                          : document.name}
                      </div>
                      <div className="text-sm text-gray-500">{document.type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}>
                    {document.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{document.projectName || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(document.uploadDate)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatFileSize(document.size)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(document.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getSecurityBadge(document.securityLevel)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-4 text-xs text-gray-500">
                    <div className="text-center">
                      <div className="font-medium">{document.version || 1}</div>
                      <div>Ver</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{document.annotationCount || 0}</div>
                      <div>Anot.</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{document.sharedWith || 0}</div>
                      <div>Comp.</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => onPreview(document)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Vista previa"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDownload(document)}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="Descargar"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {onAnnotate && (
                      <button
                        onClick={() => onAnnotate(document)}
                        className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                        title="Anotar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {onShare && (
                      <button
                        onClick={() => onShare(document)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                        title="Compartir"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                    {onVersionControl && (
                      <button
                        onClick={() => onVersionControl(document)}
                        className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                        title="Control de versiones"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    )}
                    {onSecurity && (
                      <button
                        onClick={() => onSecurity(document)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Seguridad"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(document.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentList;