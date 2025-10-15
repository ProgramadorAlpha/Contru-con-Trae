import { Tool, CreateToolDTO, UpdateToolDTO } from '../types/tools';

export interface ToolValidationErrors {
  name?: string;
  description?: string;
  category?: string;
  type?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: string;
  currentValue?: string;
  location?: string;
  status?: string;
  warrantyExpiry?: string;
  specifications?: string;
}

export const validateTool = (data: CreateToolDTO | UpdateToolDTO): ToolValidationErrors => {
  const errors: ToolValidationErrors = {};

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'El nombre de la herramienta es requerido';
  } else if (data.name.length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres';
  } else if (data.name.length > 100) {
    errors.name = 'El nombre no puede exceder 100 caracteres';
  }

  // Description validation
  if (data.description && data.description.length > 500) {
    errors.description = 'La descripción no puede exceder 500 caracteres';
  }

  // Category validation
  if (!data.category || data.category.trim().length === 0) {
    errors.category = 'La categoría es requerida';
  }

  // Type validation
  if (!data.type || data.type.trim().length === 0) {
    errors.type = 'El tipo de herramienta es requerido';
  }

  // Brand validation
  if (!data.brand || data.brand.trim().length === 0) {
    errors.brand = 'La marca es requerida';
  } else if (data.brand.length < 2) {
    errors.brand = 'La marca debe tener al menos 2 caracteres';
  }

  // Model validation
  if (!data.model || data.model.trim().length === 0) {
    errors.model = 'El modelo es requerido';
  }

  // Serial number validation
  if (!data.serialNumber || data.serialNumber.trim().length === 0) {
    errors.serialNumber = 'El número de serie es requerido';
  } else if (data.serialNumber.length < 3) {
    errors.serialNumber = 'El número de serie debe tener al menos 3 caracteres';
  }

  // Purchase date validation
  if (data.purchaseDate) {
    const purchaseDate = new Date(data.purchaseDate);
    const today = new Date();
    
    if (isNaN(purchaseDate.getTime())) {
      errors.purchaseDate = 'La fecha de compra no es válida';
    } else if (purchaseDate > today) {
      errors.purchaseDate = 'La fecha de compra no puede ser futura';
    }
  }

  // Purchase price validation
  if (data.purchasePrice !== undefined) {
    if (data.purchasePrice < 0) {
      errors.purchasePrice = 'El precio de compra no puede ser negativo';
    } else if (data.purchasePrice > 10000000) {
      errors.purchasePrice = 'El precio de compra parece excesivo';
    }
  }

  // Current value validation
  if (data.currentValue !== undefined) {
    if (data.currentValue < 0) {
      errors.currentValue = 'El valor actual no puede ser negativo';
    } else if (data.currentValue > 10000000) {
      errors.currentValue = 'El valor actual parece excesivo';
    }
  }

  // Location validation
  if (data.location && data.location.length > 200) {
    errors.location = 'La ubicación no puede exceder 200 caracteres';
  }

  // Status validation
  const validStatuses = ['available', 'in_use', 'maintenance', 'retired'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.status = 'El estado de la herramienta no es válido';
  }

  // Warranty expiry validation
  if (data.warrantyExpiry) {
    const warrantyDate = new Date(data.warrantyExpiry);
    const today = new Date();
    
    if (isNaN(warrantyDate.getTime())) {
      errors.warrantyExpiry = 'La fecha de vencimiento de garantía no es válida';
    } else if (warrantyDate < today) {
      errors.warrantyExpiry = 'La garantía ya está vencida';
    }
  }

  // Specifications validation
  if (data.specifications) {
    if (Array.isArray(data.specifications)) {
      data.specifications.forEach((spec, index) => {
        if (!spec.name || spec.name.trim().length === 0) {
          if (!errors.specifications) errors.specifications = '';
          errors.specifications += `La especificación ${index + 1} debe tener un nombre. `;
        }
        if (spec.name && spec.name.length > 100) {
          if (!errors.specifications) errors.specifications = '';
          errors.specifications += `El nombre de la especificación ${index + 1} no puede exceder 100 caracteres. `;
        }
        // Opcional: validar options/unit en ToolSpecification
        if (spec.options && spec.options.length > 50) {
          if (!errors.specifications) errors.specifications = '';
          errors.specifications += `La especificación ${index + 1} tiene demasiadas opciones. `;
        }
      });
    }
  }

  return errors;
};

export const isValidTool = (data: CreateToolDTO | UpdateToolDTO): boolean => {
  const errors = validateTool(data);
  return Object.keys(errors).length === 0;
};

export const formatToolValue = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatToolDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
};

export const formatToolDateShort = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
};

export const getToolStatusColor = (status: string): string => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_use':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'retired':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getToolStatusIcon = (status: string): string => {
  switch (status) {
    case 'available':
      return '🟢';
    case 'in_use':
      return '🔵';
    case 'maintenance':
      return '🟡';
    case 'retired':
      return '⚫';
    default:
      return '⚪';
  }
};

export const getToolStatusLabel = (status: string): string => {
  switch (status) {
    case 'available':
      return 'Disponible';
    case 'in_use':
      return 'En Uso';
    case 'maintenance':
      return 'En Mantenimiento';
    case 'retired':
      return 'Retirado';
    default:
      return 'Desconocido';
  }
};
export const getEquipmentStatusLabel = getToolStatusLabel;

