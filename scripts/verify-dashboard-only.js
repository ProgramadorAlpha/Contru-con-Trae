#!/usr/bin/env node

/**
 * Verify Dashboard Unification Code Only
 * 
 * This script checks only the dashboard-related files for TypeScript errors,
 * ignoring unrelated code (like document management).
 */

import { execSync } from 'child_process';

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

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf-8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return null;
  }
}

function checkFile(file) {
  try {
    exec(`npx tsc --noEmit ${file}`, { silent: true });
    return true;
  } catch {
    return false;
  }
}

function verifyDashboardCode() {
  log('\n🔍 Verifying Dashboard Unification Code', colors.bright + colors.blue);
  log('='.repeat(60), colors.blue);
  
  const dashboardFiles = [
    // Theme System
    'src/contexts/ThemeContext.tsx',
    'src/hooks/useDarkMode.ts',
    'src/components/DarkModeToggle.tsx',
    
    // Layout Components
    'src/components/Layout.tsx',
    'src/components/Header.tsx',
    'src/components/Sidebar.tsx',
    
    // Dashboard Components
    'src/pages/UnifiedDashboard.tsx',
    'src/components/dashboard/DashboardHeader.tsx',
    'src/components/dashboard/DashboardStats.tsx',
    'src/components/dashboard/DashboardCharts.tsx',
    'src/components/dashboard/DashboardFilters.tsx',
    'src/components/dashboard/DashboardSettings.tsx',
    'src/components/dashboard/NotificationCenter.tsx',
    'src/components/dashboard/LoadingSkeletons.tsx',
    'src/components/dashboard/ChartErrorBoundary.tsx',
    
    // Modals
    'src/components/dashboard/modals/FinanceModal.tsx',
    'src/components/dashboard/modals/VisitScheduleModal.tsx',
    
    // Config
    'src/components/dashboard/config/widgetConfig.ts',
    
    // Hooks
    'src/hooks/useDashboardData.ts',
    'src/hooks/useDashboardSettings.ts',
    'src/hooks/useNotifications.ts',
    'src/hooks/useDebounce.ts',
    
    // Utils
    'src/lib/performanceUtils.ts',
  ];
  
  log('\n📁 Checking dashboard files for TypeScript errors...\n', colors.cyan);
  
  let allPassed = true;
  let checkedCount = 0;
  let passedCount = 0;
  let failedCount = 0;
  
  for (const file of dashboardFiles) {
    process.stdout.write(`  ${file}... `);
    checkedCount++;
    
    if (checkFile(file)) {
      log('✅', colors.green);
      passedCount++;
    } else {
      log('❌', colors.red);
      failedCount++;
      allPassed = false;
    }
  }
  
  log('\n' + '='.repeat(60), colors.blue);
  log(`\n📊 Results:`, colors.cyan);
  log(`  Total files checked: ${checkedCount}`);
  log(`  Passed: ${passedCount}`, colors.green);
  log(`  Failed: ${failedCount}`, failedCount > 0 ? colors.red : colors.green);
  
  if (allPassed) {
    log('\n✅ All dashboard files are TypeScript clean!', colors.green);
    log('✅ Dashboard Unification is ready for deployment!', colors.green);
    return true;
  } else {
    log('\n❌ Some dashboard files have TypeScript errors', colors.red);
    log('❌ Fix these errors before deploying', colors.red);
    return false;
  }
}

function checkTests() {
  log('\n🧪 Running Dashboard Tests', colors.cyan);
  log('='.repeat(60), colors.blue);
  
  try {
    exec('npm run test:run -- src/components/dashboard', { silent: false });
    exec('npm run test:run -- src/contexts/__tests__/ThemeContext.test.tsx', { silent: false });
    exec('npm run test:run -- src/hooks/__tests__/useDarkMode.test.tsx', { silent: false });
    log('\n✅ All dashboard tests passed!', colors.green);
    return true;
  } catch {
    log('\n❌ Some dashboard tests failed', colors.red);
    return false;
  }
}

async function main() {
  log('\n🚀 Dashboard Unification - Verification Tool', colors.bright + colors.blue);
  log('='.repeat(60), colors.blue);
  log('\nThis tool verifies ONLY dashboard-related code,', colors.cyan);
  log('ignoring unrelated features (like document management).\n', colors.cyan);
  
  // Verify TypeScript
  const tsClean = verifyDashboardCode();
  
  // Run tests
  const testsPass = checkTests();
  
  // Summary
  log('\n' + '='.repeat(60), colors.blue);
  log('\n📋 Deployment Readiness Summary', colors.bright + colors.blue);
  log('='.repeat(60), colors.blue);
  
  log(`\n  TypeScript (Dashboard): ${tsClean ? '✅ PASS' : '❌ FAIL'}`, tsClean ? colors.green : colors.red);
  log(`  Tests (Dashboard): ${testsPass ? '✅ PASS' : '❌ FAIL'}`, testsPass ? colors.green : colors.red);
  
  if (tsClean && testsPass) {
    log('\n✅ Dashboard Unification is READY for deployment!', colors.bright + colors.green);
    log('\n📝 Note: There are TypeScript errors in OTHER parts of the codebase', colors.yellow);
    log('   (document management pages), but these are NOT part of', colors.yellow);
    log('   the dashboard unification project.', colors.yellow);
    log('\n💡 See DEPLOYMENT_NOTES.md for deployment options.', colors.cyan);
    process.exit(0);
  } else {
    log('\n❌ Dashboard code needs fixes before deployment', colors.red);
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, colors.red);
  process.exit(1);
});
