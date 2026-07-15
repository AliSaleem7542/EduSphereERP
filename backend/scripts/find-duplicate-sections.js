const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('\n🔍 CHECKING DUPLICATE SECTIONS:\n');

    // Get all classes
    const classes = await prisma.class.findMany();
    
    for (const cls of classes) {
      const sections = await prisma.section.findMany({
        where: { classId: cls.id },
        include: { _count: { select: { students: true } } }
      });

      const grouped = {};
      sections.forEach(s => {
        if (!grouped[s.name]) grouped[s.name] = [];
        grouped[s.name].push(s);
      });

      const duplicates = Object.entries(grouped).filter(([name, secs]) => secs.length > 1);
      
      if (duplicates.length > 0) {
        console.log(`\n❌ CLASS: ${cls.name}`);
        duplicates.forEach(([name, secs]) => {
          console.log(`  Section "${name}" has ${secs.length} duplicates:`);
          secs.forEach(s => {
            console.log(`    ID ${s.id}: ${s._count.students} students`);
          });
        });
      }
    }

    console.log('\n\n✅ SUMMARY:\n');
    
    // Count total duplicates
    let totalDuplicates = 0;
    for (const cls of classes) {
      const sections = await prisma.section.findMany({
        where: { classId: cls.id }
      });
      const grouped = {};
      sections.forEach(s => {
        if (!grouped[s.name]) grouped[s.name] = 0;
        grouped[s.name]++;
      });
      const dups = Object.values(grouped).filter(count => count > 1).length;
      totalDuplicates += dups;
    }

    console.log(`Total duplicate section names: ${totalDuplicates}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
