#!/usr/bin/env node

/**
 * Development Automation Scripts
 * Helper scripts for common development tasks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = 'green') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(message, 'red');
  process.exit(1);
}

/**
 * Create a new feature branch
 */
function createFeatureBranch(featureName) {
  if (!featureName) {
    error('Feature name required: npm run feature -- <name>');
  }

  const branchName = `feature/${featureName.toLowerCase().replace(/\s+/g, '-')}`;

  try {
    execSync('git fetch origin');
    execSync('git checkout -b ' + branchName);
    log(`✓ Created branch: ${branchName}`);
  } catch (e) {
    error(`Failed to create branch: ${e.message}`);
  }
}

/**
 * Setup pre-commit hooks
 */
function setupHusky() {
  try {
    log('Setting up Husky hooks...');
    execSync('npx husky install', { stdio: 'inherit' });
    log('✓ Husky setup complete');
  } catch (e) {
    error(`Failed to setup Husky: ${e.message}`);
  }
}

/**
 * Clean build artifacts
 */
function clean() {
  const dirsToDelete = ['dist', '.vite', 'node_modules/.vite', '.turbo'];

  dirsToDelete.forEach((dir) => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      execSync(`rm -rf ${dirPath}`);
      log(`✓ Deleted ${dir}`);
    }
  });

  log('✓ Clean complete');
}

/**
 * Generate commit message template
 */
function generateCommitTemplate() {
  const template = `# <type>(<scope>): <subject>
# Examples:
# feat(gallery): add image lazy loading
# fix(cart): prevent negative quantities
# docs: update API documentation
#
# <body>
#
# <footer>
# Breaking changes:
# Closes #123
`;

  const templatePath = path.join(process.cwd(), '.gitmessage');
  fs.writeFileSync(templatePath, template);
  execSync('git config commit.template ' + templatePath);
  log('✓ Commit template configured');
}

/**
 * Check project health
 */
function checkHealth() {
  log('\nChecking project health...\n');

  const checks = [
    {
      name: 'ESLint',
      cmd: 'npm run lint',
    },
    {
      name: 'Build',
      cmd: 'npm run build',
    },
    {
      name: 'Tests',
      cmd: 'npm run test',
    },
  ];

  let passed = 0;
  let failed = 0;

  checks.forEach(({ name, cmd }) => {
    try {
      execSync(cmd, { stdio: 'pipe' });
      log(`✓ ${name} passed`, 'green');
      passed++;
    } catch (e) {
      log(`✗ ${name} failed`, 'red');
      failed++;
    }
  });

  log(`\nResults: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

/**
 * Generate changelog
 */
function generateChangelog() {
  try {
    log('Generating changelog...');
    const commits = execSync('git log --oneline --all').toString().split('\n');
    const changelogContent = commits
      .filter((line) => line.trim())
      .slice(0, 20)
      .join('\n');

    const changelog = `# Changelog\n\n${changelogContent}\n`;
    fs.writeFileSync('CHANGELOG.md', changelog);
    log('✓ Changelog generated');
  } catch (e) {
    error(`Failed to generate changelog: ${e.message}`);
  }
}

/**
 * Format all code
 */
function formatAll() {
  try {
    log('Formatting code...');
    execSync('npm run format', { stdio: 'inherit' });
    log('✓ Code formatted');
  } catch (e) {
    error(`Failed to format: ${e.message}`);
  }
}

/**
 * Main CLI handler
 */
function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  const commands = {
    feature: () => createFeatureBranch(args[0]),
    setup: setupHusky,
    clean,
    health: checkHealth,
    changelog: generateChangelog,
    format: formatAll,
    help: () => {
      log('Available commands:');
      log('  npm run script -- feature <name>  Create feature branch');
      log('  npm run script -- setup           Setup Husky hooks');
      log('  npm run script -- clean           Clean build artifacts');
      log('  npm run script -- health          Check project health');
      log('  npm run script -- changelog       Generate changelog');
      log('  npm run script -- format          Format all code');
    },
  };

  if (!command || !commands[command]) {
    commands.help();
    process.exit(command ? 1 : 0);
  }

  commands[command]();
}

main();
