/**
 * EDU-SPHERE — Frontend Configuration
 *
 * PRODUCTION SETUP:
 *   After deploying backend to Render, set EDUSPHERE_API_URL to your Render URL.
 *   Example: window.EDUSPHERE_API_URL = 'https://edusphere-api.onrender.com';
 *
 * This file is loaded BEFORE auth.js on every page.
 * To switch environments, only change this file.
 */

(function () {
  // ── Detect environment ──────────────────────────────────────────────────────
  var hostname = window.location.hostname;
  var isLocal  = hostname === 'localhost' || hostname === '127.0.0.1' ||
                 hostname.startsWith('192.168.');

  if (isLocal) {
    // Development — use local backend
    window.EDUSPHERE_API_URL = 'http://localhost:5000';
  } else {
    // Production — Render backend URL
    // ⚠️  UPDATE THIS after deploying to Render:
    window.EDUSPHERE_API_URL = 'https://edusphere-api.onrender.com';
  }

  // Expose for debugging
  console.log('[EDU-SPHERE] API URL:', window.EDUSPHERE_API_URL);
})();
