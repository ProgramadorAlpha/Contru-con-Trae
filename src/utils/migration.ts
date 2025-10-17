/**
 * Migration Utilities
 * 
 * Utilities for migrating existing data to support the Job Costing system.
 * These can be used programmatically or called from migration scripts.
 * 
 * Requirements: 3.1, 9.5
 */

import type { Project } from '@/types/projects'
import type { Expense } from '@/types/expenses'
import type { CostCode } from '@/types/costCodes'
import { DEFAULT_COST_CODES } from '@/types/costCodes'

/**
 * Migration result interface
 */
export interface MigrationResult {
  success: boolean
  costCodes: CostCode[]
  projects: Project[]
  expenses: Expense[]
  stats: {
    costCodesCreated: number
    projectsMigrated: number
    expensesMigrated: number
    expensesNeedingReview: number
  }
  errors: string[]
  warnings: string[]
}

/**
 * Generate a unique ID
 */
function generateId(prefix: string = 'ID'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Initialize cost code catalog with default codes
 */
export function initializeCostCodeCatalog(): CostCode[] {
  const now = new Date().toISOString()
  
  return DEFAULT_COST_CODES.map(code => ({
    ...code,
    id: generateId('CC'),
    createdAt: now,
    updatedAt: now
  }))
}

/**
 * Migrate a single project to add financial fields
 */
export function migrateProject(project: Partial<Project>): Project {
  const now = new Date().toISOString()
  
  return {
    ...project,
    
    // Ensure required fields
    id: project.id || generateId('PRJ'),
    name: project.name || 'Untitled Project',
    code: project.code || `PRJ-${Date.now()}`,
    description: project.description || '',
    client: project.client || '',
    location: project.location || '',
    startDate: project.startDate || now,
    endDate: project.endDate || now,
    status: project.status || 'planning',
    progress: project.progress || 0,
    
    // Financial Overview (initialize if missing)
    totalBudget: project.totalBudget || 0,
    committedCost: project.committedCost || 0,
    actualCost: project.actualCost || 0,
    marginPercentage: project.marginPercentage || 0,
    
    // Detailed Financial Breakdown (initialize if missing)
    budgetBreakdown: project.budgetBreakdown || {
      labor: 0,
      materials: 0,
      equipment: 0,
      subcontracts: 0,
      other: 0
    },
    
    // Cost Code Budgets (initialize empty array if missing)
    costCodeBudgets: project.costCodeBudgets || [],
    
    // Calculated Financial Metrics (initialize if missing)
    variance: project.variance || 0,
    variancePercentage: project.variancePercentage || 0,
    projectedFinalCost: project.projectedFinalCost || 0,
    remainingBudget: project.remainingBudget || 0,
    financialHealth: project.financialHealth || 'good',
    
    // Metadata
    createdBy: project.createdBy || 'system',
    createdAt: project.createdAt || now,
    updatedAt: now
  } as Project
}

/**
 * Migrate multiple projects
 */
export function migrateProjects(projects: Partial<Project>[]): Project[] {
  return projects.map(migrateProject)
}

/**
 * Migrate a single expense to add classification fields
 */
export function migrateExpense(
  expense: Partial<Expense>,
  defaultProject: Project | null,
  defaultCostCode: CostCode
): Expense {
  const now = new Date().toISOString()
  
  // Check if expense already has required classification
  const hasClassification = expense.projectId && expense.costCodeId && expense.supplierId
  
  return {
    ...expense,
    
    // Ensure required fields
    id: expense.id || generateId('EXP'),
    
    // MANDATORY CLASSIFICATION
    projectId: expense.projectId || (defaultProject?.id || 'NEEDS_CLASSIFICATION'),
    projectName: expense.projectName || (defaultProject?.name || 'Needs Classification'),
    costCodeId: expense.costCodeId || defaultCostCode.id,
    costCode: expense.costCode || defaultCostCode,
    supplierId: expense.supplierId || 'NEEDS_CLASSIFICATION',
    supplierName: expense.supplierName || 'Needs Classification',
    
    // Financial
    amount: expense.amount || 0,
    currency: expense.currency || 'USD',
    totalAmount: expense.totalAmount || expense.amount || 0,
    
    // Details
    description: expense.description || '',
    invoiceDate: expense.invoiceDate || now,
    
    // Status
    status: expense.status || 'draft',
    paymentStatus: expense.paymentStatus || 'unpaid',
    
    // Approval Workflow
    submittedBy: expense.submittedBy || 'system',
    submittedAt: expense.submittedAt || now,
    
    // Automation
    isAutoCreated: expense.isAutoCreated || false,
    needsReview: !hasClassification, // Mark for review if missing classification
    
    // Documents
    attachments: expense.attachments || [],
    
    // Metadata
    createdAt: expense.createdAt || now,
    updatedAt: now
  } as Expense
}

/**
 * Migrate multiple expenses
 */
export function migrateExpenses(
  expenses: Partial<Expense>[],
  projects: Project[],
  costCodes: CostCode[]
): Expense[] {
  const defaultProject = projects.length > 0 ? projects[0] : null
  const defaultCostCode = costCodes.find(cc => cc.isDefault) || costCodes[0]
  
  return expenses.map(expense => 
    migrateExpense(expense, defaultProject, defaultCostCode)
  )
}

/**
 * Perform complete migration
 */
export function performMigration(
  existingProjects: Partial<Project>[],
  existingExpenses: Partial<Expense>[]
): MigrationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    // Step 1: Initialize cost code catalog
    const costCodes = initializeCostCodeCatalog()
    
    // Step 2: Migrate projects
    const projects = migrateProjects(existingProjects)
    
    // Step 3: Migrate expenses
    const expenses = migrateExpenses(existingExpenses, projects, costCodes)
    
    // Step 4: Collect warnings
    const expensesNeedingReview = expenses.filter(e => e.needsReview).length
    if (expensesNeedingReview > 0) {
      warnings.push(
        `${expensesNeedingReview} expenses need manual classification review`
      )
    }
    
    const projectsWithoutBudget = projects.filter(p => p.totalBudget === 0).length
    if (projectsWithoutBudget > 0) {
      warnings.push(
        `${projectsWithoutBudget} projects have no budget set`
      )
    }
    
    return {
      success: true,
      costCodes,
      projects,
      expenses,
      stats: {
        costCodesCreated: costCodes.length,
        projectsMigrated: projects.length,
        expensesMigrated: expenses.length,
        expensesNeedingReview
      },
      errors,
      warnings
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error')
    
    return {
      success: false,
      costCodes: [],
      projects: [],
      expenses: [],
      stats: {
        costCodesCreated: 0,
        projectsMigrated: 0,
        expensesMigrated: 0,
        expensesNeedingReview: 0
      },
      errors,
      warnings
    }
  }
}

