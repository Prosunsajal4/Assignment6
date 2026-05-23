import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/Assignment6/',
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'pages/about.html'),
        gallery: resolve(__dirname, 'pages/gallery.html'),
        contact: resolve(__dirname, 'pages/contact.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    // Use robust watch options for networked filesystems (OneDrive)
    watch: {
      usePolling: true,
      interval: 100,
      followSymlinks: true,
      // Wait for file writes to finish before triggering reloads
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100,
      },
    },
    hmr: {
      overlay: true,
    },
  },
  publicDir: 'assets',
});
