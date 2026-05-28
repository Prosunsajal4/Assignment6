/**
 * Page Loader Module
 * 
 * Provides utilities for dynamically loading and managing page content
 */

/**
 * Load a page by URL
 * @param {string} pageUrl - The URL of the page to load
 * @returns {Promise} Promise that resolves with page content
 */
export async function loadPage(pageUrl) {
  try {
    const response = await fetch(pageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to load page: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    return { success: true, html, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      html: null
    };
  }
}

/**
 * Validate page URL format
 * @param {string} url - The URL to validate
 * @returns {boolean} True if URL is valid
 */
export function isValidPageUrl(url) {
  return typeof url === 'string' && 
         (url.startsWith('/pages/') || url === '/') &&
         url.endsWith('.html') || url === '/';
}

/**
 * Extract page name from URL
 * @param {string} url - The page URL
 * @returns {string} The page name
 */
export function getPageName(url) {
  const match = url.match(/\/pages\/(\w+)\.html/);
  return match ? match[1] : 'home';
}

/**
 * Cache for loaded pages
 */
const pageCache = new Map();

/**
 * Get cached page content
 * @param {string} pageUrl - The page URL
 * @returns {string|null} Cached content or null
 */
export function getCachedPage(pageUrl) {
  return pageCache.get(pageUrl) || null;
}

/**
 * Set page cache
 * @param {string} pageUrl - The page URL
 * @param {string} html - The HTML content
 */
export function setCacheForPage(pageUrl, html) {
  pageCache.set(pageUrl, html);
}

/**
 * Clear page cache
 * @param {string} pageUrl - The page URL (optional, clears all if not provided)
 */
export function clearPageCache(pageUrl = null) {
  if (pageUrl) {
    pageCache.delete(pageUrl);
  } else {
    pageCache.clear();
  }
}

/**
 * Preload pages for better performance
 * @param {Array} pageUrls - Array of page URLs to preload
 */
export async function preloadPages(pageUrls) {
  const results = await Promise.all(
    pageUrls.map(async (url) => {
      const cached = getCachedPage(url);
      if (!cached) {
        const result = await loadPage(url);
        if (result.success) {
          setCacheForPage(url, result.html);
          console.log(`[PageLoader] Preloaded: ${url}`);
        } else {
          console.error(`[PageLoader] Failed to preload ${url}: ${result.error}`);
        }
      }
    })
  );
  
  return results;
}

/**
 * Get page status (whether it's loadable)
 * @param {string} pageUrl - The page URL
 * @returns {Promise<Object>} Object with status information
 */
export async function getPageStatus(pageUrl) {
  try {
    const response = await fetch(pageUrl, { method: 'HEAD' });
    return {
      url: pageUrl,
      accessible: response.ok,
      status: response.status,
      contentType: response.headers.get('content-type'),
    };
  } catch (error) {
    return {
      url: pageUrl,
      accessible: false,
      error: error.message,
    };
  }
}

/**
 * Verify all pages are accessible
 * @param {Array} pageUrls - Array of page URLs to verify
 * @returns {Promise<Object>} Summary of page statuses
 */
export async function verifyPages(pageUrls) {
  const statuses = await Promise.all(pageUrls.map(getPageStatus));
  
  const summary = {
    total: statuses.length,
    accessible: statuses.filter(s => s.accessible).length,
    failed: statuses.filter(s => !s.accessible).length,
    statuses: statuses,
  };
  
  console.log(`[PageLoader] Page Verification:
    Total: ${summary.total}
    Accessible: ${summary.accessible}
    Failed: ${summary.failed}
  `);
  
  return summary;
}
