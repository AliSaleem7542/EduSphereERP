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
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function main() {
  const male = await prisma.student.count({ where: { gender: 'MALE' } });
  const female = await prisma.student.count({ where: { gender: 'FEMALE' } });
  const total = male + female;
  console.log(`\n📊 Gender Distribution:`);
  console.log(`   MALE: ${male}`);
  console.log(`   FEMALE: ${female}`);
  console.log(`   TOTAL: ${total}\n`);
}

main().finally(() => prisma.$disconnect());
