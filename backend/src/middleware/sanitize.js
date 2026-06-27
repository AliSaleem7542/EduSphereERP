/**
 * Input Sanitization Middleware
 * Prevents XSS attacks by sanitizing user input
 * Applies to all text fields in request body, query, and params
 */

const validator = require('validator');

/**
 * Sanitize a single value
 * @param {any} value - Value to sanitize
 * @returns {any} Sanitized value
 */
function sanitizeValue(value) {
  // Handle null, undefined, boolean, number
  if (value == null || typeof value === 'boolean' || typeof value === 'number') {
    return value;
  }

  // Handle arrays recursively
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  // Handle objects recursively
  if (typeof value === 'object') {
    const sanitized = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        sanitized[key] = sanitizeValue(value[key]);
      }
    }
    return sanitized;
  }

  // Handle strings
  if (typeof value === 'string') {
    // Trim whitespace
    let sanitized = value.trim();

    // Escape HTML to prevent XSS
    sanitized = validator.escape(sanitized);

    return sanitized;
  }

  return value;
}

/**
 * Sanitize request body, query, and params
 * Use this middleware before validation middleware
 */
function sanitizeInput(req, res, next) {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeValue(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeValue(req.query);
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeValue(req.params);
    }

    next();
  } catch (error) {
    console.error('[SECURITY] Sanitization error:', error.message);
    // Don't block request on sanitization error, just log it
    next();
  }
}

/**
 * Selective sanitization - only sanitize specific fields
 * Use when you need to preserve certain fields (like HTML content)
 * @param {string[]} fieldsToSanitize - Array of field names to sanitize
 */
function sanitizeFields(...fieldsToSanitize) {
  return (req, res, next) => {
    try {
      if (req.body && typeof req.body === 'object') {
        for (const field of fieldsToSanitize) {
          if (req.body[field] !== undefined) {
            req.body[field] = sanitizeValue(req.body[field]);
          }
        }
      }
      next();
    } catch (error) {
      console.error('[SECURITY] Selective sanitization error:', error.message);
      next();
    }
  };
}

/**
 * Validate and sanitize email addresses
 * @param {string} email - Email to validate
 * @returns {string|null} Sanitized email or null if invalid
 */
function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return null;

  const trimmed = email.trim().toLowerCase();

  // Validate email format
  if (!validator.isEmail(trimmed)) return null;

  // Normalize email
  return validator.normalizeEmail(trimmed, {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
  });
}

/**
 * Validate and sanitize phone numbers
 * @param {string} phone - Phone to sanitize
 * @returns {string|null} Sanitized phone or null if invalid
 */
function sanitizePhone(phone) {
  if (!phone || typeof phone !== 'string') return null;

  // Remove all non-digit characters except +
  let sanitized = phone.replace(/[^\d+]/g, '');

  // Basic validation: must be 10-15 digits (with optional + prefix)
  if (sanitized.length < 10 || sanitized.length > 16) return null;

  return sanitized;
}

/**
 * Validate and sanitize URLs
 * @param {string} url - URL to sanitize
 * @returns {string|null} Sanitized URL or null if invalid
 */
function sanitizeURL(url) {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // Validate URL format
  if (!validator.isURL(trimmed, {
    protocols: ['http', 'https'],
    require_protocol: true,
  })) {
    return null;
  }

  return trimmed;
}

/**
 * Strip HTML tags from text
 * Use for fields that should never contain HTML
 * @param {string} text - Text to strip
 * @returns {string} Text without HTML tags
 */
function stripHTML(text) {
  if (!text || typeof text !== 'string') return text;
  return validator.stripLow(validator.escape(text));
}

/**
 * Sanitize filename to prevent path traversal
 * @param {string} filename - Filename to sanitize
 * @returns {string} Safe filename
 */
function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') return 'file';

  // Remove path separators and special characters
  let sanitized = filename.replace(/[\/\\?%*:|"<>]/g, '');

  // Remove leading dots (hidden files)
  sanitized = sanitized.replace(/^\.+/, '');

  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }

  return sanitized || 'file';
}

module.exports = {
  sanitizeInput,
  sanitizeFields,
  sanitizeValue,
  sanitizeEmail,
  sanitizePhone,
  sanitizeURL,
  stripHTML,
  sanitizeFilename,
};
