#!/usr/bin/env node

/**
 * Deployment script for IntuitionConcept
 * Handles Firebase deployment with proper environment setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const ENVIRONMENTS = {
  development: {
    projectId: 'intuitionconcept',
    hostingTarget: 'staging',
    envFile: '.env.development'
  },
  production: {
    projectId: 'intuitionconcept', 
    hostingTarget: 'live',
    envFile: '.env.production'
  }
};

// Utility functions
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  
  console.log(`${colors[type]}[${type.toUpperCase()}] ${message}${colors.reset}`);
};

const execCommand = (command, description) => {
  log(`${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, 'success');
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

const checkPrerequisites = () => {
  log('Checking prerequisites...');
  
  // Check if Firebase CLI is installed
  try {
    execSync('firebase --version', { stdio: 'pipe' });
  } catch (error) {
    log('Firebase CLI not found. Please install it with: npm install -g firebase-tools', 'error');
    process.exit(1);
  }
  
  // Check if user is logged in
  try {
    execSync('firebase projects:list', { stdio: 'pipe' });
  } catch (error) {
    log('Not logged in to Firebase. Please run: firebase login', 'error');
    process.exit(1);
  }
  
  log('✅ Prerequisites check passed', 'success');
};

const setupEnvironment = (env) => {
  log(`Setting up ${env} environment...`);
  
  const config = ENVIRONMENTS[env];
  if (!config) {
    log(`Unknown environment: ${env}`, 'error');
    process.exit(1);
  }
  
  // Copy environment file
  if (fs.existsSync(config.envFile)) {
    fs.copyFileSync(config.envFile, '.env.local');
    log(`✅ Environment file ${config.envFile} copied to .env.local`, 'success');
  } else {
    log(`Environment file ${config.envFile} not found`, 'warning');
  }
  
  return config;
};

const runTests = () => {
  log('Running tests...');
  
  // Run linting
  execCommand('npm run lint', 'Code linting');
  
  // Run type checking
  execCommand('npx tsc --noEmit --skipLibCheck', 'Type checking');
  
  // Run unit tests
  execCommand('npm run test:ci:stable', 'Unit tests');
  
  log('✅ All tests passed', 'success');
};

const buildApplication = (env) => {
  log(`Building application for ${env}...`);
  
  const buildCommand = env === 'production' 
    ? 'npm run build -- --mode production'
    : 'npm run build -- --mode development';
    
  execCommand(buildCommand, `Building for ${env}`);
  
  // Verify build output
  if (!fs.existsSync('dist/index.html')) {
    log('Build output not found in dist/', 'error');
    process.exit(1);
  }
  
  log('✅ Build completed successfully', 'success');
};

const deployFirestore = (config) => {
  log('Deploying Firestore rules and indexes...');
  
  // Deploy security rules
  execCommand(
    `firebase deploy --only firestore:rules --project ${config.projectId}`,
    'Deploying Firestore security rules'
  );
  
  // Deploy indexes
  execCommand(
    `firebase deploy --only firestore:indexes --project ${config.projectId}`,
    'Deploying Firestore indexes'
  );
  
  log('✅ Firestore deployment completed', 'success');
};

const deployHosting = (config) => {
  log(`Deploying to Firebase Hosting (${config.hostingTarget})...`);
  
  const hostingCommand = config.hostingTarget === 'live'
    ? `firebase deploy --only hosting --project ${config.projectId}`
    : `firebase hosting:channel:deploy ${config.hostingTarget} --project ${config.projectId}`;
  
  execCommand(hostingCommand, 'Deploying to Firebase Hosting');
  
  log('✅ Hosting deployment completed', 'success');
};

const generateDeploymentReport = (env, config) => {
  const report = {
    timestamp: new Date().toISOString(),
    environment: env,
    projectId: config.projectId,
    hostingTarget: config.hostingTarget,
    buildSize: getBuildSize(),
    version: getPackageVersion()
  };
  
  fs.writeFileSync('deployment-report.json', JSON.stringify(report, null, 2));
  log('✅ Deployment report generated', 'success');
  
  return report;
};

const getBuildSize = () => {
  try {
    const stats = fs.statSync('dist');
    return `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
  } catch (error) {
    return 'Unknown';
  }
};

const getPackageVersion = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version || '1.0.0';
  } catch (error) {
    return '1.0.0';
  }
};

const cleanup = () => {
  log('Cleaning up...');
  
  // Remove temporary environment file
  if (fs.existsSync('.env.local')) {
    fs.unlinkSync('.env.local');
  }
  
  log('✅ Cleanup completed', 'success');
};

// Main deployment function
const deploy = async () => {
  const args = process.argv.slice(2);
  const env = args[0] || 'development';
  const skipTests = args.includes('--skip-tests');
  const skipBuild = args.includes('--skip-build');
  
  log(`🚀 Starting deployment to ${env}...`);
  
  try {
    // 1. Check prerequisites
    checkPrerequisites();
    
    // 2. Setup environment
    const config = setupEnvironment(env);
    
    // 3. Run tests (unless skipped)
    if (!skipTests) {
      runTests();
    } else {
      log('⚠️  Tests skipped', 'warning');
    }
    
    // 4. Build application (unless skipped)
    if (!skipBuild) {
      buildApplication(env);
    } else {
      log('⚠️  Build skipped', 'warning');
    }
    
    // 5. Deploy Firestore
    deployFirestore(config);
    
    // 6. Deploy Hosting
    deployHosting(config);
    
    // 7. Generate report
    const report = generateDeploymentReport(env, config);
    
    // 8. Cleanup
    cleanup();
    
    // Success message
    log(`🎉 Deployment to ${env} completed successfully!`, 'success');
    log(`📊 Build size: ${report.buildSize}`);
    log(`🔗 Project: ${config.projectId}`);
    
    if (config.hostingTarget !== 'live') {
      log(`🌐 Preview URL: https://${config.projectId}--${config.hostingTarget}.web.app`);
    } else {
      log(`🌐 Live URL: https://${config.projectId}.web.app`);
    }
    
  } catch (error) {
    log(`❌ Deployment failed: ${error.message}`, 'error');
    cleanup();
    process.exit(1);
  }
};

// Help function
const showHelp = () => {
  console.log(`
Usage: node scripts/deploy.js [environment] [options]

Environments:
  development    Deploy to staging environment (default)
  production     Deploy to production environment

Options:
  --skip-tests   Skip running tests
  --skip-build   Skip building the application
  --help         Show this help message

Examples:
  node scripts/deploy.js development
  node scripts/deploy.js production --skip-tests
  node scripts/deploy.js development --skip-build
`);
};

// Run the script
if (process.argv.includes('--help')) {
  showHelp();
} else {
  deploy();
}
