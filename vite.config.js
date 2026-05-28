import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

/**
 * Vite Configuration for Green Earth Project
 *
 * This config includes custom middleware to serve:
 * - HTML pages from /pages directory
 * - Static assets from /assets directory
 * - Public files from /public directory
 *
 * This solves the issue where gallery and other pages were not being served.
 */
export default defineConfig({
  plugins: [react()],
  base: '/',
  root: '.',
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks'),
    },
  },
  server: {
    port: 3000,
    open: false,
    host: true,
    middlewareMode: false,
    watch: {
      usePolling: true,
      interval: 100,
      followSymlinks: true,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100,
      },
    },
    hmr: {
      overlay: true,
      protocol: 'ws',
    },
    middlewares: [
      (req, res, next) => {
        // Serve HTML pages from /pages directory
        if (req.url.startsWith('/pages/')) {
          const filePath = path.join(__dirname, req.url);
          try {
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              console.log(`[Vite] Serving page: ${req.url}`);
              const content = fs.readFileSync(filePath, 'utf-8');
              const ext = path.extname(filePath);

              if (ext === '.html') {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
              } else if (ext === '.css') {
                res.setHeader('Content-Type', 'text/css; charset=utf-8');
              } else if (ext === '.js') {
                res.setHeader('Content-Type', 'application/javascript');
              }

              res.setHeader('Cache-Control', 'no-cache');
              res.end(content);
              return;
            }
          } catch (err) {
            console.error(`[Vite] Error serving page ${req.url}:`, err.message);
          }
        }

        // Serve assets from /assets directory
        if (req.url.startsWith('/assets/')) {
          const filePath = path.join(__dirname, req.url);
          try {
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const content = fs.readFileSync(filePath);
              const ext = path.extname(filePath).toLowerCase();

              const contentTypes = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.webp': 'image/webp',
                '.ico': 'image/x-icon',
              };

              const contentType = contentTypes[ext] || 'application/octet-stream';
              res.setHeader('Content-Type', contentType);
              res.end(content);
              return;
            }
          } catch (err) {
            console.error(`[Vite] Error serving asset ${req.url}:`, err.message);
          }
        }

        // Serve public files from /public directory
        if (req.url.startsWith('/public/')) {
          const filePath = path.join(__dirname, req.url);
          try {
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const content = fs.readFileSync(filePath);
              const ext = path.extname(filePath).toLowerCase();

              const contentTypes = {
                '.json': 'application/json',
                '.xml': 'application/xml',
                '.pdf': 'application/pdf',
              };

              const contentType = contentTypes[ext] || 'application/octet-stream';
              res.setHeader('Content-Type', contentType);
              res.end(content);
              return;
            }
          } catch (err) {
            console.error(`[Vite] Error serving public file ${req.url}:`, err.message);
          }
        }

        next();
      },
    ],
  },
  preview: {
    port: 3000,
    host: true,
  },
  publicDir: 'assets',
});
