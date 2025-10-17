/**
 * Project Financials Service
 * 
 * Business logic for calculating and managing comprehensive financial
 * data for construction projects (Job Costing).
 */

import type {
  ProjectFinancials,
  SubcontractFinancialSummary,
  ExpenseFinancialSummary,
  RetentionSummary,
  FinancialAlert,
  CashFlowSummary,
  MonthlyCashFlow,
  EarnedValueMetrics,
  CostForecast,
  ForecastResult,
  JobCostingReport,
  CostCodeBreakdownItem,
  SubcontractReportItem,
  ExpenseReportItem,
  ChartDataPoint,
  ProfitabilityReport,
  PhaseProfit,
  MonthlyProfitability,
  UpdateProjectFinancialsDTO,
  ExportFinancialsDTO,
  FinancialHealth
} from '@/types/projectFinancials'
import { subcontractService } from './subcontractService'
import { expenseService } from './expenseService'
import { costCodeService } from './costCodeService'
import { progressCertificateService } from './progressCertificateService'

class ProjectFinancialsService {
  private baseURL = '/api/project-financials'
  private mockDelay = 500
  private financialsCache = new Map<string, ProjectFinancials>()
  private subscribers = new Map<string, Set<(financials: ProjectFinancials) => void>>()

  private async delay(ms: number = this.mockDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Calculate comprehensive project financials
   */
  async calculateProjectFinancials(projectId: string): Promise<ProjectFinancials> {
    await this.delay()

    // Get all financial data sources
    const subcontracts = await subcontractService.getSubcontractsByProject(projectId)
    const expenses = await expenseService.queryExpenses({ projectId }, 1, 1000)
    const budgets = await costCodeService.getProjectBudgets(projectId)

    // Calculate totals
    const totalBudget = budgets.reduce((sum, b) => sum + b.budgetedAmount, 0)
    const totalCommitted = subcontracts
      .filter(sc => sc.status === 'active')
      .reduce((sum, sc) => sum + sc.totalAmount, 0)
    const totalActual = expenses.data
      .filter(exp => exp.status === 'approved' || exp.status === 'paid')
      .reduce((sum, exp) => sum + exp.totalAmount, 0)

    // Calculate by category
    const budgetByCategory: Record<string, number> = {}
    const committedByCategory: Record<string, number> = {}
    const actualByCategory: Record<string, number> = {}

    budgets.forEach(budget => {
      const costCodeId = budget.costCodeId
      budgetByCategory[costCodeId] = budget.budgetedAmount
      committedByCategory[costCodeId] = budget.committedAmount
      actualByCategory[costCodeId] = budget.actualAmount
    })

    // Calculate subcontract summaries
    const subcontractDetails: SubcontractFinancialSummary[] = subcontracts.map(sc => ({
      subcontractId: sc.id,
      subcontractorName: sc.subcontractorName,
      contractNumber: sc.contractNumber,
      totalAmount: sc.totalAmount,
      certified: sc.totalCertified,
      paid: sc.totalPaid,
      retained: sc.totalRetained,
      remaining: sc.remainingBalance,
      costCodes: sc.costCodes,
      status: sc.status
    }))

    // Calculate expense summaries
    const expenseDetails: ExpenseFinancialSummary = {
      byStatus: {},
      byCostCode: {},
      bySupplier: {},
      pending: 0,
      approved: 0,
      paid: 0
    }

    expenses.data.forEach(exp => {
      expenseDetails.byStatus[exp.status] = (expenseDetails.byStatus[exp.status] || 0) + exp.totalAmount
      expenseDetails.byCostCode[exp.costCodeId] = (expenseDetails.byCostCode[exp.costCodeId] || 0) + exp.totalAmount
      expenseDetails.bySupplier[exp.supplierId] = (expenseDetails.bySupplier[exp.supplierId] || 0) + exp.totalAmount

      if (exp.status === 'pending_approval') expenseDetails.pending += exp.totalAmount
      if (exp.status === 'approved') expenseDetails.approved += exp.totalAmount
      if (exp.status === 'paid') expenseDetails.paid += exp.totalAmount
    })

    // Calculate retentions
    const totalRetained = subcontracts.reduce((sum, sc) => sum + sc.totalRetained, 0)
    const retainedBySubcontractor: Record<string, number> = {}
    const retentionDetails: RetentionSummary[] = subcontracts
      .filter(sc => sc.totalRetained > 0)
      .map(sc => {
        retainedBySubcontractor[sc.subcontractorId] = sc.totalRetained
        return {
          subcontractId: sc.id,
          subcontractorName: sc.subcontractorName,
          totalRetained: sc.totalRetained,
          released: 0, // Would come from holdback service
          pending: sc.totalRetained,
          retentionPercentage: sc.retentionPercentage
        }
      })

    // Calculate variance
    const budgetVariance = totalBudget - totalActual
    const budgetVariancePercentage = totalBudget > 0 ? (budgetVariance / totalBudget) * 100 : 0
    const committedVariance = totalBudget - totalCommitted

    // Calculate profitability
    const projectedProfit = totalBudget - (totalCommitted + totalActual)
    const projectedMargin = totalBudget > 0 ? (projectedProfit / totalBudget) * 100 : 0
    const currentMargin = totalBudget > 0 ? ((totalBudget - totalActual) / totalBudget) * 100 : 0

    // Determine financial health
    const financialHealth = this.determineFinancialHealth(
      budgetVariancePercentage,
      projectedMargin,
      totalActual,
      totalBudget
    )

    // Generate alerts
    const alerts = this.generateFinancialAlerts(
      budgets,
      totalActual,
      totalBudget,
      projectedMargin
    )

    // Calculate progress
    const percentageComplete = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0
    const earnedValue = totalBudget * (percentageComplete / 100)

    // Forecasting
    const estimatedFinalCost = totalActual + totalCommitted
    const costToComplete = estimatedFinalCost - totalActual
    const estimateAtCompletion = totalActual + costToComplete
    const varianceAtCompletion = totalBudget - estimateAtCompletion

    // Cash flow (simplified)
    const cashFlow: CashFlowSummary = {
      inflows: 0, // Would come from client payments
      outflows: expenses.data.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.totalAmount, 0),
      netCashFlow: 0,
      pendingInflows: 0,
      pendingOutflows: expenses.data.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.totalAmount, 0),
      projectedCashFlow: 0,
      monthlyBreakdown: []
    }

