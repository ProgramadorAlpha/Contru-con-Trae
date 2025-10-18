/**
 * Visit Service Tests
 */

import { describe, it, expect } from 'vitest'
import { visitService } from '../visitService'
import type { CreateVisitDTO } from '@/types/visit'

describe('visitService', () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const validVisitData: CreateVisitDTO = {
    projectId: 'proj-001',
    date: tomorrow.toISOString().split('T')[0],
    time: '10:00',
    type: 'inspection',
    notes: 'Test visit'
  }

  describe('createVisit', () => {
    it('creates visit with valid data', async () => {
      const visit = await visitService.createVisit(validVisitData)
      
      expect(visit).toBeDefined()
      expect(visit.id).toBeDefined()
      expect(visit.type).toBe('inspection')
      expect(visit.status).toBe('scheduled')
    })

    it('throws error when date is in the past', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const invalidData = { 
        ...validVisitData, 
        date: yesterday.toISOString().split('T')[0] 
      }
      
      await expect(visitService.createVisit(invalidData)).rejects.toThrow()
    })

    it('prevents duplicate visits', async () => {
      await visitService.createVisit(validVisitData)
      
      // Try to create duplicate
      await expect(visitService.createVisit(validVisitData)).rejects.toThrow('duplicada')
    })
  })

  describe('getUpcomingVisits', () => {
    it('returns only future scheduled visits', async () => {
      const visits = await visitService.getUpcomingVisits()
      
      expect(Array.isArray(visits)).toBe(true)
      visits.forEach(visit => {
        expect(visit.status).toBe('scheduled')
        const visitDate = new Date(`${visit.date}T${visit.time}`)
        expect(visitDate.getTime()).toBeGreaterThan(Date.now())
      })
    })
  })

  describe('cancelVisit', () => {
    it('cancels a scheduled visit', async () => {
      const visit = await visitService.createVisit({
        ...validVisitData,
        time: '11:00' // Different time to avoid duplicate
      })
      
      const cancelled = await visitService.cancelVisit(visit.id, 'Test cancellation')
      
      expect(cancelled.status).toBe('cancelled')
    })

    it('throws error when cancelling non-existent visit', async () => {
      await expect(visitService.cancelVisit('non-existent-id')).rejects.toThrow()
    })
  })
})
