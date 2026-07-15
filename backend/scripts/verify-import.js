require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 VERIFYING DATA IMPORT\n');
  console.log('='.repeat(60));

  try {
    // Count total students
    const totalStudents = await prisma.student.count({
      where: { deletedAt: null }
    });

    console.log(`\n📚 Total Students: ${totalStudents}\n`);

    // Count by section
    const bySection = await prisma.section.findMany({
      where: { class: { academicYear: { isCurrent: true } } },
      include: {
        students: { where: { deletedAt: null } }
      }
    });

    console.log('📋 Students by Section:\n');
    let sectionTotal = 0;
    bySection.forEach(section => {
      const count = section.students.length;
      sectionTotal += count;
      if (count > 0) {
        console.log(`  ${section.name.padEnd(15)} : ${count.toString().padStart(3)} students`);
      }
    });

    console.log(`\n  ${'─'.repeat(35)}`);
    console.log(`  TOTAL VERIFIED    : ${sectionTotal} students`);

    // Count by gender
    const byGender = await prisma.student.groupBy({
      by: ['gender'],
      where: { deletedAt: null },
      _count: { id: true }
    });

    console.log(`\n📊 Students by Gender:\n`);
    byGender.forEach(g => {
      console.log(`  ${g.gender.padEnd(10)} : ${g._count.id} students`);
    });

    // Count by section more detailed
    const classes = await prisma.class.findMany({
      include: {
        students: { where: { deletedAt: null } },
        sections: {
          include: {
            students: { where: { deletedAt: null } }
          }
        }
      }
    });

    console.log(`\n📚 By Class:\n`);
    classes.forEach(cls => {
      console.log(`  ${cls.name}: ${cls.students.length} students`);
    });

    console.log(`\n${'='.repeat(60)}\n`);

  } catch (e) {
    console.error('❌ Error:', e.message);
  }

  await prisma.$disconnect();
}

main();
