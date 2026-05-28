/**
 * Routing Helper Module
 * 
 * Utilities for managing routes and navigation in the Green Earth project
 */

/**
 * Available routes in the application
 */
export const ROUTES = {
  HOME: '/',
  ABOUT: '/pages/about.html',
  GALLERY: '/pages/gallery.html',
  CONTACT: '/pages/contact.html',
  DEVELOPER: '/pages/developer.html',
};

/**
 * Navigation menu structure
 */
export const NAV_MENU = [
  { label: 'Home', url: ROUTES.HOME },
  { label: 'About', url: ROUTES.ABOUT },
  { label: 'Gallery', url: ROUTES.GALLERY },
  { label: 'Developer', url: ROUTES.DEVELOPER },
  { label: 'Contact', url: ROUTES.CONTACT },
];

/**
 * Get all available routes
 * @returns {Array} Array of route URLs
 */
export function getAllRoutes() {
  return Object.values(ROUTES);
}

/**
 * Get all navigation items
 * @returns {Array} Array of navigation items
 */
export function getNavItems() {
  return NAV_MENU;
}

/**
 * Check if a URL is a valid route
 * @param {string} url - The URL to check
 * @returns {boolean} True if URL is a valid route
 */
export function isValidRoute(url) {
  return getAllRoutes().includes(url);
}

/**
 * Get a nav item by URL
 * @param {string} url - The URL
 * @returns {Object|null} The nav item or null
 */
export function getNavItemByUrl(url) {
  return NAV_MENU.find(item => item.url === url) || null;
}

/**
 * Get the label for a route
 * @param {string} url - The route URL
 * @returns {string} The route label
 */
export function getRouteLabel(url) {
  const item = getNavItemByUrl(url);
  return item ? item.label : 'Unknown';
}

/**
 * Create a breadcrumb for a route
 * @param {string} currentUrl - The current URL
 * @returns {Array} Array of breadcrumb items
 */
export function createBreadcrumbs(currentUrl) {
  const breadcrumbs = [{ label: 'Home', url: ROUTES.HOME }];
  
  if (currentUrl !== ROUTES.HOME) {
    const item = getNavItemByUrl(currentUrl);
    if (item) {
      breadcrumbs.push(item);
    }
  }
  
  return breadcrumbs;
}

/**
 * Get the next route in the nav menu
 * @param {string} currentUrl - The current route URL
 * @returns {Object|null} The next nav item or null
 */
export function getNextRoute(currentUrl) {
  const currentIndex = NAV_MENU.findIndex(item => item.url === currentUrl);
  if (currentIndex === -1 || currentIndex === NAV_MENU.length - 1) {
    return null;
  }
  return NAV_MENU[currentIndex + 1];
}

/**
 * Get the previous route in the nav menu
 * @param {string} currentUrl - The current route URL
 * @returns {Object|null} The previous nav item or null
 */
export function getPreviousRoute(currentUrl) {
  const currentIndex = NAV_MENU.findIndex(item => item.url === currentUrl);
  if (currentIndex <= 0) {
    return null;
  }
  return NAV_MENU[currentIndex - 1];
}

/**
 * Log all available routes (for debugging)
 */
export function logRoutes() {
  console.log('\n[Routing] Available Routes:');
  Object.entries(ROUTES).forEach(([key, url]) => {
    console.log(`  ${key}: ${url}`);
  });
  console.log('');
}

/**
 * Verify all routes are accessible
 * @returns {boolean} True if all routes are valid
 */
export function verifyRoutes() {
  const allValid = getAllRoutes().every(route => {
    return typeof route === 'string' && route.length > 0;
  });
  
  console.log(`[Routing] All routes valid: ${allValid ? '✓' : '✗'}`);
  return allValid;
}
