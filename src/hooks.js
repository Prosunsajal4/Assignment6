/**
 * Custom React Hooks
 * Reusable hooks for common patterns
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from './logger.js';
import { STORAGE_KEYS, UI_CONFIG } from './constants.js';

/**
 * useLocalStorage - Sync state with localStorage
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.error(`Error reading from localStorage: ${key}`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      logger.debug(`LocalStorage updated: ${key}`, valueToStore);
    } catch (error) {
      logger.error(`Error writing to localStorage: ${key}`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

/**
 * useDebounce - Debounce a value
 */
export function useDebounce(value, delay = UI_CONFIG.DEBOUNCE_DELAY) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useThrottle - Throttle a callback
 */
export function useThrottle(callback, delay = UI_CONFIG.THROTTLE_DELAY) {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  }, [callback, delay]);
}

/**
 * useAsync - Handle async operations
 */
export function useAsync(asyncFunction, immediate = true) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await asyncFunction(...args);
      setData(response);
      return response;
    } catch (err) {
      setError(err);
      logger.error('Async operation failed', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { loading, error, data, execute };
}

/**
 * useFetch - Simplified fetch hook with retry
 */
export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const retryCount = useRef(0);
  const maxRetries = options.retries || 3;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      setData(json);
      retryCount.current = 0;
    } catch (err) {
      logger.error(`Fetch failed: ${url}`, err);

      if (retryCount.current < maxRetries) {
        retryCount.current++;
        logger.info(`Retrying fetch (${retryCount.current}/${maxRetries}): ${url}`);
        setTimeout(fetchData, 1000);
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [url, options, maxRetries]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * useSessionStorage - Sync state with sessionStorage
 */
export function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.error(`Error reading from sessionStorage: ${key}`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      logger.error(`Error writing to sessionStorage: ${key}`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

/**
 * usePrevious - Get previous value
 */
export function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * useClickOutside - Detect clicks outside element
 */
export function useClickOutside(ref, callback) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
}

/**
 * useMediaQuery - Detect media queries
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (e) => setMatches(e.matches);
    mediaQuery.addListener(handleChange);

    return () => mediaQuery.removeListener(handleChange);
  }, [query]);

  return matches;
}

/**
 * usePerformance - Measure performance
 */
export function usePerformance(label) {
  const startTime = useRef(Date.now());

  useEffect(() => {
    return () => {
      const duration = Date.now() - startTime.current;
      logger.performance(label, duration);
    };
  }, [label]);
}

export default {
  useLocalStorage,
  useDebounce,
  useThrottle,
  useAsync,
  useFetch,
  useSessionStorage,
  usePrevious,
  useClickOutside,
  useMediaQuery,
  usePerformance,
};
