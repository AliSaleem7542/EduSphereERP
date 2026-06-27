/**
 * Security Audit Logger
 * Logs security-related events for monitoring and compliance
 * Tracks: failed logins, lockouts, permission denials, suspicious activity
 */

const { prisma } = require('../config/database');

/**
 * Security event types
 */
const SecurityEventType = {
  // Authentication events
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGIN_LOCKED: 'LOGIN_LOCKED',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
  
  // Authorization events
  ACCESS_DENIED: 'ACCESS_DENIED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  PRIVILEGE_ESCALATION_ATTEMPT: 'PRIVILEGE_ESCALATION_ATTEMPT',
  
  // Token events
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Security threats
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT: 'INVALID_INPUT',
  FILE_UPLOAD_REJECTED: 'FILE_UPLOAD_REJECTED',
  
  // Data access
  SENSITIVE_DATA_ACCESSED: 'SENSITIVE_DATA_ACCESSED',
  BULK_DATA_EXPORT: 'BULK_DATA_EXPORT',
};

/**
 * Security event severity levels
 */
const SecuritySeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

/**
 * Log a security event
 * @param {object} event - Security event details
 * @param {string} event.type - Event type from SecurityEventType
 * @param {string} event.severity - Severity from SecuritySeverity
 * @param {number|null} event.userId - User ID (if authenticated)
 * @param {string|null} event.username - Username or identifier
 * @param {string} event.ipAddress - Request IP address
 * @param {string|null} event.userAgent - Browser user agent
 * @param {string|null} event.endpoint - API endpoint accessed
 * @param {string|null} event.method - HTTP method
 * @param {object|null} event.metadata - Additional event data
 * @param {string|null} event.message - Human-readable message
 */
async function logSecurityEvent(event) {
  try {
    const {
      type,
      severity = SecuritySeverity.MEDIUM,
      userId = null,
      username = null,
      ipAddress,
      userAgent = null,
      endpoint = null,
      method = null,
      metadata = null,
      message = null,
    } = event;

    // Validate required fields
    if (!type || !ipAddress) {
      console.error('[SECURITY LOG] Missing required fields:', { type, ipAddress });
      return;
    }

    // Log to console for immediate visibility
    const logLevel = severity === 'CRITICAL' || severity === 'HIGH' ? 'error' : 'warn';
    console[logLevel](`[SECURITY:${severity}] ${type} - ${message || 'No message'}`, {
      userId,
      username,
      ipAddress,
      endpoint,
    });

    // Store in database (if ActivityLog table supports security events)
    // For now, use existing activityLogger structure
    await prisma.activityLog.create({
      data: {
        userId,
        action: type,
        entity: 'Security',
        entityId: null,
        details: {
          severity,
          username,
          ipAddress,
          userAgent,
          endpoint,
          method,
          metadata,
          message,
        },
        ipAddress,
      },
    }).catch((err) => {
      // Don't fail the request if logging fails
      console.error('[SECURITY LOG] Failed to write to database:', err.message);
    });

  } catch (error) {
    console.error('[SECURITY LOG] Error logging security event:', error.message);
  }
}

/**
 * Log failed login attempt
 */
async function logFailedLogin(username, ipAddress, userAgent, remainingAttempts) {
  await logSecurityEvent({
    type: SecurityEventType.LOGIN_FAILED,
    severity: remainingAttempts <= 2 ? SecuritySeverity.HIGH : SecuritySeverity.MEDIUM,
    username,
    ipAddress,
    userAgent,
    endpoint: '/auth/login',
    method: 'POST',
    message: `Failed login attempt. ${remainingAttempts} attempts remaining.`,
    metadata: { remainingAttempts },
  });
}

/**
 * Log account lockout
 */
async function logAccountLockout(username, ipAddress, userAgent, lockedUntil) {
  await logSecurityEvent({
    type: SecurityEventType.LOGIN_LOCKED,
    severity: SecuritySeverity.CRITICAL,
    username,
    ipAddress,
    userAgent,
    endpoint: '/auth/login',
    method: 'POST',
    message: `Account locked due to too many failed attempts. Locked until ${lockedUntil}.`,
    metadata: { lockedUntil: lockedUntil.toISOString() },
  });
}

/**
 * Log successful login
 */
async function logSuccessfulLogin(userId, username, ipAddress, userAgent, role) {
  await logSecurityEvent({
    type: SecurityEventType.LOGIN_SUCCESS,
    severity: SecuritySeverity.LOW,
    userId,
    username,
    ipAddress,
    userAgent,
    endpoint: '/auth/login',
    method: 'POST',
    message: `Successful login for ${role} user.`,
    metadata: { role },
  });
}

/**
 * Log access denied (authorization failure)
 */
