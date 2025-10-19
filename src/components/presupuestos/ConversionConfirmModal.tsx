/**
 * ConversionConfirmModal Component
 * Requirements: 5.1, 5.8
 * Task: 11.3
 * 
 * Modal to confirm conversion of presupuesto to proyecto:
 * - Shows presupuesto summary
 * - Confirms conversion action
 * - Shows conversion progress
 * - Navigates to created proyecto
 */

import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Loader, ArrowRight, FileText, DollarSign, Layers, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Presupuesto } from '../../types/presupuesto.types';
import { conversionService } from '../../services/conversion.service';
import { formatearMoneda } from '../../utils/presupuesto.utils';

interface ConversionConfirmModalProps {
  presupuesto: Presupuesto;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (proyectoId: string) => void;
}

type ConversionStep = 'confirm' | 'converting' | 'success' | 'error';

export function ConversionConfirmModal({
  presupuesto,
  isOpen,
  onClose,
  onSuccess
}: ConversionConfirmModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<ConversionStep>('confirm');
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{
    proyectoId: string;
    facturaId: string;
    mensaje: string;
  } | null>(null);

  const handleConvertir = async () => {
    try {
      setStep('converting');
      setError(null);

      // Check if can convert
      const validacion = await conversionService.puedeConvertir(presupuesto.id);
      if (!validacion.puede) {
        throw new Error(validacion.razon || 'No se puede convertir el presupuesto');
      }

      // Get conversion summary
      const resumen = await conversionService.obtenerResumenConversion(presupuesto.id);

      // Simulate some delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Convert
      const result = await conversionService.convertirPresupuestoAProyecto(presupuesto.id);
      
      setResultado(result);
      setStep('success');

      // Call success callback
      if (onSuccess) {
        onSuccess(result.proyectoId);
      }

    } catch (err) {
      console.error('Error en conversión:', err);
      setError(err instanceof Error ? err.message : 'Error al convertir presupuesto');
      setStep('error');
    }
  };

  const handleNavigateToProyecto = () => {
    if (resultado) {
      navigate(`/proyectos/${resultado.proyectoId}`);
      handleClose();
    }
  };

  const handleClose = () => {
    if (step !== 'converting') {
      setStep('confirm');
      setError(null);
      setResultado(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Get first payment info
  const primerPago = presupuesto.planPagos.find(p => 
    p.numero === 1 || 
    p.descripcion.toLowerCase().includes('adelanto')
  ) || presupuesto.planPagos[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ArrowRight className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold">
              {step === 'confirm' && 'Convertir a Proyecto'}
              {step === 'converting' && 'Convirtiendo...'}
              {step === 'success' && '¡Conversión Exitosa!'}
              {step === 'error' && 'Error en Conversión'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={step === 'converting'}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Confirm Step */}
          {step === 'confirm' && (
            <div className="space-y-6">
              {/* Presupuesto Summary */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Resumen del Presupuesto</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                      <p className="font-medium">{presupuesto.nombre}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monto Total</p>
                      <p className="font-medium text-green-600">
                        {formatearMoneda(presupuesto.montos.total, presupuesto.montos.moneda)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Fases</p>
                      <p className="font-medium">{presupuesto.fases.length} fases</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Plan de Pagos</p>
                      <p className="font-medium">{presupuesto.planPagos.length} pagos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What will happen */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
                  ¿Qué sucederá al convertir?
                </h4>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Se creará un nuevo proyecto con todos los datos del presupuesto</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Se generará una factura de adelanto por {formatearMoneda(primerPago?.monto || 0, presupuesto.montos.moneda)}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Las fases se crearán con estado inicial (Fase 1: Pendiente, resto: Bloqueadas)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>El presupuesto se marcará como "Convertido"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Se vinculará el presupuesto con el proyecto creado</span>
                  </li>
                </ul>
              </div>

              {/* Warning */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <div className="text-sm text-orange-800 dark:text-orange-300">
                    <p className="font-medium mb-1">Importante:</p>
                    <p>Esta acción no se puede deshacer. El presupuesto quedará vinculado permanentemente al proyecto.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Converting Step */}
          {step === 'converting' && (
            <div className="py-12 text-center">
              <Loader className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Convirtiendo presupuesto...</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Creando proyecto y generando factura de adelanto
              </p>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && resultado && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-600 mb-2">
                  ¡Proyecto Creado Exitosamente!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {resultado.mensaje}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 dark:text-green-300 mb-3">
                  Detalles de la conversión:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-800 dark:text-green-300">ID del Proyecto:</span>
                    <span className="font-mono font-medium">{resultado.proyectoId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-800 dark:text-green-300">ID de Factura:</span>
                    <span className="font-mono font-medium">{resultado.facturaId}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Próximos pasos:</strong> Puedes acceder al proyecto para gestionar las fases, 
                  registrar gastos y hacer seguimiento del progreso.
                </p>
              </div>
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-600 mb-2">
                  Error en la Conversión
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No se pudo completar la conversión del presupuesto
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>Error:</strong> {error}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Por favor, verifica que el presupuesto esté aprobado y no haya sido convertido previamente. 
                  Si el problema persiste, contacta con soporte técnico.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          {step === 'confirm' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConvertir}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Convertir a Proyecto
              </button>
            </>
          )}

          {step === 'success' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={handleNavigateToProyecto}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Ir al Proyecto
              </button>
            </>
          )}

          {step === 'error' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Intentar de Nuevo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
