/**
 * EDU-SPHERE — Logger Utility
 * Safe logging with environment-aware controls
 * @version 1.0.0
 */

var Logger = (function() {
  
  // Configuration
  const config = {
    enabled: true,
    level: 'debug', // debug, info, warn, error
    showTimestamp: true,
    showLevel: true,
    prefix: '[EDU-SPHERE]',
  };
  
  const levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };
  
  /**
   * Get current timestamp
   */
  function getTimestamp() {
    const now = new Date();
    return now.toISOString().substr(11, 12);
  }
  
  /**
   * Format log message
   */
  function formatMessage(level, args) {
    let parts = [];
    
    if (config.showTimestamp) {
      parts.push('[' + getTimestamp() + ']');
    }
    
    if (config.showLevel) {
      parts.push('[' + level.toUpperCase() + ']');
    }
    
    if (config.prefix) {
      parts.push(config.prefix);
    }
    
    return parts.join(' ');
  }
  
  /**
   * Check if log level should be displayed
   */
  function shouldLog(level) {
    if (!config.enabled) {
      return false;
    }
    
    return levels[level] >= levels[config.level];
  }
  
  /**
   * Debug log (development only)
   * @param {...any} args - Arguments to log
   */
  function debug(...args) {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', args), ...args);
    }
  }
  
  /**
   * Info log
   * @param {...any} args - Arguments to log
   */
  function info(...args) {
    if (shouldLog('info')) {
      console.info(formatMessage('info', args), ...args);
    }
  }
  
  /**
   * Warning log
   * @param {...any} args - Arguments to log
   */
  function warn(...args) {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', args), ...args);
    }
  }
  
  /**
   * Error log (always shown)
   * @param {...any} args - Arguments to log
   */
  function error(...args) {
    if (shouldLog('error')) {
      console.error(formatMessage('error', args), ...args);
    }
  }
  
  /**
   * Group logs together
   * @param {string} label - Group label
   * @param {function} callback - Function containing logs
   */
  function group(label, callback) {
    if (!config.enabled) {
      return;
    }
    
    console.group(config.prefix + ' ' + label);
    callback();
    console.groupEnd();
  }
  
  /**
   * Table log for objects/arrays
   * @param {object|array} data - Data to display
   * @param {string} label - Optional label
   */
  function table(data, label) {
    if (!config.enabled) {
      return;
    }
    
    if (label) {
      console.log(formatMessage('info'), label);
    }
    
    console.table(data);
  }
  
  /**
   * Time measurement start
   * @param {string} label - Timer label
   */
  function time(label) {
    if (!config.enabled) {
      return;
    }
    
    console.time(config.prefix + ' ' + label);
  }
  
  /**
   * Time measurement end
   * @param {string} label - Timer label
   */
  function timeEnd(label) {
    if (!config.enabled) {
      return;
    }
    
    console.timeEnd(config.prefix + ' ' + label);
  }
  
  /**
   * Configure logger
   * @param {object} options - Configuration options
   */
  function configure(options) {
    Object.assign(config, options);
  }
  
  /**
   * Disable logging
   */
  function disable() {
    config.enabled = false;
  }
  
  /**
   * Enable logging
   */
  function enable() {
    config.enabled = true;
  }
  
  /**
   * Set log level
   * @param {string} level - Log level (debug, info, warn, error)
   */
  function setLevel(level) {
    if (levels[level] !== undefined) {
      config.level = level;
    }
  }
  
  /**
   * Log API request
   * @param {string} method - HTTP method
   * @param {string} url - URL
   * @param {object} data - Request data
   */
  function apiRequest(method, url, data) {
    if (!shouldLog('debug')) {
      return;
    }
    
    group('API Request: ' + method + ' ' + url, function() {
      if (data) {
        console.log('Data:', data);
      }
      console.log('Time:', new Date().toISOString());
    });
  }
  
  /**
   * Log API response
   * @param {string} method - HTTP method
   * @param {string} url - URL
   * @param {number} status - HTTP status
   * @param {object} data - Response data
   */
  function apiResponse(method, url, status, data) {
    if (!shouldLog('debug')) {
      return;
    }
    
    const isError = status >= 400;
    
    group('API Response: ' + method + ' ' + url + ' (' + status + ')', function() {
      console.log('Status:', status);
      if (data) {
        console.log('Data:', data);
      }
      console.log('Time:', new Date().toISOString());
    });
  }
  
  /**
   * Log authentication event
   * @param {string} event - Event type (login, logout, token refresh)
   * @param {object} data - Event data
   */
  function auth(event, data) {
    if (!shouldLog('info')) {
      return;
    }
    
    info('AUTH:', event, data);
  }
  
  /**
   * Log security event
   * @param {string} event - Security event
   * @param {object} data - Event data
   */
  function security(event, data) {
    if (!shouldLog('warn')) {
      return;
    }
    
    warn('SECURITY:', event, data);
  }
  
  /**
   * Log performance metric
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @param {string} unit - Unit (ms, MB, etc.)
   */
  function performance(metric, value, unit) {
    if (!shouldLog('debug')) {
      return;
    }
    
    debug('PERFORMANCE:', metric, '=', value, unit || '');
  }
  
  /**
   * Assert condition and log error if false
   * @param {boolean} condition - Condition to check
   * @param {string} message - Error message
   */
  function assert(condition, message) {
    if (!condition) {
      error('ASSERTION FAILED:', message);
      console.trace();
    }
  }
  
  // Auto-configure based on environment
  (function autoConfig() {
    // Check if running in production
    const hostname = window.location.hostname;
    const isProduction = hostname !== 'localhost' && 
                         hostname !== '127.0.0.1' && 
                         !hostname.includes('192.168');
    
    if (isProduction) {
      config.level = 'warn'; // Only show warnings and errors in production
      config.showTimestamp = false;
    }
    
    // Check URL parameter for debug mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
      config.enabled = true;
      config.level = 'debug';
    }
  })();
  
  // Public API
  return {
    debug: debug,
    info: info,
    warn: warn,
    error: error,
    group: group,
    table: table,
    time: time,
    timeEnd: timeEnd,
    configure: configure,
    disable: disable,
    enable: enable,
    setLevel: setLevel,
    apiRequest: apiRequest,
    apiResponse: apiResponse,
    auth: auth,
    security: security,
    performance: performance,
    assert: assert,
  };
  
})();

// Make it available globally
if (typeof window !== 'undefined') {
  window.Logger = Logger;
}

// Override console methods in production (optional)
// Uncomment to completely disable console in production
/*
(function() {
  if (window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1') {
    console.log = function() {};
    console.debug = function() {};
    console.info = function() {};
  }
})();
*/
