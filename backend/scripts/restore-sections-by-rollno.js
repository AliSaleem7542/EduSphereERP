const { prisma } = require('../src/config/database');

async function main() {
  try {
    console.log('🔧 Restoring students to correct sections based on roll numbers...\n');

    // Find 1st Year class
    const firstYear = await prisma.class.findFirst({
      where: { name: '1st Year' }
    });

    if (!firstYear) {
      console.log('❌ 1st Year class not found');
      return;
    }

    console.log(`✓ Found 1st Year class (ID: ${firstYear.id})\n`);

    // Get all students in 1st Year
    const allStudents = await prisma.student.findMany({
      where: {
        classId: firstYear.id,
        deletedAt: null
      },
      include: { section: true },
      orderBy: { rollNo: 'asc' }
    });

    console.log(`✓ Found ${allStudents.length} students to restore\n`);

    let updated = 0;
    const errors = [];

    for (const student of allStudents) {
      try {
        // Extract section from roll number
        // Format: C-1-201, C-2Eco-251, C-3-201, M-1-301, etc.
        const rollParts = student.rollNo.split('-');
        let sectionName = null;

        if (rollParts.length >= 2) {
          // Try to reconstruct section name
          if (rollParts[0] === 'C' && rollParts[1].includes('Eco')) {
            sectionName = 'C-2Eco';
          } else if (rollParts[0] === 'C') {
            sectionName = `C-${rollParts[1]}`;
          } else if (rollParts[0] === 'M' || rollParts[0] === 'E' || rollParts[0] === 'I') {
            sectionName = `${rollParts[0]}-${rollParts[1]}`;
          }
        }

        if (!sectionName) {
          errors.push(`${student.rollNo}: Could not extract section name`);
          continue;
        }

        // Find the section
        const section = await prisma.section.findFirst({
          where: {
            name: sectionName,
            classId: firstYear.id
          }
        });

        if (!section) {
          errors.push(`${student.rollNo}: Section "${sectionName}" not found`);
          continue;
        }

        // Update student
        await prisma.student.update({
          where: { id: student.id },
          data: { sectionId: section.id }
        });

        console.log(`  ✓ ${student.firstName} ${student.lastName} (${student.rollNo}) → ${sectionName}`);
        updated++;
      } catch (err) {
        errors.push(`${student.rollNo}: ${err.message}`);
      }
    }

    console.log(`\n✅ Updated ${updated} students to correct sections`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors (${errors.length}):`);
      errors.forEach(e => console.log(`  - ${e}`));
    }

    // Show final counts
    console.log('\nFinal distribution:\n');
    const sections = await prisma.section.findMany({
      where: { classId: firstYear.id },
      orderBy: { name: 'asc' }
    });

    for (const section of sections) {
      const count = await prisma.student.count({
        where: {
          classId: firstYear.id,
          sectionId: section.id,
          deletedAt: null
        }
      });
      if (count > 0) {
        console.log(`  ${section.name}: ${count} students`);
      }
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();
