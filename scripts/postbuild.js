/**
 * Post-Build Script
 * 
 * Copies necessary files to dist directory after Vite build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

/**
 * Copy directory recursively
 */
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  
  files.forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    
    if (fs.statSync(srcFile).isDirectory()) {
      copyDirectory(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
      console.log(`✓ Copied: ${path.relative(projectRoot, destFile)}`);
    }
  });
}

/**
 * Main post-build process
 */
async function postBuild() {
  console.log('\n📦 Running post-build tasks...\n');

  try {
    // Copy pages directory
    const pagesDir = path.join(projectRoot, 'pages');
    const distPagesDir = path.join(projectRoot, 'dist', 'pages');
    
    if (fs.existsSync(pagesDir)) {
      console.log('📄 Copying pages directory...');
      copyDirectory(pagesDir, distPagesDir);
      console.log('✓ Pages directory copied successfully\n');
    } else {
      console.warn('⚠️  Pages directory not found\n');
    }

    // Copy public files (if any additional public files needed)
    const publicDir = path.join(projectRoot, 'public');
    const distPublicDir = path.join(projectRoot, 'dist', 'public');
    
    if (fs.existsSync(publicDir)) {
      console.log('📋 Copying public directory...');
      copyDirectory(publicDir, distPublicDir);
      console.log('✓ Public directory copied successfully\n');
    }

    console.log('✨ Post-build tasks completed successfully!\n');
  } catch (error) {
    console.error('❌ Post-build error:', error.message);
    process.exit(1);
  }
}

// Run post-build
postBuild();
