/**
 * Account Lockout Protection
 * Prevents brute-force attacks by temporarily locking accounts after failed login attempts
 * 
 * Uses in-memory storage (production-ready for single server)
 * For multi-server: Use Redis or database
 */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Clean up every hour

// In-memory storage: Map<identifier, { attempts, lockedUntil }>
const failedAttempts = new Map();

/**
 * Generate lockout key combining IP and identifier
 * @param {string} identifier - Username, phone, or rollNo
 * @param {string} ipAddress - Client IP address
 * @returns {string} Combined key for lockout tracking
 */
function getLockoutKey(identifier, ipAddress) {
  // Use both identifier and IP to prevent cross-account brute force
  return `${String(identifier).toLowerCase().trim()}:${ipAddress}`;
}

/**
 * Record a failed login attempt
 * @param {string} identifier - Username, phone, or rollNo
 * @param {string} ipAddress - Client IP address
 * @returns {object} { isLocked: boolean, remainingAttempts: number, lockedUntil: Date|null }
 */
function recordFailedAttempt(identifier, ipAddress) {
  const key = getLockoutKey(identifier, ipAddress);
  const now = Date.now();

  let record = failedAttempts.get(key);

  // If no record or lockout expired, start fresh
  if (!record || (record.lockedUntil && record.lockedUntil < now)) {
    record = { attempts: 0, lockedUntil: null };
  }

  // Increment failed attempts
  record.attempts += 1;

  // Check if should be locked
  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    failedAttempts.set(key, record);

    return {
      isLocked: true,
      remainingAttempts: 0,
      lockedUntil: new Date(record.lockedUntil),
      message: `Too many failed login attempts. Your account is locked for 30 seconds.`,
    };
  }

  // Not locked yet
  failedAttempts.set(key, record);
  const remaining = MAX_FAILED_ATTEMPTS - record.attempts;

  return {
    isLocked: false,
    remainingAttempts: remaining,
    lockedUntil: null,
    message: `Invalid credentials. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before lockout.`,
  };
}

/**
 * Check if an account is currently locked
 * @param {string} identifier - Username, phone, or rollNo
 * @param {string} ipAddress - Client IP address
 * @returns {object} { isLocked: boolean, lockedUntil: Date|null }
 */
function isAccountLocked(identifier, ipAddress) {
  const key = getLockoutKey(identifier, ipAddress);
  const record = failedAttempts.get(key);
  const now = Date.now();

  if (!record || !record.lockedUntil) {
    return { isLocked: false, lockedUntil: null };
  }

  // Check if lockout expired
  if (record.lockedUntil < now) {
    // Lockout expired, clear record
    failedAttempts.delete(key);
    return { isLocked: false, lockedUntil: null };
  }

  // Still locked
  const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
  return {
    isLocked: true,
    lockedUntil: new Date(record.lockedUntil),
    message: `Account is temporarily locked. Please try again in ${remainingSeconds} seconds.`,
  };
}

/**
 * Reset failed attempts after successful login
 * @param {string} identifier - Username, phone, or rollNo
 * @param {string} ipAddress - Client IP address
 */
function resetFailedAttempts(identifier, ipAddress) {
  const key = getLockoutKey(identifier, ipAddress);
  failedAttempts.delete(key);
}

/**
 * Manually unlock an account (admin function)
 * @param {string} identifier - Username, phone, or rollNo
 * @param {string} ipAddress - Client IP address (optional, unlocks all IPs if not provided)
 */
function unlockAccount(identifier, ipAddress) {
  if (ipAddress) {
    const key = getLockoutKey(identifier, ipAddress);
    failedAttempts.delete(key);
    return { success: true, message: 'Account unlocked successfully' };
  }
  
  // Unlock for all IPs
  const prefix = `${String(identifier).toLowerCase().trim()}:`;
  let count = 0;
  for (const key of failedAttempts.keys()) {
    if (key.startsWith(prefix)) {
      failedAttempts.delete(key);
      count++;
    }
  }
  
  return { success: true, message: `Account unlocked for ${count} IP address(es)` };
}

/**
 * Get lockout status for an account
 * @param {string} identifier - Username, phone, or rollNo
 * @param {string} ipAddress - Client IP address
 * @returns {object} Status information
 */
function getLockoutStatus(identifier, ipAddress) {
  const key = getLockoutKey(identifier, ipAddress);
  const record = failedAttempts.get(key);
  const now = Date.now();

  if (!record) {
    return {
      failedAttempts: 0,
      isLocked: false,
      lockedUntil: null,
    };
  }

  const isLocked = record.lockedUntil && record.lockedUntil > now;

  return {
    failedAttempts: record.attempts,
    isLocked,
    lockedUntil: record.lockedUntil ? new Date(record.lockedUntil) : null,
  };
}

/**
 * Cleanup expired lockouts (called periodically)
 */
function cleanupExpiredLockouts() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, record] of failedAttempts.entries()) {
    if (record.lockedUntil && record.lockedUntil < now) {
      failedAttempts.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[SECURITY] Cleaned up ${cleaned} expired account lockouts`);
  }
}

// Auto-cleanup every hour
setInterval(cleanupExpiredLockouts, CLEANUP_INTERVAL_MS);

// Get current statistics (for monitoring)
function getStatistics() {
  const now = Date.now();
  let totalLocked = 0;
  let totalPending = 0;

  for (const record of failedAttempts.values()) {
    if (record.lockedUntil && record.lockedUntil > now) {
      totalLocked++;
    } else if (record.attempts > 0) {
      totalPending++;
    }
  }

  return {
    totalLocked,
    totalPending,
    totalRecords: failedAttempts.size,
  };
}

module.exports = {
  recordFailedAttempt,
  isAccountLocked,
  resetFailedAttempts,
  unlockAccount,
  getLockoutStatus,
  getStatistics,
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_DURATION_MS,
};
