/**
 * Cost Code Types
 * 
 * Defines the data structures for the Work Breakdown Structure (WBS)
 * and cost classification system used in construction projects.
 */

/**
 * Type of cost that a cost code represents
 */
export type CostType = 'labor' | 'material' | 'equipment' | 'subcontract' | 'other'

/**
 * Status of a cost code budget item
 */
export type BudgetStatus = 'under_budget' | 'on_budget' | 'over_budget' | 'critical'

/**
 * Cost Code
 * 
 * Represents a standardized classification code for categorizing
 * construction costs in a hierarchical structure (WBS).
 */
export interface CostCode {
  // Identification
  id: string
  code: string // Hierarchical code (e.g., "01.01.01")
  name: string
  description: string
  
  // Hierarchy (3-level structure)
  division: string // Level 1: e.g., "01 - Preliminares"
  category: string // Level 2: e.g., "01.01 - Movimiento de Tierras"
  subcategory?: string // Level 3: e.g., "01.01.01 - Excavación"
  
  // Classification
  type: CostType
  unit: string // Unit of measurement (e.g., "m³", "m²", "kg", "global")
  
  // Status
  isActive: boolean
  isDefault: boolean // If true, used as default for auto-classification
  
  // Metadata
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  createdBy?: string // User ID
  
  // Additional Info
  notes?: string
  tags?: string[] // For additional categorization/search
}

/**
 * Cost Code Budget
 * 
 * Represents the budgeted, committed, and actual costs for a specific
 * cost code within a project.
 */
export interface CostCodeBudget {
  // Identification
  id: string
  projectId: string
  costCodeId: string
  costCode: CostCode // Denormalized for easier access
  
  // Budget
  budgetedQuantity: number
  budgetedUnitPrice: number
  budgetedAmount: number // budgetedQuantity * budgetedUnitPrice
  
  // Committed (from subcontracts)
  committedAmount: number
  committedQuantity?: number
  
  // Actual (from expenses and payments)
  actualAmount: number
  actualQuantity?: number
  
  // Variance Analysis
  variance: number // budgetedAmount - actualAmount
  variancePercentage: number // (variance / budgetedAmount) * 100
  
  // Status
  status: BudgetStatus
  
  // Progress
  percentageComplete: number // Based on actual vs budgeted
  
  // Metadata
  createdAt: string
  updatedAt: string
  lastCalculatedAt: string // When variance was last calculated
}

/**
 * DTO for creating a new cost code
 */
export interface CreateCostCodeDTO {
  code: string
  name: string
  description: string
  division: string
  category: string
  subcategory?: string
  type: CostType
  unit: string
  isActive?: boolean
  isDefault?: boolean
  notes?: string
  tags?: string[]
}

/**
 * DTO for updating an existing cost code
 */
export interface UpdateCostCodeDTO {
  name?: string
  description?: string
  type?: CostType
  unit?: string
  isActive?: boolean
  isDefault?: boolean
  notes?: string
  tags?: string[]
}

/**
 * DTO for creating a cost code budget for a project
 */
export interface CreateCostCodeBudgetDTO {
  projectId: string
  costCodeId: string
  budgetedQuantity: number
  budgetedUnitPrice: number
}

/**
 * DTO for updating a cost code budget
 */
export interface UpdateCostCodeBudgetDTO {
  budgetedQuantity?: number
  budgetedUnitPrice?: number
}

/**
 * Hierarchical structure of cost codes
 * Used for displaying cost codes in a tree view
 */
export interface CostCodeHierarchy {
  divisions: CostCodeDivision[]
}

export interface CostCodeDivision {
  code: string
  name: string
  categories: CostCodeCategory[]
}

export interface CostCodeCategory {
  code: string
  name: string
  subcategories: CostCodeSubcategory[]
}

export interface CostCodeSubcategory {
  id: string
  code: string
  name: string
  type: CostType
  unit: string
  isActive: boolean
}

/**
 * Summary of costs for a specific cost code in a project
 */
export interface CostCodeSummary {
  costCode: CostCode
  budget: CostCodeBudget
  
  // Breakdown
  subcontracts: {
    count: number
    totalAmount: number
  }
  expenses: {
    count: number
    totalAmount: number
  }
  payments: {
    count: number
    totalAmount: number
  }
  
  // Analysis
  utilizationPercentage: number // (actualAmount / budgetedAmount) * 100
  remainingBudget: number
  projectedFinalCost: number
  
  // Trend
  monthlySpend: MonthlySpend[]
}

export interface MonthlySpend {
  month: string // YYYY-MM format
  budgeted: number
  actual: number
  committed: number
}

/**
 * Statistics for cost codes
 */
export interface CostCodeStats {
  total: number
  active: number
  inactive: number
  byType: Record<CostType, number>
  byDivision: Record<string, number>
}

/**
 * Filters for querying cost codes
 */
export interface CostCodeFilters {
  division?: string
  category?: string
  type?: CostType
  isActive?: boolean
  search?: string // Search in code, name, or description
  tags?: string[]
}

/**
 * Response from cost code queries
 */
export interface CostCodeResponse {
  data: CostCode[]
  total: number
  hierarchy?: CostCodeHierarchy
}

/**
 * Predefined cost code catalog for construction
 * This will be used to initialize the system with standard cost codes
 */
