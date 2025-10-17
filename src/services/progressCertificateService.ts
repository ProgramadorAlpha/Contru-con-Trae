/**
 * Progress Certificate Service
 * 
 * Business logic for certifying work progress and authorizing payments
 * to subcontractors based on completed work with retention calculations.
 */

import type {
  ProgressCertificate,
  CreateProgressCertificateDTO,
  UpdateProgressCertificateDTO,
  CertificateCalculationInput,
  CertificateCalculation,
  ProgressCertificateFilters,
  ProgressCertificateResponse,
  ProgressCertificateStats,
  ApproveCertificateDTO,
  RejectCertificateDTO,
  CertificateStatus
} from '@/types/progressCertificates'
import { subcontractService } from './subcontractService'

// Mock data for development
const mockCertificates: ProgressCertificate[] = []

class ProgressCertificateService {
  private baseURL = '/api/progress-certificates'
  private mockDelay = 500

  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateId(): string {
    return `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Calculate financial values for a progress certificate
   */
  async calculateNetPayable(input: CertificateCalculationInput): Promise<CertificateCalculation> {
    await this.delay(100)

    const { subcontractTotalAmount, retentionPercentage, amountCertified, previousCertified } = input

    // Calculate retention amount
    const retentionAmount = amountCertified * (retentionPercentage / 100)

    // Calculate net payable (amount minus retention)
    const netPayable = amountCertified - retentionAmount

    // Calculate cumulative certified
    const cumulativeCertified = previousCertified + amountCertified

    // Calculate remaining balance
    const remainingBalance = subcontractTotalAmount - cumulativeCertified

    // Calculate percentage complete
    const percentageComplete = (cumulativeCertified / subcontractTotalAmount) * 100

    return {
      amountCertified,
      retentionAmount,
      netPayable,
      cumulativeCertified,
      remainingBalance,
      percentageComplete
    }
  }

  /**
   * Create a new progress certificate
   */
  async createCertificate(data: CreateProgressCertificateDTO): Promise<ProgressCertificate> {
    await this.delay()

    // Get subcontract to validate and calculate
    const subcontract = await subcontractService.getSubcontract(data.subcontractId)
    if (!subcontract) {
      throw new Error('Subcontract not found')
    }

    // Validate amount doesn't exceed remaining balance
    if (data.amountCertified > subcontract.remainingBalance) {
      throw new Error(
        `Certified amount (${data.amountCertified}) exceeds remaining balance (${subcontract.remainingBalance})`
      )
    }

    // Calculate financial values
    const calculation = await this.calculateNetPayable({
      subcontractTotalAmount: subcontract.totalAmount,
      retentionPercentage: subcontract.retentionPercentage,
      amountCertified: data.amountCertified,
      previousCertified: subcontract.totalCertified
    })

    // Create certificate
    const newCertificate: ProgressCertificate = {
      id: this.generateId(),
      certificateNumber: data.certificateNumber,
      subcontractId: data.subcontractId,
      projectId: data.projectId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      percentageComplete: data.percentageComplete,
      amountCertified: data.amountCertified,
      retentionAmount: calculation.retentionAmount,
      netPayable: calculation.netPayable,
      previousCertified: subcontract.totalCertified,
      cumulativeCertified: calculation.cumulativeCertified,
      status: 'draft',
      submittedBy: 'current-user-id', // TODO: Get from auth context
      submittedAt: new Date().toISOString(),
      photos: data.photos || [],
      documents: data.documents || [],
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockCertificates.push(newCertificate)
    return newCertificate
  }

  /**
   * Get certificate by ID
   */
  async getCertificate(id: string): Promise<ProgressCertificate | null> {
    await this.delay()

    const certificate = mockCertificates.find(cert => cert.id === id)
    return certificate || null
  }

  /**
   * Update a certificate (only if in draft status)
   */
  async updateCertificate(
    id: string,
    data: UpdateProgressCertificateDTO
  ): Promise<ProgressCertificate> {
    await this.delay()

    const index = mockCertificates.findIndex(cert => cert.id === id)
    if (index === -1) {
      throw new Error('Certificate not found')
    }

    if (mockCertificates[index].status !== 'draft') {
      throw new Error('Only draft certificates can be updated')
    }

    // If amount changed, recalculate financials
    if (data.amountCertified !== undefined) {
      const subcontract = await subcontractService.getSubcontract(
        mockCertificates[index].subcontractId
      )
      if (!subcontract) {
        throw new Error('Subcontract not found')
      }

      const calculation = await this.calculateNetPayable({
        subcontractTotalAmount: subcontract.totalAmount,
        retentionPercentage: subcontract.retentionPercentage,
        amountCertified: data.amountCertified,
        previousCertified: subcontract.totalCertified
      })

      mockCertificates[index] = {
        ...mockCertificates[index],
        ...data,
        retentionAmount: calculation.retentionAmount,
        netPayable: calculation.netPayable,
        cumulativeCertified: calculation.cumulativeCertified,
        updatedAt: new Date().toISOString()
      }
    } else {
      mockCertificates[index] = {
        ...mockCertificates[index],
        ...data,
        updatedAt: new Date().toISOString()
      }
    }

    return mockCertificates[index]
  }

  /**
   * Submit certificate for approval
   */
  async submitForApproval(id: string): Promise<ProgressCertificate> {
    await this.delay()

    const index = mockCertificates.findIndex(cert => cert.id === id)
    if (index === -1) {
      throw new Error('Certificate not found')
    }

    if (mockCertificates[index].status !== 'draft') {
      throw new Error('Only draft certificates can be submitted')
    }

    mockCertificates[index].status = 'pending_approval'
    mockCertificates[index].updatedAt = new Date().toISOString()

    return mockCertificates[index]
  }

  /**
   * Approve a certificate
   */
  async approveCertificate(data: ApproveCertificateDTO): Promise<ProgressCertificate> {
    await this.delay()

    const index = mockCertificates.findIndex(cert => cert.id === data.certificateId)
    if (index === -1) {
      throw new Error('Certificate not found')
    }

    if (mockCertificates[index].status !== 'pending_approval') {
      throw new Error('Only pending certificates can be approved')
    }

    // Update certificate status
    mockCertificates[index].status = 'approved'
    mockCertificates[index].approvedBy = data.approverId
    mockCertificates[index].approvedAt = new Date().toISOString()
    mockCertificates[index].updatedAt = new Date().toISOString()

    // Update subcontract payment schedule
    // This would typically find the matching payment schedule item and update it
    // For now, we'll just update the subcontract's financial totals
    await subcontractService.updatePaymentScheduleItem(
      mockCertificates[index].subcontractId,
      'payment-item-id', // TODO: Match with actual payment schedule item
      'certified',
      new Date().toISOString()
    )

    return mockCertificates[index]
  }

  /**
   * Reject a certificate
   */
  async rejectCertificate(data: RejectCertificateDTO): Promise<ProgressCertificate> {
    await this.delay()

    const index = mockCertificates.findIndex(cert => cert.id === data.certificateId)
    if (index === -1) {
      throw new Error('Certificate not found')
    }

    if (mockCertificates[index].status !== 'pending_approval') {
      throw new Error('Only pending certificates can be rejected')
    }

    mockCertificates[index].status = 'rejected'
    mockCertificates[index].rejectedBy = data.rejectedBy
    mockCertificates[index].rejectedAt = new Date().toISOString()
    mockCertificates[index].rejectionReason = data.rejectionReason
    mockCertificates[index].updatedAt = new Date().toISOString()

    return mockCertificates[index]
  }

  /**
   * Mark certificate as paid
   */
  async markAsPaid(certificateId: string, paymentId: string): Promise<ProgressCertificate> {
    await this.delay()

    const index = mockCertificates.findIndex(cert => cert.id === certificateId)
    if (index === -1) {
      throw new Error('Certificate not found')
    }

    if (mockCertificates[index].status !== 'approved') {
      throw new Error('Only approved certificates can be marked as paid')
    }

    mockCertificates[index].status = 'paid'
    mockCertificates[index].paymentId = paymentId
    mockCertificates[index].paidAt = new Date().toISOString()
    mockCertificates[index].updatedAt = new Date().toISOString()

    // Update subcontract payment schedule to paid
    await subcontractService.updatePaymentScheduleItem(
      mockCertificates[index].subcontractId,
      'payment-item-id', // TODO: Match with actual payment schedule item
      'paid',
      new Date().toISOString()
    )

    return mockCertificates[index]
  }

  /**
   * Get certificates by subcontract
   */
  async getCertificatesBySubcontract(subcontractId: string): Promise<ProgressCertificate[]> {
    await this.delay()

    return mockCertificates.filter(cert => cert.subcontractId === subcontractId)
  }

  /**
   * Get certificates by project
   */
  async getCertificatesByProject(projectId: string): Promise<ProgressCertificate[]> {
    await this.delay()

    return mockCertificates.filter(cert => cert.projectId === projectId)
  }

  /**
   * Get pending approvals
   */
  async getPendingApprovals(): Promise<ProgressCertificate[]> {
    await this.delay()

    return mockCertificates.filter(cert => cert.status === 'pending_approval')
  }

  /**
   * Query certificates with filters and pagination
   */
  async queryCertificates(
    filters?: ProgressCertificateFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<ProgressCertificateResponse> {
    await this.delay()

    let filtered = [...mockCertificates]

    // Apply filters
    if (filters) {
      if (filters.subcontractId) {
        filtered = filtered.filter(cert => cert.subcontractId === filters.subcontractId)
      }

      if (filters.projectId) {
        filtered = filtered.filter(cert => cert.projectId === filters.projectId)
      }

      if (filters.status) {
        filtered = filtered.filter(cert => cert.status === filters.status)
      }

      if (filters.submittedBy) {
        filtered = filtered.filter(cert => cert.submittedBy === filters.submittedBy)
      }

      if (filters.periodStartFrom) {
        filtered = filtered.filter(cert => cert.periodStart >= filters.periodStartFrom!)
      }

      if (filters.periodStartTo) {
        filtered = filtered.filter(cert => cert.periodStart <= filters.periodStartTo!)
      }

      if (filters.minAmount !== undefined) {
        filtered = filtered.filter(cert => cert.amountCertified >= filters.minAmount!)
      }

      if (filters.maxAmount !== undefined) {
        filtered = filtered.filter(cert => cert.amountCertified <= filters.maxAmount!)
      }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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
   * Get statistics for progress certificates
   */
  async getCertificateStats(): Promise<ProgressCertificateStats> {
    await this.delay()

    const total = mockCertificates.length
    const pending = mockCertificates.filter(cert => cert.status === 'pending_approval').length
    const approved = mockCertificates.filter(cert => cert.status === 'approved').length
    const paid = mockCertificates.filter(cert => cert.status === 'paid').length
    const rejected = mockCertificates.filter(cert => cert.status === 'rejected').length

    const totalCertified = mockCertificates.reduce((sum, cert) => sum + cert.amountCertified, 0)
    const totalPaid = mockCertificates
      .filter(cert => cert.status === 'paid')
      .reduce((sum, cert) => sum + cert.netPayable, 0)
    const totalRetained = mockCertificates.reduce((sum, cert) => sum + cert.retentionAmount, 0)

    // Calculate average approval time
    const approvedCerts = mockCertificates.filter(
      cert => cert.approvedAt && cert.submittedAt
    )
    const averageApprovalTime = approvedCerts.length > 0
      ? approvedCerts.reduce((sum, cert) => {
          const submitted = new Date(cert.submittedAt).getTime()
          const approved = new Date(cert.approvedAt!).getTime()
          return sum + (approved - submitted) / (1000 * 60 * 60) // Convert to hours
        }, 0) / approvedCerts.length
      : 0

    return {
      total,
      pending,
      approved,
      paid,
      rejected,
      totalCertified,
      totalPaid,
      totalRetained,
      averageApprovalTime
    }
  }

  /**
   * Create payment from approved certificate
   * This would integrate with the payment system
   */
  async createPaymentFromCertificate(certificateId: string): Promise<any> {
    await this.delay()

    const certificate = await this.getCertificate(certificateId)
    if (!certificate) {
      throw new Error('Certificate not found')
    }

    if (certificate.status !== 'approved') {
      throw new Error('Only approved certificates can generate payments')
    }

    // TODO: Integrate with payment service
    const payment = {
      id: `PAY-${Date.now()}`,
      certificateId: certificate.id,
      subcontractId: certificate.subcontractId,
      amount: certificate.netPayable,
      retentionAmount: certificate.retentionAmount,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    // Mark certificate as paid
    await this.markAsPaid(certificateId, payment.id)

    return payment
  }

  /**
   * Delete a certificate (only if in draft status)
   */
  async deleteCertificate(id: string): Promise<void> {
    await this.delay()

    const index = mockCertificates.findIndex(cert => cert.id === id)
    if (index === -1) {
      throw new Error('Certificate not found')
    }

    if (mockCertificates[index].status !== 'draft') {
      throw new Error('Only draft certificates can be deleted')
    }

    mockCertificates.splice(index, 1)
  }
}

// Export singleton instance
export const progressCertificateService = new ProgressCertificateService()
