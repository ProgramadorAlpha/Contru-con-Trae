/**
 * Visit Service
 * 
 * Business logic for managing project visits including scheduling,
 * completion, and cancellation of site visits.
 */

import type {
  Visit,
  CreateVisitDTO,
  VisitStatus,
  VisitType
} from '@/types/visit'

// Mock data for development
const mockVisits: Visit[] = []

class VisitService {
  private baseURL = '/api/visits'
  private mockDelay = 400

  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateId(): string {
    return `VISIT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Validate visit data
   */
  private validateVisit(data: CreateVisitDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.projectId) {
      errors.push('El proyecto es obligatorio')
    }

    if (!data.date) {
      errors.push('La fecha es obligatoria')
    } else {
      const visitDate = new Date(`${data.date}T${data.time || '00:00'}`)
      const now = new Date()
      
      if (visitDate <= now) {
        errors.push('La fecha y hora deben ser futuras')
      }
    }

    if (!data.time) {
      errors.push('La hora es obligatoria')
    }

    if (!data.type) {
      errors.push('El tipo de visita es obligatorio')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check for duplicate visits (same project, date, and time)
   */
  private checkDuplicateVisit(projectId: string, date: string, time: string): boolean {
    return mockVisits.some(
      visit =>
        visit.projectId === projectId &&
        visit.date === date &&
        visit.time === time &&
        visit.status !== 'cancelled'
    )
  }

  /**
   * Create a new visit
   */
  async createVisit(data: CreateVisitDTO): Promise<Visit> {
    await this.delay()

    // Validate visit data
    const validation = this.validateVisit(data)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    // Check for duplicate visits
    if (this.checkDuplicateVisit(data.projectId, data.date, data.time)) {
      throw new Error('Ya existe una visita programada para este proyecto en la misma fecha y hora')
    }

    const newVisit: Visit = {
      id: this.generateId(),
      projectId: data.projectId,
      projectName: 'Proyecto', // TODO: Get actual project name
      date: data.date,
      time: data.time,
      type: data.type as VisitType,
      participants: data.participants || [],
      notes: data.notes,
      status: 'scheduled',
      reminder: data.reminder || {
        enabled: true,
        minutesBefore: 60
      },
      createdBy: 'current-user-id', // TODO: Get from auth context
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockVisits.push(newVisit)
    return newVisit
  }

  /**
   * Get visit by ID
   */
  async getVisit(id: string): Promise<Visit | null> {
    await this.delay()

    const visit = mockVisits.find(v => v.id === id)
    return visit || null
  }

  /**
   * Update visit
   */
  async updateVisit(id: string, data: Partial<CreateVisitDTO>): Promise<Visit> {
    await this.delay()

    const index = mockVisits.findIndex(v => v.id === id)
    if (index === -1) {
      throw new Error('Visita no encontrada')
    }

    if (mockVisits[index].status === 'completed') {
      throw new Error('No se puede modificar una visita completada')
    }

    if (mockVisits[index].status === 'cancelled') {
      throw new Error('No se puede modificar una visita cancelada')
    }

    // Check for duplicate if date/time changed
    if (data.date || data.time) {
      const newDate = data.date || mockVisits[index].date
      const newTime = data.time || mockVisits[index].time
      
      if (
        this.checkDuplicateVisit(mockVisits[index].projectId, newDate, newTime) &&
        (newDate !== mockVisits[index].date || newTime !== mockVisits[index].time)
      ) {
        throw new Error('Ya existe una visita programada para este proyecto en la misma fecha y hora')
      }
    }

    mockVisits[index] = {
      ...mockVisits[index],
      ...data,
      ...(data.type && { type: data.type as VisitType }),
      updatedAt: new Date().toISOString()
    }

    return mockVisits[index]
  }

  /**
   * Cancel visit
   */
  async cancelVisit(id: string, reason?: string): Promise<Visit> {
    await this.delay()

    const index = mockVisits.findIndex(v => v.id === id)
    if (index === -1) {
      throw new Error('Visita no encontrada')
    }

    if (mockVisits[index].status === 'completed') {
      throw new Error('No se puede cancelar una visita completada')
    }

    if (mockVisits[index].status === 'cancelled') {
      throw new Error('La visita ya está cancelada')
    }

    mockVisits[index].status = 'cancelled'
    mockVisits[index].updatedAt = new Date().toISOString()
    if (reason) {
      mockVisits[index].notes = `${mockVisits[index].notes || ''}\n\nMotivo de cancelación: ${reason}`
    }

    return mockVisits[index]
  }

  /**
   * Complete visit
   */
  async completeVisit(id: string, completionNotes?: string): Promise<Visit> {
    await this.delay()

    const index = mockVisits.findIndex(v => v.id === id)
    if (index === -1) {
      throw new Error('Visita no encontrada')
    }

    if (mockVisits[index].status === 'completed') {
      throw new Error('La visita ya está completada')
    }

    if (mockVisits[index].status === 'cancelled') {
      throw new Error('No se puede completar una visita cancelada')
    }

    mockVisits[index].status = 'completed'
    mockVisits[index].completedAt = new Date().toISOString()
    mockVisits[index].completionNotes = completionNotes
    mockVisits[index].updatedAt = new Date().toISOString()

    return mockVisits[index]
  }

  /**
   * Get upcoming visits (scheduled visits in the future)
   */
  async getUpcomingVisits(limit: number = 10): Promise<Visit[]> {
    await this.delay()

    const now = new Date()
    
    return mockVisits
      .filter(visit => {
        if (visit.status !== 'scheduled') return false
        
        const visitDateTime = new Date(`${visit.date}T${visit.time}`)
        return visitDateTime > now
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateA.getTime() - dateB.getTime()
      })
      .slice(0, limit)
  }

  /**
   * Get visits by project
   */
  async getVisitsByProject(projectId: string): Promise<Visit[]> {
    await this.delay()

    return mockVisits
      .filter(visit => visit.projectId === projectId)
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateB.getTime() - dateA.getTime() // Most recent first
      })
  }

  /**
   * Get all visits with optional status filter
   */
  async getVisits(status?: VisitStatus): Promise<Visit[]> {
    await this.delay()

    let filtered = [...mockVisits]

    if (status) {
      filtered = filtered.filter(visit => visit.status === status)
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateB.getTime() - dateA.getTime()
    })
  }

  /**
   * Delete visit (only if not completed)
   */
  async deleteVisit(id: string): Promise<void> {
    await this.delay()

    const index = mockVisits.findIndex(v => v.id === id)
    if (index === -1) {
      throw new Error('Visita no encontrada')
    }

    if (mockVisits[index].status === 'completed') {
      throw new Error('No se puede eliminar una visita completada')
    }

    mockVisits.splice(index, 1)
  }
}

// Export singleton instance
export const visitService = new VisitService()
