/**
 * Fix or remove the extra student with roll number "22"
 * 
 * Run: node scripts/fix-extra-student.js
 * Delete: node scripts/fix-extra-student.js --delete
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
const shouldDelete = process.argv.includes('--delete');

async function main() {
  console.log('\n🔧 Fix Extra Student\n');
  await prisma.$connect();

  const extraStudent = await prisma.student.findFirst({
    where: { rollNo: '22' }
  });

  if (!extraStudent) {
    console.log('✅ No student with roll number "22" found');
    return;
  }

  console.log('📋 Found extra student:');
  console.log(`  ID: ${extraStudent.id}`);
  console.log(`  Roll No: "${extraStudent.rollNo}"`);
  console.log(`  Name: ${extraStudent.firstName} ${extraStudent.lastName || ''}`);
  console.log(`  Gender: ${extraStudent.gender}`);
  console.log(`  Class ID: ${extraStudent.classId}`);

  if (shouldDelete) {
    console.log('\n⚠️  Deleting student...');
    await prisma.student.delete({
      where: { id: extraStudent.id }
    });
    console.log('✅ Student deleted');

    const finalCount = await prisma.student.count();
    console.log(`\n📊 Final Count: ${finalCount} students`);
  } else {
    console.log('\n⚠️  DRY RUN - No changes made');
    console.log('   Run with --delete to remove this student');
  }

  console.log('\n✅ Done\n');
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
