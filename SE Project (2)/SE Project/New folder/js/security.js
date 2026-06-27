/**
 * EDU-SPHERE — Security Utilities
 * XSS Prevention, Input Sanitization, and Validation
 * @version 2.0.0 - Enterprise Security Hardened
 */

var SECURITY = (function() {

  // ═══════════════════════════════════════════════════════════════════════════
  // XSS PROTECTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Escape HTML special characters to prevent XSS
   * @param {string} text - Raw text that may contain HTML
   * @returns {string} Escaped HTML-safe text
   */
  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    
    // Convert to string if not already
    text = String(text);
    
    // Create a temporary element and use browser's built-in escaping
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Escape HTML in an object's properties
   * @param {object} obj - Object with properties to escape
   * @param {string[]} keys - Array of keys to escape
   * @returns {object} New object with escaped values
   */
  function escapeObject(obj, keys) {
    if (!obj) return obj;
    
    var escaped = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (keys && keys.indexOf(key) !== -1) {
          escaped[key] = escapeHtml(obj[key]);
        } else {
          escaped[key] = obj[key];
        }
      }
    }
    return escaped;
  }

  /**
   * Safely set HTML content with automatic escaping
   * @param {HTMLElement} element - DOM element
   * @param {string} text - Text to set (will be escaped)
   */
  function safeSetText(element, text) {
    if (!element) return;
    element.textContent = text;
  }

  /**
   * Create a text node safely (alternative to innerHTML)
   * @param {string} text - Text content
   * @returns {Text} Text node
   */
  function createTextNode(text) {
    return document.createTextNode(text || '');
  }

  /**
   * Validate and sanitize numeric input
   * @param {any} value - Value to validate
   * @param {number} defaultValue - Default if invalid
   * @returns {number} Valid number
   */
  function sanitizeNumber(value, defaultValue) {
    var num = parseFloat(value);
    return isNaN(num) ? (defaultValue || 0) : num;
  }

  /**
   * Validate and sanitize integer input
   * @param {any} value - Value to validate
   * @param {number} defaultValue - Default if invalid
   * @returns {number} Valid integer
   */
  function sanitizeInteger(value, defaultValue) {
    var num = parseInt(value);
    return isNaN(num) ? (defaultValue || 0) : num;
  }

  /**
   * Strip HTML tags from text
   * @param {string} html - HTML string
   * @returns {string} Plain text
   */
  function stripHtml(html) {
    if (!html) return '';
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INPUT VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Validate email format
   * @param {string} email - Email address to validate
   * @returns {object} { valid: boolean, error: string }
   */
  function validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' };
    }
    
    email = email.trim();
    
    // RFC 5322 compliant email regex (simplified)
    var emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    
    if (email.length > 254) {
      return { valid: false, error: 'Email address too long' };
    }
    
    return { valid: true, value: email.toLowerCase() };
  }

  /**
   * Validate phone number (Pakistan format)
   * @param {string} phone - Phone number to validate
   * @returns {object} { valid: boolean, error: string }
   */
  function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') {
      return { valid: false, error: 'Phone number is required' };
    }
    
    phone = phone.trim();
    
    // Remove common separators
    var cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Pakistan phone number: 03XX-XXXXXXX or +923XX-XXXXXXX
    var phoneRegex = /^(\+92|0)?3[0-9]{9}$/;
    
    if (!phoneRegex.test(cleaned)) {
      return { valid: false, error: 'Invalid phone number format (e.g., 0300-1234567)' };
    }
    
    return { valid: true, value: cleaned };
  }

  /**
   * Validate CNIC (Pakistan National ID Card)
   * @param {string} cnic - CNIC to validate
   * @returns {object} { valid: boolean, error: string }
   */
  function validateCNIC(cnic) {
    if (!cnic) {
      return { valid: true, value: null }; // CNIC is optional
    }
    
    cnic = String(cnic).trim();
    
    // Remove dashes
    var cleaned = cnic.replace(/-/g, '');
    
    // CNIC format: 13 digits
    if (!/^\d{13}$/.test(cleaned)) {
      return { valid: false, error: 'CNIC must be 13 digits (e.g., 12345-1234567-1)' };
    }
    
    return { valid: true, value: cleaned };
  }

  /**
   * Validate required text field
   * @param {string} text - Text to validate
   * @param {string} fieldName - Field name for error message
   * @param {number} minLength - Minimum length
   * @param {number} maxLength - Maximum length
   * @returns {object} { valid: boolean, error: string }
   */
  function validateText(text, fieldName, minLength, maxLength) {
    fieldName = fieldName || 'This field';
    minLength = minLength || 1;
    maxLength = maxLength || 255;
    
    if (!text || typeof text !== 'string') {
      return { valid: false, error: fieldName + ' is required' };
    }
    
    text = text.trim();
    
    if (text.length < minLength) {
      return { valid: false, error: fieldName + ' must be at least ' + minLength + ' characters' };
    }
    
    if (text.length > maxLength) {
      return { valid: false, error: fieldName + ' must not exceed ' + maxLength + ' characters' };
    }
    
    return { valid: true, value: text };
  }

  /**
   * Validate file upload
   * @param {File} file - File object from input
   * @param {object} options - { maxSize: bytes, allowedTypes: [], allowedExtensions: [] }
   * @returns {object} { valid: boolean, error: string }
   */
  function validateFile(file, options) {
    if (!file) {
      return { valid: false, error: 'Please select a file' };
    }
    
    options = options || {};
    var maxSize = options.maxSize || (5 * 1024 * 1024); // 5MB default
    var allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
    var allowedExtensions = options.allowedExtensions || ['.jpg', '.jpeg', '.png', '.webp'];
    
    // Check file size
    if (file.size > maxSize) {
      var maxMB = Math.round(maxSize / (1024 * 1024));
      return { valid: false, error: 'File size must be less than ' + maxMB + 'MB' };
    }
    
    // Check MIME type
    if (allowedTypes.length > 0 && allowedTypes.indexOf(file.type) === -1) {
      return { valid: false, error: 'Invalid file type. Allowed: ' + allowedTypes.join(', ') };
    }
    
    // Check file extension
    var fileName = file.name.toLowerCase();
    var hasValidExtension = false;
    for (var i = 0; i < allowedExtensions.length; i++) {
      if (fileName.endsWith(allowedExtensions[i])) {
        hasValidExtension = true;
        break;
      }
    }
    
    if (!hasValidExtension) {
      return { valid: false, error: 'Invalid file extension. Allowed: ' + allowedExtensions.join(', ') };
    }
    
    // Check for double extensions (e.g., .jpg.exe)
    var parts = fileName.split('.');
    if (parts.length > 2) {
      var beforeLastExt = parts[parts.length - 2];
      var dangerousExts = ['exe', 'js', 'bat', 'cmd', 'com', 'scr', 'vbs', 'php', 'asp'];
      if (dangerousExts.indexOf(beforeLastExt) !== -1) {
        return { valid: false, error: 'Invalid file name' };
      }
    }
    
    // Check filename safety
    if (!/^[a-zA-Z0-9\s_\-\.]+$/.test(file.name)) {
      return { valid: false, error: 'Filename contains invalid characters' };
    }
    
    return { valid: true, file: file };
  }

  /**
   * Validate roll number
   * @param {string} rollNo - Roll number to validate
   * @returns {object} { valid: boolean, error: string }
   */
  function validateRollNo(rollNo) {
    if (!rollNo || typeof rollNo !== 'string') {
      return { valid: false, error: 'Roll number is required' };
    }
    
    rollNo = rollNo.trim();
    
    if (rollNo.length < 1 || rollNo.length > 50) {
      return { valid: false, error: 'Invalid roll number length' };
    }
    
    return { valid: true, value: rollNo };
  }

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {object} { valid: boolean, error: string }
   */
  function validateURL(url) {
    if (!url) {
      return { valid: true, value: null }; // URL is optional
    }
    
    url = String(url).trim();
    
    try {
      var urlObj = new URL(url);
      // Only allow http and https
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
      }
      return { valid: true, value: url };
    } catch (e) {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SAFE DOM MANIPULATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Safely set HTML content with automatic escaping
   * @param {HTMLElement} element - DOM element
   * @param {string} text - Text to set (will be escaped)
   */
  function safeSetText(element, text) {
    if (!element) return;
    element.textContent = text;
  }

  /**
   * Safely set HTML with escaping
   * @param {HTMLElement} element - DOM element
   * @param {string} html - HTML to set (will be escaped)
   */
  function safeSetHtml(element, html) {
    if (!element) return;
    element.innerHTML = escapeHtml(html);
  }

  /**
   * Create a text node safely (alternative to innerHTML)
   * @param {string} text - Text content
   * @returns {Text} Text node
   */
  function createTextNode(text) {
    return document.createTextNode(text || '');
  }

  /**
   * Create element with safe text content
   * @param {string} tagName - Element tag name
   * @param {string} text - Text content
   * @param {string} className - Optional CSS class
   * @returns {HTMLElement} Created element
   */
  function createElement(tagName, text, className) {
    var element = document.createElement(tagName);
    if (text) {
      element.textContent = text;
    }
    if (className) {
      element.className = className;
    }
    return element;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM SECURITY
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Prevent double form submission
   * @param {HTMLFormElement} form - Form element
   * @param {Function} callback - Async function to execute
   */
  async function secureFormSubmit(form, callback) {
    if (!form) return;
    
    // Disable form
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
    }
    
    // Disable all inputs
    var inputs = form.querySelectorAll('input, select, textarea');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].disabled = true;
    }
    
    try {
      await callback();
    } finally {
      // Re-enable form
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
      
      for (var j = 0; j < inputs.length; j++) {
        inputs[j].disabled = false;
      }
    }
  }

  /**
   * Sanitize form data before submission
   * @param {FormData} formData - FormData object
   * @returns {FormData} Sanitized FormData
   */
  function sanitizeFormData(formData) {
    var sanitized = new FormData();
    
    for (var pair of formData.entries()) {
      var key = pair[0];
      var value = pair[1];
      
      // Skip files
      if (value instanceof File) {
        sanitized.append(key, value);
        continue;
      }
      
      // Sanitize text values
      if (typeof value === 'string') {
        sanitized.append(key, value.trim());
      } else {
        sanitized.append(key, value);
      }
    }
    
    return sanitized;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Escape HTML in an object's properties
   * @param {object} obj - Object with properties to escape
   * @param {string[]} keys - Array of keys to escape
   * @returns {object} New object with escaped values
   */
  function escapeObject(obj, keys) {
    if (!obj) return obj;
    
    var escaped = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (keys && keys.indexOf(key) !== -1) {
          escaped[key] = escapeHtml(obj[key]);
        } else {
          escaped[key] = obj[key];
        }
      }
    }
    return escaped;
  }

  /**
   * Validate and sanitize numeric input
   * @param {any} value - Value to validate
   * @param {number} defaultValue - Default if invalid
   * @returns {number} Valid number
   */
  function sanitizeNumber(value, defaultValue) {
    var num = parseFloat(value);
    return isNaN(num) ? (defaultValue || 0) : num;
  }

  /**
   * Validate and sanitize integer input
   * @param {any} value - Value to validate
   * @param {number} defaultValue - Default if invalid
   * @returns {number} Valid integer
   */
  function sanitizeInteger(value, defaultValue) {
    var num = parseInt(value);
    return isNaN(num) ? (defaultValue || 0) : num;
  }

  // Public API
  return {
    // XSS Protection
    escapeHtml: escapeHtml,
    escapeObject: escapeObject,
    stripHtml: stripHtml,
    
    // Input Validation
    validateEmail: validateEmail,
    validatePhone: validatePhone,
    validateCNIC: validateCNIC,
    validateText: validateText,
    validateFile: validateFile,
    validateRollNo: validateRollNo,
    validateURL: validateURL,
    
    // Safe DOM Manipulation
    safeSetText: safeSetText,
    safeSetHtml: safeSetHtml,
    createTextNode: createTextNode,
    createElement: createElement,
    
    // Form Security
    secureFormSubmit: secureFormSubmit,
    sanitizeFormData: sanitizeFormData,
    
    // Utilities
    sanitizeNumber: sanitizeNumber,
    sanitizeInteger: sanitizeInteger,
  };

})();

// Make it available globally
if (typeof window !== 'undefined') {
  window.SECURITY = SECURITY;
}
