/**
 * Cost Code Service Tests
 * 
 * Tests for cost code management and classification
 */

import { describe, it, expect } from 'vitest'
import { costCodeService } from '../costCodeService'
import type { CreateCostCodeDTO } from '@/types/costCodes'

describe('CostCodeService', () => {
  describe('createCostCode', () => {
    it('should create a new cost code', async () => {
      const costCodeData: CreateCostCodeDTO = {
        code: 'TEST-001',
        name: 'Test Cost Code',
        description: 'Test description',
        division: 'Test Division',
        category: 'Test Category',
        type: 'labor',
        unit: 'global',
        isActive: true,
        isDefault: false
      }

      const costCode = await costCodeService.createCostCode(costCodeData)

      expect(costCode).toBeDefined()
      expect(costCode.id).toBeDefined()
      expect(costCode.code).toBe('TEST-001')
      expect(costCode.name).toBe('Test Cost Code')
      expect(costCode.type).toBe('labor')
      expect(costCode.isActive).toBe(true)
    })
  })

  describe('getCostCodeHierarchy', () => {
    it('should return hierarchical structure', async () => {
      const hierarchy = await costCodeService.getCostCodeHierarchy()

      expect(hierarchy).toBeDefined()
      expect(hierarchy.divisions).toBeDefined()
      expect(Array.isArray(hierarchy.divisions)).toBe(true)
      
      // Check structure has divisions
      expect(hierarchy.divisions.length).toBeGreaterThan(0)

      // Check each division has categories
      hierarchy.divisions.forEach(division => {
        expect(division.code).toBeDefined()
        expect(division.name).toBeDefined()
        expect(Array.isArray(division.categories)).toBe(true)

        // Check each category has subcategories
        division.categories.forEach(category => {
          expect(category.code).toBeDefined()
          expect(category.name).toBeDefined()
          expect(Array.isArray(category.subcategories)).toBe(true)
        })
      })
    })
  })

  describe('getCostCodeByCode', () => {
    it('should find cost code by code string', async () => {
      // First create a cost code
      const costCodeData: CreateCostCodeDTO = {
        code: 'SEARCH-001',
        name: 'Searchable Cost Code',
        description: 'Test description',
        division: 'Test Division',
        category: 'Test Category',
        type: 'labor',
        unit: 'global',
        isActive: true,
        isDefault: false
      }

      await costCodeService.createCostCode(costCodeData)

      const result = await costCodeService.getCostCodeByCode('SEARCH-001')

      expect(result).toBeDefined()
      expect(result?.code).toBe('SEARCH-001')
    })

    it('should return null for non-existent code', async () => {
      const result = await costCodeService.getCostCodeByCode('nonexistentcode12345')

      expect(result).toBeNull()
    })
  })

  describe('suggestCostCodes', () => {
    it('should suggest relevant cost codes based on description', async () => {
      const suggestions = await costCodeService.suggestCostCodes(
        'concrete foundation work',
        3
      )

      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions.length).toBeLessThanOrEqual(3)
    })

    it('should return limited number of suggestions', async () => {
      const suggestions = await costCodeService.suggestCostCodes('material', 2)

      expect(suggestions.length).toBeLessThanOrEqual(2)
    })
  })

  describe('getActiveCostCodes', () => {
    it('should return only active cost codes', async () => {
      const activeCodes = await costCodeService.getActiveCostCodes()

      expect(Array.isArray(activeCodes)).toBe(true)
      expect(activeCodes.every(code => code.isActive === true)).toBe(true)
    })
  })

  describe('createCostCodeBudget', () => {
    it('should create budget for cost code in project', async () => {
      // First create a cost code
      const costCode = await costCodeService.createCostCode({
        code: 'BUDGET-001',
        name: 'Budget Test Cost Code',
        description: 'Test',
        division: 'Test Division',
        category: 'Test Category',
        type: 'labor',
        unit: 'global',
        isActive: true,
        isDefault: false
      })

      const budget = await costCodeService.createCostCodeBudget({
        projectId: 'proj-1',
        costCodeId: costCode.id,
        budgetedQuantity: 100,
        budgetedUnitPrice: 500
      })

      expect(budget).toBeDefined()
      expect(budget.projectId).toBe('proj-1')
      expect(budget.costCodeId).toBe(costCode.id)
      expect(budget.budgetedAmount).toBe(50000)
      expect(budget.actualAmount).toBe(0)
      expect(budget.variance).toBe(50000)
    })
  })

  describe('updateBudgetActuals', () => {
    it('should update actual amount for cost code budget', async () => {
      // First create a cost code
      const costCode = await costCodeService.createCostCode({
        code: 'UPDATE-001',
        name: 'Update Test Cost Code',
        description: 'Test',
        division: 'Test Division',
        category: 'Test Category',
        type: 'labor',
        unit: 'global',
        isActive: true,
        isDefault: false
      })

      // Create a budget
      await costCodeService.createCostCodeBudget({
        projectId: 'proj-update-1',
        costCodeId: costCode.id,
        budgetedQuantity: 100,
        budgetedUnitPrice: 500
      })

      // Update actuals
      const updated = await costCodeService.updateBudgetActuals(
        'proj-update-1',
        costCode.id,
        10000
      )

      expect(updated).toBeDefined()
      expect(updated.actualAmount).toBe(10000)
      expect(updated.variance).toBe(40000)
      expect(updated.percentageComplete).toBe(20)
    })
  })

  describe('getCostCodeSummary', () => {
    it('should return summary for project cost code', async () => {
      // First create a cost code
      const costCode = await costCodeService.createCostCode({
        code: 'SUMMARY-001',
        name: 'Summary Test Cost Code',
        description: 'Test',
        division: 'Test Division',
        category: 'Test Category',
        type: 'labor',
        unit: 'global',
        isActive: true,
        isDefault: false
      })

      // Create a budget
      await costCodeService.createCostCodeBudget({
        projectId: 'proj-summary-1',
        costCodeId: costCode.id,
        budgetedQuantity: 100,
        budgetedUnitPrice: 500
      })

      const summary = await costCodeService.getCostCodeSummary('proj-summary-1', costCode.id)

      expect(summary).toBeDefined()
      expect(summary.costCode).toBeDefined()
      expect(summary.budget).toBeDefined()
      expect(summary.subcontracts).toBeDefined()
      expect(summary.expenses).toBeDefined()
      expect(summary.utilizationPercentage).toBeDefined()
    })
  })
})
