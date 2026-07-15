/**
 * CHECK: 2nd Year Class Sections
 * 
 * Verify if 2nd Year class exists and has sections
 * 
 * RUN: node scripts/check-2nd-year-sections.js
 */

const { prisma } = require('../src/config/database');

async function main() {
  console.log('\n=== Checking 2nd Year Sections ===\n');

  try {
    // Get current academic year
    const currentYear = await prisma.academicYear.findFirst({ 
      where: { isCurrent: true } 
    });

    if (!currentYear) {
      console.error('❌ No current academic year found');
      process.exit(1);
    }

    console.log('📚 Academic Year:', currentYear.label);

    // Get 2nd Year class
    const secondYear = await prisma.class.findFirst({
      where: {
        name: { contains: '2nd Year', mode: 'insensitive' },
        academicYearId: currentYear.id
      }
    });

    if (!secondYear) {
      console.error('❌ 2nd Year class NOT FOUND');
      console.log('\n   Available classes:');
      const allClasses = await prisma.class.findMany({
        where: { academicYearId: currentYear.id }
      });
      allClasses.forEach(c => {
        console.log('   • ' + c.name + ' (ID: ' + c.id + ')');
      });
      process.exit(1);
    }

    console.log('✓ 2nd Year Class: ' + secondYear.name + ' (ID: ' + secondYear.id + ')');

    // Get sections for 2nd Year
    const sections = await prisma.section.findMany({
      where: { classId: secondYear.id }
    });

    console.log('✓ Sections found: ' + sections.length);

    if (sections.length === 0) {
      console.warn('\n⚠️  WARNING: 2nd Year has NO sections!');
      console.log('\nTo create sections:');
      console.log('1. Go to Manage Classes → Manage Sections');
      console.log('2. Select 2nd Year class');
      console.log('3. Add sections: A, B, C, D, etc.');
      process.exit(1);
    }

    sections.forEach((s, i) => {
      console.log('  ' + (i+1) + '. ' + s.name + ' (ID: ' + s.id + ')');
    });

    // Check students in each section
    console.log('\n📊 Students in 2nd Year sections:');
    for (const section of sections) {
      const count = await prisma.student.count({
        where: { sectionId: section.id, deletedAt: null, status: 'ACTIVE' }
      });
      console.log('  • ' + section.name + ': ' + count + ' students');
    }

    console.log('\n✅ All good! 2nd Year class and sections exist.\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
