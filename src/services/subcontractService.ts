/**
 * Subcontract Service
 * 
 * Business logic for managing subcontractor contracts including
 * CRUD operations, financial calculations, and document management.
 */

import { auditLogService } from './auditLogService'
import type {
  Subcontract,
  CreateSubcontractDTO,
  UpdateSubcontractDTO,
  SubcontractFilters,
  SubcontractResponse,
  SubcontractStats,
  SubcontractDocument,
  PaymentScheduleItem,
  SubcontractStatus
} from '@/types/subcontracts'

// Mock data for development - will be replaced with Firebase/API calls
const mockSubcontracts: Subcontract[] = []

class SubcontractService {
  private baseURL = '/api/subcontracts'
  private mockDelay = 500 // Simulate API delay

  /**
   * Simulate API delay for development
   */
  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `SC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Calculate financial tracking values for a subcontract
   */
  private calculateFinancials(subcontract: Subcontract): void {
    // Calculate total certified from payment schedule
    subcontract.totalCertified = subcontract.paymentSchedule
      .filter(item => item.status === 'certified' || item.status === 'paid')
      .reduce((sum: number, item) => sum + item.amount, 0)

    // Calculate total paid
    subcontract.totalPaid = subcontract.paymentSchedule
      .filter(item => item.status === 'paid')
      .reduce((sum: number, item) => sum + item.amount, 0)

    // Calculate total retained (holdback)
    subcontract.totalRetained = subcontract.totalCertified * (subcontract.retentionPercentage / 100)

    // Calculate remaining balance
    subcontract.remainingBalance = subcontract.totalAmount - subcontract.totalCertified
  }

  /**
   * Validate subcontract data
   */
  private validateSubcontract(data: CreateSubcontractDTO | UpdateSubcontractDTO): void {
    if ('totalAmount' in data && data.totalAmount !== undefined && data.totalAmount <= 0) {
      throw new Error('Total amount must be greater than 0')
    }

    if ('retentionPercentage' in data && data.retentionPercentage !== undefined) {
      if (data.retentionPercentage < 0 || data.retentionPercentage > 100) {
        throw new Error('Retention percentage must be between 0 and 100')
      }
    }

    if ('startDate' in data && 'endDate' in data && data.startDate && data.endDate) {
      if (new Date(data.startDate) > new Date(data.endDate)) {
        throw new Error('Start date must be before end date')
      }
    }

    if ('paymentSchedule' in data && data.paymentSchedule && Array.isArray(data.paymentSchedule)) {
      const schedule = data.paymentSchedule as Array<{ percentage: number }>
      const totalPercentage = schedule.reduce((sum, item) => sum + item.percentage, 0)
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new Error('Payment schedule percentages must sum to 100%')
      }
    }
  }

  /**
   * Create a new subcontract
   */
  async createSubcontract(data: CreateSubcontractDTO): Promise<Subcontract> {
    await this.delay()

    // Validate input
    this.validateSubcontract(data)

    // Generate payment schedule with IDs and status
    const paymentSchedule: PaymentScheduleItem[] = data.paymentSchedule.map((item, index) => ({
      id: `PS-${Date.now()}-${index}`,
      ...item,
      amount: (data.totalAmount * item.percentage) / 100,
      status: 'pending' as const
    }))

    // Create new subcontract
    const newSubcontract: Subcontract = {
      id: this.generateId(),
      contractNumber: data.contractNumber,
      projectId: data.projectId,
      projectName: data.projectName,
      subcontractorId: data.subcontractorId,
      subcontractorName: data.subcontractorName,
      description: data.description,
      scope: data.scope,
      totalAmount: data.totalAmount,
      currency: data.currency || 'USD',
      retentionPercentage: data.retentionPercentage,
      paymentSchedule,
      advancePaymentPercentage: data.advancePaymentPercentage,
      status: 'draft',
      startDate: data.startDate,
      endDate: data.endDate,
      costCodes: data.costCodes,
      documents: [],
      totalCertified: 0,
      totalPaid: 0,
      totalRetained: 0,
      remainingBalance: data.totalAmount,
      createdBy: 'current-user-id', // TODO: Get from auth context
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: data.notes,
      terms: data.terms,
      warrantyPeriod: data.warrantyPeriod
    }

    mockSubcontracts.push(newSubcontract)
    return newSubcontract
  }

  /**
   * Get subcontract by ID
   */
  async getSubcontract(id: string): Promise<Subcontract | null> {
    await this.delay()

    const subcontract = mockSubcontracts.find(sc => sc.id === id)
    return subcontract || null
  }

  /**
   * Update an existing subcontract
   */
  async updateSubcontract(id: string, data: UpdateSubcontractDTO): Promise<Subcontract> {
    await this.delay()

    const index = mockSubcontracts.findIndex(sc => sc.id === id)
    if (index === -1) {
      throw new Error('Subcontract not found')
    }

    // Validate update data
    this.validateSubcontract(data)

    // Update subcontract
    const updatedSubcontract: Subcontract = {
      ...mockSubcontracts[index],
      ...data,
      updatedAt: new Date().toISOString()
    }

    // Recalculate financials if payment schedule or amounts changed
    if (data.paymentSchedule || data.totalAmount !== undefined) {
      this.calculateFinancials(updatedSubcontract)
    }

    mockSubcontracts[index] = updatedSubcontract
    return updatedSubcontract
  }

  /**
   * Delete a subcontract
   */
  async deleteSubcontract(id: string): Promise<void> {
    await this.delay()

    const index = mockSubcontracts.findIndex(sc => sc.id === id)
    if (index === -1) {
      throw new Error('Subcontract not found')
    }

    // Check if subcontract can be deleted (no payments made)
    if (mockSubcontracts[index].totalPaid > 0) {
      throw new Error('Cannot delete subcontract with payments made')
    }

    mockSubcontracts.splice(index, 1)
  }

  /**
   * Get subcontracts by project
   */
  async getSubcontractsByProject(projectId: string): Promise<Subcontract[]> {
    await this.delay()

    return mockSubcontracts.filter(sc => sc.projectId === projectId)
  }

  /**
   * Get subcontracts by subcontractor
   */
  async getSubcontractsBySubcontractor(subcontractorId: string): Promise<Subcontract[]> {
    await this.delay()

    return mockSubcontracts.filter(sc => sc.subcontractorId === subcontractorId)
  }

  /**
   * Get active subcontracts
   */
  async getActiveSubcontracts(): Promise<Subcontract[]> {
    await this.delay()

    return mockSubcontracts.filter(sc => sc.status === 'active')
  }

  /**
   * Query subcontracts with filters and pagination
   */
  async querySubcontracts(
    filters?: SubcontractFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<SubcontractResponse> {
    await this.delay()

    let filtered = [...mockSubcontracts]

    // Apply filters
    if (filters) {
      if (filters.projectId) {
        filtered = filtered.filter(sc => sc.projectId === filters.projectId)
      }

      if (filters.subcontractorId) {
        filtered = filtered.filter(sc => sc.subcontractorId === filters.subcontractorId)
      }

      if (filters.status) {
        filtered = filtered.filter(sc => sc.status === filters.status)
      }

      if (filters.startDateFrom) {
        filtered = filtered.filter(sc => sc.startDate >= filters.startDateFrom!)
      }

      if (filters.startDateTo) {
        filtered = filtered.filter(sc => sc.startDate <= filters.startDateTo!)
      }

      if (filters.minAmount !== undefined) {
        filtered = filtered.filter(sc => sc.totalAmount >= filters.minAmount!)
      }

      if (filters.maxAmount !== undefined) {
        filtered = filtered.filter(sc => sc.totalAmount <= filters.maxAmount!)
      }

      if (filters.costCodeId) {
        filtered = filtered.filter(sc => sc.costCodes.includes(filters.costCodeId!))
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(sc =>
          sc.contractNumber.toLowerCase().includes(searchLower) ||
          sc.description.toLowerCase().includes(searchLower) ||
          sc.scope.toLowerCase().includes(searchLower) ||
          sc.subcontractorName.toLowerCase().includes(searchLower)
        )
      }
    }

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
   * Calculate total committed cost for a project
   */
  async calculateCommittedCost(projectId: string): Promise<number> {
    await this.delay()

    const projectSubcontracts = mockSubcontracts.filter(
      sc => sc.projectId === projectId && sc.status === 'active'
    )

    return projectSubcontracts.reduce((sum, sc) => sum + sc.totalAmount, 0)
  }

  /**
   * Calculate retention balance for a subcontract
   */
  async calculateRetentionBalance(subcontractId: string): Promise<number> {
    await this.delay()

    const subcontract = mockSubcontracts.find(sc => sc.id === subcontractId)
    if (!subcontract) {
      throw new Error('Subcontract not found')
    }

    return subcontract.totalRetained
  }

  /**
   * Approve a subcontract (change status from draft to active)
   */
  async approveSubcontract(id: string, approverId: string): Promise<Subcontract> {
    await this.delay()

    const index = mockSubcontracts.findIndex(sc => sc.id === id)
    if (index === -1) {
      throw new Error('Subcontract not found')
    }

    if (mockSubcontracts[index].status !== 'draft') {
      throw new Error('Only draft subcontracts can be approved')
    }

    const previousStatus = mockSubcontracts[index].status

    mockSubcontracts[index].status = 'active'
    mockSubcontracts[index].approvedBy = approverId
    mockSubcontracts[index].approvedAt = new Date().toISOString()
    mockSubcontracts[index].updatedAt = new Date().toISOString()

    // Audit log
    await auditLogService.logSubcontractAction(
      'subcontract_approved',
      mockSubcontracts[index].id,
      mockSubcontracts[index].contractNumber,
      approverId,
      'User Name', // TODO: Get from auth context
      [
        {
          field: 'status',
          fieldLabel: 'Estado',
          oldValue: previousStatus,
          newValue: 'active',
          changeType: 'updated'
        }
      ],
      {
        amount: mockSubcontracts[index].totalAmount,
        currency: mockSubcontracts[index].currency,
        description: `Subcontract approved: ${mockSubcontracts[index].contractNumber}`
      }
    )

    return mockSubcontracts[index]
  }

  /**
   * Complete a subcontract
   */
  async completeSubcontract(id: string, completionDate: string): Promise<Subcontract> {
    await this.delay()

    const index = mockSubcontracts.findIndex(sc => sc.id === id)
    if (index === -1) {
      throw new Error('Subcontract not found')
    }

    if (mockSubcontracts[index].status !== 'active') {
      throw new Error('Only active subcontracts can be completed')
    }

    mockSubcontracts[index].status = 'completed'
    mockSubcontracts[index].completionDate = completionDate
    mockSubcontracts[index].updatedAt = new Date().toISOString()

    return mockSubcontracts[index]
  }

  /**
   * Cancel a subcontract
   */
  async cancelSubcontract(id: string, reason: string): Promise<Subcontract> {
    await this.delay()

    const index = mockSubcontracts.findIndex(sc => sc.id === id)
    if (index === -1) {
      throw new Error('Subcontract not found')
    }

    if (mockSubcontracts[index].totalPaid > 0) {
      throw new Error('Cannot cancel subcontract with payments made')
    }

    mockSubcontracts[index].status = 'cancelled'
    mockSubcontracts[index].notes = `${mockSubcontracts[index].notes || ''}\n\nCancellation reason: ${reason}`
    mockSubcontracts[index].updatedAt = new Date().toISOString()

    return mockSubcontracts[index]
  }

  /**
   * Upload a document to a subcontract
   */
  async uploadDocument(
    subcontractId: string,
    file: File,
    documentType: SubcontractDocument['type']
  ): Promise<SubcontractDocument> {
    await this.delay()

    const index = mockSubcontracts.findIndex(sc => sc.id === subcontractId)
    if (index === -1) {
      throw new Error('Subcontract not found')
    }

    // In production, this would upload to Firebase Storage or similar
    const newDocument: SubcontractDocument = {
      id: `DOC-${Date.now()}`,
      name: file.name,
      type: documentType,
      url: `/documents/subcontracts/${subcontractId}/${file.name}`,
      uploadDate: new Date().toISOString(),
      size: file.size,
      mimeType: file.type,
      uploadedBy: 'current-user-id' // TODO: Get from auth context
    }

    mockSubcontracts[index].documents.push(newDocument)
    mockSubcontracts[index].updatedAt = new Date().toISOString()

    return newDocument
  }

  /**
   * Delete a document from a subcontract
   */
  async deleteDocument(subcontractId: string, documentId: string): Promise<void> {
    await this.delay()

    const index = mockSubcontracts.findIndex(sc => sc.id === subcontractId)
    if (index === -1) {
      throw new Error('Subcontract not found')
    }

    const docIndex = mockSubcontracts[index].documents.findIndex(doc => doc.id === documentId)
    if (docIndex === -1) {
      throw new Error('Document not found')
    }

    // In production, this would also delete from Firebase Storage
    mockSubcontracts[index].documents.splice(docIndex, 1)
    mockSubcontracts[index].updatedAt = new Date().toISOString()
  }

  /**
   * Get statistics for subcontracts
   */
  async getSubcontractStats(): Promise<SubcontractStats> {
    await this.delay()

    const total = mockSubcontracts.length
    const active = mockSubcontracts.filter(sc => sc.status === 'active').length
    const completed = mockSubcontracts.filter(sc => sc.status === 'completed').length
    const cancelled = mockSubcontracts.filter(sc => sc.status === 'cancelled').length

    const totalValue = mockSubcontracts.reduce((sum, sc) => sum + sc.totalAmount, 0)
    const totalCertified = mockSubcontracts.reduce((sum, sc) => sum + sc.totalCertified, 0)
    const totalPaid = mockSubcontracts.reduce((sum, sc) => sum + sc.totalPaid, 0)
    const totalRetained = mockSubcontracts.reduce((sum, sc) => sum + sc.totalRetained, 0)

    const averageRetentionPercentage = total > 0
      ? mockSubcontracts.reduce((sum, sc) => sum + sc.retentionPercentage, 0) / total
      : 0

    return {
      total,
      active,
      completed,
      cancelled,
      totalValue,
      totalCertified,
      totalPaid,
      totalRetained,
      averageRetentionPercentage
    }
  }

  /**
   * Update payment schedule item status
   * Called when a progress certificate is approved
   */
  async updatePaymentScheduleItem(
    subcontractId: string,
    paymentItemId: string,
    status: PaymentScheduleItem['status'],
    date?: string
  ): Promise<Subcontract> {
    await this.delay()

    const index = mockSubcontracts.findIndex(sc => sc.id === subcontractId)
    if (index === -1) {
      throw new Error('Subcontract not found')
    }

    const itemIndex = mockSubcontracts[index].paymentSchedule.findIndex(
      item => item.id === paymentItemId
    )
    if (itemIndex === -1) {
      throw new Error('Payment schedule item not found')
    }

    mockSubcontracts[index].paymentSchedule[itemIndex].status = status

    if (status === 'certified' && date) {
      mockSubcontracts[index].paymentSchedule[itemIndex].certifiedDate = date
    } else if (status === 'paid' && date) {
      mockSubcontracts[index].paymentSchedule[itemIndex].paidDate = date
    }

    // Recalculate financials
    this.calculateFinancials(mockSubcontracts[index])
    mockSubcontracts[index].updatedAt = new Date().toISOString()

    return mockSubcontracts[index]
  }
}

// Export singleton instance
export const subcontractService = new SubcontractService()
