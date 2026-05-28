# Pages Directory

This directory contains the standalone HTML pages for the Green Earth website.

## Available Pages

### about.html
- URL: `/pages/about.html`
- Description: Information about the Green Earth project, mission, and vision
- Navigation: Home, Gallery, Developer, Contact

### gallery.html
- URL: `/pages/gallery.html`
- Description: Plant and tree gallery with product listings and cart functionality
- Navigation: Home, About, Developer, Contact

### contact.html
- URL: `/pages/contact.html`
- Description: Contact form and donation payment integration
- Navigation: Home, About, Gallery, Developer

### developer.html
- URL: `/pages/developer.html`
- Description: Developer information and technical documentation
- Navigation: Home, About, Gallery, Contact

## How They're Served

These pages are served by the Vite development server via custom middleware configured in `vite.config.js`. The middleware handles:

1. **File Reading**: Reads HTML content from disk
2. **Content Type Headers**: Sets proper `Content-Type: text/html` headers
3. **Caching**: Sets `Cache-Control: no-cache` for development
4. **Error Handling**: Logs any errors that occur during serving

## Link Structure

All navigation links use absolute paths:
- Home: `/`
- About: `/pages/about.html`
- Gallery: `/pages/gallery.html`
- Contact: `/pages/contact.html`
- Developer: `/pages/developer.html`

## Asset References

Pages reference assets using absolute paths:
- Images: `/assets/image-name.png`
- Favicon: `/assets/hero-leaf1.png`
- Public files: `/public/manifest.json`

## Development

When developing, all pages are served directly by the Vite dev server running on `http://localhost:3000`. No build step is required for these HTML pages to be served correctly.

## Production Build

During production build, these pages need to be included in the dist folder. The Vite build configuration should handle copying these files appropriately.
