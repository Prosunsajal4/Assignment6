/**
 * Logger Utility
 * Centralized logging with environment-aware output
 */

import { IS_DEVELOPMENT, IS_PRODUCTION, FEATURE_FLAGS } from './constants.js';

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

/**
 * Color codes for console output
 */
const COLORS = {
  DEBUG: '\x1b[36m', // Cyan
  INFO: '\x1b[32m', // Green
  WARN: '\x1b[33m', // Yellow
  ERROR: '\x1b[31m', // Red
  RESET: '\x1b[0m',
};

/**
 * Format log message with timestamp and level
 */
function formatMessage(level, message, data) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  return data ? `${prefix} ${message}` : prefix + message;
}

/**
 * Log message to console with appropriate styling
 */
function logToConsole(level, message, data) {
  const formatted = formatMessage(level, message, data);
  const color = COLORS[level] || COLORS.INFO;

  if (data) {
    console.log(`${color}${formatted}${COLORS.RESET}`, data);
  } else {
    console.log(`${color}${formatted}${COLORS.RESET}`);
  }
}

/**
 * Send error to external tracking service (if enabled)
 */
function trackError(message, data) {
  if (!FEATURE_FLAGS.ENABLE_ERROR_TRACKING || IS_DEVELOPMENT) {
    return;
  }

  try {
    // TODO: Integrate with error tracking service (Sentry, Rollbar, etc.)
    // await errorTracker.captureException(new Error(message), { extra: data });
  } catch (e) {
    console.error('Failed to track error:', e);
  }
}

/**
 * Logger object with methods for different log levels
 */
export const logger = {
  debug(message, data = null) {
    if (FEATURE_FLAGS.ENABLE_DEBUG) {
      logToConsole(LOG_LEVELS.DEBUG, message, data);
    }
  },

  info(message, data = null) {
    logToConsole(LOG_LEVELS.INFO, message, data);
  },

  warn(message, data = null) {
    logToConsole(LOG_LEVELS.WARN, message, data);
  },

  error(message, data = null) {
    logToConsole(LOG_LEVELS.ERROR, message, data);
    trackError(message, data);
  },

  /**
   * Log API request
   */
  apiRequest(method, url, data = null) {
    if (FEATURE_FLAGS.ENABLE_DEBUG) {
      logger.debug(`API Request: ${method} ${url}`, data);
    }
  },

  /**
   * Log API response
   */
  apiResponse(method, url, statusCode, data = null) {
    if (FEATURE_FLAGS.ENABLE_DEBUG) {
      logger.debug(`API Response: ${method} ${url} [${statusCode}]`, data);
    }
  },

  /**
   * Log performance metrics
   */
  performance(label, duration) {
    if (FEATURE_FLAGS.ENABLE_PERFORMANCE_MONITORING) {
      logger.info(`Performance: ${label} took ${duration}ms`);
    }
  },

  /**
   * Group related logs
   */
  group(label, fn) {
    if (IS_DEVELOPMENT) {
      console.group(label);
      try {
        fn();
      } finally {
        console.groupEnd();
      }
    } else {
      fn();
    }
  },
};

export default logger;
