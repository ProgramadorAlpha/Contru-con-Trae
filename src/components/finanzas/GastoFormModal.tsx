/**
 * GastoFormModal Component - Task 20.2
 * Requirements: 15.2, 15.3
 * 
 * Form modal for creating/editing gastos with document attachment support
 */
import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  Trash2,
  AlertCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import type { Gasto, CreateGastoDTO } from '../../services/gasto.service';
import type { Documento } from '../../services/documento.service';
import { gastoService } from '../../services/gasto.service';
import { documentoService } from '../../services/documento.service';

interface GastoFormModalProps {
  gasto?: Gasto;
  proyectoId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const GastoFormModal: React.FC<GastoFormModalProps> = ({
  gasto,
  proyectoId,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Partial<CreateGastoDTO>>({
    proyecto_id: proyectoId,
    categoria: gasto?.categoria || 'Materiales',
    concepto: gasto?.concepto || '',
    monto: gasto?.monto || 0,
    fecha: gasto?.fecha || new Date().toISOString().split('T')[0],
    proveedor: gasto?.proveedor || '',
    folio: gasto?.folio || '',
    metodo_pago: gasto?.metodo_pago || '',
    referencia: gasto?.referencia || ''
  });

  const [documentosAdjuntos, setDocumentosAdjuntos] = useState<File[]>([]);
  const [documentosExistentes, setDocumentosExistentes] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categorias = [
    'Materiales',
    'Mano de obra',
    'Subcontratistas',
    'Maquinaria',
    'Transporte',
    'Permisos/Licencias',
    'Otros'
  ];

  const metodosPago = [
    'Transferencia',
    'Efectivo',
    'Cheque',
    'Tarjeta'
  ];

  useEffect(() => {
    if (gasto) {
      cargarDocumentosExistentes();
    }
  }, [gasto]);

  const cargarDocumentosExistentes = async () => {
    if (!gasto) return;
    
    try {
      const docs = await documentoService.getDocumentosPorGasto(gasto.id);
      setDocumentosExistentes(docs);
    } catch (error) {
      console.error('Error loading existing documents:', error);
    }
  };

  const handleChange = (field: keyof CreateGastoDTO, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocumentosAdjuntos(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setDocumentosAdjuntos(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingDocument = async (documentoId: string) => {
    if (!confirm('¿Eliminar este documento?')) return;

    try {
      await documentoService.desvincularDeGasto(documentoId);
      setDocumentosExistentes(prev => prev.filter(d => d.id !== documentoId));
    } catch (error) {
      console.error('Error removing document:', error);
      setError('Error al eliminar el documento');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.concepto || formData.concepto.trim().length < 3) {
      setError('El concepto debe tener al menos 3 caracteres');
      return false;
    }

    if (!formData.monto || formData.monto <= 0) {
      setError('El monto debe ser mayor a 0');
      return false;
    }

    if (!formData.fecha) {
      setError('La fecha es requerida');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let gastoId: string;

      if (gasto) {
        // Update existing gasto
        await gastoService.updateGasto(gasto.id, formData);
        gastoId = gasto.id;
      } else {
        // Create new gasto
        const nuevoGasto = await gastoService.createGasto(formData as CreateGastoDTO);
        gastoId = nuevoGasto.id;
      }

      // Upload and link documents - Requirement 15.2
      if (documentosAdjuntos.length > 0) {
        const documentoIds: string[] = [];

        for (const file of documentosAdjuntos) {
          const documento = await documentoService.subirDocumento({
            proyecto_id: proyectoId,
            nombre: file.name,
            tipo: 'Factura',
            archivo: file,
            descripcion: `Documento adjunto a gasto: ${formData.concepto}`,
            usuario_id: 'current-user' // TODO: Get from auth
          });

          documentoIds.push(documento.id);
        }

        // Link all documents to the gasto
        await documentoService.vincularDocumentosAGasto(documentoIds, gastoId);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving gasto:', error);
      setError('Error al guardar el gasto. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {gasto ? 'Editar Gasto' : 'Nuevo Gasto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Información Básica
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => handleChange('categoria', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Concepto *
                </label>
                <input
                  type="text"
                  value={formData.concepto}
                  onChange={(e) => handleChange('concepto', e.target.value)}
                  placeholder="Descripción del gasto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      value={formData.monto}
                      onChange={(e) => handleChange('monto', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => handleChange('fecha', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Detalles Adicionales
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proveedor
                  </label>
                  <input
                    type="text"
                    value={formData.proveedor}
                    onChange={(e) => handleChange('proveedor', e.target.value)}
                    placeholder="Nombre del proveedor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Folio/Factura
                  </label>
                  <input
                    type="text"
                    value={formData.folio}
                    onChange={(e) => handleChange('folio', e.target.value)}
                    placeholder="Número de factura"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago
                  </label>
                  <select
                    value={formData.metodo_pago}
                    onChange={(e) => handleChange('metodo_pago', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    {metodosPago.map(metodo => (
                      <option key={metodo} value={metodo}>{metodo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referencia
                  </label>
                  <input
                    type="text"
                    value={formData.referencia}
                    onChange={(e) => handleChange('referencia', e.target.value)}
                    placeholder="Referencia de pago"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Document Attachments - Requirement 15.2, 15.3 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Documentos Adjuntos
            </h3>

            {/* Existing Documents */}
            {documentosExistentes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2">Documentos actuales:</p>
                <div className="space-y-2">
                  {documentosExistentes.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {doc.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(doc.archivo_size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingDocument(doc.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
              <label className="flex flex-col items-center cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 mb-1">
                  Haz clic para adjuntar documentos
                </span>
                <span className="text-xs text-gray-500">
                  PDF, imágenes, hasta 10MB por archivo
                </span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* New Files List */}
            {documentosAdjuntos.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-600">Nuevos archivos a adjuntar:</p>
                {documentosAdjuntos.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : gasto ? 'Actualizar' : 'Crear Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GastoFormModal;
