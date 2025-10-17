# Design Document: Job Costing & Subcontractor Management System

## Overview

Este documento describe la arquitectura técnica para implementar un sistema completo de Job Costing en ConstructPro, incluyendo gestión de subcontratos, clasificación de costos por Cost Codes, y automatización de gastos mediante OCR/n8n.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)            │
├─────────────────────────────────────────────────────────────┤
│  Pages:                                                      │
│  - ProjectFinancialsPage.tsx (nuevo)                        │
│  - SubcontractsPage.tsx (nuevo)                             │
│  - CostCodesPage.tsx (nuevo)                                │
│  - ExpenseApprovalsPage.tsx (nuevo)                         │
│  - ProjectsPage.tsx (extendido)                             │
│  - EnhancedDashboard.tsx (extendido)                        │
├─────────────────────────────────────────────────────────────┤
│  Components:                                                 │
│  - SubcontractForm, ProgressCertificateForm                 │
│  - CostCodeSelector, ExpenseClassificationForm             │
│  - ProfitabilityWidget, JobCostingReport                   │
├─────────────────────────────────────────────────────────────┤
│  Hooks:                                                      │
│  - useSubcontracts, useProgressCertificates                 │
│  - useCostCodes, useProjectFinancials                       │
│  - useExpenseApprovals                                      │
├─────────────────────────────────────────────────────────────┤
│  Services:                                                   │
│  - subcontractService.ts                                    │
│  - costCodeService.ts                                       │
│  - expenseService.ts (extendido)                            │
│  - projectFinancialsService.ts                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              API Layer (Firebase Functions)                  │
├─────────────────────────────────────────────────────────────┤
│  Endpoints:                                                  │
│  - POST /api/subcontracts                                   │
│  - POST /api/progress-certificates                          │
│  - POST /api/expenses/auto-create (n8n integration)        │
│  - GET  /api/projects/:id/financials                        │
│  - GET  /api/cost-codes                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Database (Firestore)                        │
├─────────────────────────────────────────────────────────────┤
│  Collections:                                                │
│  - projects (extendido)                                     │
│  - subcontracts (nuevo)                                     │
│  - progressCertificates (nuevo)                             │
│  - costCodes (nuevo)                                        │
│  - expenses (extendido)                                     │
│  - payments (extendido)                                     │
│  - holdbacks (nuevo)                                        │
│  - auditLog (nuevo)                                         │
└─────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────┐
│              External Integration (n8n)                      │
├─────────────────────────────────────────────────────────────┤
│  Workflow:                                                   │
│  1. Email con recibo → Gmail Trigger                        │
│  2. Extraer adjunto → OCR Processing                        │
│  3. Parsear datos → Data Transformation                     │
│  4. POST a ConstructPro API → HTTP Request                  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Data Models (src/types/)

#### types/subcontracts.ts
```typescript
export interface Subcontract {
  id: string
  projectId: string
  projectName: string
  subcontractorId: string
  subcontractorName: string
  contractNumber: string
  description: string
  scope: string
  
  // Financial
  totalAmount: number
  currency: string
  retentionPercentage: number // Holdback %
  
  // Payment Schedule
  paymentSchedule: PaymentScheduleItem[]
  advancePaymentPercentage?: number
  
  // Status
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  startDate: string
  endDate: string
  completionDate?: string
  
  // Cost Classification
  costCodes: string[] // Array of cost code IDs
  
  // Documents
  documents: SubcontractDocument[]
  
  // Tracking
  totalCertified: number // Total amount certified
  totalPaid: number // Total amount paid
  totalRetained: number // Total amount retained
  remainingBalance: number // Amount left to certify
  
  // Metadata
  createdBy: string
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approvedAt?: string
}

export interface PaymentScheduleItem {
  id: string
  description: string
  percentage: number
  amount: number
  dueDate?: string
  status: 'pending' | 'certified' | 'paid'
}

export interface SubcontractDocument {
  id: string
  name: string
  type: 'contract' | 'quote' | 'specification' | 'insurance' | 'other'
  url: string
  uploadDate: string
  size: number
}
```

