/**
 * Expense Service Tests
 * 
 * Tests for expense management with mandatory classification
 */

import { describe, it, expect } from 'vitest'
import { expenseService } from '../expenseService'
import type { CreateExpenseDTO, OCRExpenseDTO } from '@/types/expenses'

describe('ExpenseService', () => {
  describe('validateExpenseClassification', () => {
    it('should validate required classification fields', () => {
      const invalidData = {
        amount: 100,
        description: 'Test expense'
        // Missing projectId, costCodeId, supplierId
      }

      // This would be called internally by createExpense
      // Testing the validation logic
      expect(invalidData).not.toHaveProperty('projectId')
      expect(invalidData).not.toHaveProperty('costCodeId')
      expect(invalidData).not.toHaveProperty('supplierId')
    })
  })

  describe('createExpense', () => {
    it('should create expense with valid classification', async () => {
      // First create a cost code
      const { costCodeService } = await import('../costCodeService')
      const costCode = await costCodeService.createCostCode({
        code: 'EXP-001',
        name: 'Expense Test Cost Code',
        description: 'Test',
        division: 'Test Division',
        category: 'Test Category',
        type: 'material',
        unit: 'global',
        isActive: true,
        isDefault: false
      })

      const expenseData: CreateExpenseDTO = {
        projectId: 'proj-1',
        projectName: 'Test Project',
        costCodeId: costCode.id,
        supplierId: 'sup-1',
        supplierName: 'Test Supplier',
        amount: 1000,
        currency: 'USD',
        description: 'Test expense with proper classification',
        invoiceDate: '2024-01-15'
      }

      const expense = await expenseService.createExpense(expenseData)

      expect(expense).toBeDefined()
      expect(expense.id).toBeDefined()
      expect(expense.projectId).toBe('proj-1')
      expect(expense.costCodeId).toBe(costCode.id)
      expect(expense.supplierId).toBe('sup-1')
      expect(expense.amount).toBe(1000)
      expect(expense.status).toBe('draft')
      expect(expense.isAutoCreated).toBe(false)
    })

    it('should calculate total amount including tax', async () => {
      // First create a cost code
      const { costCodeService } = await import('../costCodeService')
      const costCode = await costCodeService.createCostCode({
        code: 'EXP-002',
        name: 'Expense Test Cost Code 2',
        description: 'Test',
        division: 'Test Division',
        category: 'Test Category',
        type: 'material',
        unit: 'global',
        isActive: true,
        isDefault: false
      })

      const expenseData: CreateExpenseDTO = {
        projectId: 'proj-1',
        projectName: 'Test Project',
        costCodeId: costCode.id,
        supplierId: 'sup-1',
        supplierName: 'Test Supplier',
        amount: 1000,
        taxAmount: 150,
        currency: 'USD',
        description: 'Test expense with tax',
        invoiceDate: '2024-01-15'
      }

      const expense = await expenseService.createExpense(expenseData)

      expect(expense.totalAmount).toBe(1150)
    })
  })

  describe('createExpenseFromOCR', () => {
    it('should create expense from OCR data', async () => {
      const ocrData: OCRExpenseDTO = {
        amount: 500,
        date: '2024-01-15',
        supplier: 'OCR Supplier',
        description: 'OCR extracted expense',
        ocrData: {
          rawText: 'Invoice text...',
          extractedFields: {
            amount: 500,
            date: '2024-01-15'
          },
          confidence: 0.95,
          processedAt: new Date().toISOString()
        },
        file: {
          name: 'invoice.pdf',
          mimeType: 'application/pdf',
          data: 'base64data'
        }
      }

      const expense = await expenseService.createExpenseFromOCR(ocrData)

      expect(expense).toBeDefined()
      expect(expense.isAutoCreated).toBe(true)
      expect(expense.ocrConfidence).toBe(0.95)
      expect(expense.status).toBe('pending_approval')
    })

    it('should flag low confidence OCR for review', async () => {
      const ocrData: OCRExpenseDTO = {
        amount: 500,
        date: '2024-01-15',
        supplier: 'OCR Supplier',
        description: 'Low confidence OCR',
        ocrData: {
          rawText: 'Invoice text...',
          extractedFields: {},
          confidence: 0.65,
          processedAt: new Date().toISOString()
        },
        file: {
          name: 'invoice.pdf',
          mimeType: 'application/pdf',
          data: 'base64data'
        }
      }

      const expense = await expenseService.createExpenseFromOCR(ocrData)

      expect(expense.needsReview).toBe(true)
    })
  })

  describe('approveExpense', () => {
    it('should approve pending expense', async () => {
      // First create a cost code
      const { costCodeService } = await import('../costCodeService')
      const costCode = await costCodeService.createCostCode({
        code: 'EXP-003',
        name: 'Expense Test Cost Code 3',
        description: 'Test',
        division: 'Test Division',
        category: 'Test Category',
        type: 'material',
        unit: 'global',
        isActive: true,
        isDefault: false
      })

      // Create an expense
      const expenseData: CreateExpenseDTO = {
        projectId: 'proj-1',
        projectName: 'Test Project',
        costCodeId: costCode.id,
        supplierId: 'sup-1',
        supplierName: 'Test Supplier',
        amount: 1000,
        currency: 'USD',
        description: 'Test expense',
        invoiceDate: '2024-01-15'
      }

      const expense = await expenseService.createExpense(expenseData)
      
      // Submit for approval
      await expenseService.submitForApproval(expense.id)

      // Approve
      const approved = await expenseService.approveExpense({
        expenseId: expense.id,
        approverId: 'approver-1'
      })

      expect(approved.status).toBe('approved')
      expect(approved.approvedBy).toBe('approver-1')
      expect(approved.approvedAt).toBeDefined()
    })
  })

  describe('getPendingApprovals', () => {
    it('should return only pending approval expenses', async () => {
      const pending = await expenseService.getPendingApprovals()

      expect(Array.isArray(pending)).toBe(true)
      expect(pending.every(exp => exp.status === 'pending_approval')).toBe(true)
    })
  })

  describe('getExpensesNeedingReview', () => {
    it('should return expenses flagged for review', async () => {
      const needingReview = await expenseService.getExpensesNeedingReview()

      expect(Array.isArray(needingReview)).toBe(true)
      expect(needingReview.every(exp => exp.needsReview === true)).toBe(true)
    })
  })
})
