import { 
  Tool, 
  CreateToolDTO, 
  UpdateToolDTO, 
  ToolFilters,
  ToolStats,
  ToolResponse,
  ToolDocument,
  ToolStatus 
} from '../types/tools';

// Mock data for development
const mockTools: Tool[] = [
  {
    id: '1',
    name: 'Excavadora Caterpillar 320D',
    description: 'Excavadora hidráulica de 21.5 toneladas para movimiento de tierras',
    brand: 'Caterpillar',
    model: '320D',
    category: 'Maquinaria Pesada',
    type: 'Excavadora',
    serialNumber: 'CAT320D2023001',
    purchaseDate: '2023-01-15',
    purchasePrice: 180000,
    currentValue: 165000,
    status: 'active',
    location: 'Obra Central',
    assignedTo: 'project-1',
    specifications: {
      weight: '21500 kg',
      power: '110 kW',
      capacity: '1.0 m³',
      fuelType: 'Diesel',
      fuelConsumption: '15 L/h'
    },
    maintenanceSchedule: {
      nextMaintenance: '2024-02-15',
      lastMaintenance: '2024-01-15',
      maintenanceInterval: 250,
      maintenanceHours: 1250
    },
    documents: [
      {
        id: 'doc1',
        name: 'Manual de Operación',
        type: 'manual',
        url: '/documents/manual-cat320d.pdf',
        uploadDate: '2023-01-20',
        size: 0
      }
    ],
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Yellow+Caterpillar+320D+excavator+on+construction+site+professional+photo&image_size=landscape_4_3'
    ],
    notes: 'Excavadora en excelente estado, recién mantenida',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Camión Mezclador Mercedes',
    description: 'Camión hormigonera de alta capacidad para obras',
    brand: 'Mercedes-Benz',
    model: 'Actros 2644',
    category: 'Vehículos',
    type: 'Camión Mezclador',
    serialNumber: 'MB26442023002',
    purchaseDate: '2023-03-10',
    purchasePrice: 120000,
    currentValue: 110000,
    status: 'maintenance',
    location: 'Taller Principal',
    assignedTo: 'project-2',
    specifications: {
      weight: '15000 kg',
      power: '320 kW',
      capacity: '8 m³',
      fuelType: 'Diesel',
      fuelConsumption: '25 L/100km'
    },
    maintenanceSchedule: {
      nextMaintenance: '2024-01-20',
      lastMaintenance: '2023-12-20',
      maintenanceInterval: 10000,
      maintenanceHours: 45000
    },
    documents: [],
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=White+Mercedes+Actros+concrete+mixer+truck+professional+photo&image_size=landscape_4_3'
    ],
    notes: 'Requiere mantenimiento de motor',
    createdAt: '2023-03-10T09:00:00Z',
    updatedAt: '2024-01-10T16:45:00Z'
  },
  {
    id: '3',
    name: 'Grúa Móvil Liebherr',
    description: 'Grúa telescópica móvil de 90 toneladas',
    brand: 'Liebherr',
    model: 'LTM 1090-4.2',
    category: 'Maquinaria de Elevación',
    type: 'Grúa Móvil',
    serialNumber: 'LBT10902023003',
    purchaseDate: '2023-02-28',
    purchasePrice: 950000,
    currentValue: 920000,
    status: 'available',
    location: 'Depósito Central',
    assignedTo: '',
    specifications: {
      weight: '48000 kg',
      power: '270 kW',
      capacity: '90 t',
      boomLength: '60 m',
      fuelType: 'Diesel'
    },
    maintenanceSchedule: {
      nextMaintenance: '2024-03-15',
      lastMaintenance: '2024-01-15',
      maintenanceInterval: 500,
      maintenanceHours: 850
    },
    documents: [],
    images: [],
    notes: 'Disponible para asignación inmediata',
    createdAt: '2023-02-28T08:30:00Z',
    updatedAt: '2024-01-15T12:00:00Z'
  }
];

