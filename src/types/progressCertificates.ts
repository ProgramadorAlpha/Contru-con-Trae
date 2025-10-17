/**
 * Progress Certificate Types
 * 
 * Defines the data structures for certifying work progress and authorizing
 * payments to subcontractors based on completed work.
 */

/**
 * Status of a progress certificate through its approval workflow
 */
export type CertificateStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'paid' 
  | 'rejected'

/**
 * Progress Certificate
 * 
 * Represents a certification of work completed by a subcontractor,
 * which authorizes a payment based on the percentage or amount of work done.
 */
export interface ProgressCertificate {
  // Identification
  id: string
  certificateNumber: string // Unique certificate reference (e.g., "CERT-001")
  
  // Relationships
  subcontractId: string
  projectId: string
  
  // Period Covered
  periodStart: string // ISO date string
  periodEnd: string // ISO date string
  
  // Progress Measurement
  percentageComplete: number // Percentage of total work completed (0-100)
  amountCertified: number // Amount being certified in this certificate
  
  // Financial Calculations
  retentionAmount: number // Amount retained (holdback) from this payment
  netPayable: number // Actual amount to be paid (amountCertified - retentionAmount)
  previousCertified: number // Total amount certified in previous certificates
  cumulativeCertified: number // Total amount certified including this certificate
  
  // Status and Workflow
  status: CertificateStatus
  
  // Submission
  submittedBy: string // User ID of field supervisor who submitted
  submittedAt: string // ISO date string
  
  // Approval
  approvedBy?: string // User ID of approver
  approvedAt?: string // ISO date string
  
  // Rejection
  rejectedBy?: string // User ID who rejected
  rejectedAt?: string // ISO date string
  rejectionReason?: string
  
  // Payment
  paymentId?: string // ID of the payment record created after approval
  paidAt?: string // ISO date string when payment was made
  
  // Supporting Documentation
  photos: string[] // URLs to progress photos
  documents: string[] // URLs to supporting documents
  notes: string // Field supervisor notes about the work completed
  
  // Metadata
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
}

/**
 * DTO for creating a new progress certificate
 */
export interface CreateProgressCertificateDTO {
  certificateNumber: string
  subcontractId: string
  projectId: string
  periodStart: string
  periodEnd: string
  percentageComplete: number
  amountCertified: number
  photos?: string[]
  documents?: string[]
  notes: string
}

/**
 * DTO for updating a progress certificate
 */
export interface UpdateProgressCertificateDTO {
  periodStart?: string
  periodEnd?: string
  percentageComplete?: number
  amountCertified?: number
  photos?: string[]
  documents?: string[]
  notes?: string
}

/**
 * Input data for calculating certificate financial values
 */
export interface CertificateCalculationInput {
  subcontractTotalAmount: number
  retentionPercentage: number
  amountCertified: number
  previousCertified: number
}

/**
 * Result of certificate financial calculations
 */
export interface CertificateCalculation {
  amountCertified: number
  retentionAmount: number
  netPayable: number
  cumulativeCertified: number
  remainingBalance: number
  percentageComplete: number
}

/**
 * Summary statistics for progress certificates
 */
export interface ProgressCertificateStats {
  total: number
  pending: number
  approved: number
  paid: number
  rejected: number
  totalCertified: number
  totalPaid: number
  totalRetained: number
  averageApprovalTime: number // In hours
}

/**
 * Filters for querying progress certificates
 */
export interface ProgressCertificateFilters {
  subcontractId?: string
  projectId?: string
  status?: CertificateStatus
  submittedBy?: string
  periodStartFrom?: string
  periodStartTo?: string
  minAmount?: number
  maxAmount?: number
}

/**
 * Response from progress certificate queries with pagination
 */
export interface ProgressCertificateResponse {
  data: ProgressCertificate[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Approval action data
 */
export interface ApproveCertificateDTO {
  certificateId: string
  approverId: string
  notes?: string
}

/**
 * Rejection action data
 */
export interface RejectCertificateDTO {
  certificateId: string
  rejectedBy: string
  rejectionReason: string
}

/**
 * Certificate history entry for audit trail
 */
export interface CertificateHistoryEntry {
  id: string
  certificateId: string
  action: 'created' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'updated'
  performedBy: string
  performedAt: string
  details?: string
  previousStatus?: CertificateStatus
  newStatus?: CertificateStatus
}
