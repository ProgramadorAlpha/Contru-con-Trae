import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Calendar, DollarSign, MapPin, User, Wrench, Package, Tag, FileText } from 'lucide-react';
import { Tool, ToolStatus, ToolCategory, ToolType, CreateToolDTO, UpdateToolDTO } from '../../types/tools';

interface ToolFormProps {
  tool?: Tool;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateToolDTO | UpdateToolDTO) => void;
  mode: 'create' | 'edit';
}

interface FormErrors {
  [key: string]: string;
}

const ToolForm: React.FC<ToolFormProps> = ({
  tool,
  isOpen,
  onClose,
  onSave,
  mode
}) => {
  const [formData, setFormData] = useState<CreateToolDTO | UpdateToolDTO>({
    name: '',
    code: '',
    category: 'heavy' as ToolCategory,
    type: 'excavator' as ToolType,
    brand: '',
    model: '',
    serialNumber: '',
    description: '',
    value: 0,
    purchaseDate: '',
    supplier: '',
    warrantyExpiry: '',
    location: '',
    status: 'available' as ToolStatus,
    specifications: [],
    documents: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'heavy', label: 'Maquinaria Pesada' },
    { value: 'tools', label: 'Herramientas' },
    { value: 'vehicles', label: 'Vehículos' },
    { value: 'safety', label: 'Equipos de Seguridad' },
    { value: 'electrical', label: 'Equipos Eléctricos' },
    { value: 'plumbing', label: 'Fontanería' }
  ];

  const toolTypes = {
    heavy: [
      { value: 'excavator', label: 'Excavadora' },
      { value: 'bulldozer', label: 'Bulldozer' },
      { value: 'crane', label: 'Grúa' },
      { value: 'loader', label: 'Cargadora' },
      { value: 'dump_truck', label: 'Camión de Volteo' }
    ],
    tools: [
      { value: 'drill', label: 'Taladro' },
      { value: 'saw', label: 'Sierra' },
      { value: 'hammer', label: 'Martillo' },
      { value: 'welder', label: 'Soldadora' }
    ],
    vehicles: [
      { value: 'truck', label: 'Camión' },
      { value: 'van', label: 'Furgoneta' },
      { value: 'pickup', label: 'Pickup' }
    ],
    safety: [
      { value: 'helmet', label: 'Casco' },
      { value: 'vest', label: 'Chaleco' },
      { value: 'harness', label: 'Arnés' }
    ],
    electrical: [
      { value: 'generator', label: 'Generador' },
      { value: 'transformer', label: 'Transformador' }
    ],
    plumbing: [
      { value: 'pump', label: 'Bomba' },
      { value: 'pipe_cutter', label: 'Cortatubos' }
    ]
  };

  const statuses = [
    { value: 'available', label: 'Disponible' },
    { value: 'assigned', label: 'Asignado' },
    { value: 'maintenance', label: 'En mantenimiento' },
    { value: 'retired', label: 'Retirado' }
  ];

  useEffect(() => {
    if (tool && mode === 'edit') {
      const specsArray = Array.isArray(tool.specifications)
        ? tool.specifications
        : Object.entries(tool.specifications || {}).map(([name, value]) => ({ name, value: String(value), unit: '' }));
      setFormData({
        name: tool.name,
        code: tool.code,
        category: tool.category as ToolCategory,
        type: tool.type as ToolType,
        brand: tool.brand,
        model: tool.model,
        serialNumber: tool.serialNumber || '',
        description: tool.description || '',
        value: tool.value ?? tool.currentValue ?? 0,
        purchaseDate: tool.purchaseDate ? new Date(tool.purchaseDate as any).toISOString().split('T')[0] : '',
        supplier: tool.supplier || '',
        warrantyExpiry: tool.warrantyExpiry ? new Date(tool.warrantyExpiry as any).toISOString().split('T')[0] : '',
        location: tool.location || '',
        status: (typeof tool.status === 'string' ? tool.status : tool.status) as ToolStatus,
        specifications: specsArray,
        documents: tool.documents || []
      });
    }
  }, [tool, mode]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'La marca es requerida';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'El modelo es requerido';
    }

    if (formData.value < 0) {
      newErrors.value = 'El valor debe ser positivo';
    }

    if (formData.purchaseDate && formData.warrantyExpiry) {
      const purchaseDate = new Date(formData.purchaseDate);
      const warrantyExpiry = new Date(formData.warrantyExpiry);
      if (warrantyExpiry <= purchaseDate) {
        newErrors.warrantyExpiry = 'La garantía debe vencer después de la fecha de compra';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving tool:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...(prev.specifications || []), { name: '', value: '', unit: '' }]
    }));
  };

  const updateSpecification = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications?.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      ) || []
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications?.filter((_, i) => i !== index) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
                {mode === 'create' ? 'Nueva Herramienta' : 'Editar Herramienta'}
              </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Herramienta *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Excavadora Caterpillar"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.code ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="EQ-001"
                  />
                  {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {toolTypes[formData.category]?.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.brand ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Caterpillar"
                  />
                  {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.model ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="320D"
                  />
                  {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Serie
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ABC123XYZ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción detallada de la herramienta..."
                />
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Información Financiera
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.value ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Compra
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vencimiento de Garantía
                  </label>
                  <input
                    type="date"
                    value={formData.warrantyExpiry}
                    onChange={(e) => handleInputChange('warrantyExpiry', e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.warrantyExpiry ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.warrantyExpiry && <p className="text-red-500 text-xs mt-1">{errors.warrantyExpiry}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre del proveedor"
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Ubicación
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación Actual
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Obra Alameda, Almacén Principal, etc."
                />
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Especificaciones
                </h3>
                <button
                  type="button"
                  onClick={addSpecification}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  Agregar
                </button>
              </div>
              
              {formData.specifications?.map((spec, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={spec.name}
                    onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Valor"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      placeholder="Unidad"
                      value={spec.unit || ''}
                      onChange={(e) => updateSpecification(index, 'unit', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolForm;