const { PrismaClient } = require('@prisma/client');

// Production: Neon requires SSL — Prisma handles this via DATABASE_URL ?sslmode=require
// Development: standard local PostgreSQL connection
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['warn', 'error']   // reduced from ['query','info','warn','error'] for cleaner logs
      : ['error'],
  errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
});

// Graceful shutdown helper
async function disconnectDB() {
  await prisma.$disconnect();
}

module.exports = { prisma, disconnectDB };
