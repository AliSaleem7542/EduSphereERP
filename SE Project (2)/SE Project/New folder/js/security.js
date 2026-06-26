/**
 * EDU-SPHERE — Security Utilities
 * XSS Prevention and Input Sanitization
 */

var SECURITY = (function() {

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

  // Public API
  return {
    escapeHtml: escapeHtml,
    escapeObject: escapeObject,
    safeSetText: safeSetText,
    createTextNode: createTextNode,
    sanitizeNumber: sanitizeNumber,
    sanitizeInteger: sanitizeInteger,
    stripHtml: stripHtml,
  };

})();

// Make it available globally
if (typeof window !== 'undefined') {
  window.SECURITY = SECURITY;
}