    const financials: ProjectFinancials = {
      projectId,
      projectName: '', // Would be fetched from project service
      totalBudget,
      budgetByCategory,
      budgetByCostCode: budgets,
      totalCommitted,
      committedByCategory,
      activeSubcontracts: subcontracts.filter(sc => sc.status === 'active').length,
      subcontractDetails,
      totalActual,
      actualByCategory,
      totalExpenses: expenses.data.reduce((sum, e) => sum + e.totalAmount, 0),
      totalPayments: subcontracts.reduce((sum, sc) => sum + sc.totalPaid, 0),
      expenseDetails,
      totalRetained,
      retainedBySubcontractor,
      retentionDetails,
      budgetVariance,
      budgetVariancePercentage,
      committedVariance,
      projectedProfit,
      projectedMargin,
      currentMargin,
      financialHealth,
      alerts,
      percentageComplete,
      earnedValue,
      estimatedFinalCost,
      costToComplete,
      estimateAtCompletion,
      varianceAtCompletion,
      cashFlow,
      lastUpdated: new Date().toISOString(),
      calculatedAt: new Date().toISOString(),
      calculatedBy: 'system'
    }

    // Cache the result
    this.financialsCache.set(projectId, financials)

    // Notify subscribers
    this.notifySubscribers(projectId, financials)

