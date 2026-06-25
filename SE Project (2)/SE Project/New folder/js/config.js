/**
 * EDU-SPHERE — Frontend Configuration
 * Production API URL: https://edusphereerp-scbr.onrender.com
 *
 * This file is loaded BEFORE auth.js on every page.
 * window.EDUSPHERE_API_URL is read by auth.js to build all API requests.
 */

// ── PRODUCTION: Always use Render backend ──────────────────────────────────
// window.EDUSPHERE_API_URL = 'https://edusphereerp-scbr.onrender.com';

// ── LOCAL DEV OVERRIDE: Uncomment the line below when running locally ───────
window.EDUSPHERE_API_URL = 'http://localhost:5000';

console.log('[EDU-SPHERE] API:', window.EDUSPHERE_API_URL);
