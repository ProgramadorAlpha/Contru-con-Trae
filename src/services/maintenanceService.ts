import { 
  MaintenanceRecord, 
  CreateMaintenanceDTO, 
  UpdateMaintenanceDTO, 
  MaintenanceFilters,
  MaintenanceResponse,
  MaintenanceStats,
  MaintenanceSchedule,
  CreateMaintenanceScheduleDTO,
  UpdateMaintenanceScheduleDTO 
} from '../types/tools';

// Mock data for development
const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: '1',
    toolId: '1',
    toolName: 'Excavadora Caterpillar 320D',
    type: 'preventive',
    description: 'Mantenimiento preventivo programado - Revisión de 250 horas',
    scheduledDate: '2024-01-15',
    completedDate: '2024-01-15',
    status: 'completed',
    priority: 'high',
    assignedTo: 'user-1',
    assignedToName: 'Juan Pérez',
    cost: 2500,
    notes: 'Mantenimiento completado exitosamente. Se cambiaron filtros y aceite.',
    partsUsed: [
      { partNumber: 'CAT-FILTER-001', name: 'Filtro de Aceite', quantity: 2, cost: 150 },
      { partNumber: 'CAT-OIL-15W40', name: 'Aceite 15W40', quantity: 10, cost: 800 }
    ],
    hoursWorked: 4,
    nextMaintenanceDate: '2024-02-15',
    nextMaintenanceType: 'preventive',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    toolId: '2',
    toolName: 'Camión Mezclador Mercedes',
    type: 'corrective',
    description: 'Reparación de sistema de frenos',
    scheduledDate: '2024-01-18',
    completedDate: null,
    status: 'pending',
    priority: 'urgent',
    assignedTo: 'user-2',
    assignedToName: 'Carlos Rodríguez',
    cost: 0,
    notes: 'Frenos presentan desgaste excesivo. Requiere atención inmediata.',
    partsUsed: [],
    hoursWorked: 0,
    nextMaintenanceDate: null,
    nextMaintenanceType: null,
    createdAt: '2024-01-16T09:30:00Z',
    updatedAt: '2024-01-16T09:30:00Z'
  },
  {
    id: '3',
    toolId: '3',
    toolName: 'Grúa Móvil Liebherr',
    type: 'inspection',
    description: 'Inspección mensual de seguridad',
    scheduledDate: '2024-01-20',
    completedDate: '2024-01-20',
    status: 'completed',
    priority: 'medium',
    assignedTo: 'user-3',
    assignedToName: 'María González',
    cost: 800,
    notes: 'Inspección completada. Todos los sistemas operativos.',
    partsUsed: [],
    hoursWorked: 2,
    nextMaintenanceDate: '2024-02-20',
    nextMaintenanceType: 'inspection',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-20T16:00:00Z'
  }
];

const mockMaintenanceSchedules: MaintenanceSchedule[] = [
  {
    id: '1',
    toolId: '1',
    toolName: 'Excavadora Caterpillar 320D',
    type: 'preventive',
    description: 'Mantenimiento preventivo de 500 horas',
    frequency: 'hourly',
    frequencyValue: 500,
    lastMaintenanceDate: '2024-01-15',
    nextMaintenanceDate: '2024-03-15',
    estimatedDuration: 6,
    estimatedCost: 3500,
    priority: 'high',
    assignedTo: 'user-1',
    assignedToName: 'Juan Pérez',
    status: 'scheduled',
    notes: 'Incluye cambio de filtros hidráulicos y revisión de sistema',
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    toolId: '2',
    toolName: 'Camión Mezclador Mercedes',
    type: 'preventive',
    description: 'Mantenimiento de motor según kilometraje',
    frequency: 'kilometric',
    frequencyValue: 50000,
    lastMaintenanceDate: '2023-12-20',
    nextMaintenanceDate: '2024-02-20',
    estimatedDuration: 8,
    estimatedCost: 2800,
    priority: 'medium',
    assignedTo: 'user-2',
    assignedToName: 'Carlos Rodríguez',
    status: 'scheduled',
    notes: 'Cambio de aceite y filtros del motor',
    createdAt: '2023-12-20T16:00:00Z',
    updatedAt: '2023-12-20T16:00:00Z'
  },
  {
    id: '3',
    toolId: '3',
    toolName: 'Grúa Móvil Liebherr',
    type: 'inspection',
    description: 'Inspección trimestral de seguridad',
    frequency: 'monthly',
    frequencyValue: 3,
    lastMaintenanceDate: '2024-01-20',
    nextMaintenanceDate: '2024-04-20',
    estimatedDuration: 4,
    estimatedCost: 1200,
    priority: 'high',
    assignedTo: 'user-3',
    assignedToName: 'María González',
    status: 'scheduled',
    notes: 'Revisión de sistemas de seguridad y carga',
    createdAt: '2024-01-20T16:00:00Z',
    updatedAt: '2024-01-20T16:00:00Z'
  }
];

