/**
 * Project Types
 * 
 * Defines the data structures for construction projects with
 * integrated financial tracking for job costing.
 */

import type { CostCodeBudget } from './costCodes'

/**
 * Project status through its lifecycle
 */
export type ProjectStatus = 
  | 'planning' 
  | 'active' 
  | 'on_hold' 
  | 'completed' 
  | 'cancelled'

/**
 * Financial health indicator for a project
 */
export type FinancialHealth = 'excellent' | 'good' | 'warning' | 'critical'

/**
 * Project
 * 
 * Represents a construction project with comprehensive financial tracking
 * including budgets, committed costs, actual costs, and profitability metrics.
 */
export interface Project {
  // Identification
  id: string
  name: string
  code: string // Unique project code (e.g., "PRJ-2024-001")
  description: string
  
  // Client & Location
  client: string
  clientId?: string
  location: string
  address?: string
  
  // Dates
  startDate: string // ISO date string
  endDate: string // ISO date string
  estimatedCompletionDate?: string // ISO date string
  actualCompletionDate?: string // ISO date string
  
  // Status
  status: ProjectStatus
  progress: number // Percentage (0-100)
  
  // Financial Overview
  totalBudget: number // Total project budget
  committedCost: number // Total committed through subcontracts
  actualCost: number // Total actual costs (expenses + payments)
  marginPercentage: number // Profit margin percentage
  
  // Detailed Financial Breakdown
  budgetBreakdown: {
    labor: number
    materials: number
    equipment: number
    subcontracts: number
    other: number
  }
  
  // Cost Code Budgets
  costCodeBudgets: CostCodeBudget[] // Budget allocation by cost code
  
  // Calculated Financial Metrics
  variance: number // totalBudget - actualCost
  variancePercentage: number // (variance / totalBudget) * 100
  projectedFinalCost: number // Estimated cost at completion
  remainingBudget: number // totalBudget - committedCost - actualCost
  financialHealth: FinancialHealth
  
  // Team
  projectManager?: string
  projectManagerId?: string
  architect?: string
  architectId?: string
  teamMembers?: string[] // Array of user IDs
  
  // Documents & Attachments
  documents?: ProjectDocument[]
  
  // Metadata
  createdBy: string
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  
  // Additional Info
  notes?: string
  tags?: string[]
}

/**
 * Project Document
 * 
 * Represents a document attached to a project
 */
export interface ProjectDocument {
  id: string
  name: string
  type: 'contract' | 'plan' | 'permit' | 'specification' | 'report' | 'other'
  url: string
  uploadDate: string
  uploadedBy: string
  size: number
  mimeType: string
}

/**
 * DTO for creating a new project
 */
export interface CreateProjectDTO {
  name: string
  code: string
  description: string
  client: string
  clientId?: string
  location: string
  address?: string
  startDate: string
  endDate: string
  totalBudget: number
  budgetBreakdown?: {
    labor: number
    materials: number
    equipment: number
    subcontracts: number
    other: number
  }
  projectManager?: string
  projectManagerId?: string
  architect?: string
  architectId?: string
  notes?: string
  tags?: string[]
}

/**
 * DTO for updating an existing project
 */
export interface UpdateProjectDTO {
  name?: string
  description?: string
  client?: string
  clientId?: string
  location?: string
  address?: string
  startDate?: string
  endDate?: string
  estimatedCompletionDate?: string
  status?: ProjectStatus
  progress?: number
  totalBudget?: number
  budgetBreakdown?: {
    labor?: number
    materials?: number
    equipment?: number
    subcontracts?: number
    other?: number
  }
  projectManager?: string
  projectManagerId?: string
  architect?: string
  architectId?: string
  notes?: string
  tags?: string[]
}

/**
 * Project Financial Summary
 * 
 * Lightweight summary of project financials for list views
 */
export interface ProjectFinancialSummary {
  projectId: string
  projectName: string
  totalBudget: number
  committedCost: number
  actualCost: number
  variance: number
  variancePercentage: number
  marginPercentage: number
  financialHealth: FinancialHealth
  progress: number
  status: ProjectStatus
}

/**
 * Filters for querying projects
 */
export interface ProjectFilters {
  status?: ProjectStatus
  clientId?: string
  projectManagerId?: string
  financialHealth?: FinancialHealth
  startDateFrom?: string
  startDateTo?: string
  endDateFrom?: string
  endDateTo?: string
  minBudget?: number
  maxBudget?: number
  search?: string // Search in name, code, description, location
  tags?: string[]
}

/**
 * Response from project queries with pagination
 */
export interface ProjectResponse {
  data: Project[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Project statistics
 */
export interface ProjectStats {
  total: number
  active: number
  completed: number
  onHold: number
  cancelled: number
  totalBudget: number
  totalActualCost: number
  totalCommittedCost: number
  averageMargin: number
  byFinancialHealth: Record<FinancialHealth, number>
  byStatus: Record<ProjectStatus, number>
}

/**
 * Project timeline event
 */
export interface ProjectTimelineEvent {
  id: string
  projectId: string
  type: 'milestone' | 'payment' | 'certificate' | 'expense' | 'subcontract' | 'note'
  title: string
  description?: string
  date: string // ISO date string
  amount?: number
  relatedEntityId?: string // ID of related subcontract, certificate, etc.
  createdBy: string
  createdAt: string
}

/**
 * Project milestone
 */
export interface ProjectMilestone {
  id: string
  projectId: string
  name: string
  description?: string
  targetDate: string // ISO date string
  completedDate?: string // ISO date string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  progress: number // Percentage (0-100)
  dependencies?: string[] // IDs of other milestones
}
