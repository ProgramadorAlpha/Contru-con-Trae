/**
 * GastoCard Component - Task 20.2
 * Requirements: 15.2, 15.3
 * 
 * Displays a gasto with attached documents and preview capability
 */
import React, { useState, useEffect } from 'react';
import {
  FileText,
  Paperclip,
  Eye,
  Download,
  X,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { Gasto } from '../../services/gasto.service';
import type { Documento } from '../../services/documento.service';
import { documentoService } from '../../services/documento.service';

interface GastoCardProps {
  gasto: Gasto;
  onEdit?: (gasto: Gasto) => void;
  onDelete?: (gastoId: string) => void;
  onApprove?: (gastoId: string) => void;
}

export const GastoCard: React.FC<GastoCardProps> = ({
  gasto,
  onEdit,
  onDelete,
  onApprove
}) => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDocumento, setPreviewDocumento] = useState<Documento | null>(null);

  useEffect(() => {
    cargarDocumentos();
  }, [gasto.id]);

  const cargarDocumentos = async () => {
    try {
      setLoadingDocumentos(true);
      const docs = await documentoService.getDocumentosPorGasto(gasto.id);
      setDocumentos(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoadingDocumentos(false);
    }
  };

  const handlePreview = (documento: Documento) => {
    setPreviewDocumento(documento);
    setShowPreview(true);
  };

  const handleDownload = (documento: Documento) => {
    // In real implementation, would download the file
    window.open(documento.archivo_url, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900">
                {gasto.concepto}
              </h3>
              {gasto.aprobado ? (
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Aprobado
                </span>
              ) : (
                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Pendiente
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600">
              {gasto.categoria} {gasto.proveedor && `• ${gasto.proveedor}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(gasto.monto)}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(gasto.fecha)}
          </span>
          {gasto.folio && (
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {gasto.folio}
            </span>
          )}
          {gasto.metodo_pago && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {gasto.metodo_pago}
            </span>
          )}
        </div>

        {/* Attached Documents - Requirement 15.2, 15.3 */}
        {documentos.length > 0 && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">
                Documentos adjuntos ({documentos.length})
              </span>
            </div>
            <div className="space-y-2">
              {documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {doc.nombre}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(doc.archivo_size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePreview(doc)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Vista previa"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="Descargar"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loadingDocumentos && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">Cargando documentos...</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            {gasto.aprobado && gasto.aprobado_por && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Aprobado por {gasto.aprobado_por}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {!gasto.aprobado && onApprove && (
              <button
                onClick={() => onApprove(gasto.id)}
                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Aprobar
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(gasto)}
                className="px-3 py-1.5 text-xs text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(gasto.id)}
                className="px-3 py-1.5 text-xs text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Document Preview Modal - Requirement 15.3 */}
      {showPreview && previewDocumento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {previewDocumento.nombre}
                </h3>
                <p className="text-sm text-gray-600">
                  {previewDocumento.tipo} • {(previewDocumento.archivo_size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4">
              {previewDocumento.mime_type.startsWith('image/') ? (
                <img
                  src={previewDocumento.archivo_url}
                  alt={previewDocumento.nombre}
                  className="max-w-full h-auto mx-auto"
                />
              ) : previewDocumento.mime_type === 'application/pdf' ? (
                <iframe
                  src={previewDocumento.archivo_url}
                  className="w-full h-[600px] border-0"
                  title={previewDocumento.nombre}
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Vista previa no disponible para este tipo de archivo
                  </p>
                  <button
                    onClick={() => handleDownload(previewDocumento)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Descargar archivo
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => handleDownload(previewDocumento)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GastoCard;
