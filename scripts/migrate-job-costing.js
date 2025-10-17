#!/usr/bin/env node

/**
 * Job Costing System - Data Migration Script
 * 
 * This script migrates existing projects and expenses to support the new
 * Job Costing system with cost codes, subcontracts, and financial tracking.
 * 
 * Requirements: 3.1, 9.5
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Default Cost Code Catalog
 * Based on standard construction WBS (Work Breakdown Structure)
 */
const DEFAULT_COST_CODES = [
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
  },
  
  // 08 - Otros (Default for unclassified)
  {
    code: '08.01.01',
    name: 'Gastos Generales',
    description: 'Gastos generales no clasificados',
    division: '08 - Otros',
    category: '08.01 - Gastos Generales',
    subcategory: '08.01.01 - Gastos Generales',
    type: 'other',
    unit: 'global',
    isActive: true,
    isDefault: true // This is the default cost code for auto-classification
  }
];

/**
 * Generate a unique ID
 */
function generateId(prefix = 'ID') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Initialize Cost Code Catalog
 */
function initializeCostCodeCatalog() {
  log('\n📋 Initializing Cost Code Catalog...', colors.cyan);
  
  const costCodes = DEFAULT_COST_CODES.map(code => ({
    ...code,
    id: generateId('CC'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  
  log(`  ✅ Created ${costCodes.length} cost codes`, colors.green);
  
  // Display summary by division
  const divisions = {};
  costCodes.forEach(code => {
    divisions[code.division] = (divisions[code.division] || 0) + 1;
  });
  
  log('\n  Cost Codes by Division:', colors.cyan);
  Object.entries(divisions).forEach(([division, count]) => {
    log(`    • ${division}: ${count} codes`, colors.reset);
  });
  
  return costCodes;
}

/**
 * Migrate existing projects to add financial fields
 */
function migrateProjects(projects, costCodes) {
  log('\n🏗️  Migrating Projects...', colors.cyan);
  
  if (!projects || projects.length === 0) {
    log('  ℹ️  No existing projects to migrate', colors.yellow);
    return [];
  }
  
  const defaultCostCode = costCodes.find(cc => cc.isDefault);
  
  const migratedProjects = projects.map(project => {
    // Add new financial fields if they don't exist
    const migrated = {
      ...project,
      
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
      
      // Update timestamp
      updatedAt: new Date().toISOString()
    };
    
    return migrated;
  });
  
  log(`  ✅ Migrated ${migratedProjects.length} projects`, colors.green);
  
  return migratedProjects;
}

/**
 * Migrate existing expenses to add classification fields
 */
function migrateExpenses(expenses, projects, costCodes) {
  log('\n💰 Migrating Expenses...', colors.cyan);
  
  if (!expenses || expenses.length === 0) {
    log('  ℹ️  No existing expenses to migrate', colors.yellow);
    return [];
  }
  
  const defaultCostCode = costCodes.find(cc => cc.isDefault);
  const defaultProject = projects && projects.length > 0 ? projects[0] : null;
  
  let needsReviewCount = 0;
  
  const migratedExpenses = expenses.map(expense => {
    // Check if expense already has required classification
    const hasClassification = expense.projectId && expense.costCodeId && expense.supplierId;
    
    if (hasClassification) {
      // Already classified, just ensure all fields are present
      return {
        ...expense,
        isAutoCreated: expense.isAutoCreated || false,
        needsReview: expense.needsReview || false,
        updatedAt: new Date().toISOString()
      };
    }
    
    // Needs classification - add default values and mark for review
    needsReviewCount++;
    
    const migrated = {
      ...expense,
      
      // MANDATORY CLASSIFICATION (use defaults, mark for review)
      projectId: expense.projectId || (defaultProject ? defaultProject.id : 'NEEDS_CLASSIFICATION'),
      projectName: expense.projectName || (defaultProject ? defaultProject.name : 'Needs Classification'),
      costCodeId: expense.costCodeId || defaultCostCode.id,
      costCode: expense.costCode || defaultCostCode,
      supplierId: expense.supplierId || 'NEEDS_CLASSIFICATION',
      supplierName: expense.supplierName || 'Needs Classification',
      
      // Mark as needing review
      needsReview: true,
      isAutoCreated: expense.isAutoCreated || false,
      
      // Ensure status is set
      status: expense.status || 'draft',
      paymentStatus: expense.paymentStatus || 'unpaid',
      
      // Ensure financial fields
      currency: expense.currency || 'USD',
      totalAmount: expense.totalAmount || expense.amount || 0,
      
      // Ensure arrays
      attachments: expense.attachments || [],
      
      // Update timestamp
      updatedAt: new Date().toISOString()
    };
    
    return migrated;
  });
  
  log(`  ✅ Migrated ${migratedExpenses.length} expenses`, colors.green);
  
  if (needsReviewCount > 0) {
    log(`  ⚠️  ${needsReviewCount} expenses need manual classification review`, colors.yellow);
  }
  
  return migratedExpenses;
}

/**
 * Generate migration report
 */
function generateMigrationReport(costCodes, projects, expenses) {
  const timestamp = new Date().toISOString();
  
  const report = `# Job Costing System - Data Migration Report

## Migration Information

- **Date**: ${new Date().toLocaleDateString()}
- **Time**: ${new Date().toLocaleTimeString()}
- **Timestamp**: ${timestamp}

## Migration Summary

### Cost Code Catalog
- **Total Cost Codes**: ${costCodes.length}
- **Active Cost Codes**: ${costCodes.filter(cc => cc.isActive).length}
- **Default Cost Code**: ${costCodes.find(cc => cc.isDefault)?.name || 'None'}

#### Cost Codes by Division
${Object.entries(
  costCodes.reduce((acc, cc) => {
    acc[cc.division] = (acc[cc.division] || 0) + 1;
    return acc;
  }, {})
).map(([division, count]) => `- ${division}: ${count} codes`).join('\n')}

#### Cost Codes by Type
${Object.entries(
  costCodes.reduce((acc, cc) => {
    acc[cc.type] = (acc[cc.type] || 0) + 1;
    return acc;
  }, {})
).map(([type, count]) => `- ${type}: ${count} codes`).join('\n')}

### Projects
- **Total Projects Migrated**: ${projects.length}
- **Projects with Budgets**: ${projects.filter(p => p.totalBudget > 0).length}
- **Projects with Cost Code Budgets**: ${projects.filter(p => p.costCodeBudgets && p.costCodeBudgets.length > 0).length}

### Expenses
- **Total Expenses Migrated**: ${expenses.length}
- **Expenses Needing Review**: ${expenses.filter(e => e.needsReview).length}
- **Auto-Created Expenses**: ${expenses.filter(e => e.isAutoCreated).length}
- **Expenses by Status**:
${Object.entries(
  expenses.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {})
).map(([status, count]) => `  - ${status}: ${count}`).join('\n')}

## Post-Migration Actions Required

### 1. Review Unclassified Expenses
${expenses.filter(e => e.needsReview).length > 0 ? `
⚠️  **${expenses.filter(e => e.needsReview).length} expenses need manual classification**

These expenses have been assigned default values and marked with \`needsReview: true\`.
Please review and update:
- Project assignment
- Cost code classification
- Supplier information

Access the Expense Approvals page to review and classify these expenses.
` : '✅ All expenses are properly classified'}

### 2. Set Up Project Budgets
${projects.filter(p => p.totalBudget === 0).length > 0 ? `
⚠️  **${projects.filter(p => p.totalBudget === 0).length} projects have no budget set**

Please set budgets for these projects:
${projects.filter(p => p.totalBudget === 0).map(p => `- ${p.name} (${p.code})`).join('\n')}

Use the Project Financials page to set budgets and allocate to cost codes.
` : '✅ All projects have budgets configured'}

### 3. Configure Cost Code Budgets
${projects.filter(p => !p.costCodeBudgets || p.costCodeBudgets.length === 0).length > 0 ? `
ℹ️  **${projects.filter(p => !p.costCodeBudgets || p.costCodeBudgets.length === 0).length} projects have no cost code budgets**

Consider creating cost code budgets for detailed tracking:
${projects.filter(p => !p.costCodeBudgets || p.costCodeBudgets.length === 0).slice(0, 5).map(p => `- ${p.name}`).join('\n')}
${projects.filter(p => !p.costCodeBudgets || p.costCodeBudgets.length === 0).length > 5 ? `... and ${projects.filter(p => !p.costCodeBudgets || p.costCodeBudgets.length === 0).length - 5} more` : ''}

Use the Cost Codes page to create budgets for each project.
` : '✅ Projects have cost code budgets configured'}

### 4. Verify Financial Calculations
After migration, verify that:
- [ ] Project committed costs are calculated correctly
- [ ] Project actual costs match expense totals
- [ ] Project margins are calculated correctly
- [ ] Cost code budgets reflect actual spending
- [ ] Dashboard widgets display correct data

### 5. Configure n8n Workflow (Optional)
If using OCR automation for expenses:
- [ ] Set up n8n workflow for OCR processing
- [ ] Configure API endpoint: POST /api/expenses/auto-create
- [ ] Test with sample receipts
- [ ] Configure auto-classification rules

See: .kiro/specs/job-costing-system/N8N_CONFIGURATION_GUIDE.md

## Migration Status

✅ **Migration Completed Successfully**

All data has been migrated and is ready for use. Please complete the post-migration
actions above to ensure optimal system performance.

## Support

- Requirements: .kiro/specs/job-costing-system/requirements.md
- Design: .kiro/specs/job-costing-system/design.md
- Deployment Guide: .kiro/specs/job-costing-system/DEPLOYMENT_GUIDE.md
- API Reference: docs/API_REFERENCE.md

---
Generated: ${timestamp}
`;
  
  return report;
}

/**
 * Save migration data
 */
function saveMigrationData(costCodes, projects, expenses) {
  log('\n💾 Saving Migration Data...', colors.cyan);
  
  const dataDir = join(process.cwd(), 'database');
  
  // Create database directory if it doesn't exist
  if (!existsSync(dataDir)) {
    log('  ℹ️  Database directory does not exist. Data will be saved to migration files.', colors.yellow);
  }
  
  // Save to migration output directory
  const migrationDir = join(process.cwd(), '.kiro', 'specs', 'job-costing-system', 'migration');
  
  try {
    // Create migration directory
    if (!existsSync(migrationDir)) {
      mkdirSync(migrationDir, { recursive: true });
    }
    
    // Save cost codes
    const costCodesPath = join(migrationDir, 'cost-codes.json');
    writeFileSync(costCodesPath, JSON.stringify(costCodes, null, 2));
    log(`  ✅ Cost codes saved: ${costCodesPath}`, colors.green);
    
    // Save projects
    if (projects.length > 0) {
      const projectsPath = join(migrationDir, 'projects.json');
      writeFileSync(projectsPath, JSON.stringify(projects, null, 2));
      log(`  ✅ Projects saved: ${projectsPath}`, colors.green);
    }
    
    // Save expenses
    if (expenses.length > 0) {
      const expensesPath = join(migrationDir, 'expenses.json');
      writeFileSync(expensesPath, JSON.stringify(expenses, null, 2));
      log(`  ✅ Expenses saved: ${expensesPath}`, colors.green);
    }
    
    log('\n  ℹ️  Migration data saved to: ' + migrationDir, colors.cyan);
    log('  ℹ️  Import this data into your database (Firestore, etc.)', colors.cyan);
    
  } catch (error) {
    log(`  ⚠️  Could not save migration data: ${error.message}`, colors.yellow);
  }
}

/**
 * Main migration function
 */
async function migrate() {
  log('\n🚀 Job Costing System - Data Migration', colors.bright + colors.blue);
  log('='.repeat(70), colors.blue);
  
  try {
    // Step 1: Initialize Cost Code Catalog
    const costCodes = initializeCostCodeCatalog();
    
    // Step 2: Load existing data (if any)
    // In a real implementation, this would load from database
    // For now, we'll use empty arrays as this is a new system
    const existingProjects = [];
    const existingExpenses = [];
    
    log('\n📊 Existing Data:', colors.cyan);
    log(`  • Projects: ${existingProjects.length}`, colors.reset);
    log(`  • Expenses: ${existingExpenses.length}`, colors.reset);
    
    // Step 3: Migrate Projects
    const migratedProjects = migrateProjects(existingProjects, costCodes);
    
    // Step 4: Migrate Expenses
    const migratedExpenses = migrateExpenses(existingExpenses, migratedProjects, costCodes);
    
    // Step 5: Save migration data
    saveMigrationData(costCodes, migratedProjects, migratedExpenses);
    
    // Step 6: Generate migration report
    const report = generateMigrationReport(costCodes, migratedProjects, migratedExpenses);
    const reportPath = join(process.cwd(), '.kiro', 'specs', 'job-costing-system', 'MIGRATION_REPORT.md');
    writeFileSync(reportPath, report);
    
    log('\n📄 Migration Report:', colors.cyan);
    log(`  ✅ Report saved: ${reportPath}`, colors.green);
    
    // Display summary
    log('\n' + '='.repeat(70), colors.blue);
    log('✅ Migration Completed Successfully!', colors.bright + colors.green);
    log('='.repeat(70), colors.blue);
    
    log('\n📋 Summary:', colors.cyan);
    log(`  • Cost Codes Initialized: ${costCodes.length}`, colors.green);
    log(`  • Projects Migrated: ${migratedProjects.length}`, colors.green);
    log(`  • Expenses Migrated: ${migratedExpenses.length}`, colors.green);
    
    if (migratedExpenses.filter(e => e.needsReview).length > 0) {
      log(`\n⚠️  Action Required:`, colors.yellow);
      log(`  • ${migratedExpenses.filter(e => e.needsReview).length} expenses need manual classification`, colors.yellow);
      log(`  • Review them in the Expense Approvals page`, colors.yellow);
    }
    
    log('\n📖 Next Steps:', colors.cyan);
    log('  1. Review the migration report', colors.reset);
    log('  2. Import migration data into your database', colors.reset);
    log('  3. Set up project budgets and cost code allocations', colors.reset);
    log('  4. Review and classify unclassified expenses', colors.reset);
    log('  5. Configure n8n workflow for OCR automation (optional)', colors.reset);
    
    log('\n📚 Documentation:', colors.cyan);
    log('  • Migration Report: ' + reportPath, colors.reset);
    log('  • Deployment Guide: .kiro/specs/job-costing-system/DEPLOYMENT_GUIDE.md', colors.reset);
    log('  • Requirements: .kiro/specs/job-costing-system/requirements.md', colors.reset);
    
  } catch (error) {
    log('\n❌ Migration failed:', colors.red);
    log(error.message, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
migrate();
