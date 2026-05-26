/**
 * Form Validation Utilities
 * Comprehensive validation for common form fields
 */

import { VALIDATION_PATTERNS, ERROR_MESSAGES } from './constants.js';

/**
 * Validation result object
 */
class ValidationResult {
  constructor(isValid, errors = {}) {
    this.isValid = isValid;
    this.errors = errors;
  }

  addError(field, message) {
    this.errors[field] = message;
    this.isValid = false;
  }

  getErrorMessage(field) {
    return this.errors[field] || null;
  }

  hasError(field) {
    return field in this.errors;
  }
}

/**
 * Validate email address
 */
export function validateEmail(email) {
  if (!email || !email.trim()) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }

  if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }

  return null;
}

/**
 * Validate phone number
 */
export function validatePhone(phone) {
  if (!phone || !phone.trim()) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }

  if (!VALIDATION_PATTERNS.PHONE.test(phone)) {
    return ERROR_MESSAGES.INVALID_PHONE;
  }

  return null;
}

/**
 * Validate ZIP code (US)
 */
export function validateZipCode(zipCode) {
  if (!zipCode || !zipCode.trim()) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }

  if (!VALIDATION_PATTERNS.ZIP_CODE.test(zipCode)) {
    return ERROR_MESSAGES.INVALID_ZIP;
  }

  return null;
}

/**
 * Validate required field
 */
export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required.`;
  }

  return null;
}

/**
 * Validate minimum length
 */
export function validateMinLength(value, minLength, fieldName) {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters.`;
  }

  return null;
}

/**
 * Validate maximum length
 */
export function validateMaxLength(value, maxLength, fieldName) {
  if (value && value.length > maxLength) {
    return `${fieldName} must be at most ${maxLength} characters.`;
  }

  return null;
}

/**
 * Validate number range
 */
export function validateNumberRange(value, min, max, fieldName) {
  const num = Number(value);

  if (isNaN(num)) {
    return `${fieldName} must be a valid number.`;
  }

  if (num < min || num > max) {
    return `${fieldName} must be between ${min} and ${max}.`;
  }

  return null;
}

/**
 * Validate credit card number (basic Luhn algorithm)
 */
export function validateCreditCard(cardNumber) {
  if (!cardNumber) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }

  const cleaned = cardNumber.replace(/\\s/g, '');

  if (!VALIDATION_PATTERNS.CREDIT_CARD.test(cleaned)) {
    return 'Please enter a valid credit card number.';
  }

  // Basic Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0 ? null : 'Invalid credit card number.';
}

/**
 * Validate donation form
 */
export function validateDonationForm(formData) {
  const result = new ValidationResult(true);

  // Validate name
  if (!formData.name || !formData.name.trim()) {
    result.addError('name', ERROR_MESSAGES.REQUIRED_FIELD);
  }

  // Validate email
  const emailError = validateEmail(formData.email);
  if (emailError) {
    result.addError('email', emailError);
  }

  // Validate amount
  if (!formData.amount) {
    result.addError('amount', ERROR_MESSAGES.REQUIRED_FIELD);
  } else {
    const amountError = validateNumberRange(formData.amount, 1, 10000, 'Donation amount');
    if (amountError) {
      result.addError('amount', amountError);
    }
  }

  return result;
}

/**
 * Validate contact form
 */
export function validateContactForm(formData) {
  const result = new ValidationResult(true);

  // Validate name
  const nameError = validateRequired(formData.name, 'Name');
  if (nameError) {
    result.addError('name', nameError);
  }

  // Validate email
  const emailError = validateEmail(formData.email);
  if (emailError) {
    result.addError('email', emailError);
  }

  // Validate message
  const messageError = validateRequired(formData.message, 'Message');
  if (messageError) {
    result.addError('message', messageError);
  }

  return result;
}

/**
 * Sanitize input (basic XSS prevention)
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitize all form fields
 */
export function sanitizeFormData(formData) {
  const sanitized = {};

  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export { ValidationResult };