#### types/progressCertificates.ts
```typescript
export interface ProgressCertificate {
  id: string
  certificateNumber: string
  subcontractId: string
  projectId: string
  
  // Progress
  periodStart: string
  periodEnd: string
  percentageComplete: number
  amountCertified: number
  
  // Calculations
  retentionAmount: number
  netPayable: number
  previousCertified: number
  cumulativeCertified: number
  
  // Status
  status: 'draft' | 'pending_approval' | 'approved' | 'paid' | 'rejected'
  
  // Approval Workflow
  submittedBy: string
  submittedAt: string
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  
  // Payment
  paymentId?: string
  paidAt?: string
  
  // Attachments
  photos: string[]
  documents: string[]
  notes: string
  
  // Metadata
  createdAt: string
  updatedAt: string
}
```

#### types/costCodes.ts
```typescript
export interface CostCode {
  id: string
  code: string // e.g., "01.01.01"
  name: string
  description: string
  
  // Hierarchy
  division: string // e.g., "01 - Preliminares"
  category: string // e.g., "01.01 - Movimiento de Tierras"
  subcategory?: string // e.g., "01.01.01 - Excavación"
  
  // Classification
  type: 'labor' | 'material' | 'equipment' | 'subcontract' | 'other'
  unit: string // e.g., "m³", "m²", "global"
  
  // Status
  isActive: boolean
  isDefault: boolean
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface CostCodeBudget {
  id: string
  projectId: string
  costCodeId: string
  costCode: CostCode
  
  // Budget
  budgetedQuantity: number
  budgetedUnitPrice: number
  budgetedAmount: number
  
  // Actual
  committedAmount: number // From subcontracts
  actualAmount: number // From expenses/payments
  
  // Variance
  variance: number
  variancePercentage: number
  
  // Status
  status: 'under_budget' | 'on_budget' | 'over_budget'
}
```

#### types/expenses.ts (Extended)
```typescript
export interface Expense {
  id: string
  
  // Classification (REQUIRED)
  projectId: string
  projectName: string
  costCodeId: string
  costCode: CostCode
  supplierId: string
  supplierName: string
  
  // Financial
  amount: number
  currency: string
  taxAmount?: number
  totalAmount: number
  
  // Details
  description: string
  invoiceNumber?: string
  invoiceDate: string
  dueDate?: string
  
  // Status
  status: 'draft' | 'pending_approval' | 'approved' | 'paid' | 'rejected'
  paymentStatus: 'unpaid' | 'partial' | 'paid'
  
  // Approval Workflow
  submittedBy: string
  submittedAt: string
  approvedBy?: string
  approvedAt?: string
  
  // Automation
  isAutoCreated: boolean
  ocrConfidence?: number
  ocrData?: OCRData
  
  // Documents
  attachments: ExpenseAttachment[]
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface OCRData {
  rawText: string
  extractedFields: {
    amount?: number
    date?: string
    supplier?: string
    invoiceNumber?: string
  }
  confidence: number
  processedAt: string
}
```

#### types/projectFinancials.ts
```typescript
export interface ProjectFinancials {
  projectId: string
  
  // Budget
  totalBudget: number
  budgetByCategory: Record<string, number>
  
  // Committed Costs (from subcontracts)
  totalCommitted: number
  committedByCategory: Record<string, number>
  activeSubcontracts: number
  
  // Actual Costs (from expenses/payments)
  totalActual: number
  actualByCategory: Record<string, number>
  totalExpenses: number
  totalPayments: number
  
  // Holdbacks
  totalRetained: number
  retainedBySubcontractor: Record<string, number>
  
  // Variance Analysis
  budgetVariance: number
  budgetVariancePercentage: number
  
  // Profitability
  projectedProfit: number
  projectedMargin: number
  currentMargin: number
  
  // Status
  financialHealth: 'excellent' | 'good' | 'warning' | 'critical'
  
  // Forecasting
  estimatedFinalCost: number
  costToComplete: number
  
  // Metadata
  lastUpdated: string
  calculatedAt: string
}
```

