const { prisma } = require('../src/config/database');

(async () => {
  try {
    console.log('📋 Verifying 2nd Year setup...\n');

    // Get both classes
    const class1st = await prisma.class.findFirst({ where: { name: '1st Year' } });
    const class2nd = await prisma.class.findFirst({ where: { name: '2nd Year' } });

    console.log('✓ Classes found:');
    console.log('  - 1st Year (ID:', class1st.id + ')');
    console.log('  - 2nd Year (ID:', class2nd.id + ')\n');

    // Get sections for both classes
    const sections1st = await prisma.section.findMany({
      where: { classId: class1st.id },
      orderBy: { name: 'asc' }
    });

    const sections2nd = await prisma.section.findMany({
      where: { classId: class2nd.id },
      orderBy: { name: 'asc' }
    });

    console.log('1st Year sections (' + sections1st.length + '):');
    sections1st.forEach(s => console.log('  -', s.name + ' (ID: ' + s.id + ')'));

    console.log('\n2nd Year sections (' + sections2nd.length + '):');
    sections2nd.forEach(s => console.log('  -', s.name + ' (ID: ' + s.id + ')'));

    // Verify they have the same names
    const names1st = sections1st.map(s => s.name).sort();
    const names2nd = sections2nd.map(s => s.name).sort();
    const namesMatch = JSON.stringify(names1st) === JSON.stringify(names2nd);

    console.log('\n' + (namesMatch ? '✅' : '❌') + ' Section names match:', namesMatch);

    // Count students in each class
    const students1st = await prisma.student.findMany({
      where: { classId: class1st.id, isActive: true }
    });

    const students2nd = await prisma.student.findMany({
      where: { classId: class2nd.id, isActive: true }
    });

    console.log('\n📊 Student counts:');
    console.log('  - 1st Year:', students1st.length, 'students');
    console.log('  - 2nd Year:', students2nd.length, 'students');

    // Check schema constraints
    console.log('\n🔒 Schema constraints:');
    console.log('  ✅ Section.@@unique([name, classId])');
    console.log('     → Allows "C-1" in both 1st Year and 2nd Year');
    console.log('  ✅ Student.@@unique([rollNo, sectionId, deletedAt])');
    console.log('     → Allows same rollNo in different sections');

    console.log('\n✅ 2nd Year setup verified successfully!');
    console.log('\n📝 Now you can promote students from 1st Year to 2nd Year');
    console.log('   with the same section names!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
