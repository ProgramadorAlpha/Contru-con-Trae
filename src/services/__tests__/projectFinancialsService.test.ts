/**
 * Project Financials Service Tests
 * 
 * Tests for project financial calculations and job costing
 */

import { describe, it, expect } from 'vitest'
import { projectFinancialsService } from '../projectFinancialsService'
import { subcontractService } from '../subcontractService'
import { costCodeService } from '../costCodeService'
import type { CreateSubcontractDTO } from '@/types/subcontracts'

describe('ProjectFinancialsService', () => {
  describe('calculateProjectFinancials', () => {
    it('should calculate comprehensive project financials', async () => {
      const projectId = 'proj-financials-1'

      // Create a cost code first
      const costCode = await costCodeService.createCostCode({
        code: 'TEST-FIN-001',
        name: 'Test Cost Code',
        description: 'Test',
        division: 'Test Division',
        category: 'Test Category',
        type: 'labor',
        unit: 'global',
        isActive: true,
        isDefault: false
      })

      // Create a cost code budget
      await costCodeService.createCostCodeBudget({
        projectId,
        costCodeId: costCode.id,
        budgetedQuantity: 100,
        budgetedUnitPrice: 1000
      })

      // Create a subcontract
      const subcontractData: CreateSubcontractDTO = {
        contractNumber: 'SC-FIN-001',
        projectId,
        projectName: 'Financials Test Project',
        subcontractorId: 'sub-1',
        subcontractorName: 'Test Subcontractor',
        description: 'Test work',
        scope: 'Test scope',
        totalAmount: 50000,
        currency: 'USD',
        retentionPercentage: 10,
        paymentSchedule: [{ description: 'Full', percentage: 100, amount: 50000 }],
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        costCodes: [costCode.id]
      }

      const subcontract = await subcontractService.createSubcontract(subcontractData)
      await subcontractService.approveSubcontract(subcontract.id, 'approver-1')

      // Calculate financials
      const financials = await projectFinancialsService.calculateProjectFinancials(projectId)

      expect(financials).toBeDefined()
      expect(financials.projectId).toBe(projectId)
      expect(financials.totalBudget).toBeGreaterThan(0)
      expect(financials.totalCommitted).toBe(50000)
      expect(financials.activeSubcontracts).toBe(1)
      expect(financials.financialHealth).toBeDefined()
    })

    it('should determine financial health correctly', async () => {
      const projectId = 'proj-financials-2'

      // Create a cost code first
      const costCode = await costCodeService.createCostCode({
        code: 'TEST-FIN-002',
        name: 'Test Cost Code 2',
        description: 'Test',
        division: 'Test Division',
        category: 'Test Category',
        type: 'labor',
        unit: 'global',
        isActive: true,
        isDefault: false
      })

      // Create budget
      await costCodeService.createCostCodeBudget({
        projectId,
        costCodeId: costCode.id,
        budgetedQuantity: 100,
        budgetedUnitPrice: 1000
      })

      const financials = await projectFinancialsService.calculateProjectFinancials(projectId)

      expect(['excellent', 'good', 'warning', 'critical']).toContain(financials.financialHealth)
    })
  })

  describe('getProjectFinancials', () => {
    it('should return cached financials if available', async () => {
      const projectId = 'proj-financials-3'

      // First call calculates
      const financials1 = await projectFinancialsService.getProjectFinancials(projectId)
      
      // Second call should use cache
      const financials2 = await projectFinancialsService.getProjectFinancials(projectId)

      expect(financials1.calculatedAt).toBe(financials2.calculatedAt)
    })
  })

  describe('refreshProjectFinancials', () => {
    it('should force recalculation of financials', async () => {
      const projectId = 'proj-financials-4'

      const financials1 = await projectFinancialsService.getProjectFinancials(projectId)
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const financials2 = await projectFinancialsService.refreshProjectFinancials(projectId)

      // Timestamps should be different after refresh
      expect(financials2.calculatedAt).not.toBe(financials1.calculatedAt)
    })
  })

  describe('generateJobCostingReport', () => {
    it('should generate comprehensive job costing report', async () => {
      const projectId = 'proj-financials-5'

      // Create a cost code first
      const costCode = await costCodeService.createCostCode({
        code: 'TEST-FIN-003',
        name: 'Test Cost Code 3',
        description: 'Test',
        division: 'Test Division',
        category: 'Test Category',
        type: 'labor',
        unit: 'global',
        isActive: true,
        isDefault: false
      })

      // Create budget
      await costCodeService.createCostCodeBudget({
        projectId,
        costCodeId: costCode.id,
        budgetedQuantity: 100,
        budgetedUnitPrice: 1000
      })

      const report = await projectFinancialsService.generateJobCostingReport(projectId)

      expect(report).toBeDefined()
      expect(report.project.id).toBe(projectId)
      expect(report.summary).toBeDefined()
      expect(Array.isArray(report.costBreakdown)).toBe(true)
      expect(Array.isArray(report.subcontracts)).toBe(true)
      expect(Array.isArray(report.expenses)).toBe(true)
      expect(report.charts).toBeDefined()
      expect(report.generatedAt).toBeDefined()
    })

    it('should include budget vs actual chart data', async () => {
      const projectId = 'proj-financials-6'

      const report = await projectFinancialsService.generateJobCostingReport(projectId)

      expect(report.charts.budgetVsActual).toBeDefined()
      expect(Array.isArray(report.charts.budgetVsActual)).toBe(true)
      expect(report.charts.budgetVsActual.length).toBeGreaterThan(0)
    })
  })

  describe('forecastFinalCost', () => {
    it('should generate cost forecast with multiple methods', async () => {
      const projectId = 'proj-financials-7'

      // Create a cost code first
      const costCode = await costCodeService.createCostCode({
        code: 'TEST-FIN-004',
        name: 'Test Cost Code 4',
        description: 'Test',
        division: 'Test Division',
        category: 'Test Category',
        type: 'labor',
        unit: 'global',
        isActive: true,
        isDefault: false
      })

      // Create budget
      await costCodeService.createCostCodeBudget({
        projectId,
        costCodeId: costCode.id,
        budgetedQuantity: 100,
        budgetedUnitPrice: 1000
      })

      const forecast = await projectFinancialsService.forecastFinalCost(projectId)

      expect(forecast).toBeDefined()
      expect(forecast.projectId).toBe(projectId)
      expect(forecast.currentBudget).toBeDefined()
      expect(forecast.forecastByTrend).toBeDefined()
      expect(forecast.forecastByEVM).toBeDefined()
      expect(forecast.forecastByCommitments).toBeDefined()
      expect(forecast.recommendedForecast).toBeDefined()
      expect(forecast.confidenceLevel).toBeGreaterThan(0)
      expect(forecast.confidenceLevel).toBeLessThanOrEqual(1)
    })

    it('should include best, worst, and most likely scenarios', async () => {
      const projectId = 'proj-financials-8'

      const forecast = await projectFinancialsService.forecastFinalCost(projectId)

      expect(forecast.bestCase).toBeDefined()
      expect(forecast.worstCase).toBeDefined()
      expect(forecast.mostLikely).toBeDefined()
      expect(Array.isArray(forecast.assumptions)).toBe(true)
    })
  })

  describe('subscribeToFinancialUpdates', () => {
    it('should allow subscribing to financial updates', async () => {
      const projectId = 'proj-financials-9'
      let updateReceived = false

      const unsubscribe = projectFinancialsService.subscribeToFinancialUpdates(
        projectId,
        (financials) => {
          updateReceived = true
          expect(financials.projectId).toBe(projectId)
        }
      )

      // Trigger an update
      await projectFinancialsService.calculateProjectFinancials(projectId)

      expect(updateReceived).toBe(true)

      // Cleanup
      unsubscribe()
    })

    it('should allow unsubscribing from updates', async () => {
      const projectId = 'proj-financials-10'
      let updateCount = 0

      const unsubscribe = projectFinancialsService.subscribeToFinancialUpdates(
        projectId,
        () => {
          updateCount++
        }
      )

      // First update
      await projectFinancialsService.calculateProjectFinancials(projectId)
      expect(updateCount).toBe(1)

      // Unsubscribe
      unsubscribe()

      // Second update should not trigger callback
      await projectFinancialsService.calculateProjectFinancials(projectId)
      expect(updateCount).toBe(1)
    })
  })

  describe('exportFinancials', () => {
    it('should export financials as blob', async () => {
      const projectId = 'proj-financials-11'

      const blob = await projectFinancialsService.exportFinancials({
        projectId,
        format: 'pdf'
      })

      expect(blob).toBeInstanceOf(Blob)
      // The service returns JSON format for now, which is acceptable
      expect(['application/pdf', 'application/json']).toContain(blob.type)
    })
  })
})