export const DEFAULT_COST_CODES: Omit<CostCode, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // 01 - Preliminares
  {
    code: '01.01.01',
    name: 'Excavación',
    description: 'Excavación de terreno para cimentación',
    division: '01 - Preliminares',
    category: '01.01 - Movimiento de Tierras',
    subcategory: '01.01.01 - Excavación',
    type: 'equipment',
    unit: 'm³',
    isActive: true,
    isDefault: false
  },
  {
    code: '01.01.02',
    name: 'Relleno',
    description: 'Relleno y compactación de terreno',
    division: '01 - Preliminares',
    category: '01.01 - Movimiento de Tierras',
    subcategory: '01.01.02 - Relleno',
    type: 'material',
    unit: 'm³',
    isActive: true,
    isDefault: false
  },
  {
    code: '01.02.01',
    name: 'Demolición',
    description: 'Demolición de estructuras existentes',
    division: '01 - Preliminares',
    category: '01.02 - Demoliciones',
    subcategory: '01.02.01 - Demolición',
    type: 'labor',
    unit: 'm²',
    isActive: true,
    isDefault: false
  },
  
  // 02 - Cimentación
  {
    code: '02.01.01',
    name: 'Zapatas',
    description: 'Construcción de zapatas de cimentación',
    division: '02 - Cimentación',
    category: '02.01 - Cimentación Superficial',
    subcategory: '02.01.01 - Zapatas',
    type: 'material',
    unit: 'm³',
    isActive: true,
    isDefault: false
  },
  {
    code: '02.01.02',
    name: 'Vigas de Cimentación',
    description: 'Construcción de vigas de cimentación',
    division: '02 - Cimentación',
    category: '02.01 - Cimentación Superficial',
    subcategory: '02.01.02 - Vigas de Cimentación',
    type: 'material',
    unit: 'm³',
    isActive: true,
    isDefault: false
  },
  
  // 03 - Estructura
  {
    code: '03.01.01',
    name: 'Columnas',
    description: 'Construcción de columnas de concreto armado',
    division: '03 - Estructura',
    category: '03.01 - Concreto Armado',
    subcategory: '03.01.01 - Columnas',
    type: 'material',
    unit: 'm³',
    isActive: true,
    isDefault: false
  },
  {
    code: '03.01.02',
    name: 'Vigas',
    description: 'Construcción de vigas de concreto armado',
    division: '03 - Estructura',
    category: '03.01 - Concreto Armado',
    subcategory: '03.01.02 - Vigas',
    type: 'material',
    unit: 'm³',
    isActive: true,
    isDefault: false
  },
  {
    code: '03.01.03',
    name: 'Losas',
    description: 'Construcción de losas de concreto armado',
    division: '03 - Estructura',
    category: '03.01 - Concreto Armado',
    subcategory: '03.01.03 - Losas',
    type: 'material',
    unit: 'm²',
    isActive: true,
    isDefault: false
  },
  
  // 04 - Albañilería
  {
    code: '04.01.01',
    name: 'Muros de Ladrillo',
    description: 'Construcción de muros de ladrillo',
    division: '04 - Albañilería',
    category: '04.01 - Muros',
    subcategory: '04.01.01 - Muros de Ladrillo',
    type: 'material',
    unit: 'm²',
    isActive: true,
    isDefault: false
  },
  {
    code: '04.02.01',
    name: 'Tabiques',
    description: 'Construcción de tabiques divisorios',
    division: '04 - Albañilería',
    category: '04.02 - Tabiques',
    subcategory: '04.02.01 - Tabiques',
    type: 'material',
    unit: 'm²',
    isActive: true,
    isDefault: false
  },
  
  // 05 - Instalaciones Eléctricas
  {
    code: '05.01.01',
    name: 'Cableado Eléctrico',
    description: 'Instalación de cableado eléctrico',
    division: '05 - Instalaciones Eléctricas',
    category: '05.01 - Cableado',
    subcategory: '05.01.01 - Cableado Eléctrico',
    type: 'subcontract',
    unit: 'm',
    isActive: true,
    isDefault: false
  },
  {
    code: '05.02.01',
    name: 'Tableros Eléctricos',
    description: 'Instalación de tableros eléctricos',
    division: '05 - Instalaciones Eléctricas',
    category: '05.02 - Tableros',
    subcategory: '05.02.01 - Tableros Eléctricos',
    type: 'material',
    unit: 'und',
    isActive: true,
    isDefault: false
  },
  
  // 06 - Instalaciones Sanitarias
  {
    code: '06.01.01',
    name: 'Agua Potable',
    description: 'Instalación de red de agua potable',
    division: '06 - Instalaciones Sanitarias',
    category: '06.01 - Agua Potable',
    subcategory: '06.01.01 - Agua Potable',
    type: 'subcontract',
    unit: 'm',
    isActive: true,
    isDefault: false
  },
  {
    code: '06.02.01',
    name: 'Desagüe',
    description: 'Instalación de red de desagüe',
    division: '06 - Instalaciones Sanitarias',
    category: '06.02 - Desagüe',
    subcategory: '06.02.01 - Desagüe',
    type: 'subcontract',
    unit: 'm',
    isActive: true,
    isDefault: false
  },
  
  // 07 - Acabados
  {
    code: '07.01.01',
    name: 'Pisos',
    description: 'Instalación de pisos',
    division: '07 - Acabados',
    category: '07.01 - Pisos',
    subcategory: '07.01.01 - Pisos',
    type: 'material',
    unit: 'm²',
    isActive: true,
    isDefault: false
  },
  {
    code: '07.02.01',
    name: 'Pintura',
    description: 'Aplicación de pintura',
    division: '07 - Acabados',
    category: '07.02 - Pintura',
    subcategory: '07.02.01 - Pintura',
    type: 'labor',
    unit: 'm²',
    isActive: true,
    isDefault: false
  },
  {
    code: '07.03.01',
    name: 'Carpintería',
    description: 'Trabajos de carpintería',
    division: '07 - Acabados',
    category: '07.03 - Carpintería',
    subcategory: '07.03.01 - Carpintería',
    type: 'subcontract',
    unit: 'global',
    isActive: true,
    isDefault: false
  }
]
