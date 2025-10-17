/**
 * Project Financials Types
 * 
 * Defines the data structures for comprehensive financial tracking
 * and analysis of construction projects (Job Costing).
 */

import type { CostCodeBudget } from './costCodes'

/**
 * Financial health status of a project
 */
export type FinancialHealth = 'excellent' | 'good' | 'warning' | 'critical'

/**
 * Project Financials
 * 
 * Comprehensive financial data for a project including budget,
 * committed costs, actual costs, and profitability analysis.
 */
export interface ProjectFinancials {
  // Project Reference
  projectId: string
  projectName: string
  
  // Budget
  totalBudget: number
  budgetByCategory: Record<string, number> // Cost code ID -> budgeted amount
  budgetByCostCode: CostCodeBudget[] // Detailed budget breakdown
  
  // Committed Costs (from active subcontracts)
  totalCommitted: number
  committedByCategory: Record<string, number> // Cost code ID -> committed amount
  activeSubcontracts: number
  subcontractDetails: SubcontractFinancialSummary[]
  
  // Actual Costs (from expenses and payments)
  totalActual: number
  actualByCategory: Record<string, number> // Cost code ID -> actual amount
  totalExpenses: number
  totalPayments: number
  expenseDetails: ExpenseFinancialSummary
  
  // Holdbacks/Retentions
  totalRetained: number
  retainedBySubcontractor: Record<string, number> // Subcontractor ID -> retained amount
  retentionDetails: RetentionSummary[]
  
  // Variance Analysis
  budgetVariance: number // totalBudget - totalActual
  budgetVariancePercentage: number // (budgetVariance / totalBudget) * 100
  committedVariance: number // totalBudget - totalCommitted
  
  // Profitability
  projectedProfit: number // totalBudget - (totalCommitted + totalActual)
  projectedMargin: number // (projectedProfit / totalBudget) * 100
  currentMargin: number // ((totalBudget - totalActual) / totalBudget) * 100
  
  // Status
  financialHealth: FinancialHealth
  alerts: FinancialAlert[]
  
  // Progress
  percentageComplete: number // Based on actual costs vs budget
  earnedValue: number // Budgeted cost of work performed
  
  // Forecasting
  estimatedFinalCost: number // Projected total cost at completion
  costToComplete: number // Estimated remaining cost
  estimateAtCompletion: number // EAC = Actual + Cost to Complete
  varianceAtCompletion: number // Budget - EAC
  
  // Cash Flow
  cashFlow: CashFlowSummary
  
  // Metadata
  lastUpdated: string // ISO date string
  calculatedAt: string // ISO date string
  calculatedBy?: string // User ID or 'system'
}

/**
 * Summary of a subcontract's financial impact
 */
export interface SubcontractFinancialSummary {
  subcontractId: string
  subcontractorName: string
  contractNumber: string
  totalAmount: number
  certified: number
  paid: number
  retained: number
  remaining: number
  costCodes: string[] // Cost code IDs
  status: string
}

/**
 * Summary of expenses by category
 */
export interface ExpenseFinancialSummary {
  byStatus: Record<string, number> // Status -> total amount
  byCostCode: Record<string, number> // Cost code ID -> total amount
  bySupplier: Record<string, number> // Supplier ID -> total amount
  pending: number
  approved: number
  paid: number
}

/**
 * Summary of retention/holdback amounts
 */
export interface RetentionSummary {
  subcontractId: string
  subcontractorName: string
  totalRetained: number
  released: number
  pending: number
  retentionPercentage: number
}

/**
 * Financial alert for project issues
 */
export interface FinancialAlert {
  id: string
  type: 'budget_exceeded' | 'high_utilization' | 'negative_margin' | 'overdue_payment' | 'retention_due'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  affectedCostCode?: string
  affectedSubcontract?: string
  amount?: number
  createdAt: string
  acknowledged: boolean
}

/**
 * Cash flow summary
 */
export interface CashFlowSummary {
  inflows: number // Payments received from client
  outflows: number // Payments made to suppliers/subcontractors
  netCashFlow: number // inflows - outflows
  pendingInflows: number // Invoices not yet paid by client
  pendingOutflows: number // Expenses/certificates not yet paid
  projectedCashFlow: number
  monthlyBreakdown: MonthlyCashFlow[]
}

export interface MonthlyCashFlow {
  month: string // YYYY-MM format
  inflows: number
  outflows: number
  netCashFlow: number
}

/**
 * Earned Value Metrics (EVM)
 * 
 * Standard project management metrics for cost and schedule performance
 */
export interface EarnedValueMetrics {
  // Planned Value (PV) - Budgeted cost of work scheduled
  plannedValue: number
  
  // Earned Value (EV) - Budgeted cost of work performed
  earnedValue: number
  
  // Actual Cost (AC) - Actual cost of work performed
  actualCost: number
  
