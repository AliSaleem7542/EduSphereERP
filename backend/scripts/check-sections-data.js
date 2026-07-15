const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Check all sections with student count
    const sections = await prisma.section.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log('\n📊 ALL SECTIONS WITH STUDENT COUNT:\n');
    sections.forEach(s => {
      console.log(`${s.id}. ${s.name}: ${s._count.students} students`);
    });

    console.log('\n---\n');

    // Check for M-4 students specifically
    const m4Section = await prisma.section.findFirst({
      where: { name: 'M-4' }
    });

    if (m4Section) {
      console.log(`✓ M-4 section found (ID: ${m4Section.id})\n`);
      const m4Students = await prisma.student.findMany({
        where: { sectionId: m4Section.id, deletedAt: null },
        select: { id: true, firstName: true, lastName: true, rollNo: true },
        take: 10
      });
      console.log(`  M-4 Students: ${m4Students.length}\n`);
      m4Students.forEach(s => {
        console.log(`    - ${s.firstName} ${s.lastName} (${s.rollNo})`);
      });
    } else {
      console.log('❌ M-4 section NOT FOUND!');
      
      // Check if any section has M-4 in name
      const similarSections = await prisma.section.findMany({
        where: {
          name: {
            contains: 'M-4'
          }
        }
      });
      
      if (similarSections.length > 0) {
        console.log('\nSimilar sections found:');
        similarSections.forEach(s => console.log(`  - ${s.name}`));
      }
    }

    // Count total students
    const totalStudents = await prisma.student.count({
      where: { deletedAt: null }
    });
    console.log(`\n\n📈 TOTAL ACTIVE STUDENTS: ${totalStudents}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
