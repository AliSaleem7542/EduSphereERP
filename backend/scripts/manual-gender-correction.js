/**
 * Manual Gender Correction Script
 * Use this to correct specific students' gender
 *
 * Usage:
 * 1. First run without --apply to see current data
 * 2. Edit the MANUAL_CORRECTIONS array below
 * 3. Run with --apply to update database
 *
 * Run: node scripts/manual-gender-correction.js
 * Apply: node scripts/manual-gender-correction.js --apply
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

// =============================================
// MANUAL CORRECTIONS
// Add student IDs and their correct gender here
// =============================================
const MANUAL_CORRECTIONS = [
  // Example: { rollNo: 'C-1-210', correctGender: 'FEMALE' },
  // Example: { rollNo: 'M-4-101', correctGender: 'MALE' },
  
  // Add your corrections below:
  // Female students wrongly marked as Male:
  { rollNo: 'C-1-210', correctGender: 'FEMALE' },  // AREEBA SHAHID
  { rollNo: 'C-1-215', correctGender: 'FEMALE' },  // AMINA BABAR
  { rollNo: 'C-1-220', correctGender: 'FEMALE' },  // ZARA AKBAR
  { rollNo: 'M-1-109', correctGender: 'FEMALE' },  // RAMIZA ASIF
  { rollNo: 'M-1-114', correctGender: 'FEMALE' },  // DUA IMRAN
  { rollNo: 'M-1-115', correctGender: 'FEMALE' },  // ZAINAB MASOOD
  { rollNo: 'M-1-116', correctGender: 'FEMALE' },  // ALIA ASLAM
  { rollNo: 'M-1-117', correctGender: 'FEMALE' },  // ALISHA SALEEM
  { rollNo: 'M-1-121', correctGender: 'FEMALE' },  // MUNEEBA AHMAD
  { rollNo: 'M-1-122', correctGender: 'FEMALE' },  // FATIMA SHAHID
  { rollNo: 'M-1-126', correctGender: 'FEMALE' },  // HINA TARIQ
  { rollNo: 'M-1-130', correctGender: 'FEMALE' },  // ZAINAB BIBI
  { rollNo: 'M-1-131', correctGender: 'FEMALE' },  // LAIBA AKBAR
  { rollNo: 'M-1-144', correctGender: 'FEMALE' },  // MEHWISH ALI SHER
  { rollNo: 'C-2Eco-251', correctGender: 'FEMALE' },  // FIZA IMRAN
  { rollNo: 'C-2Eco-252', correctGender: 'FEMALE' },  // KAINAT ZAHID
  { rollNo: 'C-2Eco-259', correctGender: 'FEMALE' },  // ZAINAB JAMEEL
  { rollNo: 'C-2Eco-260', correctGender: 'FEMALE' },  // TUBA TARIQ
  { rollNo: 'E-1-503', correctGender: 'FEMALE' },  // SARA KHALID
  { rollNo: 'I.Com 1-402', correctGender: 'FEMALE' },  // LAIBA ALI
  { rollNo: 'IT-1-302', correctGender: 'FEMALE' },  // ZAINAB IRFAN
  
  // Add more corrections as needed...
];

async function main() {
  console.log('\n🔧 Manual Gender Correction\n');
  await prisma.$connect();
  console.log('✅ Connected to database');

  if (MANUAL_CORRECTIONS.length === 0) {
    console.log('\n⚠️  No corrections defined in MANUAL_CORRECTIONS array');
    console.log('   Edit this script and add corrections, then run again.\n');
    return;
  }

  console.log(`\n📋 Processing ${MANUAL_CORRECTIONS.length} manual corrections...\n`);

  let successCount = 0;
  let notFoundCount = 0;

  for (const correction of MANUAL_CORRECTIONS) {
    const student = await prisma.student.findFirst({
      where: { rollNo: correction.rollNo },
      select: { id: true, rollNo: true, firstName: true, lastName: true, gender: true }
    });

    if (!student) {
      console.log(`❌ Not found: ${correction.rollNo}`);
      notFoundCount++;
      continue;
    }

    const name = `${student.firstName} ${student.lastName || ''}`.trim();
    
    if (student.gender === correction.correctGender) {
      console.log(`✓  Already correct: ${student.rollNo} | ${name} | ${student.gender}`);
      continue;
    }

    console.log(`🔄 ${student.rollNo} | ${name} | ${student.gender} → ${correction.correctGender}`);

    if (applyChanges) {
      await prisma.student.update({
        where: { id: student.id },
        data: { gender: correction.correctGender }
      });
      successCount++;
    }
  }

  if (applyChanges) {
    console.log(`\n✅ Updated ${successCount} students`);
    if (notFoundCount > 0) {
      console.log(`⚠️  ${notFoundCount} students not found (check roll numbers)`);
    }

    const finalMale = await prisma.student.count({ where: { gender: 'MALE' } });
    const finalFemale = await prisma.student.count({ where: { gender: 'FEMALE' } });
    
    console.log(`\n📊 Final Distribution:`);
    console.log(`   MALE: ${finalMale}`);
    console.log(`   FEMALE: ${finalFemale}`);
  } else {
    console.log('\n⚠️  DRY RUN - No changes made');
    console.log('   Run with --apply to update the database');
  }

  console.log('\n✅ Done\n');
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
