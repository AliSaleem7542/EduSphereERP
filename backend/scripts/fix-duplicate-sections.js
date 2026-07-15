const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('\n🔧 FIXING DUPLICATE SECTIONS:\n');

    // Get 2nd Year class
    const secondYear = await prisma.class.findFirst({
      where: { name: '2nd Year' }
    });

    if (!secondYear) {
      console.log('❌ 2nd Year class not found');
      return;
    }

    console.log(`Found 2nd Year class (ID: ${secondYear.id})\n`);

    // Get all sections in 2nd Year
    const secondYearSections = await prisma.section.findMany({
      where: { classId: secondYear.id },
      include: { _count: { select: { students: true } } }
    });

    console.log(`Found ${secondYearSections.length} sections in 2nd Year\n`);

    // Delete all empty 2nd Year sections
    let deleted = 0;
    for (const section of secondYearSections) {
      if (section._count.students === 0) {
        await prisma.section.delete({
          where: { id: section.id }
        });
        console.log(`✓ Deleted empty section: "${section.name}" (ID: ${section.id})`);
        deleted++;
      } else {
        console.log(`⚠️ KEEPING: "${section.name}" (ID: ${section.id}) - has ${section._count.students} students`);
      }
    }

    console.log(`\n✅ Deleted ${deleted} empty duplicate sections from 2nd Year\n`);

    // Verify the fix
    console.log('📊 VERIFICATION:\n');
    const firstYear = await prisma.class.findFirst({
      where: { name: '1st Year' }
    });

    const firstYearSections = await prisma.section.findMany({
      where: { classId: firstYear.id },
      include: { _count: { select: { students: true } } },
      orderBy: { name: 'asc' }
    });

    console.log('1st Year Sections:');
    firstYearSections.forEach(s => {
      console.log(`  ${s.name}: ${s._count.students} students`);
    });

    const remainingSecondYearSections = await prisma.section.findMany({
      where: { classId: secondYear.id },
      include: { _count: { select: { students: true } } }
    });

    console.log(`\n2nd Year Sections (remaining): ${remainingSecondYearSections.length}`);
    if (remainingSecondYearSections.length > 0) {
      remainingSecondYearSections.forEach(s => {
        console.log(`  ${s.name}: ${s._count.students} students`);
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
