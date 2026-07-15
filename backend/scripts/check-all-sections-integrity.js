const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('\n🔍 CHECKING ALL SECTIONS FOR DATA INTEGRITY:\n');

    // Get 1st Year class
    const firstYear = await prisma.class.findFirst({
      where: { name: '1st Year' }
    });

    if (!firstYear) {
      console.log('❌ 1st Year class not found');
      return;
    }

    // Get all sections in 1st Year
    const sections = await prisma.section.findMany({
      where: { classId: firstYear.id },
      orderBy: { name: 'asc' }
    });

    console.log(`Checking ${sections.length} sections in 1st Year:\n`);

    for (const section of sections) {
      // Count active students
      const activeCount = await prisma.student.count({
        where: { sectionId: section.id, deletedAt: null }
      });

      // Count deleted students
      const deletedCount = await prisma.student.count({
        where: { sectionId: section.id, deletedAt: { not: null } }
      });

      // Check students in other sections but with matching roll no prefix
      const prefix = section.name.replace(/ /g, '').split('-')[0];
      const studentsWithMatchingPrefix = await prisma.student.findMany({
        where: {
          rollNo: { startsWith: section.name },
          sectionId: { not: section.id },
          deletedAt: null
        },
        select: { firstName: true, lastName: true, rollNo: true, sectionId: true }
      });

      if (deletedCount > 0 || studentsWithMatchingPrefix.length > 0) {
        console.log(`⚠️  ${section.name}:`);
        console.log(`  Active: ${activeCount}, Deleted: ${deletedCount}`);
        
        if (deletedCount > 0) {
          console.log(`  ❌ ${deletedCount} students are DELETED`);
        }
        
        if (studentsWithMatchingPrefix.length > 0) {
          console.log(`  ❌ ${studentsWithMatchingPrefix.length} students in WRONG SECTION:`);
          studentsWithMatchingPrefix.forEach(s => {
            console.log(`     - ${s.firstName} ${s.lastName} (${s.rollNo}) in section ${s.sectionId}`);
          });
        }
      } else {
        console.log(`✓ ${section.name}: ${activeCount} active students`);
      }
    }

    console.log('\n');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
