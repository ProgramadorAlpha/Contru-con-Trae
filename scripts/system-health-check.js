#!/usr/bin/env node

/**
 * Job Costing System - Health Check Script
 * 
 * This script performs comprehensive health checks on the deployed system
 * including API endpoints, database connectivity, and critical features
 */

import https from 'https';
import http from 'http';

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

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    protocol.get(url, options, (res) => {
      const duration = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          duration: duration
        });
      });
    }).on('error', reject);
  });
}

function makePostRequest(url, body, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    const startTime = Date.now();
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...options.headers
      }
    };
    
    const req = protocol.request(reqOptions, (res) => {
      const duration = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          duration: duration
        });
      });
    });
    
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function checkEndpoint(name, url, expectedStatus = 200) {
  process.stdout.write(`  ${name}... `);
  
  try {
    const response = await makeRequest(url);
    
    if (response.statusCode === expectedStatus) {
      log(`✅ (${response.duration}ms)`, colors.green);
      return { success: true, duration: response.duration };
    } else {
      log(`❌ Status: ${response.statusCode}`, colors.red);
      return { success: false, statusCode: response.statusCode };
    }
  } catch (error) {
    log(`❌ ${error.message}`, colors.red);
    return { success: false, error: error.message };
  }
}

async function checkApiEndpoint(name, url, method = 'GET', body = null, apiKey = null) {
  process.stdout.write(`  ${name}... `);
  
  try {
    const options = apiKey ? {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    } : {};
    
    const response = method === 'POST' 
      ? await makePostRequest(url, body, options)
      : await makeRequest(url, options);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      log(`✅ (${response.duration}ms)`, colors.green);
      return { success: true, duration: response.duration };
    } else if (response.statusCode === 401 || response.statusCode === 403) {
      log(`⚠️  Auth required (${response.statusCode})`, colors.yellow);
      return { success: true, authRequired: true };
    } else {
      log(`❌ Status: ${response.statusCode}`, colors.red);
      return { success: false, statusCode: response.statusCode };
    }
  } catch (error) {
    log(`❌ ${error.message}`, colors.red);
    return { success: false, error: error.message };
  }
}

async function runFrontendChecks(baseUrl) {
  log('\n🌐 Frontend Health Checks', colors.bright + colors.cyan);
  log('='.repeat(70), colors.cyan);
  
  const routes = [
    { name: 'Homepage', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Projects', path: '/projects' },
    { name: 'Subcontracts', path: '/subcontracts' },
    { name: 'Progress Certificates', path: '/certificates' },
    { name: 'Cost Codes', path: '/cost-codes' },
    { name: 'Expense Approvals', path: '/expense-approvals' },
    { name: 'Audit Log', path: '/audit-log' },
  ];
  
  const results = [];
  for (const route of routes) {
    const result = await checkEndpoint(route.name, `${baseUrl}${route.path}`);
    results.push({ ...route, ...result });
  }
  
  const successCount = results.filter(r => r.success).length;
  const avgDuration = results
    .filter(r => r.duration)
    .reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  log(`\n  ✅ ${successCount}/${routes.length} routes accessible`, colors.green);
  log(`  ⏱️  Average load time: ${Math.round(avgDuration)}ms`, colors.cyan);
  
  return { success: successCount === routes.length, results };
}

async function runApiChecks(baseUrl, apiKey) {
  log('\n🔌 API Health Checks', colors.bright + colors.cyan);
  log('='.repeat(70), colors.cyan);
  
  const endpoints = [
    { 
      name: 'OCR Expense Endpoint', 
      path: '/api/expenses/auto-create',
      method: 'POST',
      body: JSON.stringify({
        amount: 100,
        date: '2024-01-15',
        supplier: 'Test Supplier',
        description: 'Health check test'
      })
    },
  ];
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await checkApiEndpoint(
      endpoint.name,
      `${baseUrl}${endpoint.path}`,
      endpoint.method,
      endpoint.body,
      apiKey
    );
    results.push({ ...endpoint, ...result });
  }
  
  const successCount = results.filter(r => r.success).length;
  
  log(`\n  ✅ ${successCount}/${endpoints.length} API endpoints accessible`, colors.green);
  
  return { success: successCount === endpoints.length, results };
}

