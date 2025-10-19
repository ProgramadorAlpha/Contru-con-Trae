/**
 * PresupuestoCreatorPage - Task 5.4
 */
import React, { useState } from 'react';
import { FileText, Save } from 'lucide-react';
import { IAPresupuestoChat } from '../components/presupuestos/IAPresupuestoChat';
import { PresupuestoEditor } from '../components/presupuestos/PresupuestoEditor';
import { ClienteSelector } from '../components/clientes/ClienteSelector';
import { ClienteFormModal } from '../components/clientes/ClienteFormModal';
import type { PresupuestoGenerado, Fase, ClientePresupuesto } from '../types/presupuesto.types';
import type { Cliente } from '../types/cliente.types';

export function PresupuestoCreatorPage() {
  const [step, setStep] = useState<'cliente' | 'chat' | 'editar'>('cliente');
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [cliente, setCliente] = useState<ClientePresupuesto | null>(null);
  const [fases, setFases] = useState<Fase[]>([]);
  const [showClienteModal, setShowClienteModal] = useState(false);

  const handleClienteSelected = (id: string) => {
    setClienteId(id);
    // Load cliente data
    setStep('chat');
  };

  const handlePresupuestoGenerado = (presupuesto: PresupuestoGenerado) => {
    setFases(presupuesto.fases);
    setStep('editar');
  };

  const handleGuardar = () => {
    // Save presupuesto logic
    alert('Presupuesto guardado');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Crear Presupuesto
            </h1>
          </div>
          {step === 'editar' && (
            <button
              onClick={handleGuardar}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              <Save className="w-5 h-5" />
              Guardar
            </button>
          )}
        </div>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === 'cliente' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className="w-8 h-8 rounded-full bg-current text-white flex items-center justify-center">1</div>
            <span>Cliente</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300" />
          <div className={`flex items-center gap-2 ${step === 'chat' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className="w-8 h-8 rounded-full bg-current text-white flex items-center justify-center">2</div>
            <span>Generar con IA</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300" />
          <div className={`flex items-center gap-2 ${step === 'editar' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className="w-8 h-8 rounded-full bg-current text-white flex items-center justify-center">3</div>
            <span>Editar</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {step === 'cliente' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Seleccionar Cliente</h2>
              <ClienteSelector
                value={clienteId}
                onChange={handleClienteSelected}
                onCreateClick={() => setShowClienteModal(true)}
              />
            </div>
          )}

          {step === 'chat' && (
            <div className="h-[600px]">
              <IAPresupuestoChat onPresupuestoGenerado={handlePresupuestoGenerado} />
            </div>
          )}

          {step === 'editar' && (
            <PresupuestoEditor
              fases={fases}
              cliente={cliente || undefined}
              onChange={setFases}
            />
          )}
        </div>
      </div>

      <ClienteFormModal
        isOpen={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        onSave={(c: Cliente) => {
          setClienteId(c.id);
          setShowClienteModal(false);
          setStep('chat');
        }}
      />
    </div>
  );
}
