/**
 * Server Routing Utilities
 *
 * Helper functions for serving static files and handling routes
 */

import fs from 'fs';
import path from 'path';

/**
 * MIME types mapping
 */
export const MIME_TYPES = {
  // HTML
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',

  // CSS
  '.css': 'text/css; charset=utf-8',

  // JavaScript
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.cjs': 'application/javascript',

  // JSON
  '.json': 'application/json',

  // Images
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
  '.tiff': 'image/tiff',

  // Fonts
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',

  // Other
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

/**
 * Get MIME type for a file extension
 * @param {string} filePath - The file path
 * @returns {string} The MIME type
 */
export function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Check if a file exists and is a file (not a directory)
 * @param {string} filePath - The file path to check
 * @returns {boolean} True if file exists
 */
export function fileExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

/**
 * Read file content
 * @param {string} filePath - The file path
 * @param {string} encoding - The file encoding (default: 'utf-8')
 * @returns {string|Buffer} The file content
 */
export function readFileContent(filePath, encoding = 'utf-8') {
  try {
    return fs.readFileSync(filePath, encoding);
  } catch (err) {
    throw new Error(`Failed to read file ${filePath}: ${err.message}`);
  }
}

/**
 * Serve a static file via HTTP response
 * @param {string} filePath - The file path
 * @param {Object} res - Express response object
 * @returns {boolean} True if served successfully
 */
export function serveFile(filePath, res) {
  try {
    if (!fileExists(filePath)) {
      return false;
    }

    const content = readFileContent(filePath, null);
    const mimeType = getMimeType(filePath);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'no-cache');
    res.end(content);

    return true;
  } catch (err) {
    console.error(`Error serving file ${filePath}:`, err.message);
    return false;
  }
}

/**
 * List all pages in the pages directory
 * @param {string} pagesDir - The pages directory path
 * @returns {Array} Array of page file names
 */
export function listPages(pagesDir) {
  try {
    if (!fs.existsSync(pagesDir)) {
      return [];
    }

    const files = fs.readdirSync(pagesDir);
    return files.filter((file) => file.endsWith('.html'));
  } catch (err) {
    console.error(`Error listing pages:`, err.message);
    return [];
  }
}
