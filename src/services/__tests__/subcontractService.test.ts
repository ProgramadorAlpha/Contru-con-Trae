/**
 * Subcontract Service Tests
 * 
 * Tests for subcontract management and financial calculations
 */

import { describe, it, expect } from 'vitest'
import { subcontractService } from '../subcontractService'
import type { CreateSubcontractDTO } from '@/types/subcontracts'

describe('SubcontractService', () => {
  describe('createSubcontract', () => {
    it('should create a new subcontract with valid data', async () => {
      const subcontractData: CreateSubcontractDTO = {
        contractNumber: 'SC-2024-001',
        projectId: 'proj-1',
        projectName: 'Test Project',
        subcontractorId: 'sub-1',
        subcontractorName: 'Test Subcontractor',
        description: 'Foundation work',
        scope: 'Complete foundation including excavation',
        totalAmount: 100000,
        currency: 'USD',
        retentionPercentage: 10,
        paymentSchedule: [
          { description: 'Advance', percentage: 20, amount: 20000 },
          { description: 'Progress 1', percentage: 40, amount: 40000 },
          { description: 'Final', percentage: 40, amount: 40000 }
        ],
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        costCodes: ['cc-1', 'cc-2']
      }

      const subcontract = await subcontractService.createSubcontract(subcontractData)

      expect(subcontract).toBeDefined()
      expect(subcontract.id).toBeDefined()
      expect(subcontract.contractNumber).toBe('SC-2024-001')
      expect(subcontract.totalAmount).toBe(100000)
      expect(subcontract.status).toBe('draft')
      expect(subcontract.totalCertified).toBe(0)
      expect(subcontract.remainingBalance).toBe(100000)
    })

    it('should validate payment schedule sums to 100%', async () => {
      const invalidData: CreateSubcontractDTO = {
        contractNumber: 'SC-2024-002',
        projectId: 'proj-1',
        projectName: 'Test Project',
        subcontractorId: 'sub-1',
        subcontractorName: 'Test Subcontractor',
        description: 'Test',
        scope: 'Test scope',
        totalAmount: 50000,
        currency: 'USD',
        retentionPercentage: 10,
        paymentSchedule: [
          { description: 'Payment 1', percentage: 50, amount: 25000 },
          { description: 'Payment 2', percentage: 30, amount: 15000 }
        ],
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        costCodes: []
      }

      await expect(subcontractService.createSubcontract(invalidData)).rejects.toThrow(
        'Payment schedule percentages must sum to 100%'
      )
    })

    it('should validate retention percentage range', async () => {
      const invalidData: CreateSubcontractDTO = {
        contractNumber: 'SC-2024-003',
        projectId: 'proj-1',
        projectName: 'Test Project',
        subcontractorId: 'sub-1',
        subcontractorName: 'Test Subcontractor',
        description: 'Test',
        scope: 'Test scope',
        totalAmount: 50000,
        currency: 'USD',
        retentionPercentage: 150,
        paymentSchedule: [
          { description: 'Payment', percentage: 100, amount: 50000 }
        ],
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        costCodes: []
      }

      await expect(subcontractService.createSubcontract(invalidData)).rejects.toThrow(
        'Retention percentage must be between 0 and 100'
      )
    })
  })

  describe('calculateCommittedCost', () => {
    it('should calculate total committed cost for active subcontracts', async () => {
      // Create and approve a subcontract
      const subcontractData: CreateSubcontractDTO = {
        contractNumber: 'SC-2024-004',
        projectId: 'proj-committed',
        projectName: 'Test Project',
        subcontractorId: 'sub-1',
        subcontractorName: 'Test Subcontractor',
        description: 'Test work',
        scope: 'Test scope',
        totalAmount: 75000,
        currency: 'USD',
        retentionPercentage: 10,
        paymentSchedule: [{ description: 'Full', percentage: 100, amount: 75000 }],
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        costCodes: []
      }

      const subcontract = await subcontractService.createSubcontract(subcontractData)
      await subcontractService.approveSubcontract(subcontract.id, 'approver-1')

      const committedCost = await subcontractService.calculateCommittedCost('proj-committed')

      expect(committedCost).toBe(75000)
    })
  })

  describe('approveSubcontract', () => {
    it('should approve a draft subcontract', async () => {
      const subcontractData: CreateSubcontractDTO = {
        contractNumber: 'SC-2024-005',
        projectId: 'proj-1',
        projectName: 'Test Project',
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
        costCodes: []
      }

      const subcontract = await subcontractService.createSubcontract(subcontractData)
      const approved = await subcontractService.approveSubcontract(subcontract.id, 'approver-1')

      expect(approved.status).toBe('active')
      expect(approved.approvedBy).toBe('approver-1')
      expect(approved.approvedAt).toBeDefined()
    })

    it('should not approve non-draft subcontract', async () => {
      const subcontractData: CreateSubcontractDTO = {
        contractNumber: 'SC-2024-006',
        projectId: 'proj-1',
        projectName: 'Test Project',
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
        costCodes: []
      }

      const subcontract = await subcontractService.createSubcontract(subcontractData)
      await subcontractService.approveSubcontract(subcontract.id, 'approver-1')

      await expect(
        subcontractService.approveSubcontract(subcontract.id, 'approver-2')
      ).rejects.toThrow('Only draft subcontracts can be approved')
    })
  })

  describe('getSubcontractsByProject', () => {
    it('should return subcontracts for a specific project', async () => {
      const projectId = 'proj-filter-test'
      
      const subcontractData: CreateSubcontractDTO = {
        contractNumber: 'SC-2024-007',
        projectId,
        projectName: 'Filter Test Project',
        subcontractorId: 'sub-1',
        subcontractorName: 'Test Subcontractor',
        description: 'Test work',
        scope: 'Test scope',
        totalAmount: 30000,
        currency: 'USD',
        retentionPercentage: 10,
        paymentSchedule: [{ description: 'Full', percentage: 100, amount: 30000 }],
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        costCodes: []
      }

      await subcontractService.createSubcontract(subcontractData)

      const subcontracts = await subcontractService.getSubcontractsByProject(projectId)

      expect(Array.isArray(subcontracts)).toBe(true)
      expect(subcontracts.length).toBeGreaterThan(0)
      expect(subcontracts.every(sc => sc.projectId === projectId)).toBe(true)
    })
  })

  describe('calculateRetentionBalance', () => {
    it('should return retention balance for a subcontract', async () => {
      const subcontractData: CreateSubcontractDTO = {
        contractNumber: 'SC-2024-008',
        projectId: 'proj-1',
        projectName: 'Test Project',
        subcontractorId: 'sub-1',
        subcontractorName: 'Test Subcontractor',
        description: 'Test work',
        scope: 'Test scope',
        totalAmount: 100000,
        currency: 'USD',
        retentionPercentage: 10,
        paymentSchedule: [{ description: 'Full', percentage: 100, amount: 100000 }],
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        costCodes: []
      }

      const subcontract = await subcontractService.createSubcontract(subcontractData)
      const retention = await subcontractService.calculateRetentionBalance(subcontract.id)

      expect(retention).toBe(0) // No payments certified yet
    })
  })
})
