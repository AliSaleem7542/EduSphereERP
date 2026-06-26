/**
 * Check for duplicate or extra students
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
  console.log('\n🔍 Checking for Duplicate Students\n');
  await prisma.$connect();

  const total = await prisma.student.count();
  console.log(`📊 Total Students in Database: ${total}\n`);

  // Check for duplicate roll numbers
  const students = await prisma.student.findMany({
    select: { id: true, rollNo: true, firstName: true, lastName: true },
    orderBy: { rollNo: 'asc' }
  });

  const rollNoMap = {};
  const duplicates = [];

  students.forEach(s => {
    if (rollNoMap[s.rollNo]) {
      duplicates.push({
        rollNo: s.rollNo,
        student1: rollNoMap[s.rollNo],
        student2: s
      });
    } else {
      rollNoMap[s.rollNo] = s;
    }
  });

  if (duplicates.length > 0) {
    console.log('⚠️  Found Duplicate Roll Numbers:\n');
    duplicates.forEach(d => {
      console.log(`Roll No: ${d.rollNo}`);
      console.log(`  Student 1: ID=${d.student1.id}, Name=${d.student1.firstName} ${d.student1.lastName || ''}`);
      console.log(`  Student 2: ID=${d.student2.id}, Name=${d.student2.firstName} ${d.student2.lastName || ''}`);
      console.log('');
    });
  } else {
    console.log('✅ No duplicate roll numbers found');
  }

  // Check for students with unusual roll numbers
  console.log('\n🔍 Checking for unusual entries:\n');
  const unusual = students.filter(s => 
    !s.rollNo || 
    s.rollNo.length < 3 || 
    s.rollNo.match(/^[0-9]+$/) ||
    s.rollNo === 'AUTO' ||
    s.rollNo === 'TEMP'
  );

  if (unusual.length > 0) {
    console.log('⚠️  Found unusual roll numbers:');
    unusual.forEach(s => {
      console.log(`  ID=${s.id} | Roll No="${s.rollNo}" | Name=${s.firstName} ${s.lastName || ''}`);
    });
  } else {
    console.log('✅ All roll numbers look normal');
  }

  // Show first and last few students
  console.log('\n📋 First 5 students:');
  students.slice(0, 5).forEach(s => {
    console.log(`  ${s.rollNo} | ${s.firstName} ${s.lastName || ''}`);
  });

  console.log('\n📋 Last 5 students:');
  students.slice(-5).forEach(s => {
    console.log(`  ${s.rollNo} | ${s.firstName} ${s.lastName || ''}`);
  });

  console.log(`\n📊 Expected: 252 students`);
  console.log(`📊 Actual: ${total} students`);
  console.log(`📊 Difference: ${total - 252} extra student(s)\n`);
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
