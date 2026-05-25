const { prisma } = require('../config/database');

/**
 * Log a user action to the activity_logs table
 * @param {object} params
 * @param {number} params.userId
 * @param {string} params.action  - e.g. "CREATE_STUDENT"
 * @param {string} params.entity  - e.g. "Student"
 * @param {number} [params.entityId]
 * @param {object} [params.details]
 * @param {string} [params.ipAddress]
 */
async function logActivity({ userId, action, entity, entityId, details, ipAddress }) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId || null,
        details: details || null,
        ipAddress: ipAddress || null,
      },
    });
  } catch {
    // Non-critical — never throw from logger
  }
}

module.exports = { logActivity };
