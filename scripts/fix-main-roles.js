#!/usr/bin/env node

/**
 * Script to add role="main" to all page components
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const pages = [
  'src/pages/SubcontractsPage.tsx',
  'src/pages/ProgressCertificatesPage.tsx',
  'src/pages/CostCodesPage.tsx',
  'src/pages/ExpenseApprovalsPage.tsx',
  'src/pages/ProjectFinancialsPage.tsx',
  'src/pages/AuditLogPage.tsx',
  'src/pages/TeamPage.tsx',
  'src/pages/UserProfilePage.tsx',
  'src/pages/budget/BudgetPage.tsx',
  'src/pages/reports/ReportsPage.tsx',
  'src/pages/EnhancedDashboard.tsx'
];

pages.forEach(filePath => {
  try {
    let content = readFileSync(filePath, 'utf-8');
    
    // Replace return (<div with return (<main role="main"
    content = content.replace(
      /return \(\s*<div className="space-y-6">/g,
      'return (\n    <main role="main" className="space-y-6">'
    );
    
    // Replace return (<div with return (<main role="main" for other patterns
    content = content.replace(
      /return \(\s*<div className="(container|max-w-|min-h-)/g,
      (match, className) => `return (\n    <main role="main" className="${className}`
    );
    
    // Replace closing </div> before ) with </main>
    const lines = content.split('\n');
    let modified = false;
    
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === ')' && i > 0) {
        if (lines[i-1].trim() === '</div>') {
          lines[i-1] = lines[i-1].replace('</div>', '</main>');
          modified = true;
          break;
        }
      }
    }
    
    if (modified) {
      content = lines.join('\n');
    }
    
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log('\n✅ All pages updated with role="main"');
