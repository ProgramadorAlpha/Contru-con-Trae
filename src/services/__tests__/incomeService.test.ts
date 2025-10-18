/**
 * Income Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { incomeService } from '../incomeService'
import type { CreateIncomeDTO } from '@/types/income'

describe('incomeService', () => {
  const validIncomeData: CreateIncomeDTO = {
    projectId: 'proj-001',
    amount: 1000,
    date: new Date().toISOString().split('T')[0],
    description: 'Test income entry',
    paymentMethod: 'bank_transfer'
  }

  describe('createIncome', () => {
    it('creates income with valid data', async () => {
      const income = await incomeService.createIncome(validIncomeData)
      
      expect(income).toBeDefined()
      expect(income.id).toBeDefined()
      expect(income.amount).toBe(1000)
      expect(income.description).toBe('Test income entry')
    })

    it('throws error when amount is zero or negative', async () => {
      const invalidData = { ...validIncomeData, amount: 0 }
      
      await expect(incomeService.createIncome(invalidData)).rejects.toThrow()
    })

    it('throws error when description is too short', async () => {
      const invalidData = { ...validIncomeData, description: 'abc' }
      
      await expect(incomeService.createIncome(invalidData)).rejects.toThrow()
    })

    it('throws error when date is too far in future', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)
      const invalidData = { ...validIncomeData, date: futureDate.toISOString().split('T')[0] }
      
      await expect(incomeService.createIncome(invalidData)).rejects.toThrow()
    })
  })

  describe('getIncome', () => {
    it('returns income by id', async () => {
      const created = await incomeService.createIncome(validIncomeData)
      const retrieved = await incomeService.getIncome(created.id)
      
      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(created.id)
    })

    it('returns null for non-existent id', async () => {
      const retrieved = await incomeService.getIncome('non-existent-id')
      
      expect(retrieved).toBeNull()
    })
  })
})
