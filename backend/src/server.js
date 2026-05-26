require('dotenv').config();
const app = require('./app');
const { connectWithRetry, disconnectDB } = require('./config/database');

const PORT = process.env.PORT || 5000;
const ENV  = process.env.NODE_ENV || 'development';

// ─── Production safety checks ─────────────────────────────────────────────────
if (ENV === 'production') {
  if (!process.env.DATABASE_URL) {
    console.error('❌ FATAL: DATABASE_URL is not set. Exiting.');
    process.exit(1);
  }
  if (!process.env.JWT_ACCESS_SECRET ||
      process.env.JWT_ACCESS_SECRET.includes('change_in_production')) {
    console.error('❌ FATAL: JWT_ACCESS_SECRET must be a strong secret in production.');
    process.exit(1);
  }
  if (!process.env.JWT_REFRESH_SECRET ||
      process.env.JWT_REFRESH_SECRET.includes('change_in_production')) {
    console.error('❌ FATAL: JWT_REFRESH_SECRET must be a strong secret in production.');
    process.exit(1);
  }
} else {
  if (!process.env.JWT_ACCESS_SECRET) {
    console.warn('⚠️  WARNING: JWT_ACCESS_SECRET not set — using insecure fallback');
  }
}

// ─── Start server ─────────────────────────────────────────────────────────────
async function startServer() {
  try {
    // Use retry logic for Neon cold starts on Render free tier
    await connectWithRetry(5, 3000);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 EDU-SPHERE API running on port ${PORT}`);
      console.log(`📌 Environment: ${ENV}`);
      if (ENV === 'development') {
        console.log(`🔗 Local URL: http://localhost:${PORT}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server after retries:', error.message);
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

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  if (ENV === 'production') process.exit(1);
});

startServer();
