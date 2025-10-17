/**
 * Audit Log Service
 * 
 * Service for logging all financial transactions and approval actions
 * for compliance, security, and auditing purposes.
 */

import type {
  AuditLogEntry,
  CreateAuditLogDTO,
  AuditLogFilters,
  AuditLogResponse,
  AuditLogStats,
  AuditAction,
  AuditEntityType,
  AuditSeverity
} from '@/types/auditLog'

// Mock storage - in production would use Firebase/database
const auditLogs: AuditLogEntry[] = []

class AuditLogService {
  private mockDelay = 300

  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateId(): string {
    return `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Create an audit log entry
   */
  async log(data: CreateAuditLogDTO): Promise<AuditLogEntry> {
    await this.delay(100)

    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      userRole: 'user', // TODO: Get from auth context
      projectId: data.projectId,
      projectName: data.projectName,
      changes: data.changes,
      previousState: data.previousState,
      newState: data.newState,
      financialImpact: data.financialImpact,
      severity: data.severity || this.determineSeverity(data.action),
      description: data.description,
      metadata: data.metadata,
      tags: data.tags || []
    }

    auditLogs.push(entry)

    // In production, also send to external logging service
    this.sendToExternalLogger(entry)

    return entry
  }

  /**
   * Log subcontract action
   */
  async logSubcontractAction(
    action: AuditAction,
    subcontractId: string,
    subcontractNumber: string,
    userId: string,
    userName: string,
    changes?: any,
    financialImpact?: any
  ): Promise<AuditLogEntry> {
    return this.log({
      action,
      entityType: 'subcontract',
      entityId: subcontractId,
      entityName: subcontractNumber,
      userId,
      userName,
      changes,
      financialImpact,
      description: `Subcontract ${subcontractNumber}: ${action.replace('subcontract_', '')}`,
      tags: ['subcontract', 'financial']
    })
  }

  /**
   * Log certificate action
   */
  async logCertificateAction(
    action: AuditAction,
    certificateId: string,
    certificateNumber: string,
    userId: string,
    userName: string,
    changes?: any,
    financialImpact?: any
  ): Promise<AuditLogEntry> {
    return this.log({
      action,
      entityType: 'certificate',
      entityId: certificateId,
      entityName: certificateNumber,
      userId,
      userName,
      changes,
      financialImpact,
      description: `Certificate ${certificateNumber}: ${action.replace('certificate_', '')}`,
      tags: ['certificate', 'financial', 'approval']
    })
  }

  /**
   * Log expense action
   */
  async logExpenseAction(
    action: AuditAction,
    expenseId: string,
    expenseDescription: string,
    userId: string,
    userName: string,
    changes?: any,
    financialImpact?: any
  ): Promise<AuditLogEntry> {
    return this.log({
      action,
      entityType: 'expense',
      entityId: expenseId,
      entityName: expenseDescription,
      userId,
      userName,
      changes,
      financialImpact,
      description: `Expense: ${action.replace('expense_', '')} - ${expenseDescription}`,
      tags: ['expense', 'financial', 'approval']
    })
  }

  /**
   * Log payment action
   */
  async logPaymentAction(
    paymentId: string,
    amount: number,
    recipient: string,
    userId: string,
    userName: string,
    projectId?: string
  ): Promise<AuditLogEntry> {
    return this.log({
      action: 'payment_recorded',
      entityType: 'payment',
      entityId: paymentId,
      entityName: `Payment to ${recipient}`,
      userId,
      userName,
      projectId,
      financialImpact: {
        amount,
        currency: 'USD',
        description: `Payment of ${amount} to ${recipient}`
      },
      severity: 'critical',
      description: `Payment recorded: ${amount} to ${recipient}`,
      tags: ['payment', 'financial', 'critical']
    })
  }

  /**
   * Query audit logs with filters
   */
  async query(
    filters?: AuditLogFilters,
    page: number = 1,
    limit: number = 50
  ): Promise<AuditLogResponse> {
    await this.delay()

    let filtered = [...auditLogs]

    // Apply filters
    if (filters) {
      if (filters.startDate) {
        filtered = filtered.filter(log => log.timestamp >= filters.startDate!)
      }

      if (filters.endDate) {
        filtered = filtered.filter(log => log.timestamp <= filters.endDate!)
      }

      if (filters.entityType) {
        filtered = filtered.filter(log => log.entityType === filters.entityType)
      }

      if (filters.entityId) {
        filtered = filtered.filter(log => log.entityId === filters.entityId)
      }

      if (filters.projectId) {
        filtered = filtered.filter(log => log.projectId === filters.projectId)
      }

      if (filters.userId) {
        filtered = filtered.filter(log => log.userId === filters.userId)
      }

      if (filters.actions && filters.actions.length > 0) {
        filtered = filtered.filter(log => filters.actions!.includes(log.action))
      }

      if (filters.severity) {
        filtered = filtered.filter(log => log.severity === filters.severity)
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(log =>
          log.description.toLowerCase().includes(searchLower) ||
          log.entityName?.toLowerCase().includes(searchLower) ||
          log.userName.toLowerCase().includes(searchLower)
        )
      }

      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(log =>
          log.tags && filters.tags!.some(tag => log.tags!.includes(tag))
        )
      }
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = filtered.slice(startIndex, endIndex)

    return {
      data: paginatedData,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    }
  }

  /**
   * Get audit log by ID
   */
  async getById(id: string): Promise<AuditLogEntry | null> {
    await this.delay()
    return auditLogs.find(log => log.id === id) || null
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 10): Promise<AuditLogEntry[]> {
    await this.delay()

    return [...auditLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  /**
   * Get critical events
   */
  async getCriticalEvents(limit: number = 20): Promise<AuditLogEntry[]> {
    await this.delay()

    return auditLogs
      .filter(log => log.severity === 'critical')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  /**
   * Get audit logs for specific entity
   */
  async getEntityHistory(
    entityType: AuditEntityType,
    entityId: string
  ): Promise<AuditLogEntry[]> {
    await this.delay()

    return auditLogs
      .filter(log => log.entityType === entityType && log.entityId === entityId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<AuditLogStats> {
    await this.delay()

    const entriesByAction: Record<string, number> = {}
    const entriesByEntityType: Record<string, number> = {}
    const entriesBySeverity: Record<string, number> = {}
    const entriesByUser: Record<string, number> = {}

    let totalFinancialAmount = 0
    let financialTransactionCount = 0
    const financialByType: Record<string, number> = {}

    auditLogs.forEach(log => {
      // By action
      entriesByAction[log.action] = (entriesByAction[log.action] || 0) + 1

      // By entity type
      entriesByEntityType[log.entityType] = (entriesByEntityType[log.entityType] || 0) + 1

      // By severity
      entriesBySeverity[log.severity] = (entriesBySeverity[log.severity] || 0) + 1

      // By user
      entriesByUser[log.userId] = (entriesByUser[log.userId] || 0) + 1

      // Financial impact
      if (log.financialImpact?.amount) {
        totalFinancialAmount += log.financialImpact.amount
        financialTransactionCount++
        const type = log.entityType
        financialByType[type] = (financialByType[type] || 0) + log.financialImpact.amount
      }
    })

    return {
      totalEntries: auditLogs.length,
      entriesByAction: entriesByAction as any,
      entriesByEntityType: entriesByEntityType as any,
      entriesBySeverity: entriesBySeverity as any,
      entriesByUser,
      recentActivity: await this.getRecentActivity(10),
      criticalEvents: await this.getCriticalEvents(10),
      financialTransactions: {
        total: financialTransactionCount,
        totalAmount: totalFinancialAmount,
        byType: financialByType
      }
    }
  }

  /**
   * Export audit logs
   */
  async export(format: 'csv' | 'json' | 'excel', filters?: AuditLogFilters): Promise<string> {
    await this.delay()

    const { data } = await this.query(filters, 1, 10000)

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      
      case 'csv':
        return this.convertToCSV(data)
      
      case 'excel':
        // In production, use a library like xlsx
        return this.convertToCSV(data)
      
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  /**
   * Determine severity based on action
   */
  private determineSeverity(action: AuditAction): AuditSeverity {
    const criticalActions: AuditAction[] = [
      'subcontract_deleted',
      'certificate_approved',
      'certificate_paid',
      'expense_approved',
      'expense_paid',
      'payment_recorded',
      'budget_updated',
      'retention_released'
    ]

    const warningActions: AuditAction[] = [
      'subcontract_cancelled',
      'certificate_rejected',
      'expense_rejected',
      'cost_code_deleted'
    ]

    if (criticalActions.includes(action)) {
      return 'critical'
    } else if (warningActions.includes(action)) {
      return 'warning'
    } else {
      return 'info'
    }
  }

  /**
   * Send to external logging service
   */
  private sendToExternalLogger(entry: AuditLogEntry): void {
    // In production, send to external service like:
    // - Datadog
    // - Splunk
    // - CloudWatch
    // - Custom logging service
    
    console.log('[AUDIT LOG]', {
      id: entry.id,
      action: entry.action,
      entity: `${entry.entityType}:${entry.entityId}`,
      user: entry.userName,
      severity: entry.severity,
      timestamp: entry.timestamp
    })
  }

  /**
   * Convert logs to CSV format
   */
  private convertToCSV(logs: AuditLogEntry[]): string {
    const headers = [
      'ID',
      'Timestamp',
      'Action',
      'Entity Type',
      'Entity ID',
      'Entity Name',
      'User',
      'Project',
      'Severity',
      'Description',
      'Financial Impact'
    ]

    const rows = logs.map(log => [
      log.id,
      log.timestamp,
      log.action,
      log.entityType,
      log.entityId,
      log.entityName || '',
      log.userName,
      log.projectName || '',
      log.severity,
      log.description,
      log.financialImpact?.amount || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }

  /**
   * Clean up old logs (retention policy)
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    await this.delay()

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    const cutoffISO = cutoffDate.toISOString()

    const initialCount = auditLogs.length
    
    // Remove logs older than retention period
    const indicesToRemove: number[] = []
    auditLogs.forEach((log, index) => {
      if (log.timestamp < cutoffISO) {
        indicesToRemove.push(index)
      }
    })

    // Remove in reverse order to maintain indices
    indicesToRemove.reverse().forEach(index => {
      auditLogs.splice(index, 1)
    })

    const removedCount = initialCount - auditLogs.length

    console.log(`Cleaned up ${removedCount} audit logs older than ${retentionDays} days`)

    return removedCount
  }
}

// Export singleton instance
export const auditLogService = new AuditLogService()