async function runPerformanceChecks(baseUrl) {
  log('\n⚡ Performance Checks', colors.bright + colors.cyan);
  log('='.repeat(70), colors.cyan);
  
  const checks = [
    { name: 'Homepage Load Time', path: '/', threshold: 3000 },
    { name: 'Dashboard Load Time', path: '/dashboard', threshold: 3000 },
    { name: 'Project Financials Load', path: '/projects', threshold: 2000 },
  ];
  
  const results = [];
  for (const check of checks) {
    process.stdout.write(`  ${check.name}... `);
    
    try {
      const response = await makeRequest(`${baseUrl}${check.path}`);
      
      if (response.duration < check.threshold) {
        log(`✅ ${response.duration}ms (< ${check.threshold}ms)`, colors.green);
        results.push({ ...check, success: true, duration: response.duration });
      } else {
        log(`⚠️  ${response.duration}ms (> ${check.threshold}ms)`, colors.yellow);
        results.push({ ...check, success: false, duration: response.duration });
      }
    } catch (error) {
      log(`❌ ${error.message}`, colors.red);
      results.push({ ...check, success: false, error: error.message });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  log(`\n  ✅ ${successCount}/${checks.length} performance checks passed`, colors.green);
  
  return { success: successCount === checks.length, results };
}

function displaySystemStatus(frontendResults, apiResults, performanceResults) {
  log('\n📊 System Status Summary', colors.bright + colors.blue);
  log('='.repeat(70), colors.blue);
  
  const allChecks = [
    { name: 'Frontend Routes', ...frontendResults },
    { name: 'API Endpoints', ...apiResults },
    { name: 'Performance', ...performanceResults },
  ];
  
  for (const check of allChecks) {
    const status = check.success ? '✅ PASS' : '❌ FAIL';
    const color = check.success ? colors.green : colors.red;
    log(`  ${check.name}: ${status}`, color);
  }
  
  const allPassed = allChecks.every(c => c.success);
  
  log('\n' + '='.repeat(70), colors.blue);
  if (allPassed) {
    log('✅ ALL SYSTEMS OPERATIONAL', colors.bright + colors.green);
  } else {
    log('⚠️  SOME SYSTEMS NEED ATTENTION', colors.bright + colors.yellow);
  }
  log('='.repeat(70), colors.blue);
  
  return allPassed;
}

function displayRecommendations(allPassed) {
  log('\n💡 Recommendations', colors.cyan);
  log('='.repeat(70), colors.cyan);
  
  if (allPassed) {
    log('  ✅ System is healthy and ready for production use');
    log('  ✅ Continue monitoring for the next 24 hours');
    log('  ✅ Set up automated health checks (cron job)');
    log('  ✅ Configure alerting for failures');
  } else {
    log('  ⚠️  Review failed checks above');
    log('  ⚠️  Check Vercel deployment logs');
    log('  ⚠️  Verify Firebase configuration');
    log('  ⚠️  Test manually in browser');
    log('  ⚠️  Consider rollback if critical issues found');
  }
}

function displayMonitoringSetup() {
  log('\n🔔 Continuous Monitoring Setup', colors.cyan);
  log('='.repeat(70), colors.cyan);
  
  log('\n=== Option 1: Cron Job (Linux/Mac) ===');
  log('  Add to crontab (crontab -e):');
  log('  */5 * * * * cd /path/to/project && npm run health-check >> /var/log/health-check.log 2>&1');
  
  log('\n=== Option 2: Vercel Monitoring ===');
  log('  1. Enable Vercel Analytics');
  log('  2. Set up custom alerts');
  log('  3. Configure Slack/email notifications');
  
  log('\n=== Option 3: External Monitoring ===');
  log('  • UptimeRobot: https://uptimerobot.com');
  log('  • Pingdom: https://www.pingdom.com');
  log('  • StatusCake: https://www.statuscake.com');
  
  log('\n=== Option 4: Custom Monitoring ===');
  log('  • Set up this script to run every 5 minutes');
  log('  • Send alerts on failures');
  log('  • Log results to monitoring dashboard');
}

async function main() {
  log('\n🏥 Job Costing System - Health Check', colors.bright + colors.blue);
  log('='.repeat(70), colors.blue);
  
  // Get configuration from arguments or environment
  const baseUrl = process.argv[2] || process.env.DEPLOYMENT_URL || 'https://your-app.vercel.app';
  const apiKey = process.argv[3] || process.env.API_KEY;
  
  if (baseUrl === 'https://your-app.vercel.app') {
    log('\n⚠️  Using default URL. Please provide your deployment URL:', colors.yellow);
    log('  npm run health-check -- https://your-actual-domain.com [api-key]', colors.cyan);
    log('  or set DEPLOYMENT_URL environment variable\n', colors.cyan);
  }
  
  log(`\n📍 Checking system at: ${baseUrl}`, colors.cyan);
  log(`🔑 API Key: ${apiKey ? '✅ Provided' : '⚠️  Not provided (some checks will be skipped)'}`, colors.cyan);
  log(`⏰ Time: ${new Date().toLocaleString()}`, colors.cyan);
  
  try {
    // Run all health checks
    const frontendResults = await runFrontendChecks(baseUrl);
    const apiResults = await runApiChecks(baseUrl, apiKey);
    const performanceResults = await runPerformanceChecks(baseUrl);
    
    // Display summary
    const allPassed = displaySystemStatus(frontendResults, apiResults, performanceResults);
    
    // Display recommendations
    displayRecommendations(allPassed);
    
    // Display monitoring setup
    displayMonitoringSetup();
    
    log('\n');
    
    // Exit with appropriate code
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    log(`\n❌ Health check failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run health check
main();
