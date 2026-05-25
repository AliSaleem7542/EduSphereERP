const { prisma } = require('../config/database');
const { randomBytes } = require('crypto');

/**
 * Generate a unique receipt number
 * Format: RCP-YYYYMMDD-XXXX-RR (date + count + 2-char random suffix to avoid race conditions)
 * @returns {Promise<string>}
 */
async function generateReceiptNo() {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
  const count = await prisma.feeRecord.count();
  const seq = String(count + 1).padStart(4, '0');
  const rand = randomBytes(1).toString('hex').toUpperCase(); // 2-char hex suffix
  return `RCP-${datePart}-${seq}-${rand}`;
}

module.exports = { generateReceiptNo };
