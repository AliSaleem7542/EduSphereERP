const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('\n🔧 COMPREHENSIVE STUDENT RESTORATION:\n');

    // Get 1st Year class
    const firstYear = await prisma.class.findFirst({
      where: { name: '1st Year' }
    });

    if (!firstYear) {
      console.log('❌ 1st Year class not found');
      return;
    }

    // Get all 1st Year sections
    const firstYearSections = await prisma.section.findMany({
      where: { classId: firstYear.id }
    });

    console.log(`Found ${firstYearSections.length} 1st Year sections\n`);

    let totalRestored = 0;
    let totalMoved = 0;

    // Process each section
    for (const section of firstYearSections) {
      console.log(`Processing: ${section.name}`);

      // Find all students that should be in this section
      // They either start with the section name or match the pattern
      let pattern = section.name;
      
      // Get students by roll number pattern
      const shouldBeHere = await prisma.student.findMany({
        where: {
          rollNo: { startsWith: pattern }
        }
      });

      console.log(`  Found ${shouldBeHere.length} students with roll prefix\n`);

      for (const student of shouldBeHere) {
        const updates = {};

        // Restore if deleted
        if (student.deletedAt) {
          updates.deletedAt = null;
          totalRestored++;
        }

        // Move to correct section
        if (student.sectionId !== section.id || student.classId !== firstYear.id) {
          updates.sectionId = section.id;
          updates.classId = firstYear.id;
          totalMoved++;
        }

        if (Object.keys(updates).length > 0) {
          await prisma.student.update({
            where: { id: student.id },
            data: updates
          });
        }
      }
    }

    console.log(`\n✅ RESTORATION COMPLETE:`);
    console.log(`  Restored deleted: ${totalRestored} students`);
    console.log(`  Moved to correct section: ${totalMoved} students\n`);

    // Final verification
    console.log('📊 FINAL VERIFICATION:\n');
    for (const section of firstYearSections) {
      const count = await prisma.student.count({
        where: {
          sectionId: section.id,
          deletedAt: null
        }
      });
      console.log(`  ${section.name}: ${count} students`);
    }

    const totalActive = await prisma.student.count({
      where: {
        classId: firstYear.id,
        deletedAt: null
      }
    });

    console.log(`\n  TOTAL ACTIVE 1st YEAR: ${totalActive} students`);

  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    await prisma.$disconnect();
  }
})();