### 2. Services Layer (src/services/)

#### services/subcontractService.ts
```typescript
class SubcontractService {
  // CRUD Operations
  async createSubcontract(data: CreateSubcontractDTO): Promise<Subcontract>
  async getSubcontract(id: string): Promise<Subcontract>
  async updateSubcontract(id: string, data: UpdateSubcontractDTO): Promise<Subcontract>
  async deleteSubcontract(id: string): Promise<void>
  
  // Queries
  async getSubcontractsByProject(projectId: string): Promise<Subcontract[]>
  async getSubcontractsBySubcontractor(subcontractorId: string): Promise<Subcontract[]>
  async getActiveSubcontracts(): Promise<Subcontract[]>
  
  // Financial Calculations
  async calculateCommittedCost(projectId: string): Promise<number>
  async calculateRetentionBalance(subcontractId: string): Promise<number>
  
  // Document Management
  async uploadDocument(subcontractId: string, file: File, type: string): Promise<SubcontractDocument>
  async deleteDocument(subcontractId: string, documentId: string): Promise<void>
}
```

#### services/progressCertificateService.ts
```typescript
class ProgressCertificateService {
  // CRUD Operations
  async createCertificate(data: CreateCertificateDTO): Promise<ProgressCertificate>
  async getCertificate(id: string): Promise<ProgressCertificate>
  async updateCertificate(id: string, data: UpdateCertificateDTO): Promise<ProgressCertificate>
  
  // Workflow
  async submitForApproval(id: string): Promise<ProgressCertificate>
  async approveCertificate(id: string, approverId: string): Promise<ProgressCertificate>
  async rejectCertificate(id: string, reason: string): Promise<ProgressCertificate>
  
  // Calculations
  async calculateNetPayable(certificateData: CertificateCalculationInput): Promise<CertificateCalculation>
  
  // Queries
  async getCertificatesBySubcontract(subcontractId: string): Promise<ProgressCertificate[]>
  async getPendingApprovals(): Promise<ProgressCertificate[]>
  
  // Payment Integration
  async createPaymentFromCertificate(certificateId: string): Promise<Payment>
}
```

#### services/costCodeService.ts
```typescript
class CostCodeService {
  // CRUD Operations
  async createCostCode(data: CreateCostCodeDTO): Promise<CostCode>
  async getCostCode(id: string): Promise<CostCode>
  async updateCostCode(id: string, data: UpdateCostCodeDTO): Promise<CostCode>
  async deactivateCostCode(id: string): Promise<void>
  
  // Queries
  async getAllCostCodes(): Promise<CostCode[]>
  async getActiveCostCodes(): Promise<CostCode[]>
  async getCostCodesByDivision(division: string): Promise<CostCode[]>
  async searchCostCodes(query: string): Promise<CostCode[]>
  
  // Hierarchy
  async getCostCodeHierarchy(): Promise<CostCodeHierarchy>
  
  // Budget Management
  async createCostCodeBudget(projectId: string, data: CreateBudgetDTO): Promise<CostCodeBudget>
  async updateCostCodeBudget(id: string, data: UpdateBudgetDTO): Promise<CostCodeBudget>
  async getCostCodeBudgets(projectId: string): Promise<CostCodeBudget[]>
  
  // Reporting
  async getCostCodeSummary(projectId: string, costCodeId: string): Promise<CostCodeSummary>
}
```

