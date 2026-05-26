/**
 * EDU-SPHERE — Production Seed Script
 * Creates admin user + academic year in Neon PostgreSQL.
 * Uses DIRECT_URL (bypasses pgbouncer for DDL/seed operations).
 *
 * Run: node scripts/seed-production.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// ── Use DIRECT_URL for seeding (bypasses connection pooler) ──────────────────
const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ No database URL found. Set DIRECT_URL or DATABASE_URL in .env');
  process.exit(1);
}

// Ensure SSL for Neon
function ensureSSL(url) {
  if (!url) return url;
  if (url.includes('sslmode=') || url.includes('ssl=')) return url;
  if (url.includes('neon.tech') || url.includes('amazonaws.com')) {
    return url + (url.includes('?') ? '&' : '?') + 'sslmode=require';
  }
  return url;
}

const safeUrl = ensureSSL(dbUrl);
console.log('🔗 Connecting to:', safeUrl.replace(/:([^:@]+)@/, ':***@')); // hide password

// Override DATABASE_URL for this Prisma instance
process.env.DATABASE_URL = safeUrl;

const prisma = new PrismaClient({
  datasources: { db: { url: safeUrl } },
  log: ['error'],
});

async function main() {
  console.log('\n🌱 Seeding production Neon database...\n');

  // ── Test connection ──────────────────────────────────────────────────────────
  try {
    await prisma.$connect();
    console.log('✅ Connected to Neon PostgreSQL');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

  // ── Create/update admin user ─────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin123', saltRounds);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash,
      isActive: true,
      role: 'ADMIN',
    },
    create: {
      username: 'admin',
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Admin user: id=${admin.id}, username=${admin.username}, role=${admin.role}, active=${admin.isActive}`);

  // ── Create academic year ─────────────────────────────────────────────────────
  const year = await prisma.academicYear.upsert({
    where: { label: '2025-26' },
    update: { isCurrent: true },
    create: {
      label: '2025-26',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      isCurrent: true,
    },
  });

  console.log(`✅ Academic year: ${year.label} (current=${year.isCurrent})`);

  // ── Create system settings ───────────────────────────────────────────────────
  const settings = [
    { key: 'schoolName',        value: 'EDU-SPHERE School' },
    { key: 'schoolAddress',     value: 'Samundri, Pakistan' },
    { key: 'schoolPhone',       value: '042-XXXXXXXX' },
    { key: 'schoolEmail',       value: 'admin@edusphere.com' },
    { key: 'gradeAPlus',        value: '90' },
    { key: 'gradeA',            value: '80' },
    { key: 'gradeB',            value: '70' },
    { key: 'gradeC',            value: '60' },
    { key: 'gradeD',            value: '50' },
    { key: 'libraryFinePer Day',value: '5' },
    { key: 'sidebarTheme',      value: 'dark' },
  ];

  for (const s of settings) {
    await prisma.systemSettings.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value, updatedById: admin.id },
    });
  }

  console.log(`✅ System settings seeded (${settings.length} entries)`);

  // ── Verify ───────────────────────────────────────────────────────────────────
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  const yearCount  = await prisma.academicYear.count();

  console.log('\n══════════════════════════════════════════');
  console.log('  PRODUCTION SEED COMPLETE');
  console.log('══════════════════════════════════════════');
  console.log(`  Admin users    : ${adminCount}`);
  console.log(`  Academic years : ${yearCount}`);
  console.log('──────────────────────────────────────────');
  console.log('  Login credentials:');
  console.log('  Username : admin');
  console.log('  Password : admin123');
  console.log('══════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message);
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
