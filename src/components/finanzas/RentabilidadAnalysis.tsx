/**
 * RentabilidadAnalysis Component - Task 19.2
 * Requirements: 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8
 * 
 * Displays complete profitability analysis with charts and comparative tables
 */
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  Paperclip,
  Eye,
  X
} from 'lucide-react';
import type { AnalisisRentabilidad } from '../../types/rentabilidad.types';
import type { Documento } from '../../services/documento.service';
import type { Gasto } from '../../services/gasto.service';
import { rentabilidadService } from '../../services/rentabilidad.service';
import { generarPDFAnalisisRentabilidad } from '../../utils/pdf-generator.utils';
import { documentoService } from '../../services/documento.service';
import { gastoService } from '../../services/gasto.service';

interface RentabilidadAnalysisProps {
  proyectoId: string;
  presupuestoId: string;
  onClose?: () => void;
}

export const RentabilidadAnalysis: React.FC<RentabilidadAnalysisProps> = ({
  proyectoId,
  presupuestoId,
  onClose
}) => {
  const [analisis, setAnalisis] = useState<AnalisisRentabilidad | null>(null);
  const [loading, setLoading] = useState(true);
  const [nuevaNota, setNuevaNota] = useState('');
  const [agregandoNota, setAgregandoNota] = useState(false);
  const [documentosPorCategoria, setDocumentosPorCategoria] = useState<Record<string, Documento[]>>({});
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [showDocumentosModal, setShowDocumentosModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  useEffect(() => {
    cargarAnalisis();
    cargarDocumentos();
  }, [proyectoId, presupuestoId]);

  const cargarAnalisis = async () => {
    try {
      setLoading(true);
      // Try to get existing analysis
      let analisisExistente = await rentabilidadService.getAnalisisByProyecto(proyectoId);
      
      // If not found, calculate it
      if (!analisisExistente) {
        analisisExistente = await rentabilidadService.calcularAnalisisRentabilidad(
          proyectoId,
          presupuestoId
        );
      }
      
      setAnalisis(analisisExistente);
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  // Task 20.3: Load documents grouped by expense category
  // Requirements: 15.4, 15.5
  const cargarDocumentos = async () => {
    try {
      setLoadingDocumentos(true);
      
      // Get all gastos for the project
      const gastos = await gastoService.getGastosByProyecto(proyectoId);
      
      // Get documents grouped by category
      const documentosAgrupados = await documentoService.getDocumentosAgrupadosPorCategoria(
        proyectoId,
        gastos.map(g => ({ id: g.id, categoria: g.categoria }))
      );
      
      setDocumentosPorCategoria(documentosAgrupados);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoadingDocumentos(false);
    }
  };

  const handleAgregarNota = async () => {
    if (!nuevaNota.trim() || !analisis) return;
    
    try {
      setAgregandoNota(true);
      const analisisActualizado = await rentabilidadService.agregarNota(
        proyectoId,
        nuevaNota.trim()
      );
      setAnalisis(analisisActualizado);
      setNuevaNota('');
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setAgregandoNota(false);
    }
  };

  const handleExportarPDF = async () => {
    if (!analisis) return;
    
    try {
      const blob = await generarPDFAnalisisRentabilidad(analisis);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analisis-rentabilidad-${proyectoId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const handleVerDocumentos = (categoria: string) => {
    setCategoriaSeleccionada(categoria);
    setShowDocumentosModal(true);
  };

  const handleDownloadDocumento = (documento: Documento) => {
    window.open(documento.archivo_url, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getVariationColor = (variacion: number) => {
    if (variacion > 0) return 'text-green-600';
    if (variacion < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVariationIcon = (variacion: number) => {
    if (variacion > 0) return <TrendingUp className="w-4 h-4" />;
    if (variacion < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analisis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se pudo cargar el análisis de rentabilidad</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Análisis de Rentabilidad</h2>
          <p className="text-sm text-gray-600 mt-1">
            Proyecto: {proyectoId}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportarPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Key Metrics - Requirement 11.5 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Margen Bruto</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(analisis.margenBruto)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {analisis.margenBrutoPorcentaje.toFixed(2)}% del total
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Utilidad Neta</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(analisis.utilidadNeta)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {analisis.utilidadNetaPorcentaje.toFixed(2)}% del total
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">ROI</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {analisis.roi.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Retorno de inversión
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tiempo Ejecución</span>
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {analisis.tiempoEjecucion.real} días
          </p>
          <p className={`text-sm mt-1 ${getVariationColor(analisis.tiempoEjecucion.variacion)}`}>
            {analisis.tiempoEjecucion.variacion > 0 ? '+' : ''}
            {analisis.tiempoEjecucion.variacion} días vs planificado
          </p>
        </div>
      </div>

      {/* Income Breakdown - Requirement 11.2 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Presupuesto Original</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(analisis.ingresos.presupuestoOriginal)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cambios Aprobados</p>
            <p className={`text-xl font-bold ${getVariationColor(analisis.ingresos.cambiosAprobados)}`}>
              {formatCurrency(analisis.ingresos.cambiosAprobados)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Facturado</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(analisis.ingresos.totalFacturado)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Cobrado</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(analisis.ingresos.totalCobrado)}
            </p>
          </div>
        </div>
      </div>

      {/* Direct Costs Breakdown - Requirement 11.3 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Costos Directos</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-600">Subcontratistas</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(analisis.costosDirectos.subcontratistas)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Materiales</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(analisis.costosDirectos.materiales)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Maquinaria</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(analisis.costosDirectos.maquinaria)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Otros</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(analisis.costosDirectos.otros)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(analisis.costosDirectos.total)}
            </p>
          </div>
        </div>
      </div>

      {/* Operational Expenses - Requirement 11.4 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos Operativos</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-600">Personal Propio</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(analisis.gastosOperativos.personalPropio)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Transporte</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(analisis.gastosOperativos.transporte)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Permisos/Licencias</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(analisis.gastosOperativos.permisosLicencias)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Otros</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(analisis.gastosOperativos.otros)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(analisis.gastosOperativos.total)}
            </p>
          </div>
        </div>
      </div>

      {/* Comparative Table - Requirement 11.6 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Comparativa Presupuesto vs Real
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Concepto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Presupuestado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Real
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  %
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documentos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analisis.comparativa.map((item, index) => {
                const documentosCategoria = documentosPorCategoria[item.concepto] || [];
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.concepto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(item.presupuestado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(item.real)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getVariationColor(item.variacion)}`}>
                      {formatCurrency(item.variacion)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getVariationColor(item.variacionPorcentaje)}`}>
                      <div className="flex items-center justify-end gap-1">
                        {getVariationIcon(item.variacionPorcentaje)}
                        {formatPercentage(item.variacionPorcentaje)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {documentosCategoria.length > 0 ? (
                        <button
                          onClick={() => handleVerDocumentos(item.concepto)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                        >
                          <Paperclip className="w-3 h-3" />
                          {documentosCategoria.length}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Time - Requirement 11.7 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tiempo de Ejecución
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Planificado</p>
            <p className="text-xl font-bold text-gray-900">
              {analisis.tiempoEjecucion.planificado} días
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Real</p>
            <p className="text-xl font-bold text-gray-900">
              {analisis.tiempoEjecucion.real} días
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Variación</p>
            <p className={`text-xl font-bold ${getVariationColor(analisis.tiempoEjecucion.variacion)}`}>
              {analisis.tiempoEjecucion.variacion > 0 ? '+' : ''}
              {analisis.tiempoEjecucion.variacion} días
            </p>
          </div>
        </div>
        
        {/* Visual progress bar */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">Progreso temporal:</span>
            <span className="text-sm font-medium text-gray-900">
              {analisis.tiempoEjecucion.planificado > 0 
                ? ((analisis.tiempoEjecucion.real / analisis.tiempoEjecucion.planificado) * 100).toFixed(0)
                : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                analisis.tiempoEjecucion.variacion <= 0 ? 'bg-green-600' : 'bg-red-600'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  analisis.tiempoEjecucion.planificado > 0
                    ? (analisis.tiempoEjecucion.real / analisis.tiempoEjecucion.planificado) * 100
                    : 0
                )}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Notes Section - Requirement 11.8 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Notas Explicativas
        </h3>
        
        {/* Add note form */}
        <div className="mb-4">
          <textarea
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
            placeholder="Agregar nota sobre variaciones significativas..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <button
            onClick={handleAgregarNota}
            disabled={!nuevaNota.trim() || agregandoNota}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {agregandoNota ? 'Agregando...' : 'Agregar Nota'}
          </button>
        </div>

        {/* Display notes */}
        {analisis.notas.length > 0 ? (
          <div className="space-y-2">
            {analisis.notas.map((nota, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{nota}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            No hay notas agregadas. Agrega notas para explicar variaciones significativas.
          </p>
        )}
      </div>

      {/* Supporting Documents Summary - Requirements 15.4, 15.5 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Paperclip className="w-5 h-5" />
          Documentos Respaldo
        </h3>
        
        {loadingDocumentos ? (
          <p className="text-sm text-gray-600">Cargando documentos...</p>
        ) : Object.keys(documentosPorCategoria).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(documentosPorCategoria).map(([categoria, documentos]) => (
              <div
                key={categoria}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">{categoria}</h4>
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {documentos.length}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  {documentos.length} documento{documentos.length !== 1 ? 's' : ''} adjunto{documentos.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => handleVerDocumentos(categoria)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Ver documentos
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            No hay documentos adjuntos a los gastos de este proyecto.
          </p>
        )}
      </div>

      {/* Documents Modal - Requirements 15.4, 15.5 */}
      {showDocumentosModal && categoriaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Documentos - {categoriaSeleccionada}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {documentosPorCategoria[categoriaSeleccionada]?.length || 0} documentos
                </p>
              </div>
              <button
                onClick={() => setShowDocumentosModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-3">
                {documentosPorCategoria[categoriaSeleccionada]?.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {doc.nombre}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {doc.tipo}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {(doc.archivo_size / 1024).toFixed(0)} KB
                          </span>
                          {doc.fecha_factura && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {new Date(doc.fecha_factura).toLocaleDateString('es-ES')}
                              </span>
                            </>
                          )}
                        </div>
                        {doc.proveedor && (
                          <p className="text-xs text-gray-600 mt-1">
                            Proveedor: {doc.proveedor}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadDocumento(doc)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Descargar"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDocumentosModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentabilidadAnalysis;
