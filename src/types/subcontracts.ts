/**
 * Subcontract Management Types
 * 
 * Types for managing subcontractor contracts, payment schedules,
 * and contract documents in the job costing system.
 */

/**
 * Document attached to a subcontract
 */
export interface SubcontractDocument {
  id: string
  name: string
  type: 'contract' | 'quote' | 'specification' | 'insurance' | 'other'
  url: string
  uploadDate: string
  size: number
  mimeType: string
}

/**
 * Payment schedule item for a subcontract
 */
export interface PaymentScheduleItem {
  id: string
  description: string
  percentage: number
  amount: number
  dueDate?: string
  status: 'pending' | 'certified' | 'paid'
  certifiedDate?: string
  paidDate?: string
}

/**
 * Subcontract entity
 * 
 * Represents a contract with a subcontractor for work on a specific project.
 * Tracks financial commitments, payment schedules, and contract status.
 */
export interface Subcontract {
  id: string
  projectId: string
  projectName: string
  subcontractorId: string
  subcontractorName: string
  contractNumber: string
  description: string
  scope: string
  
  // Financial
  totalAmount: number
  currency: string
  retentionPercentage: number // Holdback %
  
  // Payment Schedule
  paymentSchedule: PaymentScheduleItem[]
  advancePaymentPercentage?: number
  
  // Status
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  startDate: string
  endDate: string
  completionDate?: string
  
  // Cost Classification
  costCodes: string[] // Array of cost code IDs
  
  // Documents
  documents: SubcontractDocument[]
  
  // Tracking
  totalCertified: number // Total amount certified
  totalPaid: number // Total amount paid
  totalRetained: number // Total amount retained
  remainingBalance: number // Amount left to certify
  
  // Additional Info
  notes?: string
  terms?: string
  warrantyPeriod?: number // in months
  
  // Metadata
  createdBy: string
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approvedAt?: string
}

/**
 * DTO for creating a new subcontract
 */
export interface CreateSubcontractDTO {
  projectId: string
  projectName: string
  subcontractorId: string
  subcontractorName: string
  contractNumber: string
  description: string
  scope: string
  totalAmount: number
  currency: string
  retentionPercentage: number
  paymentSchedule: Omit<PaymentScheduleItem, 'id' | 'status'>[]
  advancePaymentPercentage?: number
  startDate: string
  endDate: string
  costCodes: string[]
  notes?: string
  terms?: string
  warrantyPeriod?: number
}

/**
 * DTO for updating an existing subcontract
 */
export interface UpdateSubcontractDTO {
  contractNumber?: string
  description?: string
  scope?: string
  totalAmount?: number
  retentionPercentage?: number
  paymentSchedule?: PaymentScheduleItem[]
  advancePaymentPercentage?: number
  startDate?: string
  endDate?: string
  completionDate?: string
  status?: 'draft' | 'active' | 'completed' | 'cancelled'
  costCodes?: string[]
}

/**
 * Subcontract status type
 */
export type SubcontractStatus = 'draft' | 'active' | 'completed' | 'cancelled'

/**
 * Filters for querying subcontracts
 */
export interface SubcontractFilters {
  projectId?: string
  subcontractorId?: string
  status?: SubcontractStatus
  costCodeId?: string
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  search?: string
}

/**
 * Response from subcontract queries with pagination
 */
export interface SubcontractResponse {
  data: Subcontract[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Summary statistics for subcontracts
 */
export interface SubcontractStats {
  total: number
  draft: number
  active: number
  completed: number
  cancelled: number
  totalAmount: number
  totalPaid: number
  totalPending: number
  averageAmount: number
  byProject: Record<string, number>
  byCostCode: Record<string, number>
}