export const getMaintenancePriorityColor = (priority: string): string => {
  switch (priority) {
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'urgent':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getMaintenancePriorityLabel = (priority: string): string => {
  switch (priority) {
    case 'low':
      return 'Baja';
    case 'medium':
      return 'Media';
    case 'high':
      return 'Alta';
    case 'urgent':
      return 'Urgente';
    default:
      return 'Desconocida';
  }
};

export const getMaintenanceTypeLabel = (type: string): string => {
  switch (type) {
    case 'preventive':
      return 'Preventivo';
    case 'corrective':
      return 'Correctivo';
    case 'inspection':
      return 'Inspección';
    case 'calibration':
      return 'Calibración';
    default:
      return 'Desconocido';
  }
};

export const isMaintenanceOverdue = (scheduledDate: string): boolean => {
  const today = new Date();
  const scheduled = new Date(scheduledDate);
  return scheduled < today;
};

export const isMaintenanceDueSoon = (scheduledDate: string, days: number = 7): boolean => {
  const today = new Date();
  const scheduled = new Date(scheduledDate);
  const dueDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
  return scheduled >= today && scheduled <= dueDate;
};

export const calculateDepreciation = (
  purchasePrice: number,
  currentValue: number,
  purchaseDate: string
): {
  totalDepreciation: number;
  depreciationPercentage: number;
  annualDepreciation: number;
  yearsOwned: number;
} => {
  const purchase = new Date(purchaseDate);
  const today = new Date();
  const yearsOwned = (today.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  const totalDepreciation = purchasePrice - currentValue;
  const depreciationPercentage = (totalDepreciation / purchasePrice) * 100;
  const annualDepreciation = yearsOwned > 0 ? totalDepreciation / yearsOwned : 0;

  return {
    totalDepreciation,
    depreciationPercentage,
    annualDepreciation,
    yearsOwned
  };
};

export const generateToolCode = (category: string, brand: string, sequence: number): string => {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const brandCode = brand.substring(0, 3).toUpperCase();
  const sequenceCode = sequence.toString().padStart(4, '0');
  return `${categoryCode}-${brandCode}-${sequenceCode}`;
};
export const generateEquipmentCode = generateToolCode;

export const parseToolCode = (code: string): {
  category: string;
  brand: string;
  sequence: number;
} | null => {
  const parts = code.split('-');
  if (parts.length !== 3) return null;
  return {
    category: parts[0],
    brand: parts[1],
    sequence: parseInt(parts[2], 10)
  };
};
export const parseEquipmentCode = parseToolCode;

export const filterToolsByDateRange = (
  tools: Tool[],
  startDate: string,
  endDate: string,
  dateField: 'purchaseDate' | 'warrantyExpiry' | 'createdAt' | 'updatedAt'
): Tool[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return tools.filter(item => {
    const itemDate = new Date((item as any)[dateField]);
    return itemDate >= start && itemDate <= end;
  });
};
export const filterEquipmentByDateRange = filterToolsByDateRange;

export const sortTools = (
  tools: Tool[],
  sortBy: 'name' | 'purchaseDate' | 'currentValue' | 'status' | 'brand' | 'category',
  sortOrder: 'asc' | 'desc'
): Tool[] => {
  return [...tools].sort((a, b) => {
    let aValue: any = (a as any)[sortBy];
    let bValue: any = (b as any)[sortBy];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    } else {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
  });
};
export const sortEquipment = sortTools;

export const searchTools = (tools: Tool[], searchTerm: string): Tool[] => {
  const term = searchTerm.toLowerCase();
  
  return tools.filter(item =>
    item.name.toLowerCase().includes(term) ||
    (item.description as any)?.toLowerCase?.().includes(term) ||
    (item.brand as any)?.toLowerCase?.().includes(term) ||
    (item.model as any)?.toLowerCase?.().includes(term) ||
    (item.serialNumber as any)?.toLowerCase?.().includes(term) ||
    (item.category as any)?.toLowerCase?.().includes(term) ||
    (item.location as any)?.toLowerCase?.().includes(term) ||
    (item as any).code?.toLowerCase?.().includes(term)
  );
};
export const searchEquipment = searchTools;

export const groupToolsByCategory = (tools: Tool[]): Record<string, Tool[]> => {
  return tools.reduce((groups, item) => {
    const category = (item as any).category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, Tool[]>);
};
export const groupEquipmentByCategory = groupToolsByCategory;

export const groupToolsByStatus = (tools: Tool[]): Record<string, Tool[]> => {
  return tools.reduce((groups, item) => {
    const status = (item as any).status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(item);
    return groups;
  }, {} as Record<string, Tool[]>);
};
export const groupEquipmentByStatus = groupToolsByStatus;

export const calculateToolUtilization = (
  tool: Tool,
  assignments: any[],
  dateRange: { startDate: string; endDate: string }
): {
  utilizationPercentage: number;
  totalDays: number;
  assignedDays: number;
  availableDays: number;
} => {
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Filter assignments for this tool within the date range
  const toolAssignments = assignments.filter(assignment =>
    assignment.toolId === (tool as any).id &&
    new Date(assignment.startDate) <= endDate &&
    (!assignment.endDate || new Date(assignment.endDate) >= startDate)
  );

  let assignedDays = 0;
  toolAssignments.forEach(assignment => {
    const assignmentStart = new Date(assignment.startDate);
    const assignmentEnd = assignment.endDate ? new Date(assignment.endDate) : endDate;
    
    const effectiveStart = assignmentStart > startDate ? assignmentStart : startDate;
    const effectiveEnd = assignmentEnd < endDate ? assignmentEnd : endDate;
    
    const days = Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    assignedDays += days;
  });

  const availableDays = totalDays - assignedDays;
  const utilizationPercentage = (assignedDays / totalDays) * 100;

  return {
    utilizationPercentage,
    totalDays,
    assignedDays,
    availableDays
  };
};
export const calculateEquipmentUtilization = calculateToolUtilization;