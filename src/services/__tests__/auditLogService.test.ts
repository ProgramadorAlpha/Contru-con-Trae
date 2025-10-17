/**
 * Audit Log Service Tests
 * 
 * Tests for the audit logging functionality
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { auditLogService } from '../auditLogService'
import type { CreateAuditLogDTO } from '@/types/auditLog'

describe('AuditLogService', () => {
  describe('log', () => {
    it('should create an audit log entry', async () => {
      const logData: CreateAuditLogDTO = {
        action: 'subcontract_created',
        entityType: 'subcontract',
        entityId: 'SC-123',
        entityName: 'Test Subcontract',
        userId: 'user-1',
        userName: 'Test User',
        description: 'Created test subcontract',
        severity: 'info'
      }

      const entry = await auditLogService.log(logData)

      expect(entry).toBeDefined()
      expect(entry.id).toBeDefined()
      expect(entry.action).toBe('subcontract_created')
      expect(entry.entityType).toBe('subcontract')
      expect(entry.entityId).toBe('SC-123')
      expect(entry.userId).toBe('user-1')
      expect(entry.severity).toBe('info')
    })

    it('should auto-determine severity for critical actions', async () => {
      const logData: CreateAuditLogDTO = {
        action: 'payment_recorded',
        entityType: 'payment',
        entityId: 'PAY-123',
        userId: 'user-1',
        userName: 'Test User',
        description: 'Payment recorded'
      }

      const entry = await auditLogService.log(logData)

      expect(entry.severity).toBe('critical')
    })

    it('should include financial impact when provided', async () => {
      const logData: CreateAuditLogDTO = {
        action: 'certificate_approved',
        entityType: 'certificate',
        entityId: 'CERT-123',
        userId: 'user-1',
        userName: 'Test User',
        description: 'Certificate approved',
        financialImpact: {
          amount: 50000,
          currency: 'USD',
          description: 'Certificate payment'
        }
      }

      const entry = await auditLogService.log(logData)

      expect(entry.financialImpact).toBeDefined()
      expect(entry.financialImpact?.amount).toBe(50000)
      expect(entry.financialImpact?.currency).toBe('USD')
    })
  })

  describe('query', () => {
    it('should filter logs by entity type', async () => {
      // Create some test logs
      await auditLogService.log({
        action: 'subcontract_created',
        entityType: 'subcontract',
        entityId: 'SC-1',
        userId: 'user-1',
        userName: 'User 1',
        description: 'Test 1'
      })

      await auditLogService.log({
        action: 'expense_created',
        entityType: 'expense',
        entityId: 'EXP-1',
        userId: 'user-1',
        userName: 'User 1',
        description: 'Test 2'
      })

      const result = await auditLogService.query({
        entityType: 'subcontract'
      })

      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data.every(log => log.entityType === 'subcontract')).toBe(true)
    })

    it('should filter logs by severity', async () => {
      await auditLogService.log({
        action: 'payment_recorded',
        entityType: 'payment',
        entityId: 'PAY-1',
        userId: 'user-1',
        userName: 'User 1',
        description: 'Critical payment',
        severity: 'critical'
      })

      const result = await auditLogService.query({
        severity: 'critical'
      })

      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data.every(log => log.severity === 'critical')).toBe(true)
    })
  })

  describe('getRecentActivity', () => {
    it('should return recent logs in descending order', async () => {
      const result = await auditLogService.getRecentActivity(5)

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeLessThanOrEqual(5)

      // Check if sorted by timestamp (newest first)
      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          const current = new Date(result[i].timestamp).getTime()
          const next = new Date(result[i + 1].timestamp).getTime()
          expect(current).toBeGreaterThanOrEqual(next)
        }
      }
    })
  })

  describe('getCriticalEvents', () => {
    it('should return only critical severity logs', async () => {
      const result = await auditLogService.getCriticalEvents(10)

      expect(Array.isArray(result)).toBe(true)
      expect(result.every(log => log.severity === 'critical')).toBe(true)
    })
  })

  describe('export', () => {
    it('should export logs as JSON', async () => {
      const jsonExport = await auditLogService.export('json')

      expect(jsonExport).toBeDefined()
      expect(() => JSON.parse(jsonExport)).not.toThrow()
    })

    it('should export logs as CSV', async () => {
      const csvExport = await auditLogService.export('csv')

      expect(csvExport).toBeDefined()
      expect(csvExport).toContain('ID,Timestamp,Action')
    })
  })
})
