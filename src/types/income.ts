/**
 * Income Management Types
 * 
 * Defines the data structures for managing income/revenue
 * associated with projects.
 */

/**
 * Status of an income entry
 */
export type IncomeStatus = 'pending' | 'confirmed' | 'cancelled'

/**
 * Payment method for income
 */
export type PaymentMethod = 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'other'

/**
 * Income
 * 
 * Represents income/revenue received for a project
 */
export interface Income {
  id: string
  projectId: string
  projectName: string
  amount: number
  currency: string
  date: string // ISO date string
  description: string
  paymentMethod?: PaymentMethod
  reference?: string
  invoiceNumber?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  status: IncomeStatus
}

/**
 * DTO for creating a new income entry
 */
export interface CreateIncomeDTO {
  projectId: string
  amount: number
  date: string
  description: string
  paymentMethod?: PaymentMethod
  reference?: string
  invoiceNumber?: string
}

/**
 * DTO for updating an existing income entry
 */
export interface UpdateIncomeDTO {
  projectId?: string
  amount?: number
  date?: string
  description?: string
  paymentMethod?: PaymentMethod
  reference?: string
  invoiceNumber?: string
  status?: IncomeStatus
}

/**
 * Income statistics
 */
export interface IncomeStats {
  total: number
  confirmed: number
  pending: number
  cancelled: number
  totalAmount: number
  confirmedAmount: number
  pendingAmount: number
  averageAmount: number
  byProject: Record<string, number>
  byMonth: Record<string, number>
}
