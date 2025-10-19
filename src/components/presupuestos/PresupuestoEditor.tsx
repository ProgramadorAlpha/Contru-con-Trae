/**
 * PresupuestoEditor Component
 * Visual editor for complete presupuesto
 * Requirements: 2.4, 2.6
 * Task: 5.2
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { calcularTotales, formatearMoneda } from '../../utils/presupuesto.utils';
import type { Fase, Presupuesto, ClientePresupuesto } from '../../types/presupuesto.types';

interface PresupuestoEditorProps {
  fases: Fase[];
  cliente?: ClientePresupuesto;
  onChange: (fases: Fase[]) => void;
}

export function PresupuestoEditor({ fases, cliente, onChange }: PresupuestoEditorProps) {
  const [fasesEditables, setFasesEditables] = useState<Fase[]>(fases);

  useEffect(() => {
    setFasesEditables(fases);
  }, [fases]);

  const handleFaseChange = (index: number, campo: keyof Fase, valor: any) => {
    const nuevasFases = [...fasesEditables];
    nuevasFases[index] = { ...nuevasFases[index], [campo]: valor };
    setFasesEditables(nuevasFases);
    onChange(nuevasFases);
  };

  const handleAgregarFase = () => {
    const nuevaFase: Fase = {
      numero: fasesEditables.length + 1,
      nombre: `Fase ${fasesEditables.length + 1}`,
      monto: 0,
      duracionEstimada: 30,
      porcentajeCobro: 0,
      partidas: []
    };
    const nuevasFases = [...fasesEditables, nuevaFase];
    setFasesEditables(nuevasFases);
    onChange(nuevasFases);
  };

  const handleEliminarFase = (index: number) => {
    const nuevasFases = fasesEditables.filter((_, i) => i !== index);
    setFasesEditables(nuevasFases);
    onChange(nuevasFases);
  };

  const montos = calcularTotales(fasesEditables);

  return (
    <div className="space-y-6">
      {/* Cliente Info */}
      {cliente && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cliente</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{cliente.nombre}</p>
          {cliente.empresa && <p className="text-sm text-gray-500 dark:text-gray-400">{cliente.empresa}</p>}
        </div>
      )}

      {/* Fases */}
      <div className="space-y-4">
        {fasesEditables.map((fase, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={fase.nombre}
                onChange={(e) => handleFaseChange(index, 'nombre', e.target.value)}
                className="text-lg font-semibold bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
              />
              <button
                onClick={() => handleEliminarFase(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">Duración (días)</label>
                <input
                  type="number"
                  value={fase.duracionEstimada}
                  onChange={(e) => handleFaseChange(index, 'duracionEstimada', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">% Cobro</label>
                <input
                  type="number"
                  value={fase.porcentajeCobro}
                  onChange={(e) => handleFaseChange(index, 'porcentajeCobro', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Partidas: {fase.partidas.length} | Monto: {formatearMoneda(fase.monto)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleAgregarFase}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Agregar Fase
      </button>

      {/* Totales */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
        <div className="space-y-2">
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Subtotal:</span>
            <span className="font-semibold">{formatearMoneda(montos.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>IVA (21%):</span>
            <span className="font-semibold">{formatearMoneda(montos.iva)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white border-t border-gray-300 dark:border-gray-600 pt-2">
            <span>Total:</span>
            <span>{formatearMoneda(montos.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
