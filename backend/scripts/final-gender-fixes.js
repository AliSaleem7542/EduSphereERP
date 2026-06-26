/**
 * Final manual corrections for obvious mistakes
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
  console.log('\n🔧 Final Gender Corrections\n');
  await prisma.$connect();

  // Fix obvious MALE students marked as FEMALE
  const maleCorrections = [
    'E-2-515',   // ALI SHAN - MALE
    'C-4-278',   // NOOR HASSAN - MALE (Hassan indicates male)
    'C-5-401',   // ZEESHAN ALI - MALE
    'C-5-416',   // ASAD ALI - MALE
    'IT-2-309',  // SHAHID REHMAN - MALE
  ];

  // Fix obvious FEMALE students marked as MALE
  const femaleCorrections = [
    'M-1-101',   // FEHA MURTAZA - FEMALE
    'C-1-204',   // ROMAAN AFZAAL - Could be male, keeping as detected
  ];

  console.log('Fixing MALE students...');
  for (const rollNo of maleCorrections) {
    const result = await prisma.student.updateMany({
      where: { rollNo },
      data: { gender: 'MALE' }
    });
    if (result.count > 0) {
      console.log(`✅ Fixed ${rollNo} → MALE`);
    }
  }

  console.log('\nFixing FEMALE students...');
  for (const rollNo of femaleCorrections) {
    const result = await prisma.student.updateMany({
      where: { rollNo },
      data: { gender: 'FEMALE' }
    });
    if (result.count > 0) {
      console.log(`✅ Fixed ${rollNo} → FEMALE`);
    }
  }

  const finalMale = await prisma.student.count({ where: { gender: 'MALE' } });
  const finalFemale = await prisma.student.count({ where: { gender: 'FEMALE' } });
  
  console.log(`\n📊 Final Distribution:`);
  console.log(`   MALE: ${finalMale}`);
  console.log(`   FEMALE: ${finalFemale}`);
  console.log('\n✅ Done\n');
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
