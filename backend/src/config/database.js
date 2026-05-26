const { PrismaClient } = require('@prisma/client');

// ─── Neon SSL URL fix ─────────────────────────────────────────────────────────
// Neon PostgreSQL requires ?sslmode=require in the connection string.
// If the DATABASE_URL doesn't already have it, append it automatically.
function ensureSSL(url) {
  if (!url) return url;
  // Already has ssl params — don't modify
  if (url.includes('sslmode=') || url.includes('ssl=')) return url;
  // Neon host detected or production — append sslmode=require
  if (url.includes('neon.tech') || process.env.NODE_ENV === 'production') {
    const separator = url.includes('?') ? '&' : '?';
    return url + separator + 'sslmode=require';
  }
  return url;
}

// Apply SSL fix to DATABASE_URL at startup
if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = ensureSSL(process.env.DATABASE_URL);
}
if (process.env.DIRECT_URL) {
  process.env.DIRECT_URL = ensureSSL(process.env.DIRECT_URL);
}

// ─── Prisma Client ────────────────────────────────────────────────────────────
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
});

// ─── Connection with retry (handles Neon cold starts) ─────────────────────────
async function connectWithRetry(maxRetries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return;
    } catch (err) {
      console.error(`❌ DB connection attempt ${attempt}/${maxRetries} failed:`, err.message);
      if (attempt === maxRetries) throw err;
      console.log(`⏳ Retrying in ${delayMs / 1000}s...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

async function disconnectDB() {
  await prisma.$disconnect();
}

module.exports = { prisma, connectWithRetry, disconnectDB };
