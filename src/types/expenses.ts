/**
 * Expense Management Types
 * 
 * Defines the data structures for managing expenses with mandatory
 * classification by project, cost code, and supplier.
 */

import type { CostCode } from './costCodes'

/**
 * Status of an expense through its lifecycle
 */
export type ExpenseStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'paid' 
  | 'rejected'

/**
 * Payment status of an expense
 */
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

/**
 * Type of expense attachment
 */
export type AttachmentType = 'invoice' | 'receipt' | 'quote' | 'contract' | 'other'

/**
 * OCR Data
 * 
 * Contains the raw OCR output and extracted fields from automated
 * expense creation via n8n integration.
 */
export interface OCRData {
  rawText: string // Complete OCR text output
  extractedFields: {
    amount?: number
    date?: string
    supplier?: string
    invoiceNumber?: string
    taxAmount?: number
    description?: string
  }
  confidence: number // Overall confidence score (0-1)
  processedAt: string // ISO date string when OCR was processed
  ocrProvider?: string // e.g., "Google Vision API", "Tesseract"
}

/**
 * Expense Attachment
 * 
 * Represents a file attached to an expense (invoice, receipt, etc.)
 */
export interface ExpenseAttachment {
  id: string
  name: string
  type: AttachmentType
  url: string
  size: number // File size in bytes
  mimeType: string
  uploadDate: string // ISO date string
  uploadedBy?: string // User ID
}

/**
 * Expense
 * 
 * Represents a business expense with mandatory classification
 * by project, cost code, and supplier for proper job costing.
 */
export interface Expense {
  // Identification
  id: string
  expenseNumber?: string // Optional unique reference number
  
  // MANDATORY CLASSIFICATION (Required for Job Costing)
  projectId: string
  projectName: string
  costCodeId: string
  costCode: CostCode // Denormalized for easier access
  supplierId: string
  supplierName: string
  
  // Financial
  amount: number
  currency: string // ISO currency code (default: 'USD')
  taxAmount?: number
  totalAmount: number // amount + taxAmount
  
  // Details
  description: string
  invoiceNumber?: string
  invoiceDate: string // ISO date string
  dueDate?: string // ISO date string
  
  // Status
  status: ExpenseStatus
  paymentStatus: PaymentStatus
  
  // Approval Workflow
  submittedBy: string // User ID who created/submitted the expense
  submittedAt: string // ISO date string
  approvedBy?: string // User ID who approved
  approvedAt?: string // ISO date string
  rejectedBy?: string // User ID who rejected
  rejectedAt?: string // ISO date string
  rejectionReason?: string
  
  // Automation (for OCR/n8n integration)
  isAutoCreated: boolean // True if created via API automation
  ocrConfidence?: number // Confidence score if created via OCR
  ocrData?: OCRData // Full OCR data if available
  needsReview: boolean // True if auto-created and needs manual review
  
  // Documents
  attachments: ExpenseAttachment[]
  
  // Payment Tracking
  paidAmount?: number
  paidDate?: string // ISO date string
  paymentMethod?: string // e.g., "bank_transfer", "check", "cash"
  paymentReference?: string
  
  // Metadata
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  
  // Additional Info
  notes?: string
  tags?: string[]
}

/**
 * DTO for creating a new expense manually
 */
export interface CreateExpenseDTO {
  // MANDATORY CLASSIFICATION
  projectId: string
  projectName: string
  costCodeId: string
  supplierId: string
  supplierName: string
  
  // Financial
  amount: number
  currency?: string
  taxAmount?: number
  
  // Details
  description: string
  invoiceNumber?: string
  invoiceDate: string
  dueDate?: string
  
  // Optional
  notes?: string
  tags?: string[]
}

/**
 * DTO for creating an expense from OCR/n8n automation
 */
export interface OCRExpenseDTO {
  // Extracted from OCR
  amount: number
  date: string // Invoice date
  supplier: string
  description: string
  invoiceNumber?: string
  taxAmount?: number
  
  // File attachment
  file: {
    name: string
    data: string // Base64 encoded file data
    mimeType: string
  }
  
  // OCR metadata
  ocrData: OCRData
  
  // Optional pre-classification (can be set by rules in n8n)
  projectId?: string
  costCodeId?: string
  supplierId?: string
}

/**
 * DTO for updating an existing expense
 */
export interface UpdateExpenseDTO {
  projectId?: string
  projectName?: string
  costCodeId?: string
  supplierId?: string
  supplierName?: string
  amount?: number
  taxAmount?: number
  description?: string
  invoiceNumber?: string
  invoiceDate?: string
  dueDate?: string
  notes?: string
  tags?: string[]
}

/**
 * Expense Classification
 * 
 * Used to classify or reclassify an expense with the mandatory fields
 */
export interface ExpenseClassification {
  projectId: string
  projectName: string
  costCodeId: string
  supplierId: string
  supplierName: string
}

/**
 * Validation result for expense data
 */
export interface ExpenseValidationResult {
  isValid: boolean
  errors: ExpenseValidationError[]
  warnings: ExpenseValidationWarning[]
}

export interface ExpenseValidationError {
  field: string
  message: string
  code: string
}

export interface ExpenseValidationWarning {
  field: string
  message: string
  suggestion?: string
}

/**
 * Filters for querying expenses
 */
export interface ExpenseFilters {
  projectId?: string
  costCodeId?: string
  supplierId?: string
  status?: ExpenseStatus
  paymentStatus?: PaymentStatus
  isAutoCreated?: boolean
  needsReview?: boolean
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  search?: string // Search in description, invoice number, or supplier name
  tags?: string[]
}

/**
 * Response from expense queries with pagination
 */
export interface ExpenseResponse {
  data: Expense[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Summary statistics for expenses
 */
export interface ExpenseStats {
  total: number
  draft: number
  pendingApproval: number
  approved: number
  paid: number
  rejected: number
  totalAmount: number
  paidAmount: number
  unpaidAmount: number
  autoCreated: number
  needingReview: number
  averageAmount: number
  byProject: Record<string, number>
  byCostCode: Record<string, number>
  bySupplier: Record<string, number>
}

/**
 * Expense approval action
 */
export interface ApproveExpenseDTO {
  expenseId: string
  approverId: string
  notes?: string
}

/**
 * Expense rejection action
 */
export interface RejectExpenseDTO {
  expenseId: string
  rejectedBy: string
  rejectionReason: string
}

/**
 * Expense payment recording
 */
export interface RecordPaymentDTO {
  expenseId: string
  paidAmount: number
  paidDate: string
  paymentMethod: string
  paymentReference?: string
  notes?: string
}

/**
 * Bulk operations
 */
export interface BulkApproveExpensesDTO {
  expenseIds: string[]
  approverId: string
  notes?: string
}

export interface BulkRejectExpensesDTO {
  expenseIds: string[]
  rejectedBy: string
  rejectionReason: string
}

/**
 * Expense history entry for audit trail
 */
export interface ExpenseHistoryEntry {
  id: string
  expenseId: string
  action: 'created' | 'updated' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'classified'
  performedBy: string
  performedAt: string
  details?: string
  previousStatus?: ExpenseStatus
  newStatus?: ExpenseStatus
  changes?: Record<string, { old: any; new: any }>
}
