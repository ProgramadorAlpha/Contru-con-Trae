/**
 * Cost Code Service
 * 
 * Business logic for managing the Work Breakdown Structure (WBS)
 * and cost classification system for construction projects.
 */

import type {
  CostCode,
  CostCodeBudget,
  CreateCostCodeDTO,
  UpdateCostCodeDTO,
  CreateCostCodeBudgetDTO,
  UpdateCostCodeBudgetDTO,
  CostCodeHierarchy,
  CostCodeDivision,
  CostCodeCategory,
  CostCodeSubcategory,
  CostCodeSummary,
  CostCodeStats,
  CostCodeFilters,
  CostCodeResponse,
  CostType,
  BudgetStatus
} from '@/types/costCodes'
import { DEFAULT_COST_CODES } from '@/types/costCodes'

// Mock data for development
const mockCostCodes: CostCode[] = []
const mockCostCodeBudgets: CostCodeBudget[] = []

class CostCodeService {
  private baseURL = '/api/cost-codes'
  private mockDelay = 400
  private initialized = false

  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateId(): string {
    return `CC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Initialize cost code catalog with predefined codes
   */
  async initializeCatalog(): Promise<void> {
    if (this.initialized || mockCostCodes.length > 0) {
      return
    }

    await this.delay()

    // Load default cost codes
    DEFAULT_COST_CODES.forEach(code => {
      mockCostCodes.push({
        ...code,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    })

    this.initialized = true
  }

  /**
   * Create a new cost code
   */
  async createCostCode(data: CreateCostCodeDTO): Promise<CostCode> {
    await this.delay()

    // Validate code uniqueness
    const existing = mockCostCodes.find(cc => cc.code === data.code)
    if (existing) {
      throw new Error(`Cost code ${data.code} already exists`)
    }

    const newCostCode: CostCode = {
      id: this.generateId(),
      code: data.code,
      name: data.name,
      description: data.description,
      division: data.division,
      category: data.category,
      subcategory: data.subcategory,
      type: data.type,
      unit: data.unit,
      isActive: data.isActive ?? true,
      isDefault: data.isDefault ?? false,
      notes: data.notes,
      tags: data.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockCostCodes.push(newCostCode)
    return newCostCode
  }

  /**
   * Get cost code by ID
   */
  async getCostCode(id: string): Promise<CostCode | null> {
    await this.delay(100)

    const costCode = mockCostCodes.find(cc => cc.id === id)
    return costCode || null
  }

  /**
   * Get cost code by code string
   */
  async getCostCodeByCode(code: string): Promise<CostCode | null> {
    await this.delay(100)

    const costCode = mockCostCodes.find(cc => cc.code === code)
    return costCode || null
  }

  /**
   * Update an existing cost code
   */
  async updateCostCode(id: string, data: UpdateCostCodeDTO): Promise<CostCode> {
    await this.delay()

    const index = mockCostCodes.findIndex(cc => cc.id === id)
    if (index === -1) {
      throw new Error('Cost code not found')
    }

    mockCostCodes[index] = {
      ...mockCostCodes[index],
      ...data,
      updatedAt: new Date().toISOString()
    }

    return mockCostCodes[index]
  }

  /**
   * Delete a cost code (only if not used in any budget)
   */
  async deleteCostCode(id: string): Promise<void> {
    await this.delay()

    const index = mockCostCodes.findIndex(cc => cc.id === id)
    if (index === -1) {
      throw new Error('Cost code not found')
    }

    // Check if cost code is used in any budget
    const usedInBudget = mockCostCodeBudgets.some(budget => budget.costCodeId === id)
    if (usedInBudget) {
      throw new Error('Cannot delete cost code that is used in project budgets')
    }

    mockCostCodes.splice(index, 1)
  }

  /**
   * Get all active cost codes
   */
  async getActiveCostCodes(): Promise<CostCode[]> {
    await this.delay()

    return mockCostCodes.filter(cc => cc.isActive)
  }

  /**
   * Query cost codes with filters
   */
  async queryCostCodes(filters?: CostCodeFilters): Promise<CostCodeResponse> {
    await this.delay()

    let filtered = [...mockCostCodes]

    if (filters) {
      if (filters.division) {
        filtered = filtered.filter(cc => cc.division === filters.division)
      }

      if (filters.category) {
        filtered = filtered.filter(cc => cc.category === filters.category)
      }

      if (filters.type) {
        filtered = filtered.filter(cc => cc.type === filters.type)
      }

      if (filters.isActive !== undefined) {
        filtered = filtered.filter(cc => cc.isActive === filters.isActive)
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(cc =>
          cc.code.toLowerCase().includes(searchLower) ||
          cc.name.toLowerCase().includes(searchLower) ||
          cc.description.toLowerCase().includes(searchLower)
        )
      }

      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(cc =>
          cc.tags && filters.tags!.some(tag => cc.tags!.includes(tag))
        )
      }
    }

    // Build hierarchy
    const hierarchy = this.buildHierarchy(filtered)

    return {
      data: filtered,
      total: filtered.length,
      hierarchy
    }
  }

  /**
   * Build hierarchical structure from cost codes
   */
  private buildHierarchy(costCodes: CostCode[]): CostCodeHierarchy {
    const divisionsMap = new Map<string, CostCodeDivision>()

    costCodes.forEach(cc => {
      // Get or create division
      if (!divisionsMap.has(cc.division)) {
        divisionsMap.set(cc.division, {
          code: cc.division,
          name: cc.division,
          categories: []
        })
      }
      const division = divisionsMap.get(cc.division)!

      // Get or create category
      let category = division.categories.find(cat => cat.code === cc.category)
      if (!category) {
        category = {
          code: cc.category,
          name: cc.category,
          subcategories: []
        }
        division.categories.push(category)
      }

      // Add subcategory
      if (cc.subcategory) {
        const subcategory: CostCodeSubcategory = {
          id: cc.id,
          code: cc.code,
          name: cc.name,
          type: cc.type,
          unit: cc.unit,
          isActive: cc.isActive
        }
        category.subcategories.push(subcategory)
      }
    })

    return {
      divisions: Array.from(divisionsMap.values())
    }
  }

  /**
   * Get cost code hierarchy for display
   */
  async getCostCodeHierarchy(): Promise<CostCodeHierarchy> {
    await this.delay()

    const activeCostCodes = mockCostCodes.filter(cc => cc.isActive)
    return this.buildHierarchy(activeCostCodes)
  }

  /**
   * Get cost code statistics
   */
  async getCostCodeStats(): Promise<CostCodeStats> {
    await this.delay()

    const total = mockCostCodes.length
    const active = mockCostCodes.filter(cc => cc.isActive).length
    const inactive = total - active

    // Count by type
    const byType: Record<CostType, number> = {
      labor: 0,
      material: 0,
      equipment: 0,
      subcontract: 0,
      other: 0
    }
    mockCostCodes.forEach(cc => {
      byType[cc.type]++
    })

    // Count by division
    const byDivision: Record<string, number> = {}
    mockCostCodes.forEach(cc => {
      byDivision[cc.division] = (byDivision[cc.division] || 0) + 1
    })

    return {
      total,
      active,
      inactive,
      byType,
      byDivision
    }
  }

  /**
   * Create cost code budget for a project
   */
  async createCostCodeBudget(data: CreateCostCodeBudgetDTO): Promise<CostCodeBudget> {
    await this.delay()

    // Validate cost code exists
    const costCode = await this.getCostCode(data.costCodeId)
    if (!costCode) {
      throw new Error('Cost code not found')
    }

    // Check if budget already exists for this project and cost code
    const existing = mockCostCodeBudgets.find(
      budget => budget.projectId === data.projectId && budget.costCodeId === data.costCodeId
    )
    if (existing) {
      throw new Error('Budget already exists for this cost code in this project')
    }

    const budgetedAmount = data.budgetedQuantity * data.budgetedUnitPrice

    const newBudget: CostCodeBudget = {
      id: this.generateId(),
      projectId: data.projectId,
      costCodeId: data.costCodeId,
      costCode,
      budgetedQuantity: data.budgetedQuantity,
      budgetedUnitPrice: data.budgetedUnitPrice,
      budgetedAmount,
      committedAmount: 0,
      committedQuantity: 0,
      actualAmount: 0,
      actualQuantity: 0,
      variance: budgetedAmount,
      variancePercentage: 0,
      status: 'under_budget',
      percentageComplete: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastCalculatedAt: new Date().toISOString()
    }

    mockCostCodeBudgets.push(newBudget)
    return newBudget
  }

  /**
   * Get cost code budget by ID
   */
  async getCostCodeBudget(id: string): Promise<CostCodeBudget | null> {
    await this.delay(100)

    const budget = mockCostCodeBudgets.find(b => b.id === id)
    return budget || null
  }

  /**
   * Get all budgets for a project
   */
  async getProjectBudgets(projectId: string): Promise<CostCodeBudget[]> {
    await this.delay()

    return mockCostCodeBudgets.filter(budget => budget.projectId === projectId)
  }

  /**
   * Update cost code budget
   */
  async updateCostCodeBudget(id: string, data: UpdateCostCodeBudgetDTO): Promise<CostCodeBudget> {
    await this.delay()

    const index = mockCostCodeBudgets.findIndex(b => b.id === id)
    if (index === -1) {
      throw new Error('Cost code budget not found')
    }

    const budget = mockCostCodeBudgets[index]

    // Update budgeted values if provided
    if (data.budgetedQuantity !== undefined) {
      budget.budgetedQuantity = data.budgetedQuantity
    }
    if (data.budgetedUnitPrice !== undefined) {
      budget.budgetedUnitPrice = data.budgetedUnitPrice
    }

    // Recalculate budgeted amount
    budget.budgetedAmount = budget.budgetedQuantity * budget.budgetedUnitPrice

    // Recalculate variance and status
    this.recalculateBudgetMetrics(budget)

    budget.updatedAt = new Date().toISOString()
    budget.lastCalculatedAt = new Date().toISOString()

    return budget
  }

  /**
   * Update budget actuals when expenses are created
   */
  async updateBudgetActuals(
    projectId: string,
    costCodeId: string,
    amount: number,
    quantity?: number
  ): Promise<CostCodeBudget | null> {
    await this.delay(100)

    const budget = mockCostCodeBudgets.find(
      b => b.projectId === projectId && b.costCodeId === costCodeId
    )

    if (!budget) {
      // Budget doesn't exist yet, return null
      return null
    }

    // Update actual amounts
    budget.actualAmount += amount
    if (quantity !== undefined && budget.actualQuantity !== undefined) {
      budget.actualQuantity += quantity
    }

    // Recalculate metrics
    this.recalculateBudgetMetrics(budget)

    budget.updatedAt = new Date().toISOString()
    budget.lastCalculatedAt = new Date().toISOString()

    return budget
  }

  /**
   * Update budget committed costs when subcontracts are created
   */
  async updateBudgetCommitted(
    projectId: string,
    costCodeId: string,
    amount: number,
    quantity?: number
  ): Promise<CostCodeBudget | null> {
    await this.delay(100)

    const budget = mockCostCodeBudgets.find(
      b => b.projectId === projectId && b.costCodeId === costCodeId
    )

    if (!budget) {
      return null
    }

    // Update committed amounts
    budget.committedAmount += amount
    if (quantity !== undefined && budget.committedQuantity !== undefined) {
      budget.committedQuantity += quantity
    }

    // Recalculate metrics
    this.recalculateBudgetMetrics(budget)

    budget.updatedAt = new Date().toISOString()
    budget.lastCalculatedAt = new Date().toISOString()

    return budget
  }

  /**
   * Recalculate budget metrics (variance, status, percentage)
   */
  private recalculateBudgetMetrics(budget: CostCodeBudget): void {
    // Calculate variance
    budget.variance = budget.budgetedAmount - budget.actualAmount
    budget.variancePercentage = budget.budgetedAmount > 0
      ? (budget.variance / budget.budgetedAmount) * 100
      : 0

    // Calculate percentage complete
    budget.percentageComplete = budget.budgetedAmount > 0
      ? (budget.actualAmount / budget.budgetedAmount) * 100
      : 0

    // Determine status
    if (budget.actualAmount > budget.budgetedAmount) {
      budget.status = 'over_budget'
    } else if (budget.actualAmount >= budget.budgetedAmount * 0.95) {
      budget.status = 'critical'
    } else if (budget.actualAmount >= budget.budgetedAmount * 0.85) {
      budget.status = 'on_budget'
    } else {
      budget.status = 'under_budget'
    }
  }

  /**
   * Get cost code summary for reporting
   */
  async getCostCodeSummary(projectId: string, costCodeId: string): Promise<CostCodeSummary | null> {
    await this.delay()

    const costCode = await this.getCostCode(costCodeId)
    if (!costCode) {
      return null
    }

    const budget = mockCostCodeBudgets.find(
      b => b.projectId === projectId && b.costCodeId === costCodeId
    )

    if (!budget) {
      return null
    }

    // In a real implementation, these would query actual data
    const summary: CostCodeSummary = {
      costCode,
      budget,
      subcontracts: {
        count: 0,
        totalAmount: budget.committedAmount
      },
      expenses: {
        count: 0,
        totalAmount: budget.actualAmount
      },
      payments: {
        count: 0,
        totalAmount: 0
      },
      utilizationPercentage: budget.budgetedAmount > 0
        ? (budget.actualAmount / budget.budgetedAmount) * 100
        : 0,
      remainingBudget: budget.budgetedAmount - budget.actualAmount,
      projectedFinalCost: budget.actualAmount + budget.committedAmount,
      monthlySpend: [] // Would be calculated from actual data
    }

    return summary
  }

  /**
   * Suggest cost codes based on description (for auto-classification)
   */
  async suggestCostCodes(description: string, limit: number = 5): Promise<CostCode[]> {
    await this.delay(100)

    const descriptionLower = description.toLowerCase()
    const activeCostCodes = mockCostCodes.filter(cc => cc.isActive)

    // Simple keyword matching - in production, this could use ML/NLP
    const scored = activeCostCodes.map(cc => {
      let score = 0

      // Check if description contains cost code name
      if (descriptionLower.includes(cc.name.toLowerCase())) {
        score += 10
      }

      // Check if description contains cost code description keywords
      const descWords = cc.description.toLowerCase().split(' ')
      descWords.forEach(word => {
        if (word.length > 3 && descriptionLower.includes(word)) {
          score += 2
        }
      })

      // Check tags
      if (cc.tags) {
        cc.tags.forEach(tag => {
          if (descriptionLower.includes(tag.toLowerCase())) {
            score += 5
          }
        })
      }

      return { costCode: cc, score }
    })

    // Sort by score and return top matches
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.costCode)
  }

  /**
   * Delete cost code budget
   */
  async deleteCostCodeBudget(id: string): Promise<void> {
    await this.delay()

    const index = mockCostCodeBudgets.findIndex(b => b.id === id)
    if (index === -1) {
      throw new Error('Cost code budget not found')
    }

    // Check if budget has actual costs
    if (mockCostCodeBudgets[index].actualAmount > 0) {
      throw new Error('Cannot delete budget with actual costs')
    }

    mockCostCodeBudgets.splice(index, 1)
  }
}

// Export singleton instance
export const costCodeService = new CostCodeService()

// Initialize catalog on module load
costCodeService.initializeCatalog()
