/**
 * Smart Gender Detection - Improved Algorithm
 * Priority: Female names first, then check for male names
 * 
 * Run: node scripts/fix-gender-smart.js
 * Apply: node scripts/fix-gender-smart.js --apply
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

// Female names - Check these FIRST (high priority)
const FEMALE_NAMES = [
  'FATIMA', 'AYESHA', 'KHADIJA', 'MARYAM', 'ZAINAB', 'HAFSA', 'AMINA', 'SARA', 'HIRA', 'MAHNOOR',
  'NIMRA', 'NOOR', 'AMAMA', 'MUNTAHA', 'ANAMTA', 'RUMAN', 'MARIUM', 'AREEBA', 'MARIYAM', 'BUSHRA',
  'AROOJ', 'MEMONA', 'SANA', 'SEHAR', 'ZARA', 'LAIBA', 'IQRA', 'ALIZA', 'RABIA', 'SUMBAL',
  'SIDRA', 'ANUM', 'ZUNAIRA', 'JAVERIA', 'TAYYABA', 'AROOSA', 'MEHWISH', 'SADIA', 'NIDA', 'HUMA',
  'RAMIZA', 'DUA', 'ALIA', 'ALISHA', 'MUNEEBA', 'HINA', 'BIBI', 'FIZA', 'KAINAT', 'TUBA',
  'UME', 'EMAN', 'FAJAR', 'MOMINA', 'RIMSHA', 'AYAT', 'ESHA', 'KOMAL', 'MARIA', 'NAIMAL'
];

// Male-only names (only check if NOT female)
const MALE_ONLY_NAMES = [
  'MUHAMMAD', 'AHMED', 'HASSAN', 'HUSSAIN', 'USMAN', 'HAMZA', 'BILAL', 'TALHA', 'ABDULLAH',
  'ZAIN', 'ARSLAN', 'FAISAL', 'NAVEED', 'IMRAN', 'KAMRAN', 'ADNAN', 'WAQAS',
  'YASIR', 'JUNAID', 'FARHAN', 'DANISH', 'SAAD', 'UMER', 'USAMA', 'WALEED', 'OWAIS', 'SAQIB',
  'RAHEEL', 'KASHIF', 'RIZWAN', 'HARIS', 'SHOAIB', 'TARIQ', 'SALMAN', 'ZAHID', 'RASHID', 'MAJID',
  'RAYAN', 'ZEESHAN', 'FAHAD', 'MUNEEB', 'HAIDER', 'AMMAR', 'BABAR', 'AZHAR',
  'ABUBAKAR', 'MUEEZ', 'RAZA', 'ZOHAIB', 'AHSAN', 'MUJEEB', 'SOHAIB', 'HAMMAD', 'ATHER',
  'SUFYAN', 'SAMI', 'FAIZAN', 'WASIF', 'SHERAZ', 'DAWOOD', 'AHTISHAM', 'SAMEER',
  'KASHAN', 'SUDAIS', 'NABRAS', 'JOHAR', 'SHAHWAIZ', 'MAMOON', 'MOSAB', 'MOHSIN',
  'RAFAY', 'RAMEEZ', 'IKRAM', 'ISHFAQ', 'HUSSNAIN', 'MUSTAFA', 'HASSAM', 'ALEEM',
  'TAHA', 'MURTAZA', 'SUBHAN', 'AOUN', 'HAFIZ', 'RANA', 'SARDAR', 'GHULAM'
];

// Names that can be in BOTH (only if father's name suggests)
const AMBIGUOUS = ['ALI', 'SHAHID', 'TARIQ', 'AKBAR', 'SALEEM', 'KHALID'];

function detectGender(firstName, lastName) {
  const first = (firstName || '').toUpperCase().trim();
  const last = (lastName || '').toUpperCase().trim();
  const fullName = `${first} ${last}`.trim();

  // Priority 1: Check if FIRST name is clearly FEMALE
  for (const femaleName of FEMALE_NAMES) {
    if (first.includes(femaleName) || fullName.startsWith(femaleName)) {
      return 'FEMALE';
    }
  }

  // Priority 2: Check if name starts with MUHAMMAD or has male-only indicators
  if (fullName.startsWith('MUHAMMAD ') || fullName.startsWith('M ') || fullName.startsWith('HAFIZ ')) {
    return 'MALE';
  }

  // Priority 3: Check for male-only names in FIRST name
  for (const maleName of MALE_ONLY_NAMES) {
    if (first === maleName || first.startsWith(maleName + ' ')) {
      return 'MALE';
    }
  }

  // Priority 4: Check full name for male patterns
  for (const maleName of MALE_ONLY_NAMES) {
    if (fullName.includes(' ' + maleName) || fullName.includes(maleName + ' ')) {
      return 'MALE';
    }
  }

  // Default: FEMALE (since most ambiguous cases are female with father's name)
  return 'FEMALE';
}

async function main() {
  console.log('\n🔧 Smart Gender Detection (Improved)\n');
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
    
    if (detectedGender === 'MALE') maleCount++;
    else femaleCount++;

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
    console.log('🔄 Students to be updated:\n');
    updates.forEach(u => {
      console.log(`${u.rollNo || 'N/A'} | ${u.name} | ${u.currentGender} → ${u.newGender}`);
    });
  }

  if (applyChanges) {
    console.log('\n⚠️  Applying changes...\n');
    
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
    console.log('\n⚠️  DRY RUN - Run with --apply to update');
  }

  console.log('\n✅ Done\n');
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
