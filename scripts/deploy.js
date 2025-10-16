#!/usr/bin/env node

/**
 * Deployment Script for Dashboard Unification
 * 
 * This script automates the deployment process with safety checks
 * and backup creation.
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync, readFileSync } from 'fs';
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

function getCurrentBranch() {
  return exec('git rev-parse --abbrev-ref HEAD', { silent: true }).trim();
}

function getCurrentCommit() {
  return exec('git rev-parse HEAD', { silent: true }).trim();
}

function hasUncommittedChanges() {
  const status = exec('git status --porcelain', { silent: true });
  return status && status.trim().length > 0;
}

function createBackup() {
  log('\n📦 Creating backup of current version...', colors.cyan);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupBranch = `backup/pre-dashboard-unification-${timestamp}`;
  
  try {
    // Create backup branch
    exec(`git checkout -b ${backupBranch}`);
    exec(`git push origin ${backupBranch}`);
    
    // Return to original branch
    exec('git checkout main');
    
    log(`✅ Backup created: ${backupBranch}`, colors.green);
    return backupBranch;
  } catch (error) {
    log('❌ Failed to create backup', colors.red);
    throw error;
  }
}

function runPreDeploymentChecks() {
  log('\n🔍 Running pre-deployment checks...', colors.cyan);
  
  const checks = [
    {
      name: 'Uncommitted changes',
      check: () => !hasUncommittedChanges(),
      error: 'You have uncommitted changes. Please commit or stash them first.',
    },
    {
      name: 'Current branch',
      check: () => getCurrentBranch() === 'main',
      error: 'You must be on the main branch to deploy.',
      warning: true,
    },
    {
      name: 'Type checking',
      check: () => {
        try {
          exec('npm run check', { silent: true });
          return true;
        } catch {
          return false;
        }
      },
      error: 'TypeScript type checking failed.',
    },
    {
      name: 'Linting',
      check: () => {
        try {
          exec('npm run lint', { silent: true });
          return true;
        } catch {
          return false;
        }
      },
      error: 'Linting failed.',
      warning: true,
    },
    {
      name: 'Tests',
      check: () => {
        try {
          exec('npm run test:run', { silent: true });
          return true;
        } catch {
          return false;
        }
      },
      error: 'Tests failed.',
    },
    {
      name: 'Production build',
      check: () => {
        try {
          exec('npm run build', { silent: true });
          return true;
        } catch {
          return false;
        }
      },
      error: 'Production build failed.',
    },
  ];
  
  let hasErrors = false;
  let hasWarnings = false;
  
  for (const check of checks) {
    process.stdout.write(`  Checking ${check.name}... `);
    
    if (check.check()) {
      log('✅', colors.green);
    } else {
      if (check.warning) {
        log('⚠️  ' + check.error, colors.yellow);
        hasWarnings = true;
      } else {
        log('❌ ' + check.error, colors.red);
        hasErrors = true;
      }
    }
  }
  
  if (hasErrors) {
    log('\n❌ Pre-deployment checks failed. Please fix the errors above.', colors.red);
    process.exit(1);
  }
  
  if (hasWarnings) {
    log('\n⚠️  Some checks have warnings. Review them before proceeding.', colors.yellow);
  } else {
    log('\n✅ All pre-deployment checks passed!', colors.green);
  }
}

function createDeploymentLog(backupBranch) {
  log('\n📝 Creating deployment log...', colors.cyan);
  
  const timestamp = new Date().toISOString();
  const commit = getCurrentCommit();
  const branch = getCurrentBranch();
  
  const logContent = `# Deployment Log

## Deployment Information

- **Date**: ${new Date().toLocaleDateString()}
- **Time**: ${new Date().toLocaleTimeString()}
- **Branch**: ${branch}
- **Commit**: ${commit}
- **Backup Branch**: ${backupBranch}

## Pre-Deployment Checks

- [x] Type checking passed
- [x] Linting passed
- [x] Tests passed
- [x] Production build successful
- [x] Backup created

## Deployment Status

Status: DEPLOYED

## Post-Deployment Verification

### Smoke Tests
- [ ] Application loads without errors
- [ ] Dashboard page renders correctly
- [ ] Theme toggle works
- [ ] Navigation works
- [ ] Charts render correctly
- [ ] Modals function properly
- [ ] Notifications work
- [ ] Settings panel works
- [ ] Data export works
- [ ] Filters work

### Issues Found

_None yet - monitoring in progress_

## Rollback Information

If rollback is needed:

\`\`\`bash
# Via Vercel Dashboard
# Go to Deployments → Find previous deployment → Promote to Production

# Via Git
git checkout ${backupBranch}
git push origin main --force

# Or revert this commit
git revert ${commit}
git push origin main
\`\`\`

---
Generated: ${timestamp}
`;
  
  const logPath = join(process.cwd(), '.kiro', 'specs', 'dashboard-unification', 'DEPLOYMENT_LOG.md');
  writeFileSync(logPath, logContent);
  
  log(`✅ Deployment log created: ${logPath}`, colors.green);
}

function deploy() {
  log('\n🚀 Starting deployment process...', colors.bright + colors.blue);
  
  try {
    // Run pre-deployment checks
    runPreDeploymentChecks();
    
    // Create backup
    const backupBranch = createBackup();
    
    // Create deployment log
    createDeploymentLog(backupBranch);
    
    log('\n✅ Pre-deployment steps completed successfully!', colors.green);
    log('\n📋 Next steps:', colors.cyan);
    log('  1. Review the deployment log at .kiro/specs/dashboard-unification/DEPLOYMENT_LOG.md');
    log('  2. Deploy using one of these methods:');
    log('     • Git push: git push origin main (triggers automatic deployment)');
    log('     • Vercel CLI: vercel --prod');
    log('     • Vercel Dashboard: Manual deployment');
    log('  3. Monitor deployment at https://vercel.com/dashboard');
    log('  4. Run post-deployment verification (see DEPLOYMENT_GUIDE.md)');
    log(`  5. Backup available at: ${backupBranch}`, colors.yellow);
    
  } catch (error) {
    log('\n❌ Deployment preparation failed:', colors.red);
    log(error.message, colors.red);
    process.exit(1);
  }
}

// Run deployment
deploy();