class ToolService {
  private baseURL = '/api/tools';
  private mockDelay = 500; // Simulate API delay

  // Simulate API delay
  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get all tools with filters
  async getTools(filters?: ToolFilters & { page?: number; limit?: number }): Promise<ToolResponse> {
    await this.delay();
    
    let filteredTools = [...mockTools];

    // Apply filters
    if (filters) {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredTools = filteredTools.filter(tool => 
          tool.name.toLowerCase().includes(searchTerm) ||
          tool.brand.toLowerCase().includes(searchTerm) ||
          tool.model.toLowerCase().includes(searchTerm) ||
          tool.serialNumber.toLowerCase().includes(searchTerm)
        );
      }

      // Category filter
      if (filters.category) {
        filteredTools = filteredTools.filter(tool => tool.category === filters.category);
      }

      // Type filter
      if (filters.type) {
        filteredTools = filteredTools.filter(tool => tool.type === filters.type);
      }

      // Status filter
      if (filters.status) {
        filteredTools = filteredTools.filter(tool => tool.status === filters.status);
      }

      // Location filter
      if (filters.location) {
        filteredTools = filteredTools.filter(tool => tool.location === filters.location);
      }

      // Brand filter
      if (filters.brand) {
        filteredTools = filteredTools.filter(tool => tool.brand === filters.brand);
      }

      // Assigned to filter
      if (filters.assignedTo) {
        if (filters.assignedTo === 'any') {
          filteredTools = filteredTools.filter(tool => tool.assignedTo !== '');
        } else {
          filteredTools = filteredTools.filter(tool => tool.assignedTo === filters.assignedTo);
        }
      }

      // Value range filter
      if (filters.minValue !== undefined) {
        filteredTools = filteredTools.filter(tool => tool.currentValue >= filters.minValue!);
      }
      if (filters.maxValue !== undefined) {
        filteredTools = filteredTools.filter(tool => tool.currentValue <= filters.maxValue!);
      }

      // Maintenance due filter
      if (filters.maintenanceDue) {
        const today = new Date().toISOString().split('T')[0];
        filteredTools = filteredTools.filter(tool => 
          (tool.maintenanceSchedule.nextMaintenance as string) <= today
        );
      }

      // Date range filter
      if (filters.dateRange) {
        const startDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        filteredTools = filteredTools.filter(tool => {
          const purchaseDate = new Date(tool.purchaseDate);
          return purchaseDate >= startDate && purchaseDate <= endDate;
        });
      }

      // Sorting
      if (filters.sortBy) {
        filteredTools.sort((a, b) => {
          let aValue: any = a[filters.sortBy as keyof Tool];
          let bValue: any = b[filters.sortBy as keyof Tool];

          // Handle nested properties
          if (filters.sortBy.includes('.')) {
            const keys = filters.sortBy.split('.');
            aValue = keys.reduce((obj, key) => obj?.[key], a);
            bValue = keys.reduce((obj, key) => obj?.[key], b);
          }

          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          if (filters.sortOrder === 'desc') {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }
        });
      }
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTools = filteredTools.slice(startIndex, endIndex);

    return {
      data: paginatedTools,
      total: filteredTools.length,
      page,
      limit,
      totalPages: Math.ceil(filteredTools.length / limit)
    };
  }

  // Get tool by ID
  async getToolById(id: string): Promise<Tool | null> {
    await this.delay();
    const tool = mockTools.find(tool => tool.id === id);
    return tool || null;
  }