  // Cost Variance (CV) = EV - AC
  costVariance: number
  
  // Schedule Variance (SV) = EV - PV
  scheduleVariance: number
  
  // Cost Performance Index (CPI) = EV / AC
  costPerformanceIndex: number
  
  // Schedule Performance Index (SPI) = EV / PV
  schedulePerformanceIndex: number
  
  // Estimate at Completion (EAC) = Budget / CPI
  estimateAtCompletion: number
  
  // Estimate to Complete (ETC) = EAC - AC
  estimateToComplete: number
  
  // Variance at Completion (VAC) = Budget - EAC
  varianceAtCompletion: number
  
  // To Complete Performance Index (TCPI) = (Budget - EV) / (Budget - AC)
  toCompletePerformanceIndex: number
}

/**
 * Cost forecast for project completion
 */
export interface CostForecast {
  projectId: string
  
  // Current State
  currentBudget: number
  currentActual: number
  currentCommitted: number
  percentageComplete: number
  
  // Forecast Methods
  forecastByTrend: ForecastResult
  forecastByEVM: ForecastResult
  forecastByCommitments: ForecastResult
  
  // Recommended Forecast
  recommendedForecast: ForecastResult
  confidenceLevel: number // 0-1
  
  // Scenarios
  bestCase: ForecastResult
  worstCase: ForecastResult
  mostLikely: ForecastResult
  
  // Metadata
  forecastDate: string
  assumptions: string[]
}

export interface ForecastResult {
  estimatedFinalCost: number
  costToComplete: number
  projectedVariance: number
  projectedMargin: number
  completionDate?: string
  method: string
}

/**
 * Job Costing Report
 * 
 * Comprehensive report of all costs for a project
 */
export interface JobCostingReport {
  project: {
    id: string
    name: string
    client: string
    startDate: string
    endDate: string
    status: string
  }
  
  // Financial Summary
  summary: ProjectFinancials
  
  // Cost Breakdown by Cost Code
  costBreakdown: CostCodeBreakdownItem[]
  
  // Subcontracts
  subcontracts: SubcontractReportItem[]
  
  // Expenses
  expenses: ExpenseReportItem[]
  
  // Charts Data
  charts: {
    budgetVsActual: ChartDataPoint[]
    costByCategory: ChartDataPoint[]
    monthlySpend: ChartDataPoint[]
    profitabilityTrend: ChartDataPoint[]
  }
  
  // Metadata
  generatedAt: string
  generatedBy: string
  reportPeriod: {
    from: string
    to: string
  }
}

export interface CostCodeBreakdownItem {
  costCode: string
  costCodeName: string
  budgeted: number
  committed: number
  actual: number
  variance: number
  variancePercentage: number
  percentageComplete: number
  status: 'under_budget' | 'on_budget' | 'over_budget'
}

export interface SubcontractReportItem {
  contractNumber: string
  subcontractor: string
  description: string
  totalAmount: number
  certified: number
  paid: number
  retained: number
  remaining: number
  status: string
  costCodes: string[]
}

export interface ExpenseReportItem {
  date: string
  supplier: string
  description: string
  costCode: string
  amount: number
  status: string
  invoiceNumber?: string
}

export interface ChartDataPoint {
  label: string
  value: number
  category?: string
  color?: string
}

/**
 * Profitability Report
 * 
 * Focused report on project profitability and margins
 */
export interface ProfitabilityReport {
  projectId: string
  projectName: string
  
  // Revenue
  contractValue: number
  additionalRevenue: number
  totalRevenue: number
  
  // Costs
  directCosts: number
  indirectCosts: number
  totalCosts: number
  
  // Profit
  grossProfit: number
  grossMargin: number
  netProfit: number
  netMargin: number
  
  // Breakdown
  costsByType: Record<string, number>
  profitByPhase: PhaseProfit[]
  
  // Trends
  monthlyProfitability: MonthlyProfitability[]
  
  // Metadata
  generatedAt: string
}

export interface PhaseProfit {
  phase: string
  revenue: number
  cost: number
  profit: number
  margin: number
}

export interface MonthlyProfitability {
  month: string
  revenue: number
  cost: number
  profit: number
  margin: number
  cumulativeProfit: number
}

/**
 * DTO for updating project financials
 */
export interface UpdateProjectFinancialsDTO {
  projectId: string
  recalculate?: boolean // Force recalculation of all values
}

/**
 * DTO for exporting financial reports
 */
export interface ExportFinancialsDTO {
  projectId: string
  format: 'pdf' | 'excel' | 'csv'
  reportType: 'job_costing' | 'profitability' | 'cash_flow' | 'comprehensive'
  includeCharts?: boolean
  includeCostBreakdown?: boolean
  includeSubcontracts?: boolean
  includeExpenses?: boolean
  dateRange?: {
    from: string
    to: string
  }
}
