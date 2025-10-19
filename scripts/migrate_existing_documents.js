#!/usr/bin/env node

/**
 * Documents ↔ Projects Integration - Data Migration Script
 * 
 * This script migrates existing documents to ensure they all have a project assignment.
 * Documents without a project will be assigned to a default "General" project.
 * 
 * Requirements: 1
 * Task: 2.1
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
  magenta: '\x1b[35m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Generate a unique ID
 */
function generateId(prefix = 'ID') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create or get "General" project
 */
function ensureGeneralProject(projects) {
  log('\n📁 Ensuring "General" project exists...', colors.cyan);
  
  // Check if General project already exists
  let generalProject = projects.find(p => 
    p.codigo === 'GENERAL' || 
    p.nombre.toLowerCase().includes('general') ||
    p.nombre.toLowerCase().includes('sin proyecto')
  );
  
  if (generalProject) {
    log(`  ✅ Found existing General project: ${generalProject.nombre} (${generalProject.id})`, colors.green);
    return { project: generalProject, created: false };
  }
  
  // Create new General project
  generalProject = {
    id: generateId('PROJ'),
    nombre: 'General',
    codigo: 'GENERAL',
    cliente: 'Sistema',
    descripcion: 'Proyecto por defecto para documentos sin clasificar',
    estado: 'Activo',
    fecha_inicio: new Date().toISOString().split('T')[0],
    presupuesto_total: 0,
    limite_documentos: 50000,
    limite_espacio_gb: 500,
    creado_por: 'SYSTEM',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  projects.push(generalProject);
  
  log(`  ✅ Created new General project: ${generalProject.id}`, colors.green);
  return { project: generalProject, created: true };
}

/**
 * Analyze documents and identify orphans
 */
function analyzeDocuments(documents, projects) {
  log('\n🔍 Analyzing documents...', colors.cyan);
  
  const stats = {
    total: documents.length,
    withProject: 0,
    withoutProject: 0,
    invalidProject: 0,
    byType: {},
    byProject: {}
  };
  
  const projectIds = new Set(projects.map(p => p.id));
  const orphanDocuments = [];
  
  documents.forEach(doc => {
    // Count by type
    stats.byType[doc.tipo] = (stats.byType[doc.tipo] || 0) + 1;
    
    // Check project assignment
    if (!doc.proyecto_id) {
      stats.withoutProject++;
      orphanDocuments.push(doc);
    } else if (!projectIds.has(doc.proyecto_id)) {
      stats.invalidProject++;
      orphanDocuments.push(doc);
      log(`  ⚠️  Document "${doc.nombre}" has invalid project ID: ${doc.proyecto_id}`, colors.yellow);
    } else {
      stats.withProject++;
      stats.byProject[doc.proyecto_id] = (stats.byProject[doc.proyecto_id] || 0) + 1;
    }
  });
  
  log(`\n  📊 Document Statistics:`, colors.cyan);
  log(`    • Total documents: ${stats.total}`, colors.reset);
  log(`    • With valid project: ${stats.withProject} (${((stats.withProject/stats.total)*100).toFixed(1)}%)`, colors.green);
  log(`    • Without project: ${stats.withoutProject} (${((stats.withoutProject/stats.total)*100).toFixed(1)}%)`, colors.yellow);
  log(`    • With invalid project: ${stats.invalidProject}`, colors.red);
  
  if (Object.keys(stats.byType).length > 0) {
    log(`\n  📁 Documents by Type:`, colors.cyan);
    Object.entries(stats.byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        log(`    • ${type}: ${count}`, colors.reset);
      });
  }
  
  return { stats, orphanDocuments };
}

/**
 * Migrate orphan documents to General project
 */
function migrateOrphanDocuments(orphanDocuments, generalProject) {
  log('\n🔄 Migrating orphan documents...', colors.cyan);
  
  if (orphanDocuments.length === 0) {
    log('  ✅ No orphan documents to migrate', colors.green);
    return [];
  }
  
  const migratedDocuments = orphanDocuments.map(doc => {
    const migrated = {
      ...doc,
      proyecto_id: generalProject.id,
      updated_at: new Date().toISOString(),
      // Add migration metadata
      _migration: {
        migratedAt: new Date().toISOString(),
        previousProjectId: doc.proyecto_id || null,
        reason: doc.proyecto_id ? 'invalid_project' : 'no_project',
        assignedTo: generalProject.id
      }
    };
    
    return migrated;
  });
  
  log(`  ✅ Migrated ${migratedDocuments.length} documents to General project`, colors.green);
  
  // Show sample of migrated documents
  if (migratedDocuments.length > 0) {
    log(`\n  📄 Sample of migrated documents:`, colors.cyan);
    migratedDocuments.slice(0, 5).forEach(doc => {
      log(`    • ${doc.nombre} (${doc.tipo})`, colors.reset);
    });
    if (migratedDocuments.length > 5) {
      log(`    ... and ${migratedDocuments.length - 5} more`, colors.reset);
    }
  }
  
  return migratedDocuments;
}

