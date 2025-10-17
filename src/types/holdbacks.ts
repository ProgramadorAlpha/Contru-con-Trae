/**
 * Holdback/Retention Types
 * 
 * Defines the data structures for managing retention amounts
 * withheld from subcontractor payments until satisfactory completion.
 */

/**
 * Status of a holdback/retention
 */
export type HoldbackStatus = 'active' | 'released' | 'partial' | 'expired'

/**
 * Reason for releasing a holdback
 */
export type ReleaseReason = 
  | 'work_completed' 
  | 'warranty_expired' 
  | 'defects_corrected' 
  | 'contractual_agreement'
  | 'other'

/**
 * Holdback/Retention
 * 
 * Represents an amount withheld from a subcontractor payment
 * as security until work is satisfactorily completed.
 */
export interface Holdback {
  // Identification
  id: string
  holdbackNumber: string // Unique reference number
  
  // Relationships
  projectId: string
  projectName: string
  subcontractId: string
  subcontractorId: string
  subcontractorName: string
  progressCertificateId?: string // If related to a specific certificate
  
  // Financial
  originalAmount: number // Total amount originally retained
  currentAmount: number // Current retained amount (after partial releases)
  releasedAmount: number // Total amount released so far
  currency: string
  
  // Retention Details
  retentionPercentage: number // Percentage withheld (e.g., 10%)
  baseAmount: number // Amount the retention was calculated from
  
  // Status
  status: HoldbackStatus
  
  // Dates
  createdDate: string // ISO date string - when retention was created
  dueDate?: string // ISO date string - when retention should be released
  releaseEligibleDate?: string // ISO date string - earliest date for release
  
  // Release Information
  releases: HoldbackRelease[] // History of partial/full releases
  
  // Conditions
  releaseConditions: string[] // Conditions that must be met for release
  conditionsMet: boolean
  
  // Warranty
  warrantyPeriod?: number // Warranty period in days
  warrantyStartDate?: string // ISO date string
  warrantyEndDate?: string // ISO date string
  
  // Metadata
  createdBy: string // User ID
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  
  // Additional Info
  notes?: string
  attachments?: HoldbackAttachment[]
}

/**
 * Holdback Release
 * 
 * Represents a partial or full release of a holdback amount
 */
export interface HoldbackRelease {
  id: string
  holdbackId: string
  
  // Release Details
  releaseAmount: number
  releasePercentage: number // Percentage of original holdback released
  releaseDate: string // ISO date string
  releaseReason: ReleaseReason
  
  // Approval
  requestedBy: string // User ID
  requestedAt: string // ISO date string
  approvedBy: string // User ID
  approvedAt: string // ISO date string
  
  // Payment
  paymentId?: string // ID of payment record created for this release
  paidDate?: string // ISO date string
  
  // Documentation
  notes: string
  attachments?: string[] // URLs to supporting documents
  
  // Conditions
  conditionsVerified: boolean
  verifiedBy?: string // User ID
  verifiedAt?: string // ISO date string
}

/**
 * Holdback Attachment
 * 
 * Document attached to a holdback (inspection reports, completion certificates, etc.)
 */
export interface HoldbackAttachment {
  id: string
  name: string
  type: 'inspection_report' | 'completion_certificate' | 'warranty_document' | 'photo' | 'other'
  url: string
  uploadDate: string
  uploadedBy: string
  size: number
  mimeType: string
}

/**
 * DTO for creating a new holdback
 */
export interface CreateHoldbackDTO {
  holdbackNumber: string
  projectId: string
  projectName: string
  subcontractId: string
  subcontractorId: string
  subcontractorName: string
  progressCertificateId?: string
  originalAmount: number
  currency?: string
  retentionPercentage: number
  baseAmount: number
  dueDate?: string
  releaseEligibleDate?: string
  releaseConditions?: string[]
  warrantyPeriod?: number
  warrantyStartDate?: string
  notes?: string
}

/**
 * DTO for requesting a holdback release
 */
export interface RequestHoldbackReleaseDTO {
  holdbackId: string
  releaseAmount: number
  releaseReason: ReleaseReason
  notes: string
  attachments?: string[]
  requestedBy: string
}

/**
 * DTO for approving a holdback release
 */
export interface ApproveHoldbackReleaseDTO {
  releaseId: string
  approvedBy: string
  notes?: string
  createPayment?: boolean // If true, automatically create payment record
}

/**
 * DTO for rejecting a holdback release request
 */
export interface RejectHoldbackReleaseDTO {
  releaseId: string
  rejectedBy: string
  rejectionReason: string
}

/**
 * Summary statistics for holdbacks
 */
export interface HoldbackStats {
  total: number
  active: number
  released: number
  partial: number
  expired: number
  totalAmount: number
  releasedAmount: number
  pendingAmount: number
  byProject: Record<string, number>
  bySubcontractor: Record<string, number>
  averageRetentionPercentage: number
  averageHoldPeriod: number // In days
}

/**
 * Filters for querying holdbacks
 */
export interface HoldbackFilters {
  projectId?: string
  subcontractId?: string
  subcontractorId?: string
  status?: HoldbackStatus
  dueDateFrom?: string
  dueDateTo?: string
  minAmount?: number
  maxAmount?: number
  releaseEligible?: boolean // Only show holdbacks eligible for release
  warrantyExpired?: boolean // Only show holdbacks with expired warranty
}

/**
 * Response from holdback queries with pagination
 */
export interface HoldbackResponse {
  data: Holdback[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Holdback aging report
 * 
 * Shows how long holdbacks have been retained
 */
export interface HoldbackAgingReport {
  projectId?: string
  subcontractorId?: string
  
  // Aging Buckets
  current: HoldbackAgingBucket // 0-30 days
  aging30: HoldbackAgingBucket // 31-60 days
  aging60: HoldbackAgingBucket // 61-90 days
  aging90: HoldbackAgingBucket // 91+ days
  
  // Totals
  totalCount: number
  totalAmount: number
  
  // Details
  details: HoldbackAgingDetail[]
  
  // Metadata
  generatedAt: string
  asOfDate: string
}

export interface HoldbackAgingBucket {
  count: number
  totalAmount: number
  percentage: number
}

export interface HoldbackAgingDetail {
  holdbackId: string
  holdbackNumber: string
  subcontractor: string
  project: string
  amount: number
  createdDate: string
  daysHeld: number
  status: HoldbackStatus
  releaseEligible: boolean
}

/**
 * Holdback release schedule
 * 
 * Planned schedule for releasing holdbacks
 */
export interface HoldbackReleaseSchedule {
  projectId: string
  
  // Upcoming Releases
  upcomingReleases: ScheduledRelease[]
  
  // Summary
  totalScheduled: number
  totalAmount: number
  
  // By Month
  monthlySchedule: MonthlyReleaseSchedule[]
  
  // Metadata
  generatedAt: string
}

export interface ScheduledRelease {
  holdbackId: string
  holdbackNumber: string
  subcontractor: string
  amount: number
  scheduledDate: string
  conditions: string[]
  conditionsMet: boolean
  canRelease: boolean
}

export interface MonthlyReleaseSchedule {
  month: string // YYYY-MM format
  count: number
  totalAmount: number
  releases: ScheduledRelease[]
}

/**
 * Holdback history entry for audit trail
 */
export interface HoldbackHistoryEntry {
  id: string
  holdbackId: string
  action: 'created' | 'release_requested' | 'release_approved' | 'release_rejected' | 'payment_made' | 'updated'
  performedBy: string
  performedAt: string
  details?: string
  amount?: number
  previousStatus?: HoldbackStatus
  newStatus?: HoldbackStatus
}
