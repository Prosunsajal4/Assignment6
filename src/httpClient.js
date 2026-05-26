/**
 * HTTP Client Utility
 * Centralized API communication with retry logic, error handling
 */

import { logger } from './logger.js';
import { API_CONFIG } from './constants.js';

class HTTPClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || API_CONFIG.BASE_URL;
    this.timeout = config.timeout || API_CONFIG.TIMEOUT;
    this.retryAttempts = config.retryAttempts || API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = config.retryDelay || API_CONFIG.RETRY_DELAY;
  }

  /**
   * Create abort controller with timeout
   */
  createController(timeout = this.timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    return { controller, timeoutId };
  }

  /**
   * Build request options
   */
  buildRequestOptions(method, options = {}) {
    return {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
  }

  /**
   * Retry logic for failed requests
   */
  async retry(fn, attempt = 0) {
    try {
      return await fn();
    } catch (error) {
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
        logger.warn(`Retry attempt ${attempt + 1}/${this.retryAttempts} in ${delay}ms`, {
          error: error.message,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retry(fn, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Determine if request should be retried
   */
  shouldRetry(error) {
    // Don't retry on client errors (4xx) except 408, 429
    if (error.status >= 400 && error.status < 500) {
      return error.status === 408 || error.status === 429;
    }

    // Retry on server errors (5xx) and network errors
    return error.status >= 500 || error.name === 'AbortError';
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, method = 'GET', data = null, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    logger.apiRequest(method, url, data);

    const requestOptions = this.buildRequestOptions(method, {
      ...options,
      body: data ? JSON.stringify(data) : undefined,
    });

    try {
      const { controller, timeoutId } = this.createController();

      const response = await this.retry(async () => {
        const res = await fetch(url, {
          ...requestOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const error = new Error(`HTTP ${res.status}`);
          error.status = res.status;
          error.response = res;
          throw error;
        }

        return res;
      });

      const contentType = response.headers.get('content-type');
      let responseData;

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      logger.apiResponse(method, url, response.status, responseData);

      return {
        success: true,
        status: response.status,
        data: responseData,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(error.timeoutId);

      if (error.name === 'AbortError') {
        logger.error(`Request timeout: ${method} ${url}`);
        throw new Error('Request timeout');
      }

      logger.error(`Request failed: ${method} ${url}`, {
        status: error.status,
        message: error.message,
      });

      throw error;
    }
  }

  /**
   * GET request
   */
  get(endpoint, options) {
    return this.request(endpoint, 'GET', null, options);
  }

  /**
   * POST request
   */
  post(endpoint, data, options) {
    return this.request(endpoint, 'POST', data, options);
  }

  /**
   * PUT request
   */
  put(endpoint, data, options) {
    return this.request(endpoint, 'PUT', data, options);
  }

  /**
   * PATCH request
   */
  patch(endpoint, data, options) {
    return this.request(endpoint, 'PATCH', data, options);
  }

  /**
   * DELETE request
   */
  delete(endpoint, options) {
    return this.request(endpoint, 'DELETE', null, options);
  }
}

// Export singleton instance
export const httpClient = new HTTPClient();

// Export class for custom instances
export { HTTPClient };

export default httpClient;
