/**
 * Application Constants
 * Centralized configuration for app-wide constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:4242',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Stripe Configuration
export const STRIPE_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
};

// Donation Settings
export const DONATION_CONFIG = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 10000,
  DEFAULT_AMOUNT: 25,
  SUGGESTED_AMOUNTS: [5, 10, 25, 50, 100],
  CURRENCY: 'USD',
};

// Tree Planting
export const TREE_CONFIG = {
  TREES_PER_DOLLAR: 1,
  TARGET_TREES: 1000000,
  CATEGORIES: ['Oak', 'Maple', 'Pine', 'Birch', 'Elm'],
};

// Local Storage Keys
export const STORAGE_KEYS = {
  CART_ITEMS: 'cart_items',
  USER_PREFERENCES: 'user_preferences',
  LAST_DONATION: 'last_donation',
  NOTIFICATION_HISTORY: 'notification_history',
};

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 500,
};

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
  PHONE: /^[\\d\\s\\+\\-\\(\\)]+$/,
  ZIP_CODE: /^\\d{5}(-\\d{4})?$/,
  CREDIT_CARD: /^\\d{13,19}$/,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_ZIP: 'Please enter a valid ZIP code.',
  DONATION_FAILED: 'Donation failed. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  REQUIRED_FIELD: 'This field is required.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  DONATION_RECEIVED: 'Thank you for your generous donation!',
  CART_UPDATED: 'Cart updated successfully.',
  CHECKOUT_STARTED: 'Proceeding to checkout...',
};

// Environment
export const APP_ENV = import.meta.env.MODE || 'development';
export const IS_DEVELOPMENT = APP_ENV === 'development';
export const IS_PRODUCTION = APP_ENV === 'production';

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_PERFORMANCE_MONITORING: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  ENABLE_ERROR_TRACKING: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true' && IS_DEVELOPMENT,
};
