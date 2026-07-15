const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('\n📊 DETAILED SECTION ANALYSIS:\n');

    // Get all sections
    const allSections = await prisma.section.findMany({
      include: { 
        class: true,
        _count: { select: { students: true } } 
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }]
    });

    console.log(`Total sections in database: ${allSections.length}\n`);

    // Group by name
    const grouped = {};
    allSections.forEach(s => {
      if (!grouped[s.name]) grouped[s.name] = [];
      grouped[s.name].push(s);
    });

    // Find duplicates
    const duplicates = Object.entries(grouped).filter(([name, secs]) => secs.length > 1);
    
    if (duplicates.length > 0) {
      console.log(`❌ FOUND ${duplicates.length} DUPLICATE SECTION NAMES:\n`);
      duplicates.forEach(([name, secs]) => {
        console.log(`  "${name}" appears ${secs.length} times:`);
        secs.forEach(s => {
          console.log(`    ID ${s.id} (Class: ${s.class.name}): ${s._count.students} students`);
        });
        console.log('');
      });
    } else {
      console.log('✅ No duplicate section names found\n');
    }

    // Check which section IDs frontend is using
    console.log('\n🔍 CHECKING SECTION USAGE:\n');
    
    const studentsBySectionId = await prisma.student.groupBy({
      by: ['sectionId'],
      _count: { id: true },
      where: { deletedAt: null }
    });

    console.log('Students by section ID:');
    for (const group of studentsBySectionId) {
      const section = allSections.find(s => s.id === group.sectionId);
      if (section) {
        console.log(`  Section ID ${group.sectionId} ("${section.name}" - Class: ${section.class.name}): ${group._count.id} students`);
      } else {
        console.log(`  Section ID ${group.sectionId}: ${group._count.id} students [SECTION NOT FOUND!]`);
      }
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
