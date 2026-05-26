import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',
  root: '.',
  build: {
    outDir: 'dist',
    minify: 'terser',
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
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
      mangle: true,
      output: {
        comments: false,
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
  },
  preview: {
    port: 3000,
    host: true,
  },
  publicDir: 'assets',
});
