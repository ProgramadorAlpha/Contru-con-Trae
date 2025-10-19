/**
 * PartidaEditor Component - Task 5.3
 */
import React from 'react';
import type { Partida } from '../../types/presupuesto.types';

interface PartidaEditorProps {
  partida: Partida;
  onChange: (partida: Partida) => void;
}

export function PartidaEditor({ partida, onChange }: PartidaEditorProps) {
  const handleChange = (campo: keyof Partida, valor: any) => {
    const nuevaPartida = { ...partida, [campo]: valor };
    if (campo === 'cantidad' || campo === 'precioUnitario') {
      nuevaPartida.total = nuevaPartida.cantidad * nuevaPartida.precioUnitario;
    }
    onChange(nuevaPartida);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label className="block text-sm font-medium mb-2">Descripción</label>
        <input
          type="text"
          value={partida.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Cantidad</label>
        <input
          type="number"
          value={partida.cantidad}
          onChange={(e) => handleChange('cantidad', Number(e.target.value))}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Unidad</label>
        <select
          value={partida.unidad}
          onChange={(e) => handleChange('unidad', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="ud">Unidad</option>
          <option value="m²">m²</option>
          <option value="m³">m³</option>
          <option value="ml">ml</option>
          <option value="kg">kg</option>
          <option value="h">Hora</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Precio Unitario</label>
        <input
          type="number"
          value={partida.precioUnitario}
          onChange={(e) => handleChange('precioUnitario', Number(e.target.value))}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Total</label>
        <input
          type="number"
          value={partida.total}
          disabled
          className="w-full px-3 py-2 border rounded-lg bg-gray-100"
        />
      </div>
    </div>
  );
}