  // Create new tool
  async createTool(data: CreateToolDTO): Promise<Tool> {
    await this.delay();
    
    const newTool: Tool = {
      id: this.generateId(),
      name: data.name,
      description: data.description,
      category: data.category || '',
      type: data.type || '',
      brand: data.brand,
      model: data.model,
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate,
      purchasePrice: data.purchasePrice,
      currentValue: (data.currentValue ?? data.purchaseValue ?? data.purchasePrice) || 0,
      status: data.status || 'available',
      location: data.location,
      images: data.images || [],
      documents: [],
      specifications: Array.isArray(data.specifications) ? {} : (data.specifications || {}),
      maintenanceSchedule: data.maintenanceSchedule || {},
      assignedTo: data.assignedTo || '',
      notes: (data as any).notes,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      code: (data as any).code,
      value: data.value,
      supplier: data.supplier,
      warrantyExpiry: (data.warrantyExpiry as any) as Date | string,
      currentAssignment: undefined,
      maintenanceHistory: [],
      nextMaintenance: undefined,
      assignmentHistory: []
    };

    mockTools.push(newTool);
    return newTool;
  }

  // Update tool
  async updateTool(id: string, data: UpdateToolDTO): Promise<Tool> {
    await this.delay();
    
    const index = mockTools.findIndex(tool => tool.id === id);
    if (index === -1) {
      throw new Error('Herramienta no encontrada');
    }

    const updatedTool: Tool = {
      ...mockTools[index],
      ...data,
      currentValue: (data.currentValue ?? mockTools[index].currentValue),
      updatedAt: new Date().toISOString()
    } as Tool;

    mockTools[index] = updatedTool;
    return updatedTool;
  }

  // Delete tool
  async deleteTool(id: string): Promise<void> {
    await this.delay();
    
    const index = mockTools.findIndex(tool => tool.id === id);
    if (index === -1) {
      throw new Error('Herramienta no encontrada');
    }

    mockTools.splice(index, 1);
  }

  // Bulk delete tools
  async bulkDeleteTools(ids: string[]): Promise<void> {
    await this.delay();
    
    for (const id of ids) {
      const index = mockTools.findIndex(tool => tool.id === id);
      if (index !== -1) {
        mockTools.splice(index, 1);
      }
    }
  }

  // Bulk update tool status
  async bulkUpdateStatus(ids: string[], status: ToolStatus): Promise<void> {
    await this.delay();
    
    for (const id of ids) {
      const index = mockTools.findIndex(tool => tool.id === id);
      if (index !== -1) {
        mockTools[index].status = status;
        mockTools[index].updatedAt = new Date().toISOString();
      }
    }
  }

