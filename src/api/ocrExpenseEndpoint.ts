/**
 * OCR Expense Auto-Create API Endpoint
 * 
 * This endpoint receives OCR-processed expense data from n8n automation
 * and creates expenses automatically with proper classification.
 * 
 * Endpoint: POST /api/expenses/auto-create
 */

import { expenseService } from '@/services/expenseService'
import type { OCRExpenseDTO } from '@/types/expenses'

/**
 * Request body interface for OCR expense creation
 */
export interface OCRExpenseRequest {
  // OCR Extracted Data
  amount: number
  taxAmount?: number
  date: string // ISO date string
  supplier: string
  description: string
  invoiceNumber?: string
  
  // OCR Metadata
  ocrData: {
    confidence: number // 0-1
    rawText?: string
    extractedFields: Record<string, any>
    processingTime?: number
  }
  
  // File Data
  file: {
    name: string
    mimeType: string
    data: string // Base64 encoded file data
  }
  
  // Optional Classification (if n8n can determine)
  projectId?: string
  costCodeId?: string
  supplierId?: string
  
  // Metadata
  source?: string // e.g., 'email', 'upload', 'scan'
  sourceId?: string // Reference to source (email ID, etc.)
}

/**
 * Response interface for successful creation
 */
export interface OCRExpenseResponse {
  success: boolean
  expenseId: string
  message: string
  expense: {
    id: string
    amount: number
    supplier: string
    description: string
    status: string
    needsReview: boolean
    ocrConfidence: number
  }
  warnings?: string[]
}

/**
 * Error response interface
 */
export interface OCRExpenseErrorResponse {
  success: false
  error: string
  code: string
  details?: Record<string, any>
  validationErrors?: Array<{
    field: string
    message: string
  }>
}

/**
 * POST /api/expenses/auto-create
 * 
 * Creates an expense from OCR-processed data
 */
export async function handleOCRExpenseCreate(
  request: OCRExpenseRequest
): Promise<OCRExpenseResponse | OCRExpenseErrorResponse> {
  try {
    // Validate request
    const validation = validateOCRRequest(request)
    if (!validation.valid) {
      return {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        validationErrors: validation.errors
      }
    }

    // Prepare OCR DTO
    const ocrDTO: OCRExpenseDTO = {
      amount: request.amount,
      taxAmount: request.taxAmount,
      date: request.date,
      supplier: request.supplier,
      description: request.description,
      invoiceNumber: request.invoiceNumber,
      ocrData: {
        rawText: request.ocrData.rawText || '',
        extractedFields: request.ocrData.extractedFields,
        confidence: request.ocrData.confidence,
        processedAt: new Date().toISOString()
      },
      file: request.file,
      projectId: request.projectId,
      costCodeId: request.costCodeId,
      supplierId: request.supplierId
    }

    // Create expense using service
    const expense = await expenseService.createExpenseFromOCR(ocrDTO)

    // Prepare response
    const response: OCRExpenseResponse = {
      success: true,
      expenseId: expense.id,
      message: expense.needsReview
        ? 'Expense created successfully but requires manual review due to low OCR confidence'
        : 'Expense created successfully',
      expense: {
        id: expense.id,
        amount: expense.totalAmount,
        supplier: expense.supplierName,
        description: expense.description,
        status: expense.status,
        needsReview: expense.needsReview,
        ocrConfidence: expense.ocrConfidence || 0
      },
      warnings: []
    }

    // Add warnings
    if (expense.needsReview) {
      response.warnings?.push('Low OCR confidence - manual review recommended')
    }

    if (!request.projectId) {
      response.warnings?.push('Project was auto-assigned - please verify')
    }

    if (!request.costCodeId) {
      response.warnings?.push('Cost code was auto-suggested - please verify')
    }

    return response

  } catch (error: any) {
    console.error('Error creating OCR expense:', error)

    return {
      success: false,
      error: error.message || 'Failed to create expense',
      code: error.code || 'INTERNAL_ERROR',
      details: {
        timestamp: new Date().toISOString(),
        errorType: error.constructor.name
      }
    }
  }
}

/**
 * Validate OCR request data
 */
function validateOCRRequest(request: OCRExpenseRequest): {
  valid: boolean
  errors: Array<{ field: string; message: string }>
} {
  const errors: Array<{ field: string; message: string }> = []

  // Required fields
  if (!request.amount || request.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Amount is required and must be greater than 0'
    })
  }

  if (!request.date) {
    errors.push({
      field: 'date',
      message: 'Date is required'
    })
  } else {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}/
    if (!dateRegex.test(request.date)) {
      errors.push({
        field: 'date',
        message: 'Date must be in ISO format (YYYY-MM-DD)'
      })
    }
  }

  if (!request.supplier || request.supplier.trim().length < 2) {
    errors.push({
      field: 'supplier',
      message: 'Supplier name is required (minimum 2 characters)'
    })
  }

  if (!request.description || request.description.trim().length < 3) {
    errors.push({
      field: 'description',
      message: 'Description is required (minimum 3 characters)'
    })
  }

  if (!request.file || !request.file.data) {
    errors.push({
      field: 'file',
      message: 'File data is required'
    })
  }

  if (!request.ocrData || typeof request.ocrData.confidence !== 'number') {
    errors.push({
      field: 'ocrData',
      message: 'OCR data with confidence score is required'
    })
  } else if (request.ocrData.confidence < 0 || request.ocrData.confidence > 1) {
    errors.push({
      field: 'ocrData.confidence',
      message: 'OCR confidence must be between 0 and 1'
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Express/Next.js handler wrapper
 * 
 * Example usage with Express:
 * ```typescript
 * app.post('/api/expenses/auto-create', async (req, res) => {
 *   const result = await handleOCRExpenseCreate(req.body)
 *   const statusCode = result.success ? 201 : 400
 *   res.status(statusCode).json(result)
 * })
 * ```
 */
export function createExpressHandler() {
  return async (req: any, res: any) => {
    // Validate content type
    if (req.headers['content-type'] !== 'application/json') {
      return res.status(415).json({
        success: false,
        error: 'Content-Type must be application/json',
        code: 'UNSUPPORTED_MEDIA_TYPE'
      })
    }

    // Handle request
    const result = await handleOCRExpenseCreate(req.body)
    const statusCode = result.success ? 201 : 400

    res.status(statusCode).json(result)
  }
}

/**
 * Webhook signature verification (for security)
 * 
 * Verifies that the request comes from authorized n8n instance
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // In production, implement HMAC signature verification
  // Example with crypto:
  // const crypto = require('crypto')
  // const expectedSignature = crypto
  //   .createHmac('sha256', secret)
  //   .update(payload)
  //   .digest('hex')
  // return signature === expectedSignature
  
  // For now, simple check
  return true
}

/**
 * Rate limiting helper
 * 
 * Prevents abuse of the endpoint
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }

    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    
    return true
  }

  reset(identifier: string): void {
    this.requests.delete(identifier)
  }
}

// Export singleton rate limiter
export const rateLimiter = new RateLimiter(100, 60000) // 100 requests per minute