class MaintenanceService {
  private baseURL = '/api/maintenance';
  private mockDelay = 600; // Simulate API delay

  // Simulate API delay
  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get all maintenance records with filters
  async getMaintenanceRecords(filters?: MaintenanceFilters & { page?: number; limit?: number }): Promise<MaintenanceResponse> {
    await this.delay();
    
    let filteredRecords = [...mockMaintenanceRecords];

    // Apply filters
    if (filters) {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredRecords = filteredRecords.filter(record => 
          record.toolName.toLowerCase().includes(searchTerm) ||
          record.description.toLowerCase().includes(searchTerm) ||
          record.assignedToName.toLowerCase().includes(searchTerm)
        );
      }

      // Tool ID filter
      if (filters.toolId) {
        filteredRecords = filteredRecords.filter(record => record.toolId === filters.toolId);
      }

      // Type filter
      if (filters.type) {
        filteredRecords = filteredRecords.filter(record => record.type === filters.type);
      }

      // Status filter
      if (filters.status) {
        filteredRecords = filteredRecords.filter(record => record.status === filters.status);
      }

      // Priority filter
      if (filters.priority) {
        filteredRecords = filteredRecords.filter(record => record.priority === filters.priority);
      }

      // Assigned to filter
      if (filters.assignedTo) {
        filteredRecords = filteredRecords.filter(record => record.assignedTo === filters.assignedTo);
      }

      // Upcoming only filter
      if (filters.upcomingOnly) {
        const today = new Date().toISOString().split('T')[0];
        filteredRecords = filteredRecords.filter(record => 
          record.status === 'pending' && record.scheduledDate >= today
        );
      }

      // Overdue only filter
      if (filters.overdueOnly) {
        const today = new Date().toISOString().split('T')[0];
        filteredRecords = filteredRecords.filter(record => 
          record.status === 'pending' && record.scheduledDate < today
        );
      }

      // Completed only filter
      if (filters.completedOnly) {
        filteredRecords = filteredRecords.filter(record => record.status === 'completed');
      }

      // Date range filter
      if (filters.dateRange) {
        const startDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        filteredRecords = filteredRecords.filter(record => {
          const scheduledDate = new Date(record.scheduledDate);
          return scheduledDate >= startDate && scheduledDate <= endDate;
        });
      }

      // Sorting
      if (filters.sortBy) {
        filteredRecords.sort((a, b) => {
          let aValue: any = a[filters.sortBy as keyof MaintenanceRecord];
          let bValue: any = b[filters.sortBy as keyof MaintenanceRecord];

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
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

    return {
      data: paginatedRecords,
      total: filteredRecords.length,
      page,
      limit,
      totalPages: Math.ceil(filteredRecords.length / limit)
    };
  }

  // Get maintenance record by ID
  async getMaintenanceRecordById(id: string): Promise<MaintenanceRecord | null> {
    await this.delay();
    const record = mockMaintenanceRecords.find(r => r.id === id);
    return record || null;
  }

  // Create new maintenance record
  async createMaintenanceRecord(data: CreateMaintenanceDTO): Promise<MaintenanceRecord> {
    await this.delay();
    
    const newRecord: MaintenanceRecord = {
      id: this.generateId(),
      ...data,
      status: data.status || 'pending',
      completedDate: null,
      partsUsed: data.partsUsed || [],
      hoursWorked: data.hoursWorked || 0,
      cost: data.cost || 0,
      nextMaintenanceDate: null,
      nextMaintenanceType: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockMaintenanceRecords.push(newRecord);
    return newRecord;
  }

  // Update maintenance record
  async updateMaintenanceRecord(id: string, data: UpdateMaintenanceDTO): Promise<MaintenanceRecord> {
    await this.delay();
    
    const index = mockMaintenanceRecords.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Registro de mantenimiento no encontrado');
    }

    const updatedRecord = {
      ...mockMaintenanceRecords[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    mockMaintenanceRecords[index] = updatedRecord;
    return updatedRecord;
  }

  // Delete maintenance record
  async deleteMaintenanceRecord(id: string): Promise<void> {
    await this.delay();
    
    const index = mockMaintenanceRecords.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Registro de mantenimiento no encontrado');
    }

    mockMaintenanceRecords.splice(index, 1);
  }

  // Get maintenance schedules
  async getMaintenanceSchedules(toolId?: string): Promise<MaintenanceSchedule[]> {
    await this.delay();
    
    if (toolId) {
      return mockMaintenanceSchedules.filter(s => s.toolId === toolId);
    }
    
    return mockMaintenanceSchedules;
  }

  // Get maintenance schedule by ID
  async getMaintenanceScheduleById(id: string): Promise<MaintenanceSchedule | null> {
    await this.delay();
    const schedule = mockMaintenanceSchedules.find(s => s.id === id);
    return schedule || null;
  }

  // Create maintenance schedule
  async createMaintenanceSchedule(data: CreateMaintenanceScheduleDTO): Promise<MaintenanceSchedule> {
    await this.delay();
    
    const newSchedule: MaintenanceSchedule = {
      id: this.generateId(),
      ...data,
      status: data.status || 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockMaintenanceSchedules.push(newSchedule);
    return newSchedule;
  }

  // Update maintenance schedule
  async updateMaintenanceSchedule(id: string, data: UpdateMaintenanceScheduleDTO): Promise<MaintenanceSchedule> {
    await this.delay();
    
    const index = mockMaintenanceSchedules.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Programación de mantenimiento no encontrada');
    }

    const updatedSchedule = {
      ...mockMaintenanceSchedules[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    mockMaintenanceSchedules[index] = updatedSchedule;
    return updatedSchedule;
  }

  // Delete maintenance schedule
  async deleteMaintenanceSchedule(id: string): Promise<void> {
    await this.delay();
    
    const index = mockMaintenanceSchedules.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Programación de mantenimiento no encontrada');
    }

    mockMaintenanceSchedules.splice(index, 1);
  }

  // Schedule maintenance
  async scheduleToolMaintenance(toolId: string, data: CreateMaintenanceScheduleDTO): Promise<MaintenanceSchedule> {
    await this.delay();
    
    // Check for existing schedule
    const existingSchedule = mockMaintenanceSchedules.find(s => 
      s.toolId === toolId && s.type === data.type && s.status === 'scheduled'
    );

    if (existingSchedule) {
      throw new Error('Ya existe una programación de mantenimiento para este equipo');
    }

    const newSchedule: MaintenanceSchedule = {
      id: this.generateId(),
      toolId,
      toolName: data.toolName || 'Herramienta sin nombre',
      type: data.type,
      description: data.description,
      frequency: data.frequency,
      frequencyValue: data.frequencyValue,
      lastMaintenanceDate: data.lastMaintenanceDate || new Date().toISOString().split('T')[0],
      nextMaintenanceDate: data.nextMaintenanceDate,
      estimatedDuration: data.estimatedDuration || 4,
      estimatedCost: data.estimatedCost || 0,
      priority: data.priority || 'medium',
      assignedTo: data.assignedTo,
      assignedToName: data.assignedToName || 'Sin asignar',
      status: 'scheduled',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockMaintenanceSchedules.push(newSchedule);
    return newSchedule;
  }

  // Alias: scheduleMaintenance para compatibilidad con hooks
  async scheduleMaintenance(toolId: string, data: CreateMaintenanceScheduleDTO): Promise<MaintenanceSchedule> {
    return this.scheduleToolMaintenance(toolId, data);
  }

  // Complete maintenance
  async completeMaintenance(recordId: string, completionData: { completedDate: string; notes?: string; cost?: number }): Promise<MaintenanceRecord> {
    await this.delay();
    
    const record = mockMaintenanceRecords.find(r => r.id === recordId);
    if (!record) {
      throw new Error('Registro de mantenimiento no encontrado');
    }

    if (record.status === 'completed') {
      throw new Error('El mantenimiento ya está completado');
    }

    record.status = 'completed';
    record.completedDate = completionData.completedDate;
    record.notes = completionData.notes ? `${record.notes}\n${completionData.notes}` : record.notes;
    record.cost = completionData.cost || record.cost;
    record.updatedAt = new Date().toISOString();

    // Update next maintenance date if it's a scheduled maintenance
    const schedule = mockMaintenanceSchedules.find(s => 
      s.toolId === record.toolId && s.type === record.type
    );

    if (schedule) {
      // Calculate next maintenance date based on frequency
      const completedDate = new Date(completionData.completedDate);
      let nextDate = new Date(completedDate);

      switch (schedule.frequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + schedule.frequencyValue);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + (schedule.frequencyValue * 7));
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + schedule.frequencyValue);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + schedule.frequencyValue);
          break;
        case 'hourly':
          // For hourly maintenance, we need to track operating hours
          nextDate.setDate(nextDate.getDate() + 30); // Approximate 1 month
          break;
        case 'kilometric':
          nextDate.setDate(nextDate.getDate() + 90); // Approximate 3 months
          break;
      }

      record.nextMaintenanceDate = nextDate.toISOString().split('T')[0];
      record.nextMaintenanceType = schedule.type;

      // Update schedule
      schedule.lastMaintenanceDate = completionData.completedDate;
      schedule.nextMaintenanceDate = record.nextMaintenanceDate;
      schedule.status = 'scheduled';
    }

    return record;
  }

  // Get upcoming maintenance
  async getUpcomingMaintenance(days: number = 30): Promise<MaintenanceRecord[]> {
    await this.delay();
    
    const today = new Date();
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return mockMaintenanceRecords.filter(record => 
      record.status === 'pending' && 
      new Date(record.scheduledDate).getTime() >= today.setHours(0,0,0,0) &&
      new Date(record.scheduledDate).getTime() <= futureDate.setHours(0,0,0,0)
    );
  }

  // Get overdue maintenance
  async getOverdueMaintenance(): Promise<MaintenanceRecord[]> {
    await this.delay();
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    return mockMaintenanceRecords.filter(record => 
      record.status === 'pending' && (record.scheduledDate as string) < todayStr
    );
  }

  // Get tool maintenance history
  async getToolMaintenanceHistory(toolId: string): Promise<MaintenanceRecord[]> {
    await this.delay();
    return mockMaintenanceRecords
      .filter(record => record.toolId === toolId)
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }

  // Generate maintenance report
  async generateToolMaintenanceReport(toolId: string, dateRange: { startDate: string; endDate: string }): Promise<any> {
    await this.delay();
    
    const history = await this.getToolMaintenanceHistory(toolId);
    const filteredHistory = history.filter(record => {
      const scheduledDate = new Date(record.scheduledDate);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      return scheduledDate >= startDate && scheduledDate <= endDate;
    });

    const totalCost = filteredHistory.reduce((sum, record) => sum + record.cost, 0);
    const completedCount = filteredHistory.filter(record => record.status === 'completed').length;
    const pendingCount = filteredHistory.filter(record => record.status === 'pending').length;

    const typeBreakdown = filteredHistory.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      toolId,
      dateRange,
      totalRecords: filteredHistory.length,
      completedCount,
      pendingCount,
      totalCost,
      typeBreakdown,
      records: filteredHistory
    };
  }

  // Get maintenance statistics
  async getMaintenanceStats(): Promise<MaintenanceStats> {
    await this.delay();
    
    const totalRecords = mockMaintenanceRecords.length;
    const completed = mockMaintenanceRecords.filter(r => r.status === 'completed').length;
    const pending = mockMaintenanceRecords.filter(r => r.status === 'pending').length;
    const overdue = mockMaintenanceRecords.filter(r => 
      r.status === 'pending' && new Date(r.scheduledDate).getTime() < new Date().setHours(0,0,0,0)
    ).length;

    const totalCost = mockMaintenanceRecords.reduce((sum, record) => sum + record.cost, 0);
    const avgCost = totalRecords > 0 ? totalCost / totalRecords : 0;

    // Type breakdown
    const typeBreakdown = mockMaintenanceRecords.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Priority breakdown
    const priorityBreakdown = mockMaintenanceRecords.reduce((acc, record) => {
      acc[record.priority] = (acc[record.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Tool maintenance count
    const toolMaintenance = mockMaintenanceRecords.reduce((acc, record) => {
      acc[record.toolId] = (acc[record.toolId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Upcoming maintenance (next 30 days)
    const today = new Date();
    const next30Days = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    const upcoming = mockMaintenanceRecords.filter(record => 
      record.status === 'pending' && 
      new Date(record.scheduledDate).getTime() >= today.setHours(0,0,0,0) &&
      new Date(record.scheduledDate).getTime() <= next30Days.setHours(0,0,0,0)
    ).length;

    return {
      totalRecords,
      completed,
      pending,
      overdue,
      upcoming,
      totalCost,
      averageCost: avgCost,
      typeBreakdown,
      priorityBreakdown,
      toolMaintenance,
      totalSchedules: mockMaintenanceSchedules.length,
      activeSchedules: mockMaintenanceSchedules.filter(s => s.status === 'scheduled').length
    };
  }
}

export const maintenanceService = new MaintenanceService();