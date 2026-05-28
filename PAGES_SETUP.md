# Pages Setup and Development Guide

## Quick Start

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Verify pages setup
node scripts/init-pages.js

# Start development server
npm run dev
```

### 2. Access Pages
- Home: http://localhost:3000/
- About: http://localhost:3000/pages/about.html
- Gallery: http://localhost:3000/pages/gallery.html
- Contact: http://localhost:3000/pages/contact.html
- Developer: http://localhost:3000/pages/developer.html

## Project Structure

### Pages Directory
```
pages/
├── about.html      - Project information and mission
├── gallery.html    - Plant gallery and product listings
├── contact.html    - Contact form and donations
├── developer.html  - Developer information
└── README.md       - Pages directory documentation
```

### New Utility Modules
```
src/
├── server-utils.js        - File serving utilities
├── dev-server-config.js   - Middleware configuration
├── routing.js             - Route definitions
├── page-loader.js         - Dynamic page loading
├── health-check.js        - Server health monitoring
└── routing.test.js        - Routing tests
```

### Configuration Files
```
├── vite.config.js         - Modified with pages middleware
├── PAGES_FIX.md           - Initial fix documentation
├── TROUBLESHOOTING.md     - Detailed troubleshooting guide
└── scripts/init-pages.js  - Initialization verification
```

## Development Workflow

### Working with Pages
1. Edit HTML files in `/pages/` directory
2. Dev server automatically serves updates
3. Refresh browser to see changes
4. Check console for accessibility verification

### Adding New Pages
1. Create new HTML file in `/pages/` directory
2. Add route to `src/routing.js`
3. Update navigation in `src/main.js`
4. Test with `node scripts/init-pages.js`

### Testing Pages
```bash
# Run routing tests
npm run test

# Verify pages manually in browser
# Check browser console for accessibility checks
```

## How the Middleware Works

### Vite Middleware Pipeline
1. **Request arrives** at dev server
2. **Pages Middleware**: Checks if URL starts with `/pages/`
3. **Assets Middleware**: Checks if URL starts with `/assets/`
4. **Public Middleware**: Checks if URL starts with `/public/`
5. **Next**: Passes to other handlers if no match

### File Serving Process
1. Construct file path using project root
2. Check if file exists and is a file (not directory)
3. Read file content from disk
4. Set appropriate Content-Type header
5. Set Cache-Control header for development
6. Send content to client

### Error Handling
- Logs detailed error messages to console
- Returns control to next handler if file not found
- Gracefully handles file system errors

## Performance Considerations

### Development
- Files served fresh on each request
- No caching (Cache-Control: no-cache)
- Optimized for fast iteration

### Production
- Will need separate configuration
- Consider enabling caching
- Use static file server or CDN
- Minify and optimize HTML

## Debugging Tips

### Console Checks
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for messages:
   - ✓ Page accessible: /pages/about.html
   - ✗ Page not accessible: ...

### Network Tab
1. Check Network tab in DevTools
2. Verify pages load (200 status)
3. Check Content-Type headers
4. Look for failed requests (404, 500)

### Server Logs
1. Check terminal where `npm run dev` is running
2. Look for middleware logs: `[Vite] Serving page: ...`
3. Check for error messages

## Utilities and Scripts

### Health Check
```javascript
import { checkPagesHealth } from './src/health-check.js';

const pages = [
  '/pages/about.html',
  '/pages/gallery.html',
  '/pages/contact.html',
  '/pages/developer.html',
];

const health = await checkPagesHealth(pages);
console.log(health);
```

### Page Loader
```javascript
import { loadPage, preloadPages } from './src/page-loader.js';

// Load a single page
const result = await loadPage('/pages/gallery.html');
if (result.success) {
  console.log(result.html);
}

// Preload multiple pages
await preloadPages([
  '/pages/about.html',
  '/pages/gallery.html',
  '/pages/contact.html',
]);
```

### Routing
```javascript
import { getAllRoutes, getRouteLabel, createBreadcrumbs } from './src/routing.js';

const routes = getAllRoutes();
const label = getRouteLabel('/pages/gallery.html');
const breadcrumbs = createBreadcrumbs('/pages/gallery.html');
```

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Pages not loading | Restart dev server: `npm run dev` |
| 404 errors | Check file names match URLs exactly |
| Blank pages | Check browser console for errors |
| CSS not loading | Ensure links use absolute paths `/assets/...` |
| Images missing | Verify images exist in `/assets/` directory |

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run linter
npm run lint

# Format code
npm run format

# Verify pages setup
node scripts/init-pages.js
```

## File References

For more detailed information, see:
- [PAGES_FIX.md](./PAGES_FIX.md) - Initial fix documentation
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Comprehensive troubleshooting
- [pages/README.md](./pages/README.md) - Pages directory information
- [vite.config.js](./vite.config.js) - Vite configuration with middleware

## Support & Next Steps

1. If pages still don't load, check TROUBLESHOOTING.md
2. Run initialization script: `node scripts/init-pages.js`
3. Check browser console for error messages
4. Verify all files exist in correct directories
5. Restart dev server if needed

## Commits Related to This Fix

This comprehensive fix includes 20+ commits addressing:
- Vite middleware configuration
- Error handling and logging
- Content-type headers
- Asset and public directory serving
- Utility modules for routing and page management
- Health checking and monitoring
- Documentation and guides
- Test setup
- Initialization scripts
