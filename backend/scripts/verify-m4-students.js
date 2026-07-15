const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('\n🔍 M-4 SECTION VERIFICATION:\n');

    // Get all M-4 sections
    const m4Sections = await prisma.section.findMany({
      where: { name: 'M-4' },
      include: { 
        class: true,
        _count: { select: { students: true } } 
      }
    });

    console.log(`Found ${m4Sections.length} M-4 section(s):\n`);

    for (const section of m4Sections) {
      console.log(`Section ID ${section.id} (Class: ${section.class.name}):`);
      console.log(`  Count: ${section._count.students}\n`);

      // Get actual students
      const students = await prisma.student.findMany({
        where: { sectionId: section.id, deletedAt: null },
        select: { id: true, firstName: true, lastName: true, rollNo: true, classId: true },
        take: 10
      });

      if (students.length === 0) {
        console.log('  ❌ NO STUDENTS FOUND\n');
        
        // Check if there are students with this section but different condition
        const allStudentsWithThisSection = await prisma.student.findMany({
          where: { sectionId: section.id },
          select: { id: true, firstName: true, lastName: true, rollNo: true, deletedAt: true }
        });
        
        if (allStudentsWithThisSection.length > 0) {
          console.log('  But found students (including deleted):');
          allStudentsWithThisSection.forEach(s => {
            console.log(`    - ${s.firstName} ${s.lastName} (${s.rollNo}) [deletedAt: ${s.deletedAt}]`);
          });
        }
      } else {
        console.log(`  ✓ Found ${students.length} students:\n`);
        students.forEach(s => {
          console.log(`    - ${s.firstName} ${s.lastName} (${s.rollNo}) [classId: ${s.classId}]`);
        });
      }
      console.log('');
    }

    // Check if there are roll numbers that should be M-4
    console.log('\n🔍 CHECKING ROLL NUMBERS THAT SHOULD BE M-4:\n');
    const m4RollNumbers = await prisma.student.findMany({
      where: {
        rollNo: { startsWith: 'M-4' },
        deletedAt: null
      },
      select: { id: true, firstName: true, lastName: true, rollNo: true, sectionId: true, classId: true }
    });

    console.log(`Found ${m4RollNumbers.length} students with M-4 roll numbers:\n`);
    m4RollNumbers.forEach(s => {
      console.log(`  - ${s.firstName} ${s.lastName} (${s.rollNo})`);
      console.log(`    sectionId: ${s.sectionId}, classId: ${s.classId}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
