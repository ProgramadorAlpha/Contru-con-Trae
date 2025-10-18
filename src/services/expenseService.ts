/**
 * Expense Service
 * 
 * Business logic for managing expenses with mandatory classification
 * by project, cost code, and supplier. Includes OCR integration and
 * approval workflows.
 */

import type {
  Expense,
  CreateExpenseDTO,
  UpdateExpenseDTO,
  OCRExpenseDTO,
  ExpenseClassification,
  ExpenseValidationResult,
  ExpenseValidationError,
  ExpenseValidationWarning,
  ExpenseFilters,
  ExpenseResponse,
  ExpenseStats,
  ApproveExpenseDTO,
  RejectExpenseDTO,
  RecordPaymentDTO,
  BulkApproveExpensesDTO,
  BulkRejectExpensesDTO,
  ExpenseStatus,
  PaymentStatus,
  OCRData
} from '@/types/expenses'
import { costCodeService } from './costCodeService'

// Mock data for development
const mockExpenses: Expense[] = []

class ExpenseService {
  private baseURL = '/api/expenses'
  private mockDelay = 400

  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateId(): string {
    return `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Validate expense data for required classification fields
   */
  private validateExpenseClassification(data: any): ExpenseValidationResult {
    const errors: ExpenseValidationError[] = []
    const warnings: ExpenseValidationWarning[] = []

    // Required fields validation
    if (!data.projectId) {
      errors.push({
        field: 'projectId',
        message: 'Project is required for proper job costing',
        code: 'REQUIRED_FIELD'
      })
    }

    if (!data.costCodeId) {
      errors.push({
        field: 'costCodeId',
        message: 'Cost code is required for expense classification',
        code: 'REQUIRED_FIELD'
      })
    }

    if (!data.supplierId) {
      errors.push({
        field: 'supplierId',
        message: 'Supplier is required for expense tracking',
        code: 'REQUIRED_FIELD'
      })
    }

    if (!data.amount || data.amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Amount must be greater than 0',
        code: 'INVALID_AMOUNT'
      })
    }

    if (!data.description || data.description.trim().length < 5) {
      errors.push({
        field: 'description',
        message: 'Description must be at least 5 characters long',
        code: 'INVALID_DESCRIPTION'
      })
    }

    if (!data.invoiceDate) {
      errors.push({
        field: 'invoiceDate',
        message: 'Invoice date is required',
        code: 'REQUIRED_FIELD'
      })
    }

    // Warnings
    if (data.amount > 10000) {
      warnings.push({
        field: 'amount',
        message: 'Large expense amount detected',
        suggestion: 'Consider if this should be split into multiple expenses or requires special approval'
      })
    }

    if (!data.invoiceNumber) {
      warnings.push({
        field: 'invoiceNumber',
        message: 'Invoice number not provided',
        suggestion: 'Adding invoice number helps with tracking and auditing'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Create expense from OCR/n8n automation
   */
  async createExpenseFromOCR(data: OCRExpenseDTO): Promise<Expense> {
    await this.delay()

    // Validate OCR data
    const validation = this.validateOCRData(data)
    if (!validation.isValid) {
      throw new Error(`OCR data validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    // Try to auto-classify if not provided
    let projectId = data.projectId
    let costCodeId = data.costCodeId
    let supplierId = data.supplierId

    // Auto-suggest cost code based on description
    if (!costCodeId) {
      const suggestions = await costCodeService.suggestCostCodes(data.description, 1)
      if (suggestions.length > 0) {
        costCodeId = suggestions[0].id
      }
    }

    // Set default project if not provided (would come from configuration)
    if (!projectId) {
      projectId = 'default-project-id' // TODO: Get from configuration
    }

    // Set default supplier if not provided (would try to match by name)
    if (!supplierId) {
      supplierId = 'unknown-supplier-id' // TODO: Try to match or create supplier
    }

    // Create expense with auto-created flag
    const newExpense: Expense = {
      id: this.generateId(),
      expenseNumber: `AUTO-${Date.now()}`,
      
      // Classification (required)
      projectId,
      projectName: 'Auto-assigned Project', // TODO: Get actual project name
      costCodeId,
      costCode: await costCodeService.getCostCode(costCodeId) || {
        id: costCodeId,
        code: 'UNKNOWN',
        name: 'Unknown Cost Code',
        description: 'Auto-assigned cost code',
        division: 'Unknown',
        category: 'Unknown',
        type: 'other',
        unit: 'global',
        isActive: true,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      supplierId,
      supplierName: data.supplier,
      
      // Financial
      amount: data.amount,
      currency: 'USD',
      taxAmount: data.taxAmount,
      totalAmount: data.amount + (data.taxAmount || 0),
      
      // Details
      description: data.description,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.date,
      
      // Status
      status: 'pending_approval', // Auto-created expenses need approval
      paymentStatus: 'unpaid',
      
      // Workflow
      submittedBy: 'system-ocr',
      submittedAt: new Date().toISOString(),
      
      // Automation flags
      isAutoCreated: true,
      ocrConfidence: data.ocrData.confidence,
      ocrData: data.ocrData,
      needsReview: data.ocrData.confidence < 0.8, // Low confidence needs review
      
      // Documents
      attachments: [{
        id: `ATT-${Date.now()}`,
        name: data.file.name,
        type: 'invoice',
        url: `/uploads/expenses/${this.generateId()}/${data.file.name}`,
        size: data.file.data.length,
        mimeType: data.file.mimeType,
        uploadDate: new Date().toISOString(),
        uploadedBy: 'system-ocr'
      }],
      
      // Metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockExpenses.push(newExpense)

    // Update cost code budget with actual amount
    await costCodeService.updateBudgetActuals(
      projectId,
      costCodeId,
      newExpense.totalAmount
    )

    return newExpense
  }

  /**
   * Validate OCR data
   */
  validateOCRData(data: OCRExpenseDTO): ExpenseValidationResult {
    const errors: ExpenseValidationError[] = []
    const warnings: ExpenseValidationWarning[] = []

    // Required OCR fields
    if (!data.amount || data.amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Valid amount is required from OCR data',
        code: 'OCR_MISSING_AMOUNT'
      })
    }

    if (!data.date) {
      errors.push({
        field: 'date',
        message: 'Date is required from OCR data',
        code: 'OCR_MISSING_DATE'
      })
    }

    if (!data.supplier || data.supplier.trim().length < 2) {
      errors.push({
        field: 'supplier',
        message: 'Supplier name is required from OCR data',
        code: 'OCR_MISSING_SUPPLIER'
      })
    }

    if (!data.description || data.description.trim().length < 3) {
      errors.push({
        field: 'description',
        message: 'Description is required from OCR data',
        code: 'OCR_MISSING_DESCRIPTION'
      })
    }

    if (!data.file || !data.file.data) {
      errors.push({
        field: 'file',
        message: 'Original file is required',
        code: 'OCR_MISSING_FILE'
      })
    }

    if (!data.ocrData || data.ocrData.confidence < 0.3) {
      errors.push({
        field: 'ocrData',
        message: 'OCR confidence too low or missing OCR data',
        code: 'OCR_LOW_CONFIDENCE'
      })
    }

    // Warnings for low confidence
    if (data.ocrData && data.ocrData.confidence < 0.7) {
      warnings.push({
        field: 'ocrData',
        message: 'Low OCR confidence detected',
        suggestion: 'Manual review recommended'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Create expense manually
   */
  async createExpense(data: CreateExpenseDTO): Promise<Expense> {
    await this.delay()

    // Validate required classification
    const validation = this.validateExpenseClassification(data)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    // Get cost code details
    const costCode = await costCodeService.getCostCode(data.costCodeId)
    if (!costCode) {
      throw new Error('Invalid cost code')
    }

    const newExpense: Expense = {
      id: this.generateId(),
      
      // Classification (required)
      projectId: data.projectId,
      projectName: data.projectName,
      costCodeId: data.costCodeId,
      costCode,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      
      // Financial
      amount: data.amount,
      currency: data.currency || 'USD',
      taxAmount: data.taxAmount,
      totalAmount: data.amount + (data.taxAmount || 0),
      
      // Details
      description: data.description,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      
      // Status
      status: 'draft',
      paymentStatus: 'unpaid',
      
      // Workflow
      submittedBy: 'current-user-id', // TODO: Get from auth context
      submittedAt: new Date().toISOString(),
      
      // Automation flags
      isAutoCreated: false,
      needsReview: false,
      
      // Documents
      attachments: [],
      
      // Metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: data.notes,
      tags: data.tags
    }

    mockExpenses.push(newExpense)
    return newExpense
  }

  /**
   * Get expense by ID
   */
  async getExpense(id: string): Promise<Expense | null> {
    await this.delay()

    const expense = mockExpenses.find(exp => exp.id === id)
    return expense || null
  }

  /**
   * Update expense
   */
  async updateExpense(id: string, data: UpdateExpenseDTO): Promise<Expense> {
    await this.delay()

    const index = mockExpenses.findIndex(exp => exp.id === id)
    if (index === -1) {
      throw new Error('Expense not found')
    }

    if (mockExpenses[index].status === 'paid') {
      throw new Error('Cannot update paid expenses')
    }

    // If classification changed, validate
    if (data.projectId || data.costCodeId || data.supplierId) {
      const validation = this.validateExpenseClassification({ ...mockExpenses[index], ...data })
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
      }
    }

    // Update cost code if changed
    // Update cost code if changed
    let updatedCostCode = mockExpenses[index].costCode
    if (data.costCodeId && data.costCodeId !== mockExpenses[index].costCodeId) {
      const costCode = await costCodeService.getCostCode(data.costCodeId)
      if (!costCode) {
        throw new Error('Invalid cost code')
      }
      updatedCostCode = costCode
    }

    // Recalculate total if amount or tax changed
    let updatedTotalAmount = mockExpenses[index].totalAmount
    if (data.amount !== undefined || data.taxAmount !== undefined) {
      const newAmount = data.amount ?? mockExpenses[index].amount
      const newTaxAmount = data.taxAmount ?? mockExpenses[index].taxAmount ?? 0
      updatedTotalAmount = newAmount + newTaxAmount
    }

    mockExpenses[index] = {
      ...mockExpenses[index],
      ...data,
      costCode: updatedCostCode,
      totalAmount: updatedTotalAmount,
      updatedAt: new Date().toISOString()
    }

    return mockExpenses[index]
  }

  /**
   * Classify or reclassify an expense
   */
  async classifyExpense(id: string, classification: ExpenseClassification): Promise<Expense> {
    await this.delay()

    const index = mockExpenses.findIndex(exp => exp.id === id)
    if (index === -1) {
      throw new Error('Expense not found')
    }

    // Validate classification
    const validation = this.validateExpenseClassification(classification)
    if (!validation.isValid) {
      throw new Error(`Classification validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    // Get cost code details
    const costCode = await costCodeService.getCostCode(classification.costCodeId)
    if (!costCode) {
      throw new Error('Invalid cost code')
    }

    // Update expense with classification
    mockExpenses[index] = {
      ...mockExpenses[index],
      projectId: classification.projectId,
      projectName: classification.projectName,
      costCodeId: classification.costCodeId,
      costCode,
      supplierId: classification.supplierId,
      supplierName: classification.supplierName,
      needsReview: false, // Classification complete
      updatedAt: new Date().toISOString()
    }

    return mockExpenses[index]
  }

  /**
   * Submit expense for approval
   */
  async submitForApproval(id: string): Promise<Expense> {
    await this.delay()

    const index = mockExpenses.findIndex(exp => exp.id === id)
    if (index === -1) {
      throw new Error('Expense not found')
    }

    if (mockExpenses[index].status !== 'draft') {
      throw new Error('Only draft expenses can be submitted for approval')
    }

    // Final validation before submission
    const validation = this.validateExpenseClassification(mockExpenses[index])
    if (!validation.isValid) {
      throw new Error(`Cannot submit incomplete expense: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    mockExpenses[index].status = 'pending_approval'
    mockExpenses[index].updatedAt = new Date().toISOString()

    return mockExpenses[index]
  }

  /**
   * Approve expense
   */
  async approveExpense(data: ApproveExpenseDTO): Promise<Expense> {
    await this.delay()

    const index = mockExpenses.findIndex(exp => exp.id === data.expenseId)
    if (index === -1) {
      throw new Error('Expense not found')
    }

    if (mockExpenses[index].status !== 'pending_approval') {
      throw new Error('Only pending expenses can be approved')
    }

    mockExpenses[index].status = 'approved'
    mockExpenses[index].approvedBy = data.approverId
    mockExpenses[index].approvedAt = new Date().toISOString()
    mockExpenses[index].updatedAt = new Date().toISOString()

    if (data.notes) {
      mockExpenses[index].notes = `${mockExpenses[index].notes || ''}\n\nApproval notes: ${data.notes}`
    }

    return mockExpenses[index]
  }

  /**
   * Reject expense
   */
  async rejectExpense(data: RejectExpenseDTO): Promise<Expense> {
    await this.delay()

    const index = mockExpenses.findIndex(exp => exp.id === data.expenseId)
    if (index === -1) {
      throw new Error('Expense not found')
    }

    if (mockExpenses[index].status !== 'pending_approval') {
      throw new Error('Only pending expenses can be rejected')
    }

    mockExpenses[index].status = 'rejected'
    mockExpenses[index].rejectedBy = data.rejectedBy
    mockExpenses[index].rejectedAt = new Date().toISOString()
    mockExpenses[index].rejectionReason = data.rejectionReason
    mockExpenses[index].updatedAt = new Date().toISOString()

    return mockExpenses[index]
  }

  /**
   * Record payment for expense
   */
  async recordPayment(data: RecordPaymentDTO): Promise<Expense> {
    await this.delay()

    const index = mockExpenses.findIndex(exp => exp.id === data.expenseId)
    if (index === -1) {
      throw new Error('Expense not found')
    }

    if (mockExpenses[index].status !== 'approved') {
      throw new Error('Only approved expenses can be paid')
    }

    const currentPaid = mockExpenses[index].paidAmount || 0
    const newPaidAmount = currentPaid + data.paidAmount

    if (newPaidAmount > mockExpenses[index].totalAmount) {
      throw new Error('Payment amount exceeds total expense amount')
    }

    mockExpenses[index].paidAmount = newPaidAmount
    mockExpenses[index].paidDate = data.paidDate
    mockExpenses[index].paymentMethod = data.paymentMethod
    mockExpenses[index].paymentReference = data.paymentReference
    
    // Update payment status
    if (newPaidAmount >= mockExpenses[index].totalAmount) {
      mockExpenses[index].paymentStatus = 'paid'
      mockExpenses[index].status = 'paid'
    } else {
      mockExpenses[index].paymentStatus = 'partial'
    }

    mockExpenses[index].updatedAt = new Date().toISOString()

    if (data.notes) {
      mockExpenses[index].notes = `${mockExpenses[index].notes || ''}\n\nPayment notes: ${data.notes}`
    }

    return mockExpenses[index]
  }

  /**
   * Get pending approvals
   */
  async getPendingApprovals(): Promise<Expense[]> {
    await this.delay()

    return mockExpenses.filter(exp => exp.status === 'pending_approval')
  }

  /**
   * Get expenses needing review (auto-created with low confidence)
   */
  async getExpensesNeedingReview(): Promise<Expense[]> {
    await this.delay()

    return mockExpenses.filter(exp => exp.needsReview)
  }

  /**
   * Query expenses with filters and pagination
   */
  async queryExpenses(
    filters?: ExpenseFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<ExpenseResponse> {
    await this.delay()

    let filtered = [...mockExpenses]

    // Apply filters
    if (filters) {
      if (filters.projectId) {
        filtered = filtered.filter(exp => exp.projectId === filters.projectId)
      }

      if (filters.costCodeId) {
        filtered = filtered.filter(exp => exp.costCodeId === filters.costCodeId)
      }

      if (filters.supplierId) {
        filtered = filtered.filter(exp => exp.supplierId === filters.supplierId)
      }

      if (filters.status) {
        filtered = filtered.filter(exp => exp.status === filters.status)
      }

      if (filters.paymentStatus) {
        filtered = filtered.filter(exp => exp.paymentStatus === filters.paymentStatus)
      }

      if (filters.isAutoCreated !== undefined) {
        filtered = filtered.filter(exp => exp.isAutoCreated === filters.isAutoCreated)
      }

      if (filters.needsReview !== undefined) {
        filtered = filtered.filter(exp => exp.needsReview === filters.needsReview)
      }

      if (filters.dateFrom) {
        filtered = filtered.filter(exp => exp.invoiceDate >= filters.dateFrom!)
      }

      if (filters.dateTo) {
        filtered = filtered.filter(exp => exp.invoiceDate <= filters.dateTo!)
      }

      if (filters.minAmount !== undefined) {
        filtered = filtered.filter(exp => exp.totalAmount >= filters.minAmount!)
      }

      if (filters.maxAmount !== undefined) {
        filtered = filtered.filter(exp => exp.totalAmount <= filters.maxAmount!)
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(exp =>
          exp.description.toLowerCase().includes(searchLower) ||
          (exp.invoiceNumber && exp.invoiceNumber.toLowerCase().includes(searchLower)) ||
          exp.supplierName.toLowerCase().includes(searchLower)
        )
      }

      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(exp =>
          exp.tags && filters.tags!.some(tag => exp.tags!.includes(tag))
        )
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
   * Get expense statistics
   */
  async getExpenseStats(): Promise<ExpenseStats> {
    await this.delay()

    const total = mockExpenses.length
    const draft = mockExpenses.filter(exp => exp.status === 'draft').length
    const pendingApproval = mockExpenses.filter(exp => exp.status === 'pending_approval').length
    const approved = mockExpenses.filter(exp => exp.status === 'approved').length
    const paid = mockExpenses.filter(exp => exp.status === 'paid').length
    const rejected = mockExpenses.filter(exp => exp.status === 'rejected').length

    const totalAmount = mockExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0)
    const paidAmount = mockExpenses
      .filter(exp => exp.paidAmount)
      .reduce((sum, exp) => sum + (exp.paidAmount || 0), 0)
    const unpaidAmount = totalAmount - paidAmount

    const autoCreated = mockExpenses.filter(exp => exp.isAutoCreated).length
    const needingReview = mockExpenses.filter(exp => exp.needsReview).length
    const averageAmount = total > 0 ? totalAmount / total : 0

    // Group by project
    const byProject: Record<string, number> = {}
    mockExpenses.forEach(exp => {
      byProject[exp.projectId] = (byProject[exp.projectId] || 0) + exp.totalAmount
    })

    // Group by cost code
    const byCostCode: Record<string, number> = {}
    mockExpenses.forEach(exp => {
      byCostCode[exp.costCodeId] = (byCostCode[exp.costCodeId] || 0) + exp.totalAmount
    })

    // Group by supplier
    const bySupplier: Record<string, number> = {}
    mockExpenses.forEach(exp => {
      bySupplier[exp.supplierId] = (bySupplier[exp.supplierId] || 0) + exp.totalAmount
    })

    return {
      total,
      draft,
      pendingApproval,
      approved,
      paid,
      rejected,
      totalAmount,
      paidAmount,
      unpaidAmount,
      autoCreated,
      needingReview,
      averageAmount,
      byProject,
      byCostCode,
      bySupplier
    }
  }

  /**
   * Bulk approve expenses
   */
  async bulkApproveExpenses(data: BulkApproveExpensesDTO): Promise<Expense[]> {
    await this.delay()

    const results: Expense[] = []

    for (const expenseId of data.expenseIds) {
      try {
        const approved = await this.approveExpense({
          expenseId,
          approverId: data.approverId,
          notes: data.notes
        })
        results.push(approved)
      } catch (error) {
        console.error(`Failed to approve expense ${expenseId}:`, error)
      }
    }

    return results
  }

  /**
   * Bulk reject expenses
   */
  async bulkRejectExpenses(data: BulkRejectExpensesDTO): Promise<Expense[]> {
    await this.delay()

    const results: Expense[] = []

    for (const expenseId of data.expenseIds) {
      try {
        const rejected = await this.rejectExpense({
          expenseId,
          rejectedBy: data.rejectedBy,
          rejectionReason: data.rejectionReason
        })
        results.push(rejected)
      } catch (error) {
        console.error(`Failed to reject expense ${expenseId}:`, error)
      }
    }

    return results
  }

  /**
   * Delete expense (only drafts)
   */
  async deleteExpense(id: string): Promise<void> {
    await this.delay()

    const index = mockExpenses.findIndex(exp => exp.id === id)
    if (index === -1) {
      throw new Error('Expense not found')
    }

    if (mockExpenses[index].status !== 'draft') {
      throw new Error('Only draft expenses can be deleted')
    }

    mockExpenses.splice(index, 1)
  }
}

// Export singleton instance
export const expenseService = new ExpenseService()
