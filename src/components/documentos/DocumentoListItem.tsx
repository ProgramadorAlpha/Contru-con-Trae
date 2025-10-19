/**
 * DocumentoListItem Component
 * 
 * List item component for displaying document information
 * Requirements: 6, 9, 10
 * Task: 15.1, 15.2, 15.3, 15.4
 */

import { Eye, Download, Link2, ExternalLink, Sparkles, Calendar, User } from 'lucide-react';
import { getDocumentIcon, formatFileSize, formatDate, formatCurrency, getConfidenceColor } from '@/utils/documentos.utils';
import type { Documento } from '@/services/documento.service';

interface DocumentoListItemProps {
  documento: Documento;
  onView?: (documento: Documento) => void;
  onDownload?: (documento: Documento) => void;
  onLinkToExpense?: (documento: Documento) => void;
  onViewExpense?: (gastoId: string) => void;
  selected?: boolean;
  className?: string;
}

export default function DocumentoListItem({
  documento,
  onView,
  onDownload,
  onLinkToExpense,
  onViewExpense,
  selected = false,
  className = ''
}: DocumentoListItemProps) {
  const Icon = getDocumentIcon(documento.tipo, documento.mime_type);
  const hasGasto = documento.gasto;
  const canLinkToExpense = documento.es_factura && !hasGasto;

  return (
    <div
      className={`
        group relative bg-white border rounded-lg p-4
        hover:shadow-md transition-all duration-200
        ${selected ? 'border-blue-500 shadow-md' : 'border-gray-200'}
        ${className}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Document Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-gray-600" />
          </div>
        </div>

        {/* Document Info */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {documento.nombre}
              </h3>
              {documento.descripcion && (
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {documento.descripcion}
                </p>
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* AI Badge */}
              {documento.procesado_ia && documento.confianza_ia && (
                <div className={`
                  flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                  ${getConfidenceColor(documento.confianza_ia).bg}
                  ${getConfidenceColor(documento.confianza_ia).text}
                `}>
                  <Sparkles className="w-3 h-3" />
                  <span>{documento.confianza_ia}%</span>
                </div>
              )}

              {/* Invoice Amount Badge */}
              {documento.es_factura && documento.monto_factura && (
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  {formatCurrency(documento.monto_factura)}
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            {/* Supplier (for invoices) */}
            {documento.proveedor && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{documento.proveedor}</span>
              </div>
            )}

            {/* Date */}
            {(documento.fecha_factura || documento.created_at) && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDate(documento.fecha_factura || documento.created_at!)}
                </span>
              </div>
            )}

            {/* File Size */}
            <span>{formatFileSize(documento.archivo_size)}</span>

            {/* Folio (for invoices) */}
            {documento.folio && (
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                {documento.folio}
              </span>
            )}
          </div>

          {/* Linked Expense Info */}
          {hasGasto && (
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
              <Link2 className="w-4 h-4" />
              <span>Vinculado a gasto</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* View Button */}
          {onView && (
            <button
              onClick={() => onView(documento)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver documento"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}

          {/* Download Button */}
          {onDownload && (
            <button
              onClick={() => onDownload(documento)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Descargar"
            >
              <Download className="w-5 h-5" />
            </button>
          )}

          {/* Link to Expense Button */}
          {canLinkToExpense && onLinkToExpense && (
            <button
              onClick={() => onLinkToExpense(documento)}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Vincular a gasto"
            >
              <Link2 className="w-5 h-5" />
            </button>
          )}

          {/* View Expense Button */}
          {hasGasto && onViewExpense && (
            <button
              onClick={() => onViewExpense(documento.gasto.id)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver gasto"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="mt-3 flex items-center gap-2 sm:hidden">
        {onView && (
          <button
            onClick={() => onView(documento)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Ver</span>
          </button>
        )}

        {onDownload && (
          <button
            onClick={() => onDownload(documento)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Descargar</span>
          </button>
        )}

        {canLinkToExpense && onLinkToExpense && (
          <button
            onClick={() => onLinkToExpense(documento)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
          >
            <Link2 className="w-4 h-4" />
            <span>Vincular</span>
          </button>
        )}

        {hasGasto && onViewExpense && (
          <button
            onClick={() => onViewExpense(documento.gasto.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ver Gasto</span>
          </button>
        )}
      </div>
    </div>
  );
}
