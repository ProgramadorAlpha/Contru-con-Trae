# Job Costing System - Migration Guide

## Overview

This guide explains how to migrate existing ConstructPro data to support the new Job Costing system with cost codes, subcontracts, and financial tracking.

## What Gets Migrated

### 1. Cost Code Catalog
- **19 predefined cost codes** organized in 8 divisions
- Standard construction WBS (Work Breakdown Structure)
- Includes: Preliminares, Cimentación, Estructura, Albañilería, Instalaciones Eléctricas, Instalaciones Sanitarias, Acabados, Otros

### 2. Projects
Existing projects are extended with:
- `totalBudget`: Total project budget
- `committedCost`: Costs committed through subcontracts
- `actualCost`: Actual costs from expenses/payments
- `marginPercentage`: Profit margin percentage
- `budgetBreakdown`: Breakdown by labor, materials, equipment, subcontracts, other
- `costCodeBudgets`: Array of cost code budget allocations
- `variance`: Budget variance
- `variancePercentage`: Variance as percentage
- `projectedFinalCost`: Estimated cost at completion
- `remainingBudget`: Remaining budget
- `financialHealth`: Health indicator (excellent/good/warning/critical)

### 3. Expenses
Existing expenses are extended with mandatory classification:
- `projectId`: Project assignment (REQUIRED)
- `projectName`: Project name
- `costCodeId`: Cost code classification (REQUIRED)
- `costCode`: Full cost code object
- `supplierId`: Supplier/vendor ID (REQUIRED)
- `supplierName`: Supplier name
- `needsReview`: Flag for expenses needing manual classification

## Migration Methods

### Method 1: Automated Script (Recommended for New Deployments)

Run the migration script:

```bash
npm run migrate:job-costing
```

This will:
1. Initialize the cost code catalog
2. Migrate existing projects (if any)
3. Migrate existing expenses (if any)
4. Generate a migration report
5. Save migration data to `.kiro/specs/job-costing-system/migration/`

### Method 2: Programmatic Migration (For Custom Scenarios)

Use the migration utilities in your code:

```typescript
import {
  performMigration,
  validateMigration,
  generateMigrationSummary
} from '@/utils/migration'

// Load your existing data
const existingProjects = await loadProjects()
const existingExpenses = await loadExpenses()

// Perform migration
const result = performMigration(existingProjects, existingExpenses)

// Validate result
const validation = validateMigration(result)
if (!validation.isValid) {
  console.error('Migration validation failed:', validation.issues)
}

// Generate summary
const summary = generateMigrationSummary(result)
console.log(summary)

// Save migrated data
await saveCostCodes(result.costCodes)
await saveProjects(result.projects)
await saveExpenses(result.expenses)
```

### Method 3: Manual Migration (For Existing Production Systems)

If you have an existing production system with data:

1. **Backup your database** before starting
2. **Export existing data** to JSON files
3. **Run migration script** with your data
4. **Review migration report** for warnings
5. **Import migrated data** to database
6. **Verify data integrity** using validation tools

## Migration Output

### Files Created

```
.kiro/specs/job-costing-system/migration/
├── cost-codes.json          # Cost code catalog
├── projects.json            # Migrated projects
├── expenses.json            # Migrated expenses
└── MIGRATION_REPORT.md      # Detailed migration report
```

### Migration Report

The migration report includes:
- Statistics (counts, totals)
- Cost codes by division and type
- Projects with/without budgets
- Expenses needing review
- Warnings and errors
- Post-migration action items

## Post-Migration Actions

### 1. Review Unclassified Expenses

Expenses without proper classification are marked with `needsReview: true` and assigned default values:

- **Default Project**: First project or "NEEDS_CLASSIFICATION"
- **Default Cost Code**: "08.01.01 - Gastos Generales"
- **Default Supplier**: "NEEDS_CLASSIFICATION"

**Action Required:**
1. Go to **Expense Approvals** page
2. Filter by "Needs Review"
3. Review and update classification for each expense
4. Assign correct project, cost code, and supplier

### 2. Set Up Project Budgets

Projects without budgets have `totalBudget: 0`.

**Action Required:**
1. Go to **Project Financials** page for each project
2. Set total budget
3. Allocate budget by category (labor, materials, equipment, subcontracts, other)
4. Create cost code budgets for detailed tracking

### 3. Configure Cost Code Budgets

For detailed job costing, create cost code budgets for each project:

**Action Required:**
1. Go to **Cost Codes** page
2. For each project, create budgets for relevant cost codes
3. Set budgeted quantity and unit price
4. System will track actual vs budgeted automatically

