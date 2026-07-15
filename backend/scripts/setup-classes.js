require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('📚 Setting up classes...\n');

  try {
    const ay = await prisma.academicYear.findFirst({ where: { isCurrent: true } });

    if (!ay) {
      throw new Error('No current academic year');
    }

    // Create 1st Year
    const class1 = await prisma.class.upsert({
      where: { name_academicYearId: { name: '1st Year', academicYearId: ay.id } },
      update: {},
      create: { name: '1st Year', academicYearId: ay.id }
    });
    console.log('✅ 1st Year class ready (ID:', class1.id + ')');

    // Create 2nd Year
    const class2 = await prisma.class.upsert({
      where: { name_academicYearId: { name: '2nd Year', academicYearId: ay.id } },
      update: {},
      create: { name: '2nd Year', academicYearId: ay.id }
    });
    console.log('✅ 2nd Year class ready (ID:', class2.id + ')');

  } catch (e) {
    console.error('❌ Error:', e.message);
  }

  await prisma.$disconnect();
}

main();
