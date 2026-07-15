require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  PERFORMING CLEAN START\n');
  console.log('='.repeat(60));

  try {
    // Delete all students
    const deletedStudents = await prisma.student.deleteMany({
      where: { deletedAt: null }
    });

    console.log(`\n✓ Deleted all students: ${deletedStudents.count}`);

    // Delete all sections
    const deletedSections = await prisma.section.deleteMany({});
    console.log(`✓ Deleted all sections: ${deletedSections.count}`);

    // Verify
    const studentCount = await prisma.student.count();
    const sectionCount = await prisma.section.count();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ CLEAN START COMPLETE`);
    console.log(`${'='.repeat(60)}`);
    console.log(`\nRemaining students: ${studentCount}`);
    console.log(`Remaining sections: ${sectionCount}\n`);

  } catch (e) {
    console.error('❌ Error:', e.message);
  }

  await prisma.$disconnect();
}

main();
