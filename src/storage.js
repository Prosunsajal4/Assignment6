/**
 * Storage Utility
 * Abstraction for localStorage and sessionStorage with expiration
 */

import { logger } from './logger.js';

class StorageManager {
  constructor(storageType = 'localStorage') {
    this.storage = storageType === 'session' ? window.sessionStorage : window.localStorage;
    this.storageType = storageType;
  }

  /**
   * Set item with optional expiration
   */
  setItem(key, value, expiresIn = null) {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        expiresIn: expiresIn ? Date.now() + expiresIn : null,
      };

      this.storage.setItem(key, JSON.stringify(item));
      logger.debug(`Stored ${this.storageType}: ${key}`);
    } catch (error) {
      logger.error(`Error storing ${this.storageType}`, { key, error: error.message });
      throw error;
    }
  }

  /**
   * Get item with expiration check
   */
  getItem(key) {
    try {
      const item = this.storage.getItem(key);

      if (!item) {
        return null;
      }

      const parsed = JSON.parse(item);

      // Check if item has expired
      if (parsed.expiresIn && Date.now() > parsed.expiresIn) {
        this.removeItem(key);
        logger.debug(`Retrieved item expired: ${key}`);
        return null;
      }

      logger.debug(`Retrieved from ${this.storageType}: ${key}`);
      return parsed.value;
    } catch (error) {
      logger.error(`Error retrieving from ${this.storageType}`, { key, error: error.message });
      return null;
    }
  }

  /**
   * Remove item
   */
  removeItem(key) {
    try {
      this.storage.removeItem(key);
      logger.debug(`Removed from ${this.storageType}: ${key}`);
    } catch (error) {
      logger.error(`Error removing from ${this.storageType}`, { key, error: error.message });
    }
  }

  /**
   * Clear all items
   */
  clear() {
    try {
      this.storage.clear();
      logger.debug(`Cleared all ${this.storageType}`);
    } catch (error) {
      logger.error(`Error clearing ${this.storageType}`, error);
    }
  }

  /**
   * Get all items
   */
  getAll() {
    const items = {};

    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        items[key] = this.getItem(key);
      }
    } catch (error) {
      logger.error(`Error retrieving all from ${this.storageType}`, error);
    }

    return items;
  }

  /**
   * Get storage size
   */
  getSize() {
    let size = 0;

    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        const item = this.storage.getItem(key);
        size += key.length + item.length;
      }
    } catch (error) {
      logger.error(`Error calculating storage size`, error);
    }

    return size;
  }

  /**
   * Check if key exists
   */
  hasItem(key) {
    try {
      return this.storage.getItem(key) !== null;
    } catch (error) {
      logger.error(`Error checking if item exists`, { key, error: error.message });
      return false;
    }
  }

  /**
   * Set multiple items
   */
  setMultiple(items) {
    try {
      Object.entries(items).forEach(([key, value]) => {
        this.setItem(key, value);
      });
      logger.debug(`Stored multiple items to ${this.storageType}`);
    } catch (error) {
      logger.error(`Error storing multiple items`, error);
    }
  }

  /**
   * Get multiple items
   */
  getMultiple(keys) {
    const result = {};

    try {
      keys.forEach((key) => {
        result[key] = this.getItem(key);
      });
    } catch (error) {
      logger.error(`Error retrieving multiple items`, error);
    }

    return result;
  }
}

// Export singleton instances
export const localStore = new StorageManager('local');
export const sessionStore = new StorageManager('session');

export { StorageManager };

export default { localStore, sessionStore };
