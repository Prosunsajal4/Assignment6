/**
 * Page Server Initialization Script
 * 
 * Use this script to verify all pages are accessible and working correctly
 * Run: node scripts/init-pages.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

/**
 * Check if pages directory exists and contains all required pages
 */
async function verifyPagesDirectory() {
  console.log('\n📁 Verifying Pages Directory...');
  
  const pagesDir = path.join(projectRoot, 'pages');
  const requiredPages = [
    'about.html',
    'gallery.html',
    'contact.html',
    'developer.html',
  ];

  if (!fs.existsSync(pagesDir)) {
    console.error('✗ Pages directory not found at:', pagesDir);
    return false;
  }

  console.log('✓ Pages directory found');

  let allExist = true;
  for (const page of requiredPages) {
    const pagePath = path.join(pagesDir, page);
    if (fs.existsSync(pagePath)) {
      const size = fs.statSync(pagePath).size;
      console.log(`  ✓ ${page} (${(size / 1024).toFixed(2)} KB)`);
    } else {
      console.error(`  ✗ ${page} - NOT FOUND`);
      allExist = false;
    }
  }

  return allExist;
}

/**
 * Check if assets directory exists
 */
async function verifyAssetsDirectory() {
  console.log('\n🎨 Verifying Assets Directory...');
  
  const assetsDir = path.join(projectRoot, 'assets');
  
  if (!fs.existsSync(assetsDir)) {
    console.error('✗ Assets directory not found at:', assetsDir);
    return false;
  }

  console.log('✓ Assets directory found');

  const files = fs.readdirSync(assetsDir);
  console.log(`  Found ${files.length} asset files`);
  
  return true;
}

/**
 * Check if public directory exists
 */
async function verifyPublicDirectory() {
  console.log('\n📋 Verifying Public Directory...');
  
  const publicDir = path.join(projectRoot, 'public');
  
  if (!fs.existsSync(publicDir)) {
    console.error('✗ Public directory not found at:', publicDir);
    return false;
  }

  console.log('✓ Public directory found');

  const files = fs.readdirSync(publicDir);
  console.log(`  Found ${files.length} public files`);

  // Check for manifest.json
  const manifestPath = path.join(publicDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    console.log('  ✓ manifest.json found');
  }

  return true;
}

/**
 * Verify vite.config.js has the middleware
 */
async function verifyViteConfig() {
  console.log('\n⚙️  Verifying Vite Configuration...');
  
  const viteConfigPath = path.join(projectRoot, 'vite.config.js');
  
  if (!fs.existsSync(viteConfigPath)) {
    console.error('✗ vite.config.js not found');
    return false;
  }

  const content = fs.readFileSync(viteConfigPath, 'utf-8');
  
  const checks = [
    { name: 'Pages middleware', pattern: '/pages/' },
    { name: 'Assets middleware', pattern: '/assets/' },
    { name: 'Public middleware', pattern: '/public/' },
    { name: 'Middleware configuration', pattern: 'middlewares:' },
  ];

  let allFound = true;
  for (const check of checks) {
    if (content.includes(check.pattern)) {
      console.log(`  ✓ ${check.name} configured`);
    } else {
      console.error(`  ✗ ${check.name} NOT found`);
      allFound = false;
    }
  }

  return allFound;
}

/**
 * List all created utility modules
 */
async function verifyUtilityModules() {
  console.log('\n📦 Verifying Utility Modules...');
  
  const srcDir = path.join(projectRoot, 'src');
  const modules = [
    'server-utils.js',
    'dev-server-config.js',
    'routing.js',
    'page-loader.js',
    'health-check.js',
    'routing.test.js',
  ];

  let allExist = true;
  for (const module of modules) {
    const modulePath = path.join(srcDir, module);
    if (fs.existsSync(modulePath)) {
      const size = fs.statSync(modulePath).size;
      console.log(`  ✓ ${module} (${(size / 1024).toFixed(2)} KB)`);
    } else {
      console.error(`  ✗ ${module} - NOT FOUND`);
      allExist = false;
    }
  }

  return allExist;
}

/**
 * Main initialization
 */
async function initialize() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('🌱 Green Earth Pages Initialization');
  console.log('═══════════════════════════════════════════════');

  const checks = [
    { name: 'Pages Directory', fn: verifyPagesDirectory },
    { name: 'Assets Directory', fn: verifyAssetsDirectory },
    { name: 'Public Directory', fn: verifyPublicDirectory },
    { name: 'Vite Configuration', fn: verifyViteConfig },
    { name: 'Utility Modules', fn: verifyUtilityModules },
  ];

  const results = [];

  for (const check of checks) {
    try {
      const result = await check.fn();
      results.push({ name: check.name, passed: result });
    } catch (error) {
      console.error(`✗ Error checking ${check.name}:`, error.message);
      results.push({ name: check.name, passed: false });
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 Initialization Summary');
  console.log('═══════════════════════════════════════════════');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const status = result.passed ? '✓' : '✗';
    console.log(`${status} ${result.name}`);
  });

  console.log(`\n${passed}/${total} checks passed`);

  if (passed === total) {
    console.log('\n✨ All checks passed! You can now run: npm run dev');
  } else {
    console.log('\n⚠️  Some checks failed. Please review the output above.');
  }

  console.log('\n═══════════════════════════════════════════════\n');

  process.exit(passed === total ? 0 : 1);
}

// Run initialization
initialize().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