#### services/expenseService.ts (Extended)
```typescript
class ExpenseService {
  // Existing methods...
  
  // New: Auto-creation from OCR/n8n
  async createExpenseFromOCR(data: OCRExpenseDTO): Promise<Expense>
  async validateOCRData(data: OCRExpenseDTO): Promise<ValidationResult>
  
  // Classification
  async classifyExpense(id: string, classification: ExpenseClassification): Promise<Expense>
  async suggestCostCode(description: string, projectId: string): Promise<CostCode[]>
  
  // Approval Workflow
  async submitForApproval(id: string): Promise<Expense>
  async approveExpense(id: string, approverId: string): Promise<Expense>
  async rejectExpense(id: string, reason: string): Promise<Expense>
  
  // Queries
  async getPendingApprovals(): Promise<Expense[]>
  async getExpensesByProject(projectId: string, filters?: ExpenseFilters): Promise<Expense[]>
  async getExpensesByCostCode(costCodeId: string): Promise<Expense[]>
}
```

#### services/projectFinancialsService.ts
```typescript
class ProjectFinancialsService {
  // Financial Calculations
  async calculateProjectFinancials(projectId: string): Promise<ProjectFinancials>
  async updateProjectFinancials(projectId: string): Promise<void>
  
  // Real-time Updates
  async subscribeToFinancialUpdates(projectId: string, callback: (data: ProjectFinancials) => void): Promise<() => void>
  
  // Reporting
  async generateJobCostingReport(projectId: string): Promise<JobCostingReport>
  async generateProfitabilityReport(projectId: string): Promise<ProfitabilityReport>
  async exportFinancials(projectId: string, format: 'pdf' | 'excel'): Promise<Blob>
  
  // Forecasting
  async forecastFinalCost(projectId: string): Promise<CostForecast>
  async calculateEarnedValue(projectId: string): Promise<EarnedValueMetrics>
}
```

### 3. Custom Hooks (src/hooks/)

#### hooks/useSubcontracts.ts
```typescript
export function useSubcontracts(projectId?: string) {
  const [subcontracts, setSubcontracts] = useState<Subcontract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const createSubcontract = async (data: CreateSubcontractDTO) => { /* ... */ }
  const updateSubcontract = async (id: string, data: UpdateSubcontractDTO) => { /* ... */ }
  const deleteSubcontract = async (id: string) => { /* ... */ }
  
  return {
    subcontracts,
    loading,
    error,
    createSubcontract,
    updateSubcontract,
    deleteSubcontract
  }
}
```

#### hooks/useProjectFinancials.ts
```typescript
export function useProjectFinancials(projectId: string) {
  const [financials, setFinancials] = useState<ProjectFinancials | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Real-time subscription
  useEffect(() => {
    const unsubscribe = projectFinancialsService.subscribeToFinancialUpdates(
      projectId,
      (data) => setFinancials(data)
    )
    return unsubscribe
  }, [projectId])
  
  const refreshFinancials = async () => { /* ... */ }
  
  return {
    financials,
    loading,
    error,
    refreshFinancials
  }
}
```

#### hooks/useCostCodes.ts
```typescript
export function useCostCodes() {
  const [costCodes, setCostCodes] = useState<CostCode[]>([])
  const [hierarchy, setHierarchy] = useState<CostCodeHierarchy | null>(null)
  const [loading, setLoading] = useState(true)
  
  const searchCostCodes = async (query: string) => { /* ... */ }
  const getCostCodesByDivision = async (division: string) => { /* ... */ }
  
  return {
    costCodes,
    hierarchy,
    loading,
    searchCostCodes,
    getCostCodesByDivision
  }
}
```

### 4. UI Components (src/components/)

#### components/subcontracts/SubcontractForm.tsx
- Form for creating/editing subcontracts
- Fields: subcontractor, amount, retention %, payment schedule
- Document upload
- Cost code assignment

#### components/subcontracts/ProgressCertificateForm.tsx
- Form for certifying progress
- Automatic calculation of retention and net payable
- Photo/document upload
- Approval workflow buttons

