const jwt = require('jsonwebtoken');

// ─── Security: JWT secrets are REQUIRED ──────────────────────────────────────
// Application will not start if these are not set.
// This prevents using weak fallback secrets in production.
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  console.error('❌ FATAL SECURITY ERROR: JWT secrets are not configured!');
  console.error('   Please set the following environment variables:');
  console.error('   - JWT_ACCESS_SECRET');
  console.error('   - JWT_REFRESH_SECRET');
  console.error('');
  console.error('   Generate strong secrets using:');
  console.error('   node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  process.exit(1);
}

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Sign an access token
 * @param {object} payload - { id, role, username }
 * @returns {string} signed JWT
 */
function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

/**
 * Sign a refresh token
 * @param {object} payload - { id }
 * @returns {string} signed JWT
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

/**
 * Verify an access token
 * @param {string} token
 * @returns {object} decoded payload
 */
function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

/**
 * Verify a refresh token
 * @param {string} token
 * @returns {object} decoded payload
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

/**
 * Parse expiry string to milliseconds (for DB storage)
 * @param {string} expiry - e.g. "7d", "15m"
 * @returns {Date}
 */
function expiryToDate(expiry) {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiry format: ${expiry}`);
  return new Date(Date.now() + parseInt(match[1]) * units[match[2]]);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  expiryToDate,
  REFRESH_EXPIRES,
};
