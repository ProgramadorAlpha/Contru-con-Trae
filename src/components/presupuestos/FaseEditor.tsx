/**
 * FaseEditor Component - Task 5.3
 */
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Fase, Partida } from '../../types/presupuesto.types';

interface FaseEditorProps {
  fase: Fase;
  onChange: (fase: Fase) => void;
}

export function FaseEditor({ fase, onChange }: FaseEditorProps) {
  const handlePartidaChange = (index: number, campo: keyof Partida, valor: any) => {
    const nuevasPartidas = [...fase.partidas];
    nuevasPartidas[index] = { ...nuevasPartidas[index], [campo]: valor };
    if (campo === 'cantidad' || campo === 'precioUnitario') {
      nuevasPartidas[index].total = nuevasPartidas[index].cantidad * nuevasPartidas[index].precioUnitario;
    }
    onChange({ ...fase, partidas: nuevasPartidas });
  };

  const handleAgregarPartida = () => {
    const nuevaPartida: Partida = {
      id: `P${Date.now()}`,
      codigo: `${fase.numero}.${fase.partidas.length + 1}`,
      nombre: '',
      unidad: 'ud',
      cantidad: 1,
      precioUnitario: 0,
      total: 0
    };
    onChange({ ...fase, partidas: [...fase.partidas, nuevaPartida] });
  };

  return (
    <div className="space-y-4">
      {fase.partidas.map((partida, index) => (
        <div key={partida.id} className="grid grid-cols-6 gap-2 items-center">
          <input
            type="text"
            value={partida.nombre}
            onChange={(e) => handlePartidaChange(index, 'nombre', e.target.value)}
            placeholder="Descripción"
            className="col-span-2 px-3 py-2 border rounded-lg"
          />
          <input
            type="number"
            value={partida.cantidad}
            onChange={(e) => handlePartidaChange(index, 'cantidad', Number(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="number"
            value={partida.precioUnitario}
            onChange={(e) => handlePartidaChange(index, 'precioUnitario', Number(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          />
          <span className="px-3 py-2 font-semibold">{partida.total.toFixed(2)}€</span>
          <button
            onClick={() => onChange({ ...fase, partidas: fase.partidas.filter((_, i) => i !== index) })}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={handleAgregarPartida} className="text-green-600 flex items-center gap-2">
        <Plus className="w-4 h-4" /> Agregar Partida
      </button>
    </div>
  );
}
