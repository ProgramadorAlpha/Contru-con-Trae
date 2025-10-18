import React, { useState } from 'react';
import { Calendar, DollarSign, Building2, Tag, FileText, User } from 'lucide-react';
import { ExtractedReceiptData } from '../../services/ai/receiptService';

interface ExtractedDataFormProps {
  data: ExtractedReceiptData;
  suggestedCategory: string;
  suggestedProject?: string;
  onSave: (formData: FormData) => void;
  onCancel: () => void;
}

interface FormData {
  amount: number;
  date: string;
  supplier: string;
  category: string;
  project?: string;
  description: string;
  invoiceNumber?: string;
  rfc?: string;
}

export const ExtractedDataForm: React.FC<ExtractedDataFormProps> = ({
  data,
  suggestedCategory,
  suggestedProject,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>({
    amount: data.total,
    date: data.date,
    supplier: data.supplier,
    category: suggestedCategory,
    project: suggestedProject,
    description: data.items.join(', '),
    invoiceNumber: data.invoiceNumber,
    rfc: data.rfc
  });

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-300">
          ✨ Datos extraídos automáticamente. Revisa y edita si es necesario.
        </p>
      </div>

      {/* Monto */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <DollarSign className="w-4 h-4 inline mr-1" />
          Monto Total *
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Fecha */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Fecha *
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Proveedor */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <User className="w-4 h-4 inline mr-1" />
          Proveedor *
        </label>
        <input
          type="text"
          value={formData.supplier}
          onChange={(e) => handleChange('supplier', e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Tag className="w-4 h-4 inline mr-1" />
          Categoría *
        </label>
        <select
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="materiales">Materiales</option>
          <option value="mano_de_obra">Mano de Obra</option>
          <option value="equipos">Equipos</option>
          <option value="transporte">Transporte</option>
          <option value="otros">Otros</option>
        </select>
      </div>

      {/* Proyecto */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Building2 className="w-4 h-4 inline mr-1" />
          Proyecto
        </label>
        <select
          value={formData.project || ''}
          onChange={(e) => handleChange('project', e.target.value || undefined)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar proyecto...</option>
          {/* Aquí se cargarían los proyectos dinámicamente */}
          <option value="proyecto-1">Proyecto 1</option>
          <option value="proyecto-2">Proyecto 2</option>
        </select>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <FileText className="w-4 h-4 inline mr-1" />
          Descripción *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          required
        />
      </div>

      {/* Número de Factura */}
      {formData.invoiceNumber && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Número de Factura
          </label>
          <input
            type="text"
            value={formData.invoiceNumber}
            onChange={(e) => handleChange('invoiceNumber', e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* RFC */}
      {formData.rfc && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            RFC
          </label>
          <input
            type="text"
            value={formData.rfc}
            onChange={(e) => handleChange('rfc', e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Confirmar y Guardar
        </button>
      </div>
    </form>
  );
};
