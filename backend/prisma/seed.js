require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

  // ─── Default Admin ──────────────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash('admin123', saltRounds);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Admin user created: ${admin.username}`);

  // ─── Default Academic Year ──────────────────────────────────────────────────
  const academicYear = await prisma.academicYear.upsert({
    where: { label: '2025-26' },
    update: {},
    create: {
      label: '2025-26',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      isCurrent: true,
    },
  });

  console.log(`✅ Academic year created: ${academicYear.label}`);

  // ─── Default System Settings ────────────────────────────────────────────────
  const defaultSettings = [
    { key: 'schoolName', value: 'EDU-SPHERE School' },
    { key: 'schoolAddress', value: 'Lahore, Pakistan' },
    { key: 'schoolPhone', value: '042-XXXXXXXX' },
    { key: 'schoolEmail', value: 'info@edusphere.edu.pk' },
    { key: 'gradeAPlus', value: '90' },
    { key: 'gradeA', value: '80' },
    { key: 'gradeB', value: '70' },
    { key: 'gradeC', value: '60' },
    { key: 'gradeD', value: '50' },
    { key: 'libraryFinePer Day', value: '5' },
    { key: 'sidebarTheme', value: 'dark' },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        updatedById: admin.id,
      },
    });
  }

  console.log(`✅ System settings seeded`);
  console.log('\n🎉 Seeding complete!');
  console.log('─────────────────────────────────────');
  console.log('Admin credentials:');
  console.log('  Username : admin');
  console.log('  Password : admin123');
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
