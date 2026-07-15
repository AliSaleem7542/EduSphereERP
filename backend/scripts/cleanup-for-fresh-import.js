require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🧹 Cleaning up for fresh import...\n');

    // Delete all students
    const delStudents = await prisma.student.deleteMany({});
    console.log(`✓ Deleted ${delStudents.count} students`);

    // Delete all sections except default ones
    const delSections = await prisma.section.deleteMany({
      where: { name: 'A' }
    });
    console.log(`✓ Deleted ${delSections.count} auto-created sections`);

    // Delete all classes except 1st Year and 2nd Year
    const delClasses = await prisma.class.deleteMany({
      where: { name: { notIn: ['1st Year', '2nd Year'] } }
    });
    console.log(`✓ Deleted ${delClasses.count} extra classes`);

    console.log('\n✅ Ready for fresh import!\n');

    await prisma.$disconnect();
  } catch (e) {
    console.error('Error:', e.message);
    await prisma.$disconnect();
  }
}

main();
