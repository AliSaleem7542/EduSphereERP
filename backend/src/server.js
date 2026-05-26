require('dotenv').config();
const app = require('./app');
const { prisma, disconnectDB } = require('./config/database');

const PORT = process.env.PORT || 5000;
const ENV  = process.env.NODE_ENV || 'development';

// ─── Production safety checks ─────────────────────────────────────────────────
if (ENV === 'production') {
  if (!process.env.DATABASE_URL) {
    console.error('❌ FATAL: DATABASE_URL is not set. Exiting.');
    process.exit(1);
  }
  if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET.includes('change_in_production')) {
    console.error('❌ FATAL: JWT_ACCESS_SECRET must be set to a strong secret in production. Exiting.');
    process.exit(1);
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.includes('change_in_production')) {
    console.error('❌ FATAL: JWT_REFRESH_SECRET must be set to a strong secret in production. Exiting.');
    process.exit(1);
  }
} else {
  // Development warnings only
  if (!process.env.JWT_ACCESS_SECRET) {
    console.warn('⚠️  WARNING: JWT_ACCESS_SECRET not set — using insecure fallback');
  }
}

// ─── Start server ─────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 EDU-SPHERE API running on port ${PORT}`);
      console.log(`📌 Environment: ${ENV}`);
      if (ENV === 'development') {
        console.log(`🔗 Local URL: http://localhost:${PORT}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    await disconnectDB();
    process.exit(1);
  }
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────
async function shutdown(signal) {
  console.log(`\n🔌 ${signal} received — shutting down gracefully...`);
  await disconnectDB();
  process.exit(0);
}

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught errors in production
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  if (ENV === 'production') process.exit(1);
});

startServer();
