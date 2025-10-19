/**
 * FirmaDigitalModal Component
 * Requirements: 14.1, 14.2, 14.3
 * Task: 9.1
 * 
 * Modal for digital signature of presupuestos:
 * - Draw signature with mouse/touch (canvas)
 * - Upload signature image
 * - Electronic signature
 * - Captures: type, name, date, IP, signature in base64
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, PenTool, Upload, Check, Eraser } from 'lucide-react';
import type { FirmaDigital } from '../../types/presupuesto.types';
import { Timestamp } from 'firebase/firestore';

interface FirmaDigitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFirmar: (firma: Omit<FirmaDigital, 'fecha' | 'ip'>) => Promise<void>;
  tipo: 'empresa' | 'cliente';
  nombreDefault?: string;
}

type MetodoFirma = 'dibujo' | 'imagen' | 'electronica';

export function FirmaDigitalModal({
  isOpen,
  onClose,
  onFirmar,
  tipo,
  nombreDefault = ''
}: FirmaDigitalModalProps) {
  const [metodo, setMetodo] = useState<MetodoFirma>('dibujo');
  const [nombre, setNombre] = useState(nombreDefault);
  const [firmaBase64, setFirmaBase64] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (isOpen && metodo === 'dibujo') {
      initializeCanvas();
    }
  }, [isOpen, metodo]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setFirmaBase64('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, seleccione una imagen válida');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFirmaBase64(base64);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFirmar = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate
      if (!nombre.trim()) {
        throw new Error('Por favor, ingrese su nombre');
      }

      let firmaData = firmaBase64;

      // Get signature data based on method
      if (metodo === 'dibujo') {
        const canvas = canvasRef.current;
        if (!canvas || !hasDrawn) {
          throw new Error('Por favor, dibuje su firma');
        }
        firmaData = canvas.toDataURL('image/png');
      } else if (metodo === 'imagen') {
        if (!firmaBase64) {
          throw new Error('Por favor, cargue una imagen de su firma');
        }
      } else if (metodo === 'electronica') {
        // For electronic signature, we'll create a simple text-based signature
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#000000';
          ctx.font = '30px cursive';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(nombre, canvas.width / 2, canvas.height / 2);
        }
        firmaData = canvas.toDataURL('image/png');
      }

      // Get client IP (in production, this should be done server-side)
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;
      const ip = ipData?.ip || 'unknown';

      // Create firma object
      const firma: Omit<FirmaDigital, 'fecha' | 'ip'> = {
        tipo,
        firmadoPor: nombre.trim(),
        firma: firmaData
      };

      await onFirmar(firma);
      
      // Reset and close
      handleClose();
    } catch (err) {
      console.error('Error al firmar:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar la firma');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNombre(nombreDefault);
      setFirmaBase64('');
      setHasDrawn(false);
      setError(null);
      clearCanvas();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <PenTool className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold">Firma Digital</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
              placeholder="Ingrese su nombre completo"
            />
          </div>

          {/* Método de Firma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Método de firma
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setMetodo('dibujo')}
                disabled={loading}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  metodo === 'dibujo'
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                } disabled:opacity-50`}
              >
                <PenTool className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Dibujar</span>
              </button>
              
              <button
                onClick={() => setMetodo('imagen')}
                disabled={loading}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  metodo === 'imagen'
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                } disabled:opacity-50`}
              >
                <Upload className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Cargar</span>
              </button>
              
              <button
                onClick={() => setMetodo('electronica')}
                disabled={loading}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  metodo === 'electronica'
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                } disabled:opacity-50`}
              >
                <Check className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Electrónica</span>
              </button>
            </div>
          </div>

          {/* Firma Area */}
          <div>
            {metodo === 'dibujo' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dibuje su firma
                  </label>
                  <button
                    onClick={clearCanvas}
                    disabled={loading}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50"
                  >
                    <Eraser className="w-4 h-4" />
                    Limpiar
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-48 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white cursor-crosshair touch-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use el mouse o toque la pantalla para dibujar su firma
                </p>
              </div>
            )}

            {metodo === 'imagen' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cargar imagen de firma
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                />
                {firmaBase64 && (
                  <div className="mt-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white">
                    <img src={firmaBase64} alt="Firma" className="max-h-32 mx-auto" />
                  </div>
                )}
              </div>
            )}

            {metodo === 'electronica' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vista previa de firma electrónica
                </label>
                <div className="p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white text-center">
                  <p className="text-3xl font-cursive text-gray-900">
                    {nombre || 'Su nombre aparecerá aquí'}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Su nombre será convertido en una firma digital
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Al firmar, se registrará: su nombre, fecha y hora, y dirección IP para validez legal.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleFirmar}
            disabled={loading || !nombre.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Procesando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Firmar Documento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
