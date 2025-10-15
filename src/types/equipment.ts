// Equipment Types
export interface Equipment {
  id: string;
  name: string;
  description: string;
  category: EquipmentCategory;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  status: EquipmentStatus;
  location: string;
  images: string[];
  documents: EquipmentDocument[];
  specifications: Record<string, any>;
  maintenanceSchedule: MaintenanceSchedule;
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  parentId?: string;
}

export interface EquipmentType {
  id: string;
  name: string;
  categoryId: string;
  specifications: EquipmentSpecification[];
}

export interface EquipmentSpecification {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  required: boolean;
  options?: string[];
  unit?: string;
}

export enum EquipmentStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  REPAIR = 'repair',
  RETIRED = 'retired'
}

export enum AssignmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum MaintenanceType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  PREDICTIVE = 'predictive'
}

export interface EquipmentAssignment {
  id: string;
  equipmentId: string;
  projectId: string;
  assignedBy: string;
  assignedTo: string;
  startDate: Date;
  endDate?: Date;
  status: AssignmentStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: MaintenanceType;
  scheduledDate: Date;
  completedDate?: Date;
  technician: string;
  description: string;
  cost: number;
  nextMaintenanceDate?: Date;
  documents: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipmentDocument {
  id: string;
  name: string;
  type: 'manual' | 'certificate' | 'invoice' | 'photo' | 'other';
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface MaintenanceSchedule {
  intervalType: 'days' | 'weeks' | 'months' | 'hours';
  intervalValue: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
}

export interface EquipmentFilters {
  category?: string;
  type?: string;
  status?: EquipmentStatus;
  projectId?: string;
  location?: string;
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface EquipmentStats {
  total: number;
  available: number;
  inUse: number;
  inMaintenance: number;
  retired: number;
  totalValue: number;
  utilizationRate: number;
  upcomingMaintenance: number;
  overdueMaintenance: number;
}

export interface CreateEquipmentDTO {
  name: string;
  description: string;
  categoryId: string;
  typeId: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  purchasePrice: number;
  location: string;
  specifications: Record<string, any>;
  maintenanceSchedule?: MaintenanceSchedule;
}

export interface UpdateEquipmentDTO extends Partial<CreateEquipmentDTO> {
  status?: EquipmentStatus;
  currentValue?: number;
}

export interface AssignmentDTO {
  projectId: string;
  assignedTo: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

export interface MaintenanceDTO {
  type: MaintenanceType;
  scheduledDate: Date;
  technician: string;
  description: string;
  cost: number;
  documents?: string[];
}

export interface EquipmentListItem extends Equipment {
  currentAssignment?: EquipmentAssignment;
  nextMaintenance?: MaintenanceRecord;
  projectName?: string;
  assignedUserName?: string;
}

export interface EquipmentDetail extends Equipment {
  assignments: EquipmentAssignment[];
  maintenanceHistory: MaintenanceRecord[];
  projectHistory: ProjectEquipmentHistory[];
}

export interface ProjectEquipmentHistory {
  projectId: string;
  projectName: string;
  startDate: Date;
  endDate?: Date;
  usageHours: number;
  cost: number;
}