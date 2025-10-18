export type VisitType = 'inspection' | 'supervision' | 'client_meeting' | 'material_delivery' | 'other';

export type VisitStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface Visit {
  id: string;
  projectId: string;
  projectName: string;
  date: string; // ISO date string
  time: string; // HH:mm format
  type: VisitType;
  participants: string[]; // User IDs
  notes?: string;
  status: VisitStatus;
  reminder?: {
    enabled: boolean;
    minutesBefore: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  completionNotes?: string;
}

export interface CreateVisitDTO {
  projectId: string;
  date: string;
  time: string;
  type: string;
  participants?: string[];
  notes?: string;
  reminder?: {
    enabled: boolean;
    minutesBefore: number;
  };
}