/**
 * Validate migration result
 */
export function validateMigration(result: MigrationResult): {
  isValid: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  // Check cost codes
  if (result.costCodes.length === 0) {
    issues.push('No cost codes were created')
  }
  
  const defaultCostCode = result.costCodes.find(cc => cc.isDefault)
  if (!defaultCostCode) {
    issues.push('No default cost code found')
  }
  
  // Check projects
  result.projects.forEach(project => {
    if (!project.id || !project.name || !project.code) {
      issues.push(`Project missing required fields: ${project.id}`)
    }
    
    if (project.totalBudget < 0) {
      issues.push(`Project has negative budget: ${project.name}`)
    }
  })
  
  // Check expenses
  result.expenses.forEach(expense => {
    if (!expense.id || !expense.projectId || !expense.costCodeId || !expense.supplierId) {
      issues.push(`Expense missing required fields: ${expense.id}`)
    }
    
    if (expense.amount < 0) {
      issues.push(`Expense has negative amount: ${expense.id}`)
    }
  })
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

/**
 * Generate migration summary
 */
export function generateMigrationSummary(result: MigrationResult): string {
  const lines: string[] = [
    '# Migration Summary',
    '',
    '## Statistics',
    `- Cost Codes Created: ${result.stats.costCodesCreated}`,
    `- Projects Migrated: ${result.stats.projectsMigrated}`,
    `- Expenses Migrated: ${result.stats.expensesMigrated}`,
    `- Expenses Needing Review: ${result.stats.expensesNeedingReview}`,
    ''
  ]
  
  if (result.warnings.length > 0) {
    lines.push('## Warnings')
    result.warnings.forEach(warning => {
      lines.push(`- ⚠️  ${warning}`)
    })
    lines.push('')
  }
  
  if (result.errors.length > 0) {
    lines.push('## Errors')
    result.errors.forEach(error => {
      lines.push(`- ❌ ${error}`)
    })
    lines.push('')
  }
  
  if (result.success) {
    lines.push('## Status')
    lines.push('✅ Migration completed successfully')
  } else {
    lines.push('## Status')
    lines.push('❌ Migration failed')
  }
  
  return lines.join('\n')
}
