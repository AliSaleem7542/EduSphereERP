/**
 * EDU-SPHERE — Frontend Configuration
 * Production API URL: https://edusphereerp-scbr.onrender.com
 *
 * This file is loaded BEFORE auth.js on every page.
 * window.EDUSPHERE_API_URL is read by auth.js to build all API requests.
 */

// ── DETECT LOCALHOST: Auto-switch between local and production backend ──────
if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
  // LOCALHOST: Use local backend if running
  window.EDUSPHERE_API_URL = 'http://localhost:5002';
  console.log('[EDU-SPHERE] Running on LOCALHOST - Using local backend');
} else {
  // PRODUCTION: Use Render backend
  window.EDUSPHERE_API_URL = 'https://edusphereerp-scbr.onrender.com';
  console.log('[EDU-SPHERE] Running on PRODUCTION - Using Render backend');
}

console.log('[EDU-SPHERE] API URL:', window.EDUSPHERE_API_URL);
