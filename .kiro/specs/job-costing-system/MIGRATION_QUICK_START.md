# Migration Quick Start

## Run Migration

```bash
npm run migrate:job-costing
```

## What It Does

1. ✅ Creates 18 cost codes (construction WBS)
2. ✅ Migrates existing projects (adds financial fields)
3. ✅ Migrates existing expenses (adds classification)
4. ✅ Generates migration report
5. ✅ Saves data to JSON files

## Output Files

```
.kiro/specs/job-costing-system/
├── MIGRATION_REPORT.md          # Detailed report
└── migration/
    ├── cost-codes.json          # 18 cost codes
    ├── projects.json            # Migrated projects
    └── expenses.json            # Migrated expenses
```

## After Migration

### 1. Import Data to Database
```typescript
// Example: Import to Firestore
import { costCodes } from './migration/cost-codes.json'

for (const code of costCodes) {
  await db.collection('costCodes').doc(code.id).set(code)
}
```

### 2. Review Unclassified Expenses
- Go to **Expense Approvals** page
- Filter by "Needs Review"
- Assign correct project, cost code, supplier

### 3. Set Project Budgets
- Go to **Project Financials** page
- Set total budget for each project
- Allocate budget by category

### 4. Create Cost Code Budgets
- Go to **Cost Codes** page
- Create budgets for each project
- Set quantity and unit price

## Cost Codes Created

| Division | Codes | Examples |
|----------|-------|----------|
| 01 - Preliminares | 3 | Excavación, Relleno, Demolición |
| 02 - Cimentación | 2 | Zapatas, Vigas |
| 03 - Estructura | 3 | Columnas, Vigas, Losas |
| 04 - Albañilería | 2 | Muros, Tabiques |
| 05 - Instalaciones Eléctricas | 2 | Cableado, Tableros |
| 06 - Instalaciones Sanitarias | 2 | Agua Potable, Desagüe |
| 07 - Acabados | 3 | Pisos, Pintura, Carpintería |
| 08 - Otros | 1 | Gastos Generales (Default) |

## Programmatic Usage

```typescript
import { performMigration } from '@/utils/migration'

// Load existing data
const projects = await loadProjects()
const expenses = await loadExpenses()

// Run migration
const result = performMigration(projects, expenses)

// Check results
console.log(result.stats)
// {
//   costCodesCreated: 18,
//   projectsMigrated: 10,
//   expensesMigrated: 50,
//   expensesNeedingReview: 5
// }

// Save to database
await saveCostCodes(result.costCodes)
await saveProjects(result.projects)
await saveExpenses(result.expenses)
```

## Troubleshooting

### No data to migrate?
✅ Normal for new installations. Cost codes are still created.

### Expenses marked "Needs Classification"?
✅ Expected. Review and update in Expense Approvals page.

### Projects have zero budget?
✅ Expected. Set budgets in Project Financials page.

## Full Documentation

- [Migration Guide](./MIGRATION_GUIDE.md) - Complete guide
- [Implementation Summary](./MIGRATION_IMPLEMENTATION_SUMMARY.md) - Technical details
- [Requirements](./requirements.md) - System requirements
- [Design](./design.md) - Architecture design

---

**Quick Start:** Run `npm run migrate:job-costing` and follow the prompts!
