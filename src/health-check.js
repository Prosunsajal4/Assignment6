/**
 * Server Health Check Utility
 * 
 * Utilities for checking server status and page accessibility
 */

/**
 * Check if a server is running and responding
 * @param {string} url - The server URL
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {Promise<Object>} Health check result
 */
export async function checkServerHealth(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return {
      healthy: response.ok,
      status: response.status,
      statusText: response.statusText,
      url: url,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    clearTimeout(timeoutId);

    return {
      healthy: false,
      error: error.message,
      url: url,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Check health of all pages
 * @param {Array} pageUrls - Array of page URLs to check
 * @returns {Promise<Object>} Health check results for all pages
 */
export async function checkPagesHealth(pageUrls) {
  const results = await Promise.all(
    pageUrls.map(url => checkServerHealth(url))
  );

  const summary = {
    timestamp: new Date().toISOString(),
    total: results.length,
    healthy: results.filter(r => r.healthy).length,
    unhealthy: results.filter(r => !r.healthy).length,
    results: results,
  };

  return summary;
}

/**
 * Check if the dev server is running
 * @param {string} host - The server host
 * @param {number} port - The server port
 * @returns {Promise<Object>} Dev server health check
 */
export async function checkDevServer(host = 'localhost', port = 3000) {
  const url = `http://${host}:${port}/`;
  return checkServerHealth(url);
}

/**
 * Log health check results
 * @param {Object} result - The health check result
 */
export function logHealthResult(result) {
  const status = result.healthy ? '✓' : '✗';
  const message = result.healthy
    ? `${status} Server is healthy (${result.status})`
    : `${status} Server is unhealthy: ${result.error || result.statusText}`;

  console.log(`[Health Check] ${message}`);
  console.log(`  URL: ${result.url}`);
  console.log(`  Timestamp: ${result.timestamp}`);
}

/**
 * Log all health check results
 * @param {Object} summary - The health check summary
 */
export function logHealthSummary(summary) {
  console.log('\n[Health Check Summary]');
  console.log(`  Total Pages: ${summary.total}`);
  console.log(`  Healthy: ${summary.healthy}`);
  console.log(`  Unhealthy: ${summary.unhealthy}`);
  console.log(`  Timestamp: ${summary.timestamp}`);

  summary.results.forEach(result => {
    const status = result.healthy ? '✓' : '✗';
    const info = result.healthy
      ? `${status} ${result.url} (${result.status})`
      : `${status} ${result.url} - ${result.error || result.statusText}`;
    console.log(`  ${info}`);
  });
  console.log('');
}

/**
 * Check if all pages are accessible
 * @param {Array} pageUrls - Array of page URLs
 * @returns {Promise<boolean>} True if all pages are accessible
 */
export async function areAllPagesAccessible(pageUrls) {
  const summary = await checkPagesHealth(pageUrls);
  return summary.unhealthy === 0;
}

/**
 * Retry a health check with exponential backoff
 * @param {string} url - The URL to check
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in milliseconds
 * @returns {Promise<Object>} Health check result after retries
 */
export async function checkHealthWithRetry(
  url,
  maxRetries = 3,
  initialDelay = 1000
) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await checkServerHealth(url);

    if (result.healthy) {
      return result;
    }

    lastError = result;

    if (attempt < maxRetries - 1) {
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`[Health Check] Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return lastError;
}

/**
 * Monitor server health continuously
 * @param {string} url - The URL to monitor
 * @param {number} interval - Check interval in milliseconds
 * @param {number} duration - Total monitoring duration in milliseconds
 * @returns {Promise<Array>} Array of health check results
 */
export async function monitorServerHealth(
  url,
  interval = 5000,
  duration = 60000
) {
  const results = [];
  const startTime = Date.now();

  while (Date.now() - startTime < duration) {
    const result = await checkServerHealth(url);
    results.push(result);

    logHealthResult(result);

    const elapsed = Date.now() - startTime;
    const remaining = duration - elapsed;

    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, Math.min(interval, remaining)));
    }
  }

  return results;
}