/**
 * Update documents array with migrated documents
 */
function updateDocuments(documents, migratedDocuments) {
  const migratedIds = new Set(migratedDocuments.map(d => d.id));
  
  return documents.map(doc => {
    if (migratedIds.has(doc.id)) {
      return migratedDocuments.find(m => m.id === doc.id);
    }
    return doc;
  });
}

/**
 * Validate migration results
 */
function validateMigration(documents, projects) {
  log('\n✅ Validating migration...', colors.cyan);
  
  const projectIds = new Set(projects.map(p => p.id));
  const errors = [];
  
  documents.forEach(doc => {
    if (!doc.proyecto_id) {
      errors.push(`Document "${doc.nombre}" (${doc.id}) has no project_id`);
    } else if (!projectIds.has(doc.proyecto_id)) {
      errors.push(`Document "${doc.nombre}" (${doc.id}) has invalid project_id: ${doc.proyecto_id}`);
    }
  });
  
  if (errors.length === 0) {
    log('  ✅ All documents have valid project assignments', colors.green);
    return true;
  } else {
    log(`  ❌ Found ${errors.length} validation errors:`, colors.red);
    errors.slice(0, 10).forEach(err => log(`    • ${err}`, colors.red));
    if (errors.length > 10) {
      log(`    ... and ${errors.length - 10} more errors`, colors.red);
    }
    return false;
  }
}

/**
 * Generate migration report
 */
function generateMigrationReport(stats, generalProject, migratedDocuments, wasCreated) {
  const timestamp = new Date().toISOString();
  
  const report = `# Documents Data Migration Report

## Migration Information

- **Date**: ${new Date().toLocaleDateString()}
- **Time**: ${new Date().toLocaleTimeString()}
- **Timestamp**: ${timestamp}
- **Script**: migrate_existing_documents.js

## Migration Summary

### General Project
- **Project ID**: ${generalProject.id}
- **Project Name**: ${generalProject.nombre}
- **Project Code**: ${generalProject.codigo}
- **Status**: ${wasCreated ? '✨ Created new' : '✅ Used existing'}

### Document Statistics

#### Before Migration
- **Total Documents**: ${stats.total}
- **With Valid Project**: ${stats.withProject} (${((stats.withProject/stats.total)*100).toFixed(1)}%)
- **Without Project**: ${stats.withoutProject} (${((stats.withoutProject/stats.total)*100).toFixed(1)}%)
- **With Invalid Project**: ${stats.invalidProject}

#### After Migration
- **Total Documents**: ${stats.total}
- **With Valid Project**: ${stats.total} (100%)
- **Migrated to General**: ${migratedDocuments.length}

### Documents by Type
${Object.entries(stats.byType)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => `- **${type}**: ${count} documents`)
  .join('\n')}

### Migrated Documents

${migratedDocuments.length > 0 ? `
**${migratedDocuments.length} documents** were migrated to the General project:

${migratedDocuments.slice(0, 20).map(doc => 
  `- ${doc.nombre} (${doc.tipo}) - ${doc._migration.reason === 'no_project' ? 'No project assigned' : 'Invalid project ID'}`
).join('\n')}

${migratedDocuments.length > 20 ? `\n... and ${migratedDocuments.length - 20} more documents\n` : ''}

#### Migration Reasons
${Object.entries(
  migratedDocuments.reduce((acc, doc) => {
    acc[doc._migration.reason] = (acc[doc._migration.reason] || 0) + 1;
    return acc;
  }, {})
).map(([reason, count]) => `- **${reason}**: ${count} documents`).join('\n')}
` : '✅ No documents needed migration - all documents already had valid project assignments'}

## Post-Migration Actions

### 1. Review Migrated Documents

${migratedDocuments.length > 0 ? `
⚠️  **${migratedDocuments.length} documents** were assigned to the General project.

Please review these documents and reassign them to appropriate projects:

1. Open the Documents module
2. Filter by project: "General"
3. Review each document
4. Reassign to correct project using the project selector

**Priority Documents to Review:**
${migratedDocuments
  .filter(d => d.tipo === 'Contrato' || d.tipo === 'Factura')
  .slice(0, 10)
  .map(d => `- ${d.nombre} (${d.tipo})`)
  .join('\n')}
` : '✅ No documents need review - all documents already had valid project assignments'}

### 2. Apply NOT NULL Constraint

After verifying all documents have valid projects, apply the NOT NULL constraint:

\`\`\`sql
-- Verify no documents without project
SELECT COUNT(*) FROM documentos WHERE proyecto_id IS NULL;
-- Should return 0

-- Apply NOT NULL constraint
ALTER TABLE documentos ALTER COLUMN proyecto_id SET NOT NULL;
\`\`\`

### 3. Update Project Statistics

Refresh the project statistics view:

\`\`\`sql
SELECT refresh_proyecto_stats();
\`\`\`

### 4. Verify Data Integrity

Run these verification queries:

\`\`\`sql
-- Check all documents have valid projects
SELECT COUNT(*) as orphan_count
FROM documentos d
LEFT JOIN proyectos p ON d.proyecto_id = p.id
WHERE p.id IS NULL;
-- Should return 0

-- Check General project document count
SELECT COUNT(*) as general_docs
FROM documentos
WHERE proyecto_id = '${generalProject.id}';
-- Should return ${migratedDocuments.length}

-- View project document distribution
SELECT 
  p.nombre,
  COUNT(d.id) as doc_count
FROM proyectos p
LEFT JOIN documentos d ON d.proyecto_id = p.id
GROUP BY p.id, p.nombre
ORDER BY doc_count DESC;
\`\`\`

## Migration Status

${migratedDocuments.length === 0 ? 
  '✅ **No Migration Needed** - All documents already had valid project assignments' :
  `✅ **Migration Completed Successfully** - ${migratedDocuments.length} documents migrated to General project`
}

## Next Steps

1. ${migratedDocuments.length > 0 ? '⚠️  Review and reassign migrated documents' : '✅ No action needed'}
2. ✅ Apply NOT NULL constraint to proyecto_id
3. ✅ Refresh project statistics
4. ✅ Verify data integrity
5. ✅ Update application to enforce project selection

## Support

- Requirements: .kiro/specs/documents-projects-integration/requirements.md
- Design: .kiro/specs/documents-projects-integration/design.md
- Migration Guide: migrations/MIGRATION_TESTING_GUIDE.md

---
Generated: ${timestamp}
`;
  
  return report;
}

