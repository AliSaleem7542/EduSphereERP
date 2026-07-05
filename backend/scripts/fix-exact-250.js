/**
 * Fix Gender for Exact 250 Students from JSON
 * Use the actual data structure to update database
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

// Female names - HIGH PRIORITY
const FEMALE_NAMES = [
  'AMAMA', 'NIMRA', 'MUNTAHA', 'MARYAM', 'AYESHA', 'FATIMA', 'KHADIJA', 'ZAINAB', 'HAFSA', 'AMINA', 'SARA', 'HIRA',
  'MAHNOOR', 'NOOR', 'ANAMTA', 'RUMAN', 'MARIUM', 'AREEBA', 'MARIYAM', 'BUSHRA', 'AROOJ', 'MEMONA', 'SANA', 'SEHAR',
  'ZARA', 'LAIBA', 'IQRA', 'ALIZA', 'RABIA', 'SUMBAL', 'SIDRA', 'ANUM', 'ZUNAIRA', 'JAVERIA', 'TAYYABA', 'AROOSA',
  'MEHWISH', 'SADIA', 'NIDA', 'HUMA', 'RAMIZA', 'DUA', 'ALIA', 'ALISHA', 'MUNEEBA', 'HINA', 'BIBI', 'FIZA', 'KAINAT',
  'TUBA', 'UME', 'EMAN', 'FAJAR', 'MOMINA', 'RIMSHA', 'AYAT', 'ESHA', 'KOMAL', 'MARIA', 'NAIMAL', 'AQSA', 'KASHMAIL',
  'WAJIHA', 'SABA', 'FARWA', 'AFRAH', 'ANFAAL', 'EZZA', 'HAMNA', 'HOORAIN', 'SHAKEELA', 'HABIBA', 'MAHEEN', 'ZOHA',
  'AROOBA', 'ALEENA', 'BARIRA', 'HUSNA', 'HAFSA', 'MINAHIL', 'EMAAN', 'IMAN', 'ISHWA', 'ROMAIZAH', 'MALEEHA', 'YASHAL',
  'MANAHIL', 'SEHAR', 'ZAINAB', 'LARAIB', 'MARIAM', 'HAFZA', 'NADIA', 'FARIA', 'HANIA', 'RUKHSANA', 'SHAHINA', 'AKASHA',
  'TABASSUM', 'SHUMAILA', 'SAWAIRA', 'AFIA', 'MAROOSH', 'MUNIHA', 'RASHMAL', 'MEERAB', 'FIZA', 'KAINAT', 'HUMA', 'MALEEHA',
  'YASHAL', 'SEHAR', 'MINAHIL', 'MAHNOOR', 'ZAINAB', 'TUBA'
];

// Male names
const MALE_NAMES = [
  'ROMAAN', 'ZEESHAN', 'UZAIR', 'HANZALA', 'TAYYAB', 'BAKIR', 'ABDUL', 'AHTISHAM', 'ZAID', 'SAMEER', 'MUHAMMAD',
  'AHMAD', 'AHMED', 'HASSAN', 'HUSSAIN', 'USMAN', 'HAMZA', 'BILAL', 'TALHA', 'ABDULLAH', 'ZAIN', 'ARSLAN', 'FAISAL',
  'NAVEED', 'IMRAN', 'KAMRAN', 'ADNAN', 'WAQAS', 'YASIR', 'JUNAID', 'FARHAN', 'DANISH', 'SAAD', 'UMER', 'USAMA',
  'WALEED', 'OWAIS', 'SAQIB', 'RAHEEL', 'KASHIF', 'RIZWAN', 'HARIS', 'SHOAIB', 'TARIQ', 'SALMAN', 'ZAHID', 'RASHID',
  'MAJID', 'RAYAN', 'FAHAD', 'MUNEEB', 'HAIDER', 'AMMAR', 'BABAR', 'AZHAR', 'ABUBAKAR', 'MUEEZ', 'RAZA', 'ZOHAIB',
  'AHSAN', 'MUJEEB', 'SOHAIB', 'HAMMAD', 'ATHER', 'SUFYAN', 'SAMI', 'FAIZAN', 'WASIF', 'SHERAZ', 'DAWOOD', 'AHTISHAM',
  'SAMEER', 'KASHAN', 'SUDAIS', 'NABRAS', 'JOHAR', 'SHAHWAIZ', 'MAMOON', 'MOSAB', 'MOHSIN', 'RAFAY', 'RAMEEZ', 'IKRAM',
  'ISHFAQ', 'HUSSNAIN', 'MUSTAFA', 'HASSAM', 'ALEEM', 'TAHA', 'MURTAZA', 'SUBHAN', 'AOUN', 'HAFIZ', 'RANA', 'SARDAR',
  'GHULAM', 'NASIR', 'NASEER', 'SAJID', 'NADIR', 'NADEEM', 'NABIL', 'NABEEL', 'WARIS', 'TAHIR', 'TAHER', 'ALI',
  'KHAN', 'SHAH', 'SHAN', 'MALIK', 'ARHAM', 'FAIZAN', 'USMAN', 'M'
];

function detectGender(firstName) {
  const first = (firstName || '').toUpperCase().trim();

  // Check female names first
  for (const name of FEMALE_NAMES) {
    if (first === name || first.startsWith(name + ' ')) {
      return 'FEMALE';
    }
  }

  // Check male names
  for (const name of MALE_NAMES) {
    if (first === name || first.startsWith(name + ' ')) {
      return 'MALE';
    }
  }

  // Default female (most are female in this case)
  return 'FEMALE';
}

async function main() {
  console.log('\n🔧 Fix Gender for Exact 250 Students\n');
  await prisma.$connect();

  // Get 250 students
  const students = await prisma.student.findMany({
    where: { deletedAt: null },
    take: 250,
    select: { id: true, firstName: true, rollNo: true, gender: true },
    orderBy: { rollNo: 'asc' }
  });

  console.log(`📊 Processing ${students.length} students\n`);

  let changeCount = 0;
  let femaleCount = 0;
  let maleCount = 0;
  const updates = [];

  students.forEach(s => {
    const detected = detectGender(s.firstName);
    
    if (detected === 'FEMALE') femaleCount++;
    else maleCount++;

    if (s.gender !== detected) {
      changeCount++;
      updates.push({
        id: s.id,
        rollNo: s.rollNo,
        name: s.firstName,
        old: s.gender,
        new: detected
      });
    }
  });

  console.log(`📈 Detection Results:`);
  console.log(`   FEMALE: ${femaleCount}`);
  console.log(`   MALE: ${maleCount}`);
  console.log(`   Changes needed: ${changeCount}\n`);

  if (changeCount > 0) {
    console.log('Changes to apply:');
    updates.slice(0, 10).forEach(u => {
      console.log(`   ${u.rollNo} | ${u.name} | ${u.old} → ${u.new}`);
    });
    if (changeCount > 10) console.log(`   ... and ${changeCount - 10} more\n`);
  }

  if (applyChanges && changeCount > 0) {
    console.log(`⚠️  Updating ${changeCount} students...\n`);
    
    for (const u of updates) {
      await prisma.student.update({
        where: { id: u.id },
        data: { gender: u.new }
      });
      process.stdout.write('.');
    }

    console.log(`\n\n✅ Updated successfully!\n`);
  } else if (!applyChanges && changeCount > 0) {
    console.log(`📝 DRY RUN - To apply, run:`);
    console.log(`   node scripts/fix-exact-250.js --apply\n`);
  }
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
