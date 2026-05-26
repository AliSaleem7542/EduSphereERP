/**
 * EDU-SPHERE — Frontend Configuration
 *
 * Single source of truth for the backend API URL.
 * This file is loaded BEFORE auth.js on every page.
 *
 * To switch environments, only change PRODUCTION_API_URL below.
 */

(function () {
  var PRODUCTION_API_URL = 'https://edusphereerp-scbr.onrender.com';
  var DEVELOPMENT_API_URL = 'http://localhost:5000';

  var hostname = window.location.hostname;
  var isLocal  = hostname === 'localhost' ||
                 hostname === '127.0.0.1' ||
                 hostname.startsWith('192.168.') ||
                 hostname.startsWith('10.');

  window.EDUSPHERE_API_URL = isLocal ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;

  console.log('[EDU-SPHERE] Environment:', isLocal ? 'development' : 'production');
  console.log('[EDU-SPHERE] API URL:', window.EDUSPHERE_API_URL);
})();