async function logAccessDenied(userId, username, ipAddress, endpoint, method, requiredRole) {
  await logSecurityEvent({
    type: SecurityEventType.ACCESS_DENIED,
    severity: SecuritySeverity.HIGH,
    userId,
    username,
    ipAddress,
    endpoint,
    method,
    message: `Access denied: insufficient permissions (required: ${requiredRole}).`,
    metadata: { requiredRole },
  });
}

/**
 * Log IDOR attempt (trying to access another user's resource)
 */
async function logIDORAttempt(userId, username, ipAddress, endpoint, method, resourceId) {
  await logSecurityEvent({
    type: SecurityEventType.PRIVILEGE_ESCALATION_ATTEMPT,
    severity: SecuritySeverity.CRITICAL,
    userId,
    username,
    ipAddress,
    endpoint,
    method,
    message: `Potential IDOR attack: User attempted to access resource they don't own.`,
    metadata: { resourceId },
  });
}

/**
 * Log rate limit exceeded
 */
async function logRateLimitExceeded(ipAddress, endpoint, userAgent) {
  await logSecurityEvent({
    type: SecurityEventType.RATE_LIMIT_EXCEEDED,
    severity: SecuritySeverity.MEDIUM,
    ipAddress,
    userAgent,
    endpoint,
    method: 'N/A',
    message: 'Rate limit exceeded for IP address.',
  });
}

/**
 * Log rejected file upload
 */
async function logFileUploadRejected(userId, username, ipAddress, filename, reason) {
  await logSecurityEvent({
    type: SecurityEventType.FILE_UPLOAD_REJECTED,
    severity: SecuritySeverity.MEDIUM,
    userId,
    username,
    ipAddress,
    endpoint: '/upload',
    method: 'POST',
    message: `File upload rejected: ${reason}`,
    metadata: { filename, reason },
  });
}

/**
 * Log password change
 */
async function logPasswordChange(userId, username, ipAddress, userAgent) {
  await logSecurityEvent({
    type: SecurityEventType.PASSWORD_CHANGED,
    severity: SecuritySeverity.MEDIUM,
    userId,
    username,
    ipAddress,
    userAgent,
    endpoint: '/auth/change-password',
    method: 'PATCH',
    message: 'User changed their password.',
  });
}

/**
 * Get security events for monitoring
 * @param {object} filters - Query filters
 * @returns {Promise<Array>} Security events
 */
async function getSecurityEvents(filters = {}) {
  const {
    severity,
    type,
    userId,
    startDate,
    endDate,
    limit = 100,
  } = filters;

  const where = {
    entity: 'Security',
  };

  if (severity) {
    where.details = { path: ['severity'], equals: severity };
  }

  if (type) {
    where.action = type;
  }

  if (userId) {
    where.userId = userId;
  }

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);
  }

  const events = await prisma.activityLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: limit,
  });

  return events;
}

/**
 * Get security statistics
 * @param {Date} startDate - Start date for stats
 * @returns {Promise<object>} Security statistics
 */
async function getSecurityStats(startDate = new Date(Date.now() - 24 * 60 * 60 * 1000)) {
  const events = await prisma.activityLog.findMany({
    where: {
      entity: 'Security',
      timestamp: { gte: startDate },
    },
  });

  const stats = {
    total: events.length,
    bySeverity: {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    },
    byType: {},
    uniqueIPs: new Set(),
    suspiciousIPs: [],
  };

  const ipFailures = new Map();

  events.forEach((event) => {
    const severity = event.details?.severity || 'MEDIUM';
    const type = event.action;
    const ip = event.ipAddress;

    // Count by severity
    if (stats.bySeverity[severity] !== undefined) {
      stats.bySeverity[severity]++;
    }

    // Count by type
    stats.byType[type] = (stats.byType[type] || 0) + 1;

    // Track unique IPs
    stats.uniqueIPs.add(ip);

    // Track failed logins by IP
    if (type === SecurityEventType.LOGIN_FAILED || type === SecurityEventType.LOGIN_LOCKED) {
      ipFailures.set(ip, (ipFailures.get(ip) || 0) + 1);
    }
  });

  // Find suspicious IPs (more than 10 failed attempts)
  stats.suspiciousIPs = Array.from(ipFailures.entries())
    .filter(([_, count]) => count > 10)
    .map(([ip, count]) => ({ ip, failedAttempts: count }))
    .sort((a, b) => b.failedAttempts - a.failedAttempts);

  stats.uniqueIPs = stats.uniqueIPs.size;

  return stats;
}

module.exports = {
  SecurityEventType,
  SecuritySeverity,
  logSecurityEvent,
  logFailedLogin,
  logAccountLockout,
  logSuccessfulLogin,
  logAccessDenied,
  logIDORAttempt,
  logRateLimitExceeded,
  logFileUploadRejected,
  logPasswordChange,
  getSecurityEvents,
  getSecurityStats,
};