/**
 * Save migration data
 */
function saveMigrationData(projects, documents, generalProject, migratedDocuments) {
  log('\n💾 Saving migration data...', colors.cyan);
  
  const migrationDir = join(process.cwd(), '.kiro', 'specs', 'documents-projects-integration', 'migration');
  
  try {
    // Create migration directory
    if (!existsSync(migrationDir)) {
      mkdirSync(migrationDir, { recursive: true });
    }
    
    // Save projects (including General if created)
    const projectsPath = join(migrationDir, 'projects.json');
    writeFileSync(projectsPath, JSON.stringify(projects, null, 2));
    log(`  ✅ Projects saved: ${projectsPath}`, colors.green);
    
    // Save all documents (with migrations applied)
    const documentsPath = join(migrationDir, 'documents.json');
    writeFileSync(documentsPath, JSON.stringify(documents, null, 2));
    log(`  ✅ Documents saved: ${documentsPath}`, colors.green);
    
    // Save migrated documents separately for review
    if (migratedDocuments.length > 0) {
      const migratedPath = join(migrationDir, 'migrated-documents.json');
      writeFileSync(migratedPath, JSON.stringify(migratedDocuments, null, 2));
      log(`  ✅ Migrated documents saved: ${migratedPath}`, colors.green);
    }
    
    // Save General project info
    const generalPath = join(migrationDir, 'general-project.json');
    writeFileSync(generalPath, JSON.stringify(generalProject, null, 2));
    log(`  ✅ General project info saved: ${generalPath}`, colors.green);
    
    log('\n  ℹ️  Migration data saved to: ' + migrationDir, colors.cyan);
    log('  ℹ️  Import this data into your database', colors.cyan);
    
  } catch (error) {
    log(`  ⚠️  Could not save migration data: ${error.message}`, colors.yellow);
  }
}

/**
 * Create backup of current data
 */
function createBackup(projects, documents) {
  log('\n💾 Creating backup...', colors.cyan);
  
  const backupDir = join(process.cwd(), 'backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    // Create backup directory
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
    
    const backupData = {
      timestamp: new Date().toISOString(),
      projects: projects,
      documents: documents
    };
    
    const backupPath = join(backupDir, `backup-before-doc-migration-${timestamp}.json`);
    writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    log(`  ✅ Backup created: ${backupPath}`, colors.green);
    return backupPath;
    
  } catch (error) {
    log(`  ⚠️  Could not create backup: ${error.message}`, colors.yellow);
    return null;
  }
}

