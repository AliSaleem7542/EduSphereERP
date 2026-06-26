/**
 * Fix gender based on student names
 * This script intelligently assigns gender based on common name patterns
 *
 * Run: node scripts/fix-gender-by-names.js
 * Run with apply: node scripts/fix-gender-by-names.js --apply
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

// Common Pakistani male name patterns
const malePatterns = [
  'MUHAMMAD', 'AHMED', 'ALI', 'HASSAN', 'HUSSAIN', 'USMAN', 'HAMZA', 'BILAL', 'TALHA', 'ABDULLAH',
  'ZAIN', 'ARSLAN', 'FAISAL', 'SHAHID', 'NAVEED', 'IMRAN', 'KAMRAN', 'ADNAN', 'WAQAS', 'ASIF',
  'YASIR', 'JUNAID', 'FARHAN', 'DANISH', 'SAAD', 'UMER', 'USAMA', 'WALEED', 'OWAIS', 'SAQIB',
  'RAHEEL', 'KASHIF', 'RIZWAN', 'HARIS', 'SHOAIB', 'TARIQ', 'SALMAN', 'ZAHID', 'RASHID', 'MAJID',
  'ROMAAN', 'RAYAN', 'ZEESHAN', 'FAHAD', 'MUNEEB', 'HAIDER', 'AMMAR', 'BABAR', 'AZHAR', 'AKBAR'
];

// Common Pakistani female name patterns
const femalePatterns = [
  'FATIMA', 'AYESHA', 'KHADIJA', 'MARYAM', 'ZAINAB', 'HAFSA', 'AMINA', 'SARA', 'HIRA', 'MAHNOOR',
  'NIMRA', 'NOOR', 'AMAMA', 'MUNTAHA', 'ANAMTA', 'RUMAN', 'MARIUM', 'AREEBA', 'MARIYAM', 'BUSHRA',
  'AROOJ', 'MEMONA', 'SANA', 'SEHAR', 'ZARA', 'LAIBA', 'IQRA', 'ALIZA', 'RABIA', 'SUMBAL',
  'SIDRA', 'ANUM', 'ZUNAIRA', 'JAVERIA', 'TAYYABA', 'AROOSA', 'MEHWISH', 'SADIA', 'NIDA', 'HUMA'
];

function detectGender(firstName, lastName) {
  const fullName = `${firstName} ${lastName || ''}`.toUpperCase();
  
  // Check for male patterns
  for (const pattern of malePatterns) {
    if (fullName.includes(pattern)) {
      return 'MALE';
    }
  }
  
  // Check for female patterns
  for (const pattern of femalePatterns) {
    if (fullName.includes(pattern)) {
      return 'FEMALE';
    }
  }
  
  // Default to FEMALE (since this is a girls college)
  return 'FEMALE';
}

async function main() {
  console.log('\n🔧 Fix Gender Based on Names\n');
  await prisma.$connect();
  console.log('✅ Connected to database');

  const students = await prisma.student.findMany({
    select: { id: true, firstName: true, lastName: true, rollNo: true, gender: true }
  });

  console.log(`\n📊 Analyzing ${students.length} students...\n`);

  let maleCount = 0;
  let femaleCount = 0;
  let changedCount = 0;

  const updates = [];

  students.forEach(s => {
    const detectedGender = detectGender(s.firstName, s.lastName);
    const name = `${s.firstName} ${s.lastName || ''}`.trim();
    
    if (detectedGender === 'MALE') {
      maleCount++;
    } else {
      femaleCount++;
    }

    if (s.gender !== detectedGender) {
      changedCount++;
      updates.push({
        id: s.id,
        rollNo: s.rollNo,
        name: name,
        currentGender: s.gender,
        newGender: detectedGender
      });
    }
  });

  console.log(`📈 Detection Results:`);
  console.log(`   Detected MALE: ${maleCount}`);
  console.log(`   Detected FEMALE: ${femaleCount}`);
  console.log(`   Changes needed: ${changedCount}\n`);

  if (updates.length > 0) {
    console.log('🔄 Students that will be updated:\n');
    console.log('Roll No | Name | Current → New');
    console.log('--------|------|---------------');
    updates.forEach(u => {
      console.log(`${u.rollNo || 'N/A'} | ${u.name} | ${u.currentGender} → ${u.newGender}`);
    });
  }

  if (applyChanges) {
    console.log('\n⚠️  Applying changes to database...\n');
    
    for (const update of updates) {
      await prisma.student.update({
        where: { id: update.id },
        data: { gender: update.newGender }
      });
    }
    
    console.log(`✅ Updated ${updates.length} students`);
    
    const finalMale = await prisma.student.count({ where: { gender: 'MALE' } });
    const finalFemale = await prisma.student.count({ where: { gender: 'FEMALE' } });
    
    console.log(`\n📊 Final Distribution:`);
    console.log(`   MALE: ${finalMale}`);
    console.log(`   FEMALE: ${finalFemale}`);
  } else {
    console.log('\n⚠️  DRY RUN - No changes made');
    console.log('   Run with --apply to actually update the database');
  }

  console.log('\n✅ Done\n');
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
