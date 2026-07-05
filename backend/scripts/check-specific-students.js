/**
 * Check specific students' data
 */
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
  console.log('\n🔍 Checking Specific Students\n');
  await prisma.$connect();

  // List of roll numbers to check
  const rollNos = [
    'C-1-204', 'C-3-204', 'C-3-225', 'C-3-229', 'C-4-251', 'C-4-255', 'C-4-267', 'C-4-270', 'C-4-272', 'C-4-274', 'C-4-278',
    'C-5-402', 'C-5-409', 'C-5-416', 'E-2-509', 'E-2-510', 'E-2-512', 'E-2-514', 'IT-2-302', 'IT-2-308', 'IT-2-309', 'IT-2-311', 'M-4-108'
  ];

  console.log(`📋 Checking ${rollNos.length} students:\n`);

  for (const rollNo of rollNos) {
    const student = await prisma.student.findFirst({
      where: { rollNo, deletedAt: null },
      select: { id: true, rollNo: true, firstName: true, lastName: true, gender: true, class: true }
    });

    if (student) {
      console.log(`${student.rollNo.padEnd(12)} | ${(student.firstName + ' ' + (student.lastName || '')).padEnd(25)} | Gender: ${student.gender}`);
    } else {
      console.log(`${rollNo.padEnd(12)} | NOT FOUND`);
    }
  }

  console.log('\n✅ Done\n');
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
