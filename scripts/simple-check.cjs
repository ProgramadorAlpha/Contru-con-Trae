#!/usr/bin/env node

/**
 * Simple Quality Check Script for Dashboard Improvements
 */

const { execSync } = require('child_process')
const { existsSync } = require('fs')

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function runCommand(command, description) {
  log(`\n${colors.blue}🔍 ${description}...${colors.reset}`)
  try {
    execSync(command, { encoding: 'utf8', stdio: 'pipe' })
    log(`✅ ${description} passed`, 'green')
    return true
  } catch (error) {
    log(`❌ ${description} failed`, 'red')
    return false
  }
}

function checkFileExists(filePath, description) {
  if (existsSync(filePath)) {
    log(`✅ ${description} exists`, 'green')
    return true
  } else {
    log(`❌ ${description} missing: ${filePath}`, 'red')
    return false
  }
}

function main() {
  log(`${colors.bold}🚀 Dashboard Quality Check${colors.reset}`)
  log('=' .repeat(50))

  const results = {
    build: runCommand('npm run build', 'Production build'),
    files: checkFileExists('src/pages/EnhancedDashboard.tsx', 'Enhanced Dashboard page'),
    components: checkFileExists('src/components/dashboard/DashboardCharts.tsx', 'Dashboard Charts component'),
    hooks: checkFileExists('src/hooks/useDashboardData.ts', 'Dashboard Data hook')
  }

  log('\n📊 Quality Check Summary', 'bold')
  log('=' .repeat(30))

  Object.entries(results).forEach(([check, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL'
    const color = passed ? 'green' : 'red'
    log(`${check.padEnd(15)}: ${status}`, color)
  })

  const allPassed = Object.values(results).every(result => result === true)
  
  if (allPassed) {
    log('\n🎉 Basic quality checks passed!', 'green')
    log('The dashboard implementation is ready.', 'green')
  } else {
    log('\n⚠️  Some quality checks failed.', 'yellow')
    log('Please review the issues above.', 'yellow')
  }

  process.exit(allPassed ? 0 : 1)
}

main().catch(error => {
  log(`❌ Quality check failed: ${error.message}`, 'red')
  process.exit(1)
})