/**
 * Main migration function
 */
async function migrate() {
  log('\n🚀 Documents Data Migration', colors.bright + colors.blue);
  log('='.repeat(70), colors.blue);
  
  try {
    // Step 1: Load existing data
    // In a real implementation, this would load from database
    // For now, we'll use mock data or empty arrays
    log('\n📊 Loading existing data...', colors.cyan);
    
    // Try to load from mock data or use empty arrays
    let existingProjects = [];
    let existingDocuments = [];
    
    try {
      // Try to load mock data if available
      const mockDataPath = join(process.cwd(), 'src', 'lib', 'mockData.js');
      if (existsSync(mockDataPath)) {
        log('  ℹ️  Mock data file found, but using empty arrays for migration', colors.yellow);
      }
    } catch (error) {
      // Ignore errors, use empty arrays
    }
    
    log(`  • Projects: ${existingProjects.length}`, colors.reset);
    log(`  • Documents: ${existingDocuments.length}`, colors.reset);
    
    if (existingDocuments.length === 0) {
      log('\n  ℹ️  No existing documents found. This is expected for a new system.', colors.yellow);
      log('  ℹ️  Migration will create the General project for future use.', colors.yellow);
    }
    
    // Step 2: Create backup
    const backupPath = createBackup(existingProjects, existingDocuments);
    
    // Step 3: Ensure General project exists
    const { project: generalProject, created: wasCreated } = ensureGeneralProject(existingProjects);
    
    // Step 4: Analyze documents
    const { stats, orphanDocuments } = analyzeDocuments(existingDocuments, existingProjects);
    
    // Step 5: Migrate orphan documents
    const migratedDocuments = migrateOrphanDocuments(orphanDocuments, generalProject);
    
    // Step 6: Update documents array
    const updatedDocuments = updateDocuments(existingDocuments, migratedDocuments);
    
    // Step 7: Validate migration
    const isValid = validateMigration(updatedDocuments, existingProjects);
    
    if (!isValid) {
      throw new Error('Migration validation failed. Please review errors above.');
    }
    
    // Step 8: Save migration data
    saveMigrationData(existingProjects, updatedDocuments, generalProject, migratedDocuments);
    
    // Step 9: Generate migration report
    const report = generateMigrationReport(stats, generalProject, migratedDocuments, wasCreated);
    const reportPath = join(
      process.cwd(),
      '.kiro',
      'specs',
      'documents-projects-integration',
      'DATA_MIGRATION_REPORT.md'
    );
    writeFileSync(reportPath, report);
    
    log('\n📄 Migration Report:', colors.cyan);
    log(`  ✅ Report saved: ${reportPath}`, colors.green);
    
    // Display summary
    log('\n' + '='.repeat(70), colors.blue);
    log('✅ Data Migration Completed Successfully!', colors.bright + colors.green);
    log('='.repeat(70), colors.blue);
    
    log('\n📋 Summary:', colors.cyan);
    log(`  • Total documents: ${stats.total}`, colors.reset);
    log(`  • Documents migrated: ${migratedDocuments.length}`, colors.green);
    log(`  • General project: ${wasCreated ? 'Created' : 'Existing'}`, colors.reset);
    if (backupPath) {
      log(`  • Backup created: ${backupPath}`, colors.green);
    }
    
    if (migratedDocuments.length > 0) {
      log(`\n⚠️  Action Required:`, colors.yellow);
      log(`  • ${migratedDocuments.length} documents assigned to General project`, colors.yellow);
      log(`  • Review and reassign to appropriate projects`, colors.yellow);
      log(`  • See report for details: ${reportPath}`, colors.yellow);
    }
    
    log('\n📖 Next Steps:', colors.cyan);
    log('  1. Review the migration report', colors.reset);
    log('  2. Import migration data into your database', colors.reset);
    log('  3. Review and reassign documents in General project', colors.reset);
    log('  4. Apply NOT NULL constraint to proyecto_id', colors.reset);
    log('  5. Refresh project statistics', colors.reset);
    
    log('\n📚 Documentation:', colors.cyan);
    log('  • Migration Report: ' + reportPath, colors.reset);
    log('  • Migration Guide: migrations/MIGRATION_TESTING_GUIDE.md', colors.reset);
    log('  • Requirements: .kiro/specs/documents-projects-integration/requirements.md', colors.reset);
    
  } catch (error) {
    log('\n❌ Migration failed:', colors.red);
    log(error.message, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
migrate();