  // Get tool statistics
  async getToolStats(): Promise<ToolStats> {
    await this.delay();
    
    const total = mockTools.length;
    const active = mockTools.filter(tool => tool.status === 'active').length;
    const maintenance = mockTools.filter(tool => tool.status === 'maintenance').length;
    const available = mockTools.filter(tool => tool.status === 'available').length;
    const retired = mockTools.filter(tool => tool.status === 'retired').length;
    const assigned = mockTools.filter(tool => (tool.assignedTo || '') !== '').length;
    
    const totalValue = mockTools.reduce((sum, tool) => sum + (tool.currentValue || 0), 0);
    const avgValue = total > 0 ? totalValue / total : 0;

    // Calculate maintenance due
    const today = new Date().toISOString().split('T')[0];
    const maintenanceDue = mockTools.filter(tool => 
      (tool.maintenanceSchedule.nextMaintenance as string) <= today
    ).length;

    // Categories count
    const categories = mockTools.reduce((acc, tool) => {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      maintenance,
      available,
      retired,
      assigned,
      maintenanceDue,
      totalValue,
      averageValue: avgValue,
      categories
    };
  }

  // Export tool data
  async exportTools(format: 'csv' | 'pdf' | 'excel'): Promise<string> {
    await this.delay();
    
    switch (format) {
      case 'csv':
        return this.generateCSV(mockTools);
      case 'pdf':
        return this.generatePDF(mockTools);
      case 'excel':
        return this.generateExcel(mockTools);
      default:
        throw new Error('Formato no soportado');
    }
  }

  // Import tool data
  async importTools(file: File): Promise<number> {
    await this.delay();
    
    // Simulate file parsing
    const importedData: Tool[] = [
      {
        id: 'imp-001',
        name: 'Herramienta Importada 1',
        description: 'Descripción de la herramienta importada',
        category: 'hand_tools',
        type: 'hammer',
        brand: 'Importado',
        model: 'IMP-001',
        serialNumber: 'IMP001',
        status: 'available',
        location: 'warehouse',
        purchaseDate: '2024-01-01',
        purchasePrice: 100,
        currentValue: 90,
        images: [],
        documents: [],
        specifications: {},
        maintenanceSchedule: {
          nextMaintenance: '2024-12-31'
        },
        assignedTo: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    // Add imported tools to mock data
    mockTools.push(...importedData);
    
    return importedData.length;
  }

  // Helper methods for export
  private generateCSV(data: Tool[]): string {
    const headers = [
      'ID', 'Nombre', 'Descripción', 'Categoría', 'Tipo', 'Marca', 'Modelo', 
      'Número de Serie', 'Estado', 'Ubicación', 'Fecha de Compra', 'Precio de Compra',
      'Valor Actual', 'Asignado a', 'Próximo Mantenimiento'
    ].join(',');
    
    const rows = data.map(tool => [
      tool.id,
      `"${tool.name}"`,
      `"${tool.description}"`,
      tool.category,
      tool.type,
      tool.brand,
      tool.model,
      tool.serialNumber,
      tool.status,
      tool.location,
      tool.purchaseDate,
      tool.purchasePrice,
      tool.currentValue,
      tool.assignedTo || '',
      (tool.maintenanceSchedule.nextMaintenance as string) || ''
    ].join(','));
    
    return [headers, ...rows].join('\n');
  }

  private generatePDF(data: Tool[]): string {
    // This is a simplified simulation - in reality you'd use a PDF library
    return `PDF Report - Tool List\nTotal Items: ${data.length}\nGenerated: ${new Date().toISOString()}`;
  }

  private generateExcel(data: Tool[]): string {
    // This is a simplified simulation - in reality you'd use an Excel library
    return `Excel Report - Tool List\nTotal Items: ${data.length}\nGenerated: ${new Date().toISOString()}`;
  }

  // Document management
  async uploadDocument(toolId: string, file: File, documentType: ToolDocument['type']): Promise<ToolDocument> {
    await this.delay();
    
    const tool = mockTools.find(t => t.id === toolId);
    if (!tool) {
      throw new Error('Herramienta no encontrada');
    }

    const newDocument: ToolDocument = {
      id: this.generateId(),
      name: file.name,
      type: documentType,
      url: `/documents/${toolId}/${file.name}`,
      uploadDate: new Date().toISOString(),
      size: file.size,
      mimeType: file.type
    };

    tool.documents.push(newDocument);
    return newDocument;
  }

  async deleteDocument(toolId: string, documentId: string): Promise<void> {
    await this.delay();
    
    const tool = mockTools.find(t => t.id === toolId);
    if (!tool) {
      throw new Error('Herramienta no encontrada');
    }

    const documentIndex = tool.documents.findIndex(doc => doc.id === documentId);
    if (documentIndex === -1) {
      throw new Error('Documento no encontrado');
    }

    tool.documents.splice(documentIndex, 1);
  }

  async downloadDocument(toolId: string, documentId: string): Promise<Blob> {
    await this.delay();
    
    const tool = mockTools.find(t => t.id === toolId);
    if (!tool) {
      throw new Error('Herramienta no encontrada');
    }

    const document = tool.documents.find(doc => doc.id === documentId);
    if (!document) {
      throw new Error('Documento no encontrado');
    }

    // Simulate document download
    const content = `Simulated content for document: ${document.name}`;
    return new Blob([content], { type: document.mimeType || 'application/octet-stream' });
  }
}

export const toolService = new ToolService();