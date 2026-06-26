/**
 * Check what gender values are stored in database
 * This helps identify if values are 'Male'/'Female' or 'MALE'/'FEMALE'
 *
 * Run: node scripts/check-gender-values.js
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
  console.log('\n🔍 Checking Gender Values in Database\n');
  await prisma.$connect();
  console.log('✅ Connected to database');

  // Get raw gender values
  const students = await prisma.student.findMany({
    select: { id: true, firstName: true, lastName: true, rollNo: true, gender: true },
    take: 20
  });

  console.log('\n📊 Sample of first 20 students:\n');
  console.log('ID | Roll No | Name | Gender Value');
  console.log('---|---------|------|-------------');
  
  students.forEach(s => {
    const name = `${s.firstName} ${s.lastName || ''}`.trim();
    console.log(`${s.id} | ${s.rollNo || 'N/A'} | ${name} | "${s.gender}"`);
  });

  // Count by distinct values
  const result = await prisma.$queryRaw`
    SELECT gender, COUNT(*) as count 
    FROM "Student" 
    GROUP BY gender 
    ORDER BY count DESC
  `;

  console.log('\n📈 Gender Distribution:\n');
  result.forEach(row => {
    console.log(`  "${row.gender}": ${row.count} students`);
  });

  const total = await prisma.student.count();
  console.log(`\n📊 Total Students: ${total}\n`);
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
