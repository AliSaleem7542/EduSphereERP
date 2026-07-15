require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

function ensureSSL(url) {
  if (!url) return url;
  if (url.includes('sslmode=') || url.includes('ssl=')) return url;
  if (url.includes('neon.tech') || url.includes('amazonaws.com')) {
    return url + (url.includes('?') ? '&' : '?') + 'sslmode=require';
  }
  return url;
}

const dbUrl = ensureSSL(process.env.DIRECT_URL || process.env.DATABASE_URL);
process.env.DATABASE_URL = dbUrl;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function main() {
  console.log('\n🔍 Checking Students\n');
  await prisma.$connect();

  try {
    // Count total students
    const totalCount = await prisma.student.count();
    console.log(`📊 Total students in DB: ${totalCount}`);

    // Count active students
    const activeCount = await prisma.student.count({
      where: { deletedAt: null }
    });
    console.log(`✅ Active students (not deleted): ${activeCount}`);

    // Get first 10 students
    const students = await prisma.student.findMany({
      where: { deletedAt: null },
      select: { id: true, rollNo: true, firstName: true, lastName: true, classId: true, sectionId: true },
      take: 10,
      orderBy: { rollNo: 'asc' }
    });

    console.log(`\nFirst 10 students:`);
    students.forEach((s, i) => {
      console.log(`${i+1}. ${s.rollNo} | ${s.firstName} ${s.lastName || ''} | ClassID: ${s.classId} | SectionID: ${s.sectionId}`);
    });

  } catch(e) {
    console.error('❌ Error:', e.message);
  }

  await prisma.$disconnect();
}

main();
