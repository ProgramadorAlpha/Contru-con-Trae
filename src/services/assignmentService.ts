import { 
  ToolAssignment, 
  EquipmentAssignment,
  CreateAssignmentDTO, 
  UpdateAssignmentDTO, 
  AssignmentFilters,
  AssignmentResponse,
  AssignmentStats 
} from '../types/tools';

// Mock data for development
const mockAssignments: ToolAssignment[] = [
  {
    id: '1',
    toolId: '1',
    toolName: 'Excavadora Caterpillar 320D',
    assignedTo: 'project-1',
    assignedToType: 'project',
    assignedToName: 'Proyecto Construcción Centro Comercial',
    assignedBy: 'user-1',
    assignedByName: 'Juan Pérez',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    actualEndDate: null,
    status: 'active',
    type: 'assignment',
    purpose: 'Excavación de cimientos para edificio comercial',
    location: 'Obra Central',
    notes: 'Asignación para fase inicial de construcción',
    priority: 'high',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    toolId: '2',
    toolName: 'Camión Mezclador Mercedes',
    assignedTo: 'user-2',
    assignedToType: 'user',
    assignedToName: 'Carlos Rodríguez',
    assignedBy: 'user-1',
    assignedByName: 'Juan Pérez',
    startDate: '2024-01-10',
    endDate: '2024-02-10',
    actualEndDate: null,
    status: 'active',
    type: 'assignment',
    purpose: 'Transporte de concreto para estructura',
    location: 'Obra Norte',
    notes: 'Operador experimentado asignado',
    priority: 'medium',
    createdAt: '2024-01-10T07:30:00Z',
    updatedAt: '2024-01-10T07:30:00Z'
  },
  {
    id: '3',
    toolId: '3',
    toolName: 'Grúa Móvil Liebherr',
    assignedTo: 'project-2',
    assignedToType: 'project',
    assignedToName: 'Proyecto Puente San Miguel',
    assignedBy: 'user-3',
    assignedByName: 'María González',
    startDate: '2023-12-01',
    endDate: '2024-01-31',
    actualEndDate: '2024-01-25',
    status: 'completed',
    type: 'assignment',
    purpose: 'Montaje de estructura metálica',
    location: 'Puente San Miguel',
    notes: 'Asignación completada exitosamente',
    priority: 'high',
    createdAt: '2023-12-01T09:00:00Z',
    updatedAt: '2024-01-25T18:00:00Z'
  }
];

class AssignmentService {
  private baseURL = '/api/assignments';
  private mockDelay = 400; // Simulate API delay

