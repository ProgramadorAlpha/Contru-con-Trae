#!/usr/bin/env node

/**
 * Post-Deployment Monitoring Script
 * 
 * This script helps monitor the deployment and verify critical functionality
 */

import { execSync } from 'child_process';
import https from 'https';

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

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(`Status code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function runHealthChecks(deploymentUrl) {
  log('\n🏥 Running health checks...', colors.cyan);
  
  const checks = [
    {
      name: 'Homepage accessible',
      url: deploymentUrl,
    },
    {
      name: 'Dashboard route accessible',
      url: `${deploymentUrl}/dashboard`,
    },
    {
      name: 'Projects route accessible',
      url: `${deploymentUrl}/projects`,
    },
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    process.stdout.write(`  ${check.name}... `);
    
    try {
      await checkUrl(check.url);
      log('✅', colors.green);
    } catch (error) {
      log(`❌ ${error.message}`, colors.red);
      allPassed = false;
    }
  }
  
  return allPassed;
}

function displayMonitoringChecklist() {
  log('\n📋 Post-Deployment Monitoring Checklist', colors.bright + colors.blue);
  log('\n=== Immediate Checks (First 5 minutes) ===', colors.cyan);
  log('  [ ] Application loads without errors');
  log('  [ ] Dashboard page renders correctly');
  log('  [ ] Theme toggle works (light/dark mode)');
  log('  [ ] Navigation between pages works');
  log('  [ ] Dashboard stats display correctly');
  log('  [ ] Charts render without errors');
  log('  [ ] Modals open and close properly');
  log('  [ ] Notifications system works');
  log('  [ ] Settings panel functions correctly');
  log('  [ ] Data export works');
  log('  [ ] Filters apply correctly');
  
  log('\n=== Extended Monitoring (First Hour) ===', colors.cyan);
  log('  [ ] No JavaScript errors in browser console');
  log('  [ ] No server errors in Vercel logs');
  log('  [ ] No 404 or routing issues');
  log('  [ ] Page load times acceptable');
  log('  [ ] Works on Chrome, Firefox, Safari, Edge');
  log('  [ ] Works on Desktop, Tablet, Mobile');
  log('  [ ] Responsive design works correctly');
  
  log('\n=== Critical Features to Verify ===', colors.cyan);
  log('  [ ] Theme persistence (refresh page, theme stays)');
  log('  [ ] Widget configuration persistence');
  log('  [ ] Notification system doesn\'t spam');
  log('  [ ] Auto-refresh works without performance issues');
  log('  [ ] Modal forms submit correctly');
  log('  [ ] Data export downloads file correctly');
  log('  [ ] Filters update data correctly');
  log('  [ ] Error boundaries catch errors gracefully');
  
  log('\n=== Performance Metrics ===', colors.cyan);
  log('  [ ] Lighthouse Performance Score > 90');
  log('  [ ] Lighthouse Accessibility Score > 95');
  log('  [ ] First Contentful Paint < 1.5s');
  log('  [ ] Time to Interactive < 3.5s');
  log('  [ ] Total Bundle Size < 500KB');
}

function displayRollbackInstructions() {
  log('\n🔄 Rollback Instructions (If Needed)', colors.yellow);
  log('\n=== Via Vercel Dashboard ===', colors.cyan);
  log('  1. Go to https://vercel.com/dashboard');
  log('  2. Select your project');
  log('  3. Go to "Deployments" tab');
  log('  4. Find the previous stable deployment');
  log('  5. Click "..." menu → "Promote to Production"');
  
  log('\n=== Via Git ===', colors.cyan);
  log('  git checkout backup/pre-dashboard-unification-*');
  log('  git push origin main --force');
  
  log('\n=== Via Vercel CLI ===', colors.cyan);
  log('  vercel ls');
  log('  vercel rollback <deployment-url>');
}

function displayMonitoringResources() {
  log('\n📊 Monitoring Resources', colors.bright + colors.blue);
  log('\n=== Vercel Dashboard ===', colors.cyan);
  log('  • Deployments: https://vercel.com/dashboard');
  log('  • Logs: Check "Functions" tab for runtime logs');
  log('  • Analytics: Check "Analytics" tab for performance');
  
  log('\n=== Browser DevTools ===', colors.cyan);
  log('  • Console: Check for JavaScript errors');
  log('  • Network: Check for failed requests');
  log('  • Performance: Check Core Web Vitals');
  log('  • Lighthouse: Run audit for performance/accessibility');
  
  log('\n=== Testing Tools ===', colors.cyan);
  log('  • Chrome DevTools Device Mode: Test responsive design');
  log('  • BrowserStack: Test on real devices');
  log('  • axe DevTools: Test accessibility');
}

async function monitor() {
  log('\n🔍 Post-Deployment Monitoring Tool', colors.bright + colors.blue);
  log('='.repeat(50), colors.blue);
  
  // Get deployment URL from user or environment
  const deploymentUrl = process.env.DEPLOYMENT_URL || 'https://your-app.vercel.app';
  
  log(`\n📍 Monitoring deployment at: ${deploymentUrl}`, colors.cyan);
  
  // Run automated health checks
  const healthChecksPassed = await runHealthChecks(deploymentUrl);
  
  if (healthChecksPassed) {
    log('\n✅ Automated health checks passed!', colors.green);
  } else {
    log('\n⚠️  Some automated health checks failed. Review above.', colors.yellow);
  }
  
  // Display manual checklist
  displayMonitoringChecklist();
  
  // Display rollback instructions
  displayRollbackInstructions();
  
  // Display monitoring resources
  displayMonitoringResources();
  
  log('\n' + '='.repeat(50), colors.blue);
  log('💡 Tip: Keep this checklist open and mark items as you verify them', colors.cyan);
  log('⏰ Monitor for at least 1 hour after deployment', colors.cyan);
  log('📞 Have rollback plan ready if critical issues are found', colors.yellow);
  log('\n');
}

// Run monitoring
monitor().catch(error => {
  log(`\n❌ Error: ${error.message}`, colors.red);
  process.exit(1);
});
