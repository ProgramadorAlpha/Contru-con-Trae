// Tool Types

export type ToolCategory = string;
export type ToolType = string;

export interface ToolSpecification {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  required: boolean;
  options?: string[];
  unit?: string;
  // Compatibilidad con UI que usa valor directo
  value?: string | number | boolean;
}

export type ToolStatus = 'available' | 'in_use' | 'maintenance' | 'repair' | 'retired' | 'active';

export enum AssignmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export type MaintenanceType = 'preventive' | 'corrective' | 'inspection' | 'calibration' | string;

export interface ToolDocument {
  id: string;
  name: string;
  type: 'manual' | 'certificate' | 'invoice' | 'photo' | 'other';
  url: string;
  size: number;
  mimeType?: string;
  uploadedAt?: string | Date;
  // Compatibilidad con componentes
  description?: string;
  uploadDate?: string | Date;
}

export interface MaintenanceSchedule {
  intervalType?: 'days' | 'weeks' | 'months' | 'hours';
  intervalValue?: number;
  lastMaintenanceDate?: string | Date;
  nextMaintenanceDate?: string | Date;
  // Compatibilidad con componentes y mocks
  nextMaintenance?: string | Date;
  lastMaintenance?: string | Date;
  maintenanceInterval?: number;
  maintenanceHours?: number;
  maintenanceType?: string;
  frequency?: string;
  notes?: string;
  // Nuevos campos para compatibilidad con servicios
  id?: string;
  toolId?: string;
  toolName?: string;
  type?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  estimatedDuration?: number;
  estimatedCost?: number;
  frequencyValue?: number;
  description?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface MaintenanceRecord {
  id: string;
  toolId: string;
  toolName?: string;
  type: MaintenanceType;
  scheduledDate: string | Date;
  completedDate?: string | Date;
  technician?: string;
  description: string;
  cost: number;
  nextMaintenanceDate?: string | Date;
  documents?: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'pending';
  createdAt: string | Date;
  updatedAt: string | Date;
  // Compatibilidad con componentes
  date?: Date;
  // Compatibilidad con servicio de mantenimiento
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  nextMaintenanceType?: string;
  assignedTo?: string;
  assignedToName?: string;
  partsUsed?: Array<{ partNumber: string; name: string; quantity: number; cost: number }>;
  hoursWorked?: number;
}

export interface ToolAssignment {
  id: string;
  toolId: string;
  assignedBy: string;
  assignedTo: string;
  startDate: string | Date;
  endDate?: string | Date;
  status: AssignmentStatus | 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Compatibilidad con UI y servicios
  projectId?: string;
  toolName?: string;
  assignedToType?: 'user' | 'project';
  assignedToName?: string;
  assignedByName?: string;
  actualEndDate?: string | Date;
  type?: string;
  purpose?: string;
  location?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  projectName?: string;
  assignedDate?: string | Date;
  expectedReturnDate?: string | Date;
  // Compatibilidad adicional con componentes
  returnDate?: string | Date;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  type: ToolType;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string | Date;
  purchasePrice: number;
  currentValue: number;
  status: string | ToolStatus;
  location: string;
  images: string[];
  documents: ToolDocument[];
  specifications: Record<string, any>;
  maintenanceSchedule: MaintenanceSchedule;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Compatibilidad con componentes existentes
  code?: string;
  value?: number;
  supplier?: string;
  warrantyExpiry?: string | Date;
  currentAssignment?: ToolAssignment;
  maintenanceHistory?: MaintenanceRecord[];
  nextMaintenance?: MaintenanceRecord;
  assignmentHistory?: ToolAssignment[];
  assignedTo?: string;
  notes?: string;
  // Compatibilidad adicional con componentes
  projectName?: string;
  assignedUserName?: string;
}

export interface ToolFilters {
  category?: string;
  type?: string;
  status?: string | ToolStatus | '';
  projectId?: string;
  location?: string;
  search?: string;
  // Extras usados por filtros UI
  brand?: string;
  minValue?: number;
  maxValue?: number;
  assignedTo?: string;
  maintenanceDue?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface ToolStats {
  total: number;
  active?: number;
  available: number;
  maintenance: number;
  retired: number;
  assigned?: number;
  maintenanceDue?: number;
  totalValue: number;
  averageValue?: number;
  categories?: Record<string, number>;
}

export interface CreateToolDTO {
  id?: string;
  name: string;
  description: string;
  // El formulario usa strings de categoría/tipo
  category?: string;
  type?: string;
  // Mantener IDs opcionales para compatibilidad
  categoryId?: string;
  typeId?: string;
  brand: string;
  model: string;
  serialNumber: string;
  // Fechas como string en formularios
  purchaseDate: string;
  // Valores financieros
  purchasePrice: number;
  purchaseValue?: number;
  value?: number;
  currentValue?: number;
  // Otros campos usados en UI
  location: string;
  // Compatibilidad adicional con formularios
  code?: string;
  supplier?: string;
  warrantyExpiry?: string;
  status?: ToolStatus | string;
  images?: string[];
  documents?: ToolDocument[];
  assignedTo?: string;
  specifications: ToolSpecification[] | Record<string, any>;
  maintenanceSchedule?: MaintenanceSchedule;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AssignmentDTO {
  projectId: string;
  assignedTo: string;
  startDate: string | Date;
  endDate?: string | Date;
  notes?: string;
}

export interface UpdateToolDTO extends Partial<CreateToolDTO> {
  // explícito para claridad (ya incluido por Partial<CreateToolDTO>)
  status?: ToolStatus | string;
  currentValue?: number;
}

export interface MaintenanceFilters {
  search?: string;
  toolId?: string;
  type?: 'preventive' | 'corrective' | 'inspection' | 'calibration' | string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'pending' | '';
  priority?: 'low' | 'medium' | 'high' | 'urgent' | '';
  assignedTo?: string;
  upcomingOnly?: boolean;
  overdueOnly?: boolean;
  completedOnly?: boolean;
  dateRange?: { startDate: string; endDate: string };
  sortBy?: keyof MaintenanceRecord | 'scheduledDate' | 'completedDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}


export interface MaintenanceDTO {
  type: MaintenanceType;
  scheduledDate: Date;
  technician: string;
  description: string;
  cost: number;
  documents?: string[];
}

export interface ToolListItem extends Tool {
  currentAssignment?: ToolAssignment;
  nextMaintenance?: MaintenanceRecord;
  projectName?: string;
  assignedUserName?: string;
}

export interface ToolDetail extends Tool {
  assignments: ToolAssignment[];
  maintenanceHistory: MaintenanceRecord[];
  projectHistory: ProjectToolHistory[];
}

export interface ProjectToolHistory {
  projectId: string;
  projectName: string;
  startDate: Date;
  endDate?: Date;
  usageHours: number;
  cost: number;
}

export interface ToolResponse {
  data: Tool[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Asignaciones: DTOs y tipos usados por servicios
export interface CreateAssignmentDTO {
  toolName?: string;
  assignedTo: string;
  assignedToType: 'user' | 'project';
  assignedToName?: string;
  assignedBy: string;
  assignedByName?: string;
  startDate: string;
  endDate?: string;
  type?: string;
  purpose?: string;
  location?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'active' | 'completed' | 'cancelled';
}

export interface UpdateAssignmentDTO extends Partial<CreateAssignmentDTO> {}

export interface AssignmentFilters {
  search?: string;
  toolId?: string;
  userId?: string;
  projectId?: string;
  status?: 'active' | 'completed' | 'cancelled' | '';
  type?: string;
  dateRange?: { startDate: string; endDate: string };
  activeOnly?: boolean;
  overdueOnly?: boolean;
  sortBy?: 'startDate' | 'endDate' | 'status' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface AssignmentResponse {
  data: ToolAssignment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AssignmentStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  types: Record<string, number>;
  priorities: Record<string, number>;
  assignmentsByType: Record<'user' | 'project', number>;
}

// Mantenimiento: DTOs, filtros y respuestas usados por maintenanceService
export interface CreateMaintenanceDTO {
  toolId: string;
  toolName?: string;
  type: 'preventive' | 'corrective' | 'inspection' | 'calibration' | string;
  description: string;
  scheduledDate: string;
  completedDate?: string | null;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'pending';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  technician?: string;
  cost?: number;
  notes?: string;
  partsUsed?: Array<{ partNumber: string; name: string; quantity: number; cost: number }>;
  hoursWorked?: number;
  documents?: string[];
}

export interface UpdateMaintenanceDTO extends Partial<CreateMaintenanceDTO> {}

export interface MaintenanceResponse {
  data: MaintenanceRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MaintenanceStats {
  totalRecords: number;
  completed: number;
  pending: number;
  overdue: number;
  upcoming: number;
  totalCost: number;
  averageCost: number;
  typeBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  toolMaintenance: Record<string, number>;
  totalSchedules: number;
  activeSchedules: number;
}

export interface CreateMaintenanceScheduleDTO {
  toolId: string;
  toolName?: string;
  type: 'preventive' | 'corrective' | 'inspection' | 'calibration' | string;
  description: string;
  frequency: string;
  frequencyValue?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  estimatedDuration?: number;
  estimatedCost?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface UpdateMaintenanceScheduleDTO extends Partial<CreateMaintenanceScheduleDTO> {}
export type EquipmentAssignment = ToolAssignment;