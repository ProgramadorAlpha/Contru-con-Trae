/**
 * EnviarPresupuestoModal Component
 * Requirements: 13.1, 13.2
 * Task: 8.2
 * 
 * Modal for sending presupuestos to clients via email:
 * - Generates professional PDF
 * - Creates unique viewing link (UUID)
 * - Sends email with PDF and link
 * - Updates presupuesto status to "enviado"
 */

import React, { useState } from 'react';
import { X, Send, Mail, Link as LinkIcon, FileText, AlertCircle } from 'lucide-react';
import type { Presupuesto } from '../../types/presupuesto.types';
import { generarPDFPresupuesto } from '../../utils/pdf-generator.utils';
import { v4 as uuidv4 } from 'uuid';

interface EnviarPresupuestoModalProps {
  presupuesto: Presupuesto;
  isOpen: boolean;
  onClose: () => void;
  onEnviar: (token: string, pdfBlob: Blob) => Promise<void>;
}

export function EnviarPresupuestoModal({
  presupuesto,
  isOpen,
  onClose,
  onEnviar
}: EnviarPresupuestoModalProps) {
  const [email, setEmail] = useState(presupuesto.cliente.email);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEnviar = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate email
      if (!email || !email.includes('@')) {
        throw new Error('Email inválido');
      }

      // Generate unique token for public viewing
      const token = uuidv4();
      const publicLink = `${window.location.origin}/presupuestos/public/${token}`;
      setGeneratedLink(publicLink);

      // Generate PDF
      const pdfBlob = await generarPDFPresupuesto(presupuesto);

      // Call parent handler to save token and send email
      await onEnviar(token, pdfBlob);

      setSuccess(true);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setGeneratedLink(null);
      }, 2000);

    } catch (err) {
      console.error('Error enviando presupuesto:', err);
      setError(err instanceof Error ? err.message : 'Error al enviar presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
      setSuccess(false);
      setGeneratedLink(null);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Send className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold">Enviar Presupuesto</h2>
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
          {/* Presupuesto Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-lg">{presupuesto.nombre}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Número:</span>
                <span className="ml-2 font-medium">{presupuesto.numero}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                <span className="ml-2 font-medium">{presupuesto.cliente.nombre}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                <span className="ml-2 font-medium text-green-600">
                  {formatCurrency(presupuesto.montos.total, presupuesto.montos.moneda)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Validez:</span>
                <span className="ml-2 font-medium">{formatDate(presupuesto.fechaValidez)}</span>
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4" />
              Email del cliente
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
              placeholder="cliente@ejemplo.com"
            />
          </div>

          {/* Mensaje Personalizado */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4" />
              Mensaje personalizado (opcional)
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              disabled={loading}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 resize-none"
              placeholder="Agregue un mensaje personalizado para el cliente..."
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <LinkIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">El cliente recibirá:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                  <li>PDF del presupuesto adjunto</li>
                  <li>Link único para visualizar online</li>
                  <li>Botones para aprobar o rechazar</li>
                  <li>Fecha de validez del presupuesto</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Generated Link (after sending) */}
          {generatedLink && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                Link generado:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-green-300 dark:border-green-700 rounded text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(generatedLink)}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Send className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800 dark:text-green-300">
                  ¡Presupuesto enviado exitosamente!
                </p>
              </div>
            </div>
          )}
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
            onClick={handleEnviar}
            disabled={loading || !email || success}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Presupuesto
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