    return financials
  }

  /**
   * Determine financial health based on metrics
   */
  private determineFinancialHealth(
    variancePercentage: number,
    margin: number,
    actual: number,
    budget: number
  ): FinancialHealth {
    const utilization = budget > 0 ? (actual / budget) * 100 : 0

    if (utilization > 100 || margin < 0) {
      return 'critical'
    } else if (utilization > 95 || margin < 5) {
      return 'warning'
    } else if (utilization > 85 || margin < 10) {
      return 'good'
    } else {
      return 'excellent'
    }
  }

  /**
   * Generate financial alerts
   */
  private generateFinancialAlerts(
    budgets: any[],
    totalActual: number,
    totalBudget: number,
    margin: number
  ): FinancialAlert[] {
    const alerts: FinancialAlert[] = []

    // Budget exceeded alert
    if (totalActual > totalBudget) {
      alerts.push({
        id: `alert-${Date.now()}-1`,
        type: 'budget_exceeded',
        severity: 'critical',
        title: 'Budget Exceeded',
        message: `Project has exceeded total budget by ${((totalActual - totalBudget) / totalBudget * 100).toFixed(1)}%`,
        amount: totalActual - totalBudget,
        createdAt: new Date().toISOString(),
        acknowledged: false
      })
    }

    // High utilization alert
    const utilization = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0
    if (utilization > 90 && utilization <= 100) {
      alerts.push({
        id: `alert-${Date.now()}-2`,
        type: 'high_utilization',
        severity: 'high',
        title: 'High Budget Utilization',
        message: `Project has used ${utilization.toFixed(1)}% of budget`,
        createdAt: new Date().toISOString(),
        acknowledged: false
      })
    }

    // Negative margin alert
    if (margin < 0) {
      alerts.push({
        id: `alert-${Date.now()}-3`,
        type: 'negative_margin',
        severity: 'critical',
        title: 'Negative Profit Margin',
        message: `Project margin is ${margin.toFixed(1)}%`,
        createdAt: new Date().toISOString(),
        acknowledged: false
      })
    }

    // Cost code over budget alerts
    budgets.forEach(budget => {
      if (budget.status === 'over_budget') {
        alerts.push({
          id: `alert-${Date.now()}-cc-${budget.id}`,
          type: 'budget_exceeded',
          severity: 'high',
          title: 'Cost Code Over Budget',
          message: `${budget.costCode.name} has exceeded budget`,
          affectedCostCode: budget.costCodeId,
          amount: budget.actualAmount - budget.budgetedAmount,
          createdAt: new Date().toISOString(),
          acknowledged: false
        })
      }
    })

    return alerts
  }

  /**
   * Get cached financials or calculate if not cached
   */
  async getProjectFinancials(projectId: string): Promise<ProjectFinancials> {
    const cached = this.financialsCache.get(projectId)
    if (cached) {
      return cached
    }
    return this.calculateProjectFinancials(projectId)
  }

  /**
   * Subscribe to financial updates for a project
   */
  subscribeToFinancialUpdates(
    projectId: string,
    callback: (financials: ProjectFinancials) => void
  ): () => void {
    if (!this.subscribers.has(projectId)) {
      this.subscribers.set(projectId, new Set())
    }
    this.subscribers.get(projectId)!.add(callback)

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(projectId)
      if (subs) {
        subs.delete(callback)
      }
    }
  }

  /**
   * Notify all subscribers of financial updates
   */
  private notifySubscribers(projectId: string, financials: ProjectFinancials): void {
    const subs = this.subscribers.get(projectId)
    if (subs) {
      subs.forEach(callback => callback(financials))
    }
  }

  /**
   * Force recalculation of project financials
   */
  async refreshProjectFinancials(projectId: string): Promise<ProjectFinancials> {
    this.financialsCache.delete(projectId)
    return this.calculateProjectFinancials(projectId)
  }

  /**
   * Generate job costing report
   */
  async generateJobCostingReport(projectId: string): Promise<JobCostingReport> {
    await this.delay()

    const financials = await this.getProjectFinancials(projectId)
    const subcontracts = await subcontractService.getSubcontractsByProject(projectId)
    const expenses = await expenseService.queryExpenses({ projectId }, 1, 1000)

    // Cost breakdown by cost code
    const costBreakdown: CostCodeBreakdownItem[] = financials.budgetByCostCode.map(budget => {
      // Map budget status to report status
      let status: 'under_budget' | 'on_budget' | 'over_budget' = 'under_budget'
      if (budget.status === 'over_budget') status = 'over_budget'
      else if (budget.status === 'on_budget' || budget.status === 'critical') status = 'on_budget'
      
      return {
        costCode: budget.costCode.code,
        costCodeName: budget.costCode.name,
        budgeted: budget.budgetedAmount,
        committed: budget.committedAmount,
        actual: budget.actualAmount,
        variance: budget.variance,
        variancePercentage: budget.variancePercentage,
        percentageComplete: budget.percentageComplete,
        status
      }
    })

    // Subcontract report items
    const subcontractItems: SubcontractReportItem[] = subcontracts.map(sc => ({
      contractNumber: sc.contractNumber,
      subcontractor: sc.subcontractorName,
      description: sc.description,
      totalAmount: sc.totalAmount,
      certified: sc.totalCertified,
      paid: sc.totalPaid,
      retained: sc.totalRetained,
      remaining: sc.remainingBalance,
      status: sc.status,
      costCodes: sc.costCodes
    }))

    // Expense report items
    const expenseItems: ExpenseReportItem[] = expenses.data.map(exp => ({
      date: exp.invoiceDate,
      supplier: exp.supplierName,
      description: exp.description,
      costCode: exp.costCode.code,
      amount: exp.totalAmount,
      status: exp.status,
      invoiceNumber: exp.invoiceNumber
    }))

    // Chart data
    const budgetVsActual: ChartDataPoint[] = [
      { label: 'Budgeted', value: financials.totalBudget, color: '#3b82f6' },
      { label: 'Committed', value: financials.totalCommitted, color: '#f59e0b' },
      { label: 'Actual', value: financials.totalActual, color: '#10b981' }
    ]

    const costByCategory: ChartDataPoint[] = Object.entries(financials.actualByCategory).map(([code, amount]) => {
      const budget = financials.budgetByCostCode.find(b => b.costCodeId === code)
      return {
        label: budget?.costCode.name || code,
        value: amount,
        category: budget?.costCode.division
      }
    })

    const report: JobCostingReport = {
      project: {
        id: projectId,
        name: financials.projectName,
        client: '',
        startDate: '',
        endDate: '',
        status: 'active'
      },
      summary: financials,
      costBreakdown,
      subcontracts: subcontractItems,
      expenses: expenseItems,
      charts: {
        budgetVsActual,
        costByCategory,
        monthlySpend: [],
        profitabilityTrend: []
      },
      generatedAt: new Date().toISOString(),
      generatedBy: 'system',
      reportPeriod: {
        from: '',
        to: new Date().toISOString()
      }
    }

    return report
  }

  /**
   * Forecast final cost
   */
  async forecastFinalCost(projectId: string): Promise<CostForecast> {
    await this.delay()

    const financials = await this.getProjectFinancials(projectId)

    // Forecast by trend (simple linear projection)
    const trendForecast: ForecastResult = {
      estimatedFinalCost: financials.estimatedFinalCost,
      costToComplete: financials.costToComplete,
      projectedVariance: financials.varianceAtCompletion,
      projectedMargin: financials.projectedMargin,
      method: 'Trend Analysis'
    }

    // Forecast by EVM
    const cpi = financials.earnedValue > 0 ? financials.totalActual / financials.earnedValue : 1
    const evmEstimate = financials.totalBudget / cpi
    const evmForecast: ForecastResult = {
      estimatedFinalCost: evmEstimate,
      costToComplete: evmEstimate - financials.totalActual,
      projectedVariance: financials.totalBudget - evmEstimate,
      projectedMargin: financials.totalBudget > 0 ? ((financials.totalBudget - evmEstimate) / financials.totalBudget) * 100 : 0,
      method: 'Earned Value Management'
    }

    // Forecast by commitments
    const commitmentsForecast: ForecastResult = {
      estimatedFinalCost: financials.totalActual + financials.totalCommitted,
      costToComplete: financials.totalCommitted,
      projectedVariance: financials.totalBudget - (financials.totalActual + financials.totalCommitted),
      projectedMargin: financials.totalBudget > 0 
        ? ((financials.totalBudget - (financials.totalActual + financials.totalCommitted)) / financials.totalBudget) * 100 
        : 0,
      method: 'Committed Costs'
    }

    const forecast: CostForecast = {
      projectId,
      currentBudget: financials.totalBudget,
      currentActual: financials.totalActual,
      currentCommitted: financials.totalCommitted,
      percentageComplete: financials.percentageComplete,
      forecastByTrend: trendForecast,
      forecastByEVM: evmForecast,
      forecastByCommitments: commitmentsForecast,
      recommendedForecast: commitmentsForecast, // Most conservative
      confidenceLevel: 0.75,
      bestCase: trendForecast,
      worstCase: evmForecast,
      mostLikely: commitmentsForecast,
      forecastDate: new Date().toISOString(),
      assumptions: [
        'All committed costs will be realized',
        'No additional subcontracts will be added',
        'Current cost trends will continue'
      ]
    }

    return forecast
  }

  /**
   * Update project financials (trigger recalculation)
   */
  async updateProjectFinancials(data: UpdateProjectFinancialsDTO): Promise<ProjectFinancials> {
    if (data.recalculate) {
      return this.refreshProjectFinancials(data.projectId)
    }
    return this.getProjectFinancials(data.projectId)
  }

  /**
   * Export financials to different formats
   */
  async exportFinancials(data: ExportFinancialsDTO): Promise<Blob> {
    await this.delay()

    // In production, this would generate actual PDF/Excel files
    const report = await this.generateJobCostingReport(data.projectId)
    const jsonData = JSON.stringify(report, null, 2)
    
    return new Blob([jsonData], { type: 'application/json' })
  }
}

// Export singleton instance
export const projectFinancialsService = new ProjectFinancialsService()