#### components/financials/ProfitabilityWidget.tsx
- Dashboard widget showing project profitability
- Traffic light indicator (green/yellow/red)
- Drill-down to detailed view

#### components/financials/JobCostingReport.tsx
- Comprehensive job costing report
- Budget vs Committed vs Actual comparison
- Cost code breakdown
- Export to PDF/Excel

#### components/costCodes/CostCodeSelector.tsx
- Hierarchical cost code selector
- Search functionality
- Recently used cost codes

#### components/expenses/ExpenseClassificationForm.tsx
- Form for classifying expenses
- Required fields: project, cost code, supplier
- Validation and error messages

## Data Models

### Firestore Collections Structure

```
/projects/{projectId}
  - Extended with financial fields
  - totalBudget, committedCost, actualCost, marginPercentage

/subcontracts/{subcontractId}
  - All subcontract data
  - Indexed by: projectId, subcontractorId, status

/progressCertificates/{certificateId}
  - All certificate data
  - Indexed by: subcontractId, projectId, status

/costCodes/{costCodeId}
  - Cost code catalog
  - Indexed by: code, division, isActive

/costCodeBudgets/{budgetId}
  - Budget per cost code per project
  - Indexed by: projectId, costCodeId

/expenses/{expenseId}
  - Extended with classification fields
  - Indexed by: projectId, costCodeId, supplierId, status

/holdbacks/{holdbackId}
  - Retention tracking
  - Indexed by: subcontractId, projectId, status

/auditLog/{logId}
  - All financial actions
  - Indexed by: userId, action, timestamp
```

## Error Handling

### Validation Errors
- Missing required classification fields
- Invalid cost code for project
- Retention percentage out of range (0-100%)
- Certificate amount exceeds contract balance

### Business Logic Errors
- Cannot certify progress on inactive contract
- Cannot approve expense without proper permissions
- Cannot delete cost code with existing transactions

### API Errors
- OCR endpoint: Invalid request format
- OCR endpoint: Missing required fields
- OCR endpoint: File size exceeds limit

## Testing Strategy

### Unit Tests
- Service layer methods
- Financial calculation functions
- Cost code hierarchy logic
- Retention calculations

### Integration Tests
- Subcontract creation → Project financials update
- Progress certificate approval → Payment creation
- OCR expense creation → Approval workflow
- Cost code assignment → Budget tracking

### E2E Tests
- Complete subcontract lifecycle
- Progress certification and payment flow
- Expense approval workflow
- Job costing report generation

## Performance Considerations

### Caching
- Cost code catalog (rarely changes)
- Project financials (cache with TTL)
- User permissions (cache per session)

### Optimization
- Lazy load subcontract documents
- Paginate expense lists
- Debounce cost code search
- Batch financial calculations

### Real-time Updates
- Use Firestore listeners for project financials
- Throttle dashboard updates (max 1/second)
- Optimistic UI updates for better UX

## Security

### Authentication
- Firebase Authentication for all users
- JWT tokens for API requests

### Authorization
- Role-based access control (RBAC)
- Project-level permissions
- Action-level permissions (create, approve, delete)

### Data Validation
- Server-side validation for all inputs
- Sanitize OCR data before storage
- Validate file uploads (type, size)

### Audit Trail
- Log all financial transactions
- Track who approved what and when
- Immutable audit log

## Migration Strategy

### Phase 1: Data Model Extension
1. Add new fields to existing Project model
2. Create new collections (subcontracts, costCodes, etc.)
3. Migrate existing expense data to include classification

### Phase 2: Service Layer
1. Implement new services
2. Extend existing services
3. Add validation and business logic

### Phase 3: UI Components
1. Create new pages and components
2. Extend existing dashboard
3. Add new widgets

### Phase 4: API Integration
1. Implement OCR endpoint
2. Test n8n integration
3. Deploy to production

### Phase 5: Testing & Rollout
1. User acceptance testing
2. Training materials
3. Gradual rollout to users
