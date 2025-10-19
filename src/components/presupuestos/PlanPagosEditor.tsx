/**
 * PlanPagosEditor Component - Task 5.3
 */
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { PlanPago } from '../../types/presupuesto.types';
import { formatearMoneda } from '../../utils/presupuesto.utils';

interface PlanPagosEditorProps {
  planPagos: PlanPago[];
  montoTotal: number;
  onChange: (planPagos: PlanPago[]) => void;
}

export function PlanPagosEditor({ planPagos, montoTotal, onChange }: PlanPagosEditorProps) {
  const handlePagoChange = (index: number, campo: keyof PlanPago, valor: any) => {
    const nuevosPagos = [...planPagos];
    nuevosPagos[index] = { ...nuevosPagos[index], [campo]: valor };
    if (campo === 'porcentaje') {
      nuevosPagos[index].monto = (montoTotal * Number(valor)) / 100;
    }
    onChange(nuevosPagos);
  };

  const handleAgregarPago = () => {
    const nuevoPago: PlanPago = {
      numero: planPagos.length + 1,
      descripcion: '',
      porcentaje: 0,
      monto: 0,
      estado: 'pendiente'
    };
    onChange([...planPagos, nuevoPago]);
  };

  const totalPorcentaje = planPagos.reduce((sum, p) => sum + p.porcentaje, 0);

  return (
    <div className="space-y-4">
      {planPagos.map((pago, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 items-center border p-4 rounded-lg">
          <input
            type="text"
            value={pago.descripcion}
            onChange={(e) => handlePagoChange(index, 'descripcion', e.target.value)}
            placeholder="Descripción del pago"
            className="col-span-2 px-3 py-2 border rounded-lg"
          />
          <input
            type="number"
            value={pago.porcentaje}
            onChange={(e) => handlePagoChange(index, 'porcentaje', Number(e.target.value))}
            placeholder="%"
            className="px-3 py-2 border rounded-lg"
          />
          <div className="flex items-center justify-between">
            <span className="font-semibold">{formatearMoneda(pago.monto)}</span>
            <button
              onClick={() => onChange(planPagos.filter((_, i) => i !== index))}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={handleAgregarPago}
        className="w-full py-2 border-2 border-dashed rounded-lg text-green-600 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Agregar Pago
      </button>
      <div className={`text-right font-semibold ${totalPorcentaje !== 100 ? 'text-red-600' : 'text-green-600'}`}>
        Total: {totalPorcentaje}% {totalPorcentaje !== 100 && '(debe ser 100%)'}
      </div>
    </div>
  );
}
