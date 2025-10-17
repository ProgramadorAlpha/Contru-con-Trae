/**
 * Audit Log Types
 * 
 * Defines the data structures for tracking all financial transactions
 * and approval actions for compliance and auditing purposes.
 */

/**
 * Type of action being audited
 */
export type AuditAction =
  // Subcontract actions
  | 'subcontract_created'
  | 'subcontract_updated'
  | 'subcontract_approved'
  | 'subcontract_completed'
  | 'subcontract_cancelled'
  | 'subcontract_deleted'
  // Certificate actions
  | 'certificate_created'
  | 'certificate_updated'
  | 'certificate_submitted'
  | 'certificate_approved'
  | 'certificate_rejected'
  | 'certificate_paid'
  | 'certificate_deleted'
  // Expense actions
  | 'expense_created'
  | 'expense_updated'
  | 'expense_classified'
  | 'expense_submitted'
  | 'expense_approved'
  | 'expense_rejected'
  | 'expense_paid'
  | 'expense_deleted'
  // Cost code actions
  | 'cost_code_created'
  | 'cost_code_updated'
  | 'cost_code_deleted'
  // Financial actions
  | 'budget_updated'
  | 'payment_recorded'
  | 'retention_released'
  // System actions
  | 'user_login'
  | 'user_logout'
  | 'settings_changed'

/**
 * Entity type being audited
 */
export type AuditEntityType =
  | 'subcontract'
  | 'certificate'
  | 'expense'
  | 'cost_code'
  | 'project'
  | 'payment'
  | 'user'
  | 'system'

/**
 * Severity level of the audit event
 */
export type AuditSeverity = 'info' | 'warning' | 'critical'

/**
 * Audit Log Entry
 * 
 * Complete record of an auditable action in the system
 */
export interface AuditLogEntry {
  // Identification
  id: string
  timestamp: string // ISO date string
  
  // Action details
  action: AuditAction
  entityType: AuditEntityType
  entityId: string
  entityName?: string
  
  // User information
  userId: string
  userName: string
  userEmail?: string
  userRole?: string
  
  // Context
  projectId?: string
  projectName?: string
  
  // Changes
  changes?: AuditChange[]
  previousState?: Record<string, any>
  newState?: Record<string, any>
  
  // Financial impact
  financialImpact?: {
    amount?: number
    currency?: string
    budgetImpact?: number
    description?: string
  }
  
  // Metadata
  severity: AuditSeverity
  description: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  
  // Additional context
  metadata?: Record<string, any>
  tags?: string[]
}

/**
 * Audit Change
 * 
 * Represents a specific field change
 */
export interface AuditChange {
  field: string
  fieldLabel?: string
  oldValue: any
  newValue: any
  changeType: 'created' | 'updated' | 'deleted'
}

/**
 * Audit Log Query Filters
 */
export interface AuditLogFilters {
  // Time range
  startDate?: string
  endDate?: string
  
  // Entity filters
  entityType?: AuditEntityType
  entityId?: string
  projectId?: string
  
  // User filters
  userId?: string
  userRole?: string
  
  // Action filters
  actions?: AuditAction[]
  severity?: AuditSeverity
  
  // Search
  search?: string
  
  // Tags
  tags?: string[]
}

/**
 * Audit Log Response
 */
export interface AuditLogResponse {
  data: AuditLogEntry[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Audit Log Statistics
 */
export interface AuditLogStats {
  totalEntries: number
  entriesByAction: Record<AuditAction, number>
  entriesByEntityType: Record<AuditEntityType, number>
  entriesBySeverity: Record<AuditSeverity, number>
  entriesByUser: Record<string, number>
  recentActivity: AuditLogEntry[]
  criticalEvents: AuditLogEntry[]
  financialTransactions: {
    total: number
    totalAmount: number
    byType: Record<string, number>
  }
}

/**
 * DTO for creating audit log entry
 */
export interface CreateAuditLogDTO {
  action: AuditAction
  entityType: AuditEntityType
  entityId: string
  entityName?: string
  userId: string
  userName: string
  userEmail?: string
  projectId?: string
  projectName?: string
  changes?: AuditChange[]
  previousState?: Record<string, any>
  newState?: Record<string, any>
  financialImpact?: {
    amount?: number
    currency?: string
    budgetImpact?: number
    description?: string
  }
  severity?: AuditSeverity
  description: string
  metadata?: Record<string, any>
  tags?: string[]
}

/**
 * Audit Log Export Options
 */
export interface AuditLogExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json'
  filters?: AuditLogFilters
  includeMetadata?: boolean
  includeChanges?: boolean
  dateRange: {
    start: string
    end: string
  }
}
