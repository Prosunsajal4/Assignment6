/**
 * Utility Helpers and Formatters
 * Common utility functions for the application
 */

import { logger } from './logger.js';

/**
 * Format currency value
 */
export function formatCurrency(value, currency = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(value);
}

/**
 * Format date to readable string
 */
export function formatDate(date, locale = 'en-US', options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  const formatter = new Intl.DateTimeFormat(locale, defaultOptions);
  return formatter.format(new Date(date));
}

/**
 * Format date to ISO string
 */
export function formatDateISO(date) {
  return new Date(date).toISOString().split('T')[0];
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\\D/g, '');

  if (cleaned.length !== 10) {
    return phone;
  }

  return cleaned.replace(/(\\d{3})(\\d{3})(\\d{4})/, '($1) $2-$3');
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Truncate string
 */
export function truncateString(str, maxLength = 50, suffix = '...') {
  if (str.length <= maxLength) {
    return str;
  }

  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize string
 */
export function capitalizeString(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Slug generator
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\\w\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * URL parameters
 */
export const URLParams = {
  get: (key) => new URLSearchParams(window.location.search).get(key),
  getAll: () => Object.fromEntries(new URLSearchParams(window.location.search)),
  set: (params) => {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    window.history.replaceState({}, '', url.toString());
  },
};

/**
 * Debounce function
 */
export function debounce(fn, delay = 300) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle(fn, delay = 300) {
  let lastCall = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    logger.error('Deep clone failed', error);
    return obj;
  }
}

/**
 * Merge objects
 */
export function mergeObjects(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object'
      ) {
        result[key] = mergeObjects(targetValue, sourceValue);
      } else {
        result[key] = sourceValue;
      }
    }
  }

  return result;
}

/**
 * Get random item from array
 */
export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Shuffle array
 */
export function shuffleArray(arr) {
  const result = [...arr];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Group array by key
 */
export function groupBy(arr, key) {
  return arr.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}

/**
 * Wait for async operation
 */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default {
  formatCurrency,
  formatDate,
  formatDateISO,
  formatPhoneNumber,
  formatFileSize,
  truncateString,
  capitalizeString,
  slugify,
  URLParams,
  debounce,
  throttle,
  deepClone,
  mergeObjects,
  getRandomItem,
  shuffleArray,
  groupBy,
  wait,
};
