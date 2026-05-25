require('dotenv').config();
const app = require('./app');
const { prisma } = require('./config/database');

const PORT = process.env.PORT || 5000;

// ─── Security: Warn if using fallback JWT secrets ─────────────────────────────
if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET === 'fallback_access_secret_change_me') {
  console.warn('⚠️  WARNING: JWT_ACCESS_SECRET is not set or using fallback. Set a strong secret in .env');
}
if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === 'fallback_refresh_secret_change_me') {
  console.warn('⚠️  WARNING: JWT_REFRESH_SECRET is not set or using fallback. Set a strong secret in .env');
}
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET)) {
  console.error('❌ FATAL: JWT secrets must be set in production. Exiting.');
  process.exit(1);
}

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 EDU-SPHERE API running on http://localhost:${PORT}`);
      console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\n🔌 Database disconnected. Server shutting down.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
