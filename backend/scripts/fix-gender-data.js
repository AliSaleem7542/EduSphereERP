/**
 * Fix corrupted gender data in Neon production DB.
 * The original import hardcoded FEMALE for all students.
 * The source data (Superior College Samundri) is a girls college — FEMALE is correct.
 * This script verifies the distribution and optionally resets all to FEMALE.
 *
 * Run: node scripts/fix-gender-data.js
 * Run with reset: node scripts/fix-gender-data.js --reset-to-female
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
const resetToFemale = process.argv.includes('--reset-to-female');
const resetToMale   = process.argv.includes('--reset-to-male');

async function main() {
  console.log('\n🔧 Gender Data Fix Script\n');
  await prisma.$connect();
  console.log('✅ Connected to database');

  const total  = await prisma.student.count();
  const male   = await prisma.student.count({ where: { gender: 'MALE' } });
  const female = await prisma.student.count({ where: { gender: 'FEMALE' } });
  const other  = await prisma.student.count({ where: { gender: 'OTHER' } });

  console.log(`\nCurrent distribution (${total} students):`);
  console.log(`  MALE   : ${male}`);
  console.log(`  FEMALE : ${female}`);
  console.log(`  OTHER  : ${other}`);

  if (resetToFemale) {
    console.log('\n⚠️  Resetting ALL students to FEMALE (Superior College is a girls college)...');
    const result = await prisma.student.updateMany({ data: { gender: 'FEMALE' } });
    console.log(`✅ Updated ${result.count} students to FEMALE`);
  } else if (resetToMale) {
    console.log('\n⚠️  Resetting ALL students to MALE...');
    const result = await prisma.student.updateMany({ data: { gender: 'MALE' } });
    console.log(`✅ Updated ${result.count} students to MALE`);
  } else {
    console.log('\nNo changes made. Use --reset-to-female or --reset-to-male to bulk update.');
  }

  const newMale   = await prisma.student.count({ where: { gender: 'MALE' } });
  const newFemale = await prisma.student.count({ where: { gender: 'FEMALE' } });
  console.log(`\nFinal: MALE=${newMale}, FEMALE=${newFemale}`);
  console.log('\n✅ Done\n');
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