  // Simulate API delay
  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get all assignments with filters
  async getAssignments(filters?: AssignmentFilters & { page?: number; limit?: number }): Promise<AssignmentResponse> {
    await this.delay();
    
    let filteredAssignments = [...mockAssignments];

    // Apply filters
    if (filters) {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredAssignments = filteredAssignments.filter(assignment => 
          assignment.toolName.toLowerCase().includes(searchTerm) ||
          assignment.assignedToName.toLowerCase().includes(searchTerm) ||
          assignment.purpose.toLowerCase().includes(searchTerm) ||
          assignment.location.toLowerCase().includes(searchTerm)
        );
      }

      // Equipment ID filter
      if (filters.toolId) {
        filteredAssignments = filteredAssignments.filter(assignment => assignment.toolId === filters.toolId);
      }

      // User ID filter
      if (filters.userId) {
        filteredAssignments = filteredAssignments.filter(assignment => 
          assignment.assignedTo === filters.userId && assignment.assignedToType === 'user'
        );
      }

      // Project ID filter
      if (filters.projectId) {
        filteredAssignments = filteredAssignments.filter(assignment => 
          assignment.assignedTo === filters.projectId && assignment.assignedToType === 'project'
        );
      }

      // Status filter
      if (filters.status) {
        filteredAssignments = filteredAssignments.filter(assignment => assignment.status === filters.status);
      }

      // Type filter
      if (filters.type) {
        filteredAssignments = filteredAssignments.filter(assignment => assignment.type === filters.type);
      }

      // Active only filter
      if (filters.activeOnly) {
        filteredAssignments = filteredAssignments.filter(assignment => assignment.status === 'active');
      }

      // Overdue only filter
      if (filters.overdueOnly) {
        const today = new Date().toISOString().split('T')[0];
        filteredAssignments = filteredAssignments.filter(assignment => 
          assignment.status === 'active' && assignment.endDate < today
        );
      }

      // Date range filter
      if (filters.dateRange) {
        const startDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        filteredAssignments = filteredAssignments.filter(assignment => {
          const assignmentStart = new Date(assignment.startDate);
          const assignmentEnd = new Date(assignment.endDate);
          return (assignmentStart >= startDate && assignmentStart <= endDate) ||
                 (assignmentEnd >= startDate && assignmentEnd <= endDate);
        });
      }

      // Sorting
      if (filters.sortBy) {
        filteredAssignments.sort((a, b) => {
          let aValue: any = a[filters.sortBy as keyof EquipmentAssignment];
          let bValue: any = b[filters.sortBy as keyof EquipmentAssignment];

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
    const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

    return {
      data: paginatedAssignments,
      total: filteredAssignments.length,
      page,
      limit,
      totalPages: Math.ceil(filteredAssignments.length / limit)
    };
  }

  // Get assignment by ID
  async getAssignmentById(id: string): Promise<EquipmentAssignment | null> {
    await this.delay();
    const assignment = mockAssignments.find(a => a.id === id);
    return assignment || null;
  }

  // Create new assignment
  async createAssignment(data: CreateAssignmentDTO): Promise<EquipmentAssignment> {
    await this.delay();
    
    const newAssignment: EquipmentAssignment = {
      id: this.generateId(),
      toolId: (data as any).toolId || '',
      ...data,
      status: data.status || 'active',
      actualEndDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockAssignments.push(newAssignment);
    return newAssignment;
  }

  // Update assignment
  async updateAssignment(id: string, data: UpdateAssignmentDTO): Promise<EquipmentAssignment> {
    await this.delay();
    
    const index = mockAssignments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Asignación no encontrada');
    }

    const updatedAssignment = {
      ...mockAssignments[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    mockAssignments[index] = updatedAssignment;
    return updatedAssignment;
  }

  // Delete assignment
  async deleteAssignment(id: string): Promise<void> {
    await this.delay();
    
    const index = mockAssignments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Asignación no encontrada');
    }

    mockAssignments.splice(index, 1);
  }

  // Assign equipment
  async assignTool(toolId: string, data: CreateAssignmentDTO): Promise<ToolAssignment> {
    await this.delay();
    
    // Check if tool is already assigned
    const existingAssignment = mockAssignments.find(a => 
      a.toolId === toolId && a.status === 'active'
    );

    if (existingAssignment) {
      throw new Error('El equipo ya está asignado');
    }

    const newAssignment: ToolAssignment = {
      id: this.generateId(),
      toolId,
      toolName: data.toolName || 'Herramienta sin nombre',
      assignedTo: data.assignedTo,
      assignedToType: data.assignedToType,
      assignedToName: data.assignedToName || 'Sin asignar',
      assignedBy: data.assignedBy,
      assignedByName: data.assignedByName || 'Sistema',
      startDate: data.startDate,
      endDate: data.endDate,
      actualEndDate: null,
      status: 'active',
      type: data.type || 'assignment',
      purpose: data.purpose,
      location: data.location || '',
      notes: data.notes || '',
      priority: data.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockAssignments.push(newAssignment);
    return newAssignment;
  }

  // Unassign equipment
  async unassignEquipment(assignmentId: string, notes?: string): Promise<void> {
    await this.delay();
    
    const assignment = mockAssignments.find(a => a.id === assignmentId);
    if (!assignment) {
      throw new Error('Asignación no encontrada');
    }

    if (assignment.status !== 'active') {
      throw new Error('La asignación no está activa');
    }

    assignment.status = 'completed';
    assignment.actualEndDate = new Date().toISOString().split('T')[0];
    assignment.notes = notes ? `${assignment.notes}\n${notes}` : assignment.notes;
    assignment.updatedAt = new Date().toISOString();
  }

  // Alias: Unassign tool (compatibilidad con hooks)
  async unassignTool(assignmentId: string, notes?: string): Promise<void> {
    return this.unassignEquipment(assignmentId, notes);
  }

  // Extend assignment
  async extendAssignment(assignmentId: string, newEndDate: string, notes?: string): Promise<EquipmentAssignment> {
    await this.delay();
    
    const assignment = mockAssignments.find(a => a.id === assignmentId);
    if (!assignment) {
      throw new Error('Asignación no encontrada');
    }

    if (assignment.status !== 'active') {
      throw new Error('La asignación no está activa');
    }

    assignment.endDate = newEndDate;
    assignment.notes = notes ? `${assignment.notes}\n${notes}` : assignment.notes;
    assignment.updatedAt = new Date().toISOString();

    return assignment;
  }

  // Get current assignments for equipment
  async getCurrentToolAssignments(toolId: string): Promise<ToolAssignment[]> {
    await this.delay();
    return mockAssignments.filter(a => 
      a.toolId === toolId && a.status === 'active'
    );
  }

  // Get assignments for user
  async getUserAssignments(userId: string): Promise<EquipmentAssignment[]> {
    await this.delay();
    
    return mockAssignments.filter(a => 
      a.assignedTo === userId && a.assignedToType === 'user'
    );
  }

  // Get assignments for project
  async getProjectAssignments(projectId: string): Promise<EquipmentAssignment[]> {
    await this.delay();
    
    return mockAssignments.filter(a => 
      a.assignedTo === projectId && a.assignedToType === 'project'
    );
  }

  // Get assignment statistics
  async getAssignmentStats(): Promise<AssignmentStats> {
    await this.delay();
    
    const total = mockAssignments.length;
    const active = mockAssignments.filter(a => a.status === 'active').length;
    const completed = mockAssignments.filter(a => a.status === 'completed').length;
    const overdue = mockAssignments.filter(a => 
      a.status === 'active' && a.endDate < new Date().toISOString().split('T')[0]
    ).length;

    // Assignment types count
    const types = mockAssignments.reduce((acc, assignment) => {
      acc[assignment.type] = (acc[assignment.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Assignment priorities count
    const priorities = mockAssignments.reduce((acc, assignment) => {
      acc[assignment.priority] = (acc[assignment.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Assignment by type (user vs project)
    const assignmentsByType = mockAssignments.reduce((acc, assignment) => {
      acc[assignment.assignedToType] = (acc[assignment.assignedToType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      completed,
      overdue,
      types,
      priorities,
      assignmentsByType
    };
  }

  // Get available equipment for assignment
  async getAvailableEquipment(): Promise<any[]> {
    await this.delay();
    
    // In a real implementation, this would fetch from equipment service
    // For now, return mock data
    return [
      { id: '4', name: 'Compresor Atlas Copco', brand: 'Atlas Copco', status: 'available' },
      { id: '5', name: 'Generador Cummins', brand: 'Cummins', status: 'available' },
      { id: '6', name: 'Retroexcavadora JCB', brand: 'JCB', status: 'available' }
    ];
  }

  // Get available users for assignment
  async getAvailableUsers(): Promise<any[]> {
    await this.delay();
    
    // In a real implementation, this would fetch from user service
    return [
      { id: 'user-4', name: 'Roberto Martínez', role: 'Operador' },
      { id: 'user-5', name: 'Luis Hernández', role: 'Conductor' },
      { id: 'user-6', name: 'Pedro Sánchez', role: 'Técnico' }
    ];
  }

  // Get available projects for assignment
  async getAvailableProjects(): Promise<any[]> {
    await this.delay();
    
    // In a real implementation, this would fetch from project service
    return [
      { id: 'project-3', name: 'Proyecto Residencial Los Álamos', status: 'active' },
      { id: 'project-4', name: 'Proyecto Vial Autopista Norte', status: 'active' },
      { id: 'project-5', name: 'Proyecto Industrial Planta Cemento', status: 'planning' }
    ];
  }
}

export const assignmentService = new AssignmentService();