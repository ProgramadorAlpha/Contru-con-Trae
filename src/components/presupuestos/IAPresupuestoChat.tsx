/**
 * IAPresupuestoChat Component
 * Chat interface for generating presupuestos with AI
 * Requirements: 2.1, 2.2, 2.3, 2.8
 * Task: 5.1
 */

import React, { useState } from 'react';
import { Send, Loader, Sparkles } from 'lucide-react';
import { presupuestoIAService } from '../../services/ai/presupuestoIAService';
import type { PresupuestoGenerado } from '../../types/presupuesto.types';
import type { AIMessage } from '@/types/ai';

interface IAPresupuestoChatProps {
  onPresupuestoGenerado: (presupuesto: PresupuestoGenerado) => void;
}

export function IAPresupuestoChat({ onPresupuestoGenerado }: IAPresupuestoChatProps) {
  const [mensaje, setMensaje] = useState('');
  const [conversacion, setConversacion] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleEnviar = async () => {
    if (!mensaje.trim() || loading) return;

    const nuevoMensaje: AIMessage = {
      role: 'user',
      content: mensaje
    };

    setConversacion([...conversacion, nuevoMensaje]);
    setMensaje('');
    setLoading(true);

    try {
      const resultado = await presupuestoIAService.generarPresupuestoConIA({
        descripcionProyecto: mensaje,
        conversacionPrevia: conversacion
      });

      const respuestaIA: AIMessage = {
        role: 'assistant',
        content: resultado.respuestaIA
      };

      setConversacion([...conversacion, nuevoMensaje, respuestaIA]);
      onPresupuestoGenerado(resultado.presupuesto);
    } catch (error: any) {
      alert(error.message || 'Error al generar presupuesto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversacion.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Genera tu presupuesto con IA
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Describe el proyecto y la IA creará un presupuesto detallado
            </p>
          </div>
        )}
        {conversacion.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <Loader className="w-5 h-5 animate-spin text-green-600" />
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleEnviar()}
            placeholder="Describe el proyecto..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={loading}
          />
          <button
            onClick={handleEnviar}
            disabled={loading || !mensaje.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
