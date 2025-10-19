/**
 * PresupuestoPublicPage - Public presupuesto viewing page
 * Requirements: 13.3, 13.4, 13.7
 * Task: 8.3
 * 
 * Public page (no auth required) for clients to:
 * - View complete presupuesto details
 * - Approve or reject the presupuesto
 * - Add comments
 * - Track visualization (viewing tracking)
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Calendar,
  MapPin,
  DollarSign,
  Layers,
  AlertCircle,
  Building,
  Mail,
  Phone,
  User
} from 'lucide-react';
import type { Presupuesto } from '../../types/presupuesto.types';
import { presupuestoService } from '../../services/presupuesto.service';
import { formatearMoneda } from '../../utils/presupuesto.utils';

export function PresupuestoPublicPage() {
  const { token } = useParams<{ token: string }>();
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);

  useEffect(() => {
    if (token) {
      loadPresupuesto();
      // Register view tracking
      registerView();
    }
  }, [token]);

  const loadPresupuesto = async () => {
    try {
      setLoading(true);
      // TODO: Implement getPresupuestoByToken in service
      // For now, we'll simulate it
      const presupuestos = await presupuestoService.getPresupuestosAll();
      const found = presupuestos.find(p => p.id === token); // Temporary: using ID as token
      
      if (!found) {
        setError('Presupuesto no encontrado o link inválido');
        return;
      }

      setPresupuesto(found);
    } catch (err) {
      console.error('Error loading presupuesto:', err);
      setError('Error al cargar el presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const registerView = async () => {
    try {
      // TODO: Implement view tracking
      console.log('View registered for token:', token);
    } catch (err) {
      console.error('Error registering view:', err);
    }
  };

  const handleAprobar = async () => {
    if (!presupuesto || !token) return;

    try {
      setSubmitting(true);
      await presupuestoService.aprobarPresupuesto(presupuesto.id);
      setActionCompleted(true);
    } catch (err) {
      console.error('Error aprobando presupuesto:', err);
      alert('Error al aprobar el presupuesto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRechazar = async () => {
    if (!presupuesto || !token) return;

    if (!comentarios.trim()) {
      alert('Por favor, indique el motivo del rechazo');
      return;
    }

    try {
      setSubmitting(true);
      await presupuestoService.rechazarPresupuesto(presupuesto.id, comentarios);
      setActionCompleted(true);
    } catch (err) {
      console.error('Error rechazando presupuesto:', err);
      alert('Error al rechazar el presupuesto');
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando presupuesto...</p>
        </div>
      </div>
    );
  }

  if (error || !presupuesto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Presupuesto no encontrado
          </h1>
          <p className="text-gray-600">
            {error || 'El link proporcionado no es válido o ha expirado.'}
          </p>
        </div>
      </div>
    );
  }

  if (actionCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Gracias por su respuesta!
          </h1>
          <p className="text-gray-600">
            Hemos registrado su decisión y notificaremos al equipo.
          </p>
        </div>
      </div>
    );
  }

  const isExpired = presupuesto.estado === 'expirado' || 
    (presupuesto.fechaValidez && (presupuesto.fechaValidez.toDate ? presupuesto.fechaValidez.toDate() : new Date(presupuesto.fechaValidez as any)) < new Date());

  const canTakeAction = presupuesto.estado === 'enviado' && !isExpired;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Presupuesto</h1>
          </div>
          <p className="text-gray-600">{presupuesto.numero}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Status Alert */}
        {isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Presupuesto Expirado</p>
                <p className="text-sm text-red-700">
                  Este presupuesto ha expirado. Por favor, contacte con nosotros para solicitar una actualización.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Project Info */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{presupuesto.nombre}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-medium">{presupuesto.cliente.nombre}</p>
                  {presupuesto.cliente.empresa && (
                    <p className="text-sm text-gray-600">{presupuesto.cliente.empresa}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Contacto</p>
                  <p className="font-medium">{presupuesto.cliente.email}</p>
                  <p className="text-sm text-gray-600">{presupuesto.cliente.telefono}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Ubicación de la obra</p>
                  <p className="font-medium">{presupuesto.ubicacionObra.direccion}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Válido hasta</p>
                  <p className="font-medium">{formatDate(presupuesto.fechaValidez)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fases */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-gray-600" />
              <h3 className="text-xl font-bold">Fases del Proyecto</h3>
            </div>

            <div className="space-y-4">
              {presupuesto.fases.map((fase) => (
                <div key={fase.numero} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg">
                      Fase {fase.numero}: {fase.nombre}
                    </h4>
                    <span className="text-lg font-bold text-green-600">
                      {formatearMoneda(fase.monto, presupuesto.montos.moneda)}
                    </span>
                  </div>

                  {fase.descripcion && (
                    <p className="text-sm text-gray-600 mb-3">{fase.descripcion}</p>
                  )}

                  {/* Partidas */}
                  <div className="space-y-2">
                    {fase.partidas.map((partida) => (
                      <div key={partida.id} className="bg-gray-50 rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{partida.nombre}</span>
                          <span className="font-semibold">
                            {formatearMoneda(partida.total, presupuesto.montos.moneda)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {partida.cantidad} {partida.unidad} × {formatearMoneda(partida.precioUnitario, presupuesto.montos.moneda)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plan de Pagos */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <h3 className="text-xl font-bold">Plan de Pagos</h3>
            </div>

            <div className="space-y-2">
              {presupuesto.planPagos.map((pago) => (
                <div key={pago.numero} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{pago.descripcion}</p>
                    <p className="text-sm text-gray-600">{pago.porcentaje}% del total</p>
                  </div>
                  <span className="font-semibold text-green-600">
                    {formatearMoneda(pago.monto, presupuesto.montos.moneda)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="p-6 bg-gray-50">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-lg">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">
                  {formatearMoneda(presupuesto.montos.subtotal, presupuesto.montos.moneda)}
                </span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="text-gray-600">IVA (21%):</span>
                <span className="font-semibold">
                  {formatearMoneda(presupuesto.montos.iva, presupuesto.montos.moneda)}
                </span>
              </div>
              <div className="flex items-center justify-between text-2xl font-bold pt-2 border-t border-gray-300">
                <span>Total:</span>
                <span className="text-green-600">
                  {formatearMoneda(presupuesto.montos.total, presupuesto.montos.moneda)}
                </span>
              </div>
            </div>
          </div>

          {/* Condiciones */}
          {presupuesto.condiciones && presupuesto.condiciones.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-lg font-bold mb-3">Condiciones</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {presupuesto.condiciones.map((condicion, index) => (
                  <li key={index}>{condicion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Section */}
        {canTakeAction && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">¿Desea aprobar este presupuesto?</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios (opcional para aprobación, requerido para rechazo)
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="Agregue sus comentarios aquí..."
                disabled={submitting}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAprobar}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                {submitting ? 'Procesando...' : 'Aprobar Presupuesto'}
              </button>
              
              <button
                onClick={handleRechazar}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5" />
                {submitting ? 'Procesando...' : 'Rechazar Presupuesto'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
