const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_change_me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_change_me';
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
