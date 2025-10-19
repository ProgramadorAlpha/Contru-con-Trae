#!/usr/bin/env node

/**
 * Firestore Deployment Script
 * 
 * This script helps deploy Firestore indexes and rules with validation and monitoring.
 * 
 * Usage:
 *   node scripts/deploy-firestore.js [options]
 * 
 * Options:
 *   --indexes-only    Deploy only indexes
 *   --rules-only      Deploy only security rules
 *   --validate-only   Validate configuration without deploying
 *   --project <id>    Specify Firebase project ID
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ERROR: ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  indexesOnly: args.includes('--indexes-only'),
  rulesOnly: args.includes('--rules-only'),
  validateOnly: args.includes('--validate-only'),
  project: null
};

const projectIndex = args.indexOf('--project');
if (projectIndex !== -1 && args[projectIndex + 1]) {
  options.project = args[projectIndex + 1];
}

// Validate indexes configuration
function validateIndexes() {
  info('Validating firestore.indexes.json...');
  
  const indexesPath = path.join(process.cwd(), 'firestore.indexes.json');
  
  if (!fs.existsSync(indexesPath)) {
    error('firestore.indexes.json not found');
    return false;
  }
  
  try {
    const indexesContent = fs.readFileSync(indexesPath, 'utf8');
    const indexes = JSON.parse(indexesContent);
    
    if (!indexes.indexes || !Array.isArray(indexes.indexes)) {
      error('Invalid indexes structure: missing "indexes" array');
      return false;
    }
    
    // Check for duplicates
    const seen = new Set();
    for (const index of indexes.indexes) {
      const key = JSON.stringify(index);
      if (seen.has(key)) {
        error(`Duplicate index found: ${JSON.stringify(index, null, 2)}`);
        return false;
      }
      seen.add(key);
    }
    
    success(`Validated ${indexes.indexes.length} indexes`);
    return true;
  } catch (err) {
    error(`Failed to parse firestore.indexes.json: ${err.message}`);
    return false;
  }
}

// Validate security rules
function validateRules() {
  info('Validating firestore.rules...');
  
  const rulesPath = path.join(process.cwd(), 'firestore.rules');
  
  if (!fs.existsSync(rulesPath)) {
    error('firestore.rules not found');
    return false;
  }
  
  try {
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');
    
    // Basic syntax checks
    if (!rulesContent.includes('rules_version')) {
      warning('rules_version not specified');
    }
    
    if (!rulesContent.includes('service cloud.firestore')) {
      error('Invalid rules: missing "service cloud.firestore"');
      return false;
    }
    
    // Check for common collections
    const requiredCollections = [
      'clientes',
      'presupuestos',
      'proyectos',
      'facturas',
      'alertas-financieras'
    ];
    
    for (const collection of requiredCollections) {
      if (!rulesContent.includes(collection)) {
        warning(`Collection "${collection}" not found in rules`);
      }
    }
    
    success('Security rules validation passed');
    return true;
  } catch (err) {
    error(`Failed to read firestore.rules: ${err.message}`);
    return false;
  }
}

// Check Firebase CLI installation
function checkFirebaseCLI() {
  info('Checking Firebase CLI installation...');
  
  try {
    const version = execSync('firebase --version', { encoding: 'utf8' }).trim();
    success(`Firebase CLI installed: ${version}`);
    return true;
  } catch (err) {
    error('Firebase CLI not found. Install with: npm install -g firebase-tools');
    return false;
  }
}

// Check Firebase authentication
function checkFirebaseAuth() {
  info('Checking Firebase authentication...');
  
  try {
    execSync('firebase projects:list', { encoding: 'utf8', stdio: 'pipe' });
    success('Firebase authentication verified');
    return true;
  } catch (err) {
    error('Not authenticated with Firebase. Run: firebase login');
    return false;
  }
}

// Deploy indexes
function deployIndexes(projectId) {
  info('Deploying Firestore indexes...');
  
  try {
    const projectFlag = projectId ? `--project ${projectId}` : '';
    const command = `firebase deploy --only firestore:indexes ${projectFlag}`;
    
    log(`\nExecuting: ${command}\n`, 'cyan');
    execSync(command, { stdio: 'inherit' });
    
    success('Indexes deployed successfully');
    info('Note: Index creation is asynchronous. Check Firebase Console for status.');
    return true;
  } catch (err) {
    error('Failed to deploy indexes');
    return false;
  }
}

// Deploy security rules
function deployRules(projectId) {
  info('Deploying Firestore security rules...');
  
  try {
    const projectFlag = projectId ? `--project ${projectId}` : '';
    const command = `firebase deploy --only firestore:rules ${projectFlag}`;
    
    log(`\nExecuting: ${command}\n`, 'cyan');
    execSync(command, { stdio: 'inherit' });
    
    success('Security rules deployed successfully');
    return true;
  } catch (err) {
    error('Failed to deploy security rules');
    return false;
  }
}

// Main execution
async function main() {
  log('\n🚀 Firestore Deployment Script\n', 'cyan');
  
  // Validation phase
  if (!checkFirebaseCLI()) {
    process.exit(1);
  }
  
  if (!checkFirebaseAuth()) {
    process.exit(1);
  }
  
  let validationPassed = true;
  
  if (!options.rulesOnly) {
    validationPassed = validateIndexes() && validationPassed;
  }
  
  if (!options.indexesOnly) {
    validationPassed = validateRules() && validationPassed;
  }
  
  if (!validationPassed) {
    error('Validation failed. Fix errors before deploying.');
    process.exit(1);
  }
  
  if (options.validateOnly) {
    success('Validation complete. Use without --validate-only to deploy.');
    process.exit(0);
  }
  
  // Deployment phase
  log('\n📦 Starting deployment...\n', 'cyan');
  
  let deploymentSuccess = true;
  
  if (options.indexesOnly) {
    deploymentSuccess = deployIndexes(options.project);
  } else if (options.rulesOnly) {
    deploymentSuccess = deployRules(options.project);
  } else {
    // Deploy both
    deploymentSuccess = deployIndexes(options.project) && deploymentSuccess;
    deploymentSuccess = deployRules(options.project) && deploymentSuccess;
  }
  
  if (deploymentSuccess) {
    log('\n✨ Deployment complete!\n', 'green');
    
    info('Next steps:');
    console.log('  1. Check Firebase Console for index creation status');
    console.log('  2. Test queries that use the new indexes');
    console.log('  3. Monitor for any permission errors');
    console.log('\nFirebase Console: https://console.firebase.google.com\n');
  } else {
    error('Deployment failed. Check errors above.');
    process.exit(1);
  }
}

// Run main function
main().catch(err => {
  error(`Unexpected error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
