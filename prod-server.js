/**
 * Production Server Configuration
 * 
 * Express server for serving the built application
 * Handles static files, pages directory, and API routes
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Serve pages from /pages directory
app.get('/pages/:page', (req, res) => {
  const page = req.params.page;
  
  // Security: only allow .html files
  if (!page.endsWith('.html')) {
    return res.status(403).send('Forbidden');
  }

  const filePath = path.join(__dirname, 'dist', 'pages', page);
  
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.sendFile(filePath);
  }

  res.status(404).send('Page not found');
});

// Serve public files
app.get('/public/:file', (req, res) => {
  const file = req.params.file;
  const filePath = path.join(__dirname, 'dist', 'public', file);
  
  if (fs.existsSync(filePath)) {
    const ext = path.extname(file);
    const contentTypes = {
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.pdf': 'application/pdf',
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(filePath);
  }

  res.status(404).send('File not found');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Serve SPA - all other requests go to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🌱 Green Earth Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`🔗 Home: http://localhost:${PORT}/`);
  console.log(`📄 About: http://localhost:${PORT}/pages/about.html`);
  console.log(`🏛️  Gallery: http://localhost:${PORT}/pages/gallery.html`);
  console.log(`📧 Contact: http://localhost:${PORT}/pages/contact.html`);
  console.log(`👨‍💻 Developer: http://localhost:${PORT}/pages/developer.html`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

export default app;
