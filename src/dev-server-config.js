/**
 * Development Server Configuration
 * 
 * Centralized configuration for the Vite development server middleware
 * that handles serving pages, assets, and public files
 */

import fs from 'fs';
import path from 'path';

/**
 * Content type mappings for different file types
 */
const CONTENT_TYPES = {
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'application/javascript',
  json: 'application/json',
  
  // Images
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  ico: 'image/x-icon',
  
  // Other
  pdf: 'application/pdf',
  xml: 'application/xml',
};

/**
 * Get content type for a file extension
 * @param {string} ext - File extension (with or without dot)
 * @returns {string} Content type
 */
export function getContentType(ext) {
  const key = ext.startsWith('.') ? ext.slice(1) : ext;
  return CONTENT_TYPES[key.toLowerCase()] || 'application/octet-stream';
}

/**
 * Middleware configuration for serving pages directory
 */
export const pagesMiddleware = {
  name: 'pages-middleware',
  description: 'Serves HTML pages from /pages directory',
  path: '/pages/',
  handler: (req, res, next) => {
    if (req.url.startsWith('/pages/')) {
      const filePath = path.join(process.cwd(), req.url);
      
      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          console.log(`[Server] Serving page: ${req.url}`);
          const content = fs.readFileSync(filePath, 'utf-8');
          const ext = path.extname(filePath);
          
          res.setHeader('Content-Type', getContentType(ext));
          res.setHeader('Cache-Control', 'no-cache');
          res.end(content);
          return;
        }
      } catch (err) {
        console.error(`[Server] Error serving page ${req.url}:`, err.message);
      }
    }
    
    next();
  },
};

/**
 * Middleware configuration for serving assets directory
 */
export const assetsMiddleware = {
  name: 'assets-middleware',
  description: 'Serves static assets from /assets directory',
  path: '/assets/',
  handler: (req, res, next) => {
    if (req.url.startsWith('/assets/')) {
      const filePath = path.join(process.cwd(), req.url);
      
      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const content = fs.readFileSync(filePath);
          const ext = path.extname(filePath);
          
          res.setHeader('Content-Type', getContentType(ext));
          res.end(content);
          return;
        }
      } catch (err) {
        console.error(`[Server] Error serving asset ${req.url}:`, err.message);
      }
    }
    
    next();
  },
};

/**
 * Middleware configuration for serving public directory
 */
export const publicMiddleware = {
  name: 'public-middleware',
  description: 'Serves public files from /public directory',
  path: '/public/',
  handler: (req, res, next) => {
    if (req.url.startsWith('/public/')) {
      const filePath = path.join(process.cwd(), req.url);
      
      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const content = fs.readFileSync(filePath);
          const ext = path.extname(filePath);
          
          res.setHeader('Content-Type', getContentType(ext));
          res.end(content);
          return;
        }
      } catch (err) {
        console.error(`[Server] Error serving public file ${req.url}:`, err.message);
      }
    }
    
    next();
  },
};

/**
 * All middleware configurations
 */
export const allMiddlewares = [
  pagesMiddleware,
  assetsMiddleware,
  publicMiddleware,
];

/**
 * Create middleware handlers from configuration
 * @returns {Array} Array of middleware handler functions
 */
export function createMiddlewares() {
  return allMiddlewares.map(config => config.handler);
}

/**
 * Get summary of all registered middlewares
 * @returns {string} Summary of middlewares
 */
export function getMiddlewareSummary() {
  console.log('\n[Server] Registered Middlewares:');
  allMiddlewares.forEach(config => {
    console.log(`  ✓ ${config.name} - ${config.description}`);
    console.log(`    Path: ${config.path}`);
  });
  console.log('');
}
