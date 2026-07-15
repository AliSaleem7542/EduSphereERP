const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('\n🔧 RESTORING M-4 STUDENTS:\n');

    // Get M-4 section (ID 7)
    const m4Section = await prisma.section.findFirst({
      where: { name: 'M-4', class: { name: '1st Year' } }
    });

    if (!m4Section) {
      console.log('❌ M-4 section not found!');
      return;
    }

    console.log(`Found M-4 section (ID: ${m4Section.id})\n`);

    // Get all M-4 students (including deleted ones)
    const m4Students = await prisma.student.findMany({
      where: {
        rollNo: { startsWith: 'M-4' }
      }
    });

    console.log(`Found ${m4Students.length} total M-4 students\n`);

    let restored = 0;
    let updated = 0;

    for (const student of m4Students) {
      const updates = {};

      // Restore if deleted
      if (student.deletedAt) {
        updates.deletedAt = null;
        restored++;
        console.log(`  ✓ Restoring: ${student.firstName} ${student.lastName} (${student.rollNo})`);
      }

      // Update section if not in M-4
      if (student.sectionId !== m4Section.id) {
        updates.sectionId = m4Section.id;
        updated++;
        console.log(`  ✓ Moving to M-4: ${student.firstName} ${student.lastName} (${student.rollNo})`);
      }

      if (Object.keys(updates).length > 0) {
        await prisma.student.update({
          where: { id: student.id },
          data: updates
        });
      }
    }

    console.log(`\n✅ Restored ${restored} deleted students`);
    console.log(`✅ Updated ${updated} students' sections\n`);

    // Verify
    console.log('📊 VERIFICATION:\n');
    const verifyStudents = await prisma.student.findMany({
      where: {
        sectionId: m4Section.id,
        deletedAt: null
      },
      select: { firstName: true, lastName: true, rollNo: true }
    });

    console.log(`M-4 Section now has ${verifyStudents.length} active students:\n`);
    verifyStudents.forEach(s => {
      console.log(`  - ${s.firstName} ${s.lastName} (${s.rollNo})`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