### 4. Verify Financial Calculations

After migration, verify:
- [ ] Project committed costs calculate correctly
- [ ] Project actual costs match expense totals
- [ ] Project margins calculate correctly
- [ ] Cost code budgets reflect actual spending
- [ ] Dashboard widgets display correct data

### 5. Configure n8n Workflow (Optional)

If using OCR automation for expenses:
- [ ] Set up n8n workflow for OCR processing
- [ ] Configure API endpoint: `POST /api/expenses/auto-create`
- [ ] Test with sample receipts
- [ ] Configure auto-classification rules

See: [N8N Configuration Guide](./N8N_CONFIGURATION_GUIDE.md)

## Cost Code Catalog

### Divisions

1. **01 - Preliminares**
   - 01.01 - Movimiento de Tierras (Excavación, Relleno)
   - 01.02 - Demoliciones

2. **02 - Cimentación**
   - 02.01 - Cimentación Superficial (Zapatas, Vigas)

3. **03 - Estructura**
   - 03.01 - Concreto Armado (Columnas, Vigas, Losas)

4. **04 - Albañilería**
   - 04.01 - Muros
   - 04.02 - Tabiques

5. **05 - Instalaciones Eléctricas**
   - 05.01 - Cableado
   - 05.02 - Tableros

6. **06 - Instalaciones Sanitarias**
   - 06.01 - Agua Potable
   - 06.02 - Desagüe

7. **07 - Acabados**
   - 07.01 - Pisos
   - 07.02 - Pintura
   - 07.03 - Carpintería

8. **08 - Otros**
   - 08.01 - Gastos Generales (Default)

### Adding Custom Cost Codes

After migration, you can add custom cost codes:

1. Go to **Cost Codes** page
2. Click "Add Cost Code"
3. Fill in:
   - Code (e.g., "09.01.01")
   - Name
   - Description
   - Division, Category, Subcategory
   - Type (labor/material/equipment/subcontract/other)
   - Unit (m³, m², kg, und, global)
4. Save

## Rollback

If migration fails or causes issues:

### Before Database Import
Simply don't import the migrated data. Your original data is unchanged.

### After Database Import
1. Restore from backup taken before migration
2. Review migration report for errors
3. Fix issues and re-run migration

## Troubleshooting

### Issue: Migration script fails

**Solution:**
1. Check Node.js version (requires v18+)
2. Run `npm install` to ensure dependencies
3. Check file permissions
4. Review error message in console

### Issue: Expenses marked as "Needs Classification"

**Expected behavior.** Expenses without project, cost code, or supplier are marked for review.

**Solution:**
1. Review expenses in Expense Approvals page
2. Assign correct classification
3. Save changes

### Issue: Projects have zero budget

**Expected behavior.** New projects or projects without budget data start at zero.

**Solution:**
1. Go to Project Financials page
2. Set budget for each project
3. Allocate to cost codes as needed

### Issue: Cost codes don't match my needs

**Solution:**
1. Add custom cost codes via Cost Codes page
2. Deactivate unused default codes
3. Update expense classifications to use new codes

## Testing Migration

Before running on production data:

1. **Run unit tests:**
   ```bash
   npm run test:run -- src/utils/__tests__/migration.test.ts
   ```

2. **Test with sample data:**
   ```typescript
   import { performMigration } from '@/utils/migration'
   
   const sampleProjects = [/* sample data */]
   const sampleExpenses = [/* sample data */]
   
   const result = performMigration(sampleProjects, sampleExpenses)
   console.log(result)
   ```

3. **Validate output:**
   ```typescript
   import { validateMigration } from '@/utils/migration'
   
   const validation = validateMigration(result)
   if (!validation.isValid) {
     console.error('Issues:', validation.issues)
   }
   ```

## Support

For migration issues or questions:

1. Review this guide
2. Check [Requirements](./requirements.md)
3. Check [Design Document](./design.md)
4. Check [Deployment Guide](./DEPLOYMENT_GUIDE.md)
5. Review migration report for specific errors

## Migration Checklist

- [ ] Backup existing database
- [ ] Run migration script
- [ ] Review migration report
- [ ] Import migrated data to database
- [ ] Verify cost code catalog
- [ ] Review unclassified expenses
- [ ] Set up project budgets
- [ ] Configure cost code budgets
- [ ] Verify financial calculations
- [ ] Test dashboard and reports
- [ ] Configure n8n workflow (optional)
- [ ] Train users on new features
- [ ] Monitor system for 24 hours

---

**Requirements:** 3.1, 9.5
