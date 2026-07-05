/**
 * Fix gender for specific students
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

const applyChanges = process.argv.includes('--apply');

// These students need to be MALE (except C-1-204 which is already correct, and E-2-510 which is female)
const toFixMale = [
  'C-3-225', // IHTISHAM - Male
  'C-3-229', // RAO ARHAM - Male
  'C-4-251', // MUEEZULLAH - Male
  'C-4-255', // HUZAIFA - Male
  'C-4-267', // ABU BAKAR - Male
  'C-4-270', // GUL ZAMAN - Male
  'C-4-272', // SAIM - Male
  'C-4-274', // M. HAMMAD - Male
  'C-4-278', // NOOR HASSAN - Male
  'C-5-402', // SAMAR ABBAS - Male
  'C-5-409', // UMAIR - Male
  'C-5-416', // ASAD - Male
  'E-2-509', // IHSANULLAH - Male
  'E-2-512', // UMAR - Male
  'E-2-514', // FARRUKH - Male
  'IT-2-302', // M. SOHAIB - Male
  'IT-2-308', // ZULFIQAR - Male
  'IT-2-309', // SHAHID - Male
  'IT-2-311', // SAMIULLAH - Male
  'M-4-108'  // ZAYYAN - Male
];

async function main() {
  console.log('\n🔧 Fix Gender for Specific Students\n');
  await prisma.$connect();

  console.log(`📋 Processing ${toFixMale.length} students...\n`);

  const updates = [];

  // Get all students to fix
  for (const rollNo of toFixMale) {
    const student = await prisma.student.findFirst({
      where: { rollNo, deletedAt: null },
      select: { id: true, rollNo: true, firstName: true, gender: true }
    });

    if (student && student.gender !== 'MALE') {
      updates.push({
        id: student.id,
        rollNo: student.rollNo,
        name: student.firstName,
        old: student.gender,
        new: 'MALE'
      });
    }
  }

  console.log(`📊 Found ${updates.length} students to update:\n`);

  updates.forEach(u => {
    console.log(`   ${u.rollNo} | ${u.name} | ${u.old} → ${u.new}`);
  });

  if (applyChanges && updates.length > 0) {
    console.log(`\n⚠️  Applying changes to ${updates.length} students...\n`);
    
    for (const u of updates) {
      await prisma.student.update({
        where: { id: u.id },
        data: { gender: 'MALE' }
      });
      process.stdout.write('.');
    }

    console.log(`\n\n✅ Updated ${updates.length} students successfully!\n`);
  } else if (!applyChanges && updates.length > 0) {
    console.log(`\n📝 DRY RUN - To apply, run:`);
    console.log(`   node scripts/fix-specific-gender.js --apply\n`);
  } else {
    console.log(`\n✅ No changes needed!\n`);
  }
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
