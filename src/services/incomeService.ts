/**
 * Income Service
 * 
 * Business logic for managing income/revenue entries
 * associated with projects.
 */

import type {
  Income,
  CreateIncomeDTO,
  UpdateIncomeDTO,
  IncomeStats
} from '@/types/income'

// Mock data for development
const mockIncomes: Income[] = [
  {
    id: 'INC-001',
    projectId: 'proj-001',
    projectName: 'Construcción Edificio Central',
    amount: 50000,
    currency: 'USD',
    date: '2024-10-15',
    description: 'Pago inicial del cliente - Fase 1',
    paymentMethod: 'bank_transfer',
    reference: 'TRANS-2024-001',
    invoiceNumber: 'INV-001',
    createdBy: 'user-001',
    createdAt: '2024-10-15T10:00:00Z',
    updatedAt: '2024-10-15T10:00:00Z',
    status: 'confirmed'
  },
  {
    id: 'INC-002',
    projectId: 'proj-002',
    projectName: 'Remodelación Casa Residencial',
    amount: 25000,
    currency: 'USD',
    date: '2024-10-16',
    description: 'Pago por avance de obra - 50%',
    paymentMethod: 'check',
    reference: 'CHK-5678',
    createdBy: 'user-001',
    createdAt: '2024-10-16T14:30:00Z',
    updatedAt: '2024-10-16T14:30:00Z',
    status: 'confirmed'
  },
  {
    id: 'INC-003',
    projectId: 'proj-001',
    projectName: 'Construcción Edificio Central',
    amount: 30000,
    currency: 'USD',
    date: '2024-10-17',
    description: 'Pago pendiente - Fase 2',
    paymentMethod: 'bank_transfer',
    createdBy: 'user-001',
    createdAt: '2024-10-17T09:15:00Z',
    updatedAt: '2024-10-17T09:15:00Z',
    status: 'pending'
  }
]

class IncomeService {
  private baseURL = '/api/incomes'
  private mockDelay = 400

  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateId(): string {
    return `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Validate income data
   */
  private validateIncome(data: CreateIncomeDTO | UpdateIncomeDTO): void {
    if ('amount' in data && data.amount !== undefined) {
      if (data.amount <= 0) {
        throw new Error('El monto debe ser mayor a 0')
      }
    }

    if ('description' in data && data.description !== undefined) {
      if (data.description.trim().length < 5) {
        throw new Error('La descripción debe tener al menos 5 caracteres')
      }
    }

    if ('date' in data && data.date) {
      const incomeDate = new Date(data.date)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(23, 59, 59, 999)

      if (incomeDate > tomorrow) {
        throw new Error('La fecha no puede ser más de 1 día en el futuro')
      }
    }
  }

  /**
   * Create a new income entry
   */
  async createIncome(data: CreateIncomeDTO): Promise<Income> {
    await this.delay()

    // Validate data
    this.validateIncome(data)

    if (!data.projectId) {
      throw new Error('El proyecto es obligatorio')
    }

    const newIncome: Income = {
      id: this.generateId(),
      projectId: data.projectId,
      projectName: 'Proyecto', // TODO: Get actual project name from project service
      amount: data.amount,
      currency: 'USD',
      date: data.date,
      description: data.description,
      paymentMethod: data.paymentMethod,
      reference: data.reference,
      invoiceNumber: data.invoiceNumber,
      createdBy: 'current-user-id', // TODO: Get from auth context
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'confirmed'
    }

    mockIncomes.push(newIncome)
    return newIncome
  }

  /**
   * Get income by ID
   */
  async getIncome(id: string): Promise<Income | null> {
    await this.delay()

    const income = mockIncomes.find(inc => inc.id === id)
    return income || null
  }

  /**
   * Update an existing income entry
   */
  async updateIncome(id: string, data: UpdateIncomeDTO): Promise<Income> {
    await this.delay()

    const index = mockIncomes.findIndex(inc => inc.id === id)
    if (index === -1) {
      throw new Error('Ingreso no encontrado')
    }

    // Validate update data
    this.validateIncome(data)

    // Cannot update cancelled income
    if (mockIncomes[index].status === 'cancelled') {
      throw new Error('No se puede actualizar un ingreso cancelado')
    }

    mockIncomes[index] = {
      ...mockIncomes[index],
      ...data,
      updatedAt: new Date().toISOString()
    }

    return mockIncomes[index]
  }

  /**
   * Delete an income entry
   */
  async deleteIncome(id: string): Promise<void> {
    await this.delay()

    const index = mockIncomes.findIndex(inc => inc.id === id)
    if (index === -1) {
      throw new Error('Ingreso no encontrado')
    }

    // Only pending income can be deleted
    if (mockIncomes[index].status === 'confirmed') {
      throw new Error('No se puede eliminar un ingreso confirmado. Considere cancelarlo en su lugar.')
    }

    mockIncomes.splice(index, 1)
  }

  /**
   * Get incomes by project
   */
  async getIncomesByProject(projectId: string): Promise<Income[]> {
    await this.delay()

    return mockIncomes.filter(inc => inc.projectId === projectId)
  }

  /**
   * Get income statistics
   */
  async getIncomeStats(): Promise<IncomeStats> {
    await this.delay()

    const total = mockIncomes.length
    const confirmed = mockIncomes.filter(inc => inc.status === 'confirmed').length
    const pending = mockIncomes.filter(inc => inc.status === 'pending').length
    const cancelled = mockIncomes.filter(inc => inc.status === 'cancelled').length

    const totalAmount = mockIncomes.reduce((sum, inc) => sum + inc.amount, 0)
    const confirmedAmount = mockIncomes
      .filter(inc => inc.status === 'confirmed')
      .reduce((sum, inc) => sum + inc.amount, 0)
    const pendingAmount = mockIncomes
      .filter(inc => inc.status === 'pending')
      .reduce((sum, inc) => sum + inc.amount, 0)

    const averageAmount = total > 0 ? totalAmount / total : 0

    // Group by project
    const byProject: Record<string, number> = {}
    mockIncomes.forEach(inc => {
      byProject[inc.projectId] = (byProject[inc.projectId] || 0) + inc.amount
    })

    // Group by month
    const byMonth: Record<string, number> = {}
    mockIncomes.forEach(inc => {
      const month = inc.date.substring(0, 7) // YYYY-MM
      byMonth[month] = (byMonth[month] || 0) + inc.amount
    })

    return {
      total,
      confirmed,
      pending,
      cancelled,
      totalAmount,
      confirmedAmount,
      pendingAmount,
      averageAmount,
      byProject,
      byMonth
    }
  }

  /**
   * Get all incomes (for development/testing)
   */
  async getAllIncomes(): Promise<Income[]> {
    await this.delay()
    return [...mockIncomes]
  }
}

// Export singleton instance
export const incomeService = new IncomeService()
