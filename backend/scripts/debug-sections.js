const { prisma } = require('../src/config/database');

(async () => {
  try {
    console.log('🔍 Debugging sections loading...\n');
    
    // Get all classes
    const classes = await prisma.class.findMany();
    console.log('✓ Classes found:', classes.length);
    classes.forEach(c => console.log('  - ID:', c.id, 'Name:', c.name));
    
    if (classes.length === 0) {
      console.log('\n❌ No classes found in database!');
      process.exit(1);
    }
    
    // Get sections for first class
    const classId = classes[0].id;
    console.log('\n📋 Looking for sections with classId:', classId);
    
    const sections = await prisma.section.findMany({
      where: { classId: classId }
    });
    
    console.log('\n✓ Sections found:', sections.length);
    if (sections.length === 0) {
      console.log('❌ No sections found for this class!');
    } else {
      sections.forEach(s => console.log('  - ID:', s.id, 'Name:', s.name, 'ClassId:', s.classId));
    }
    
    // Also try with integer conversion
    console.log('\n🔄 Trying with parseInt...');
    const sectionsInt = await prisma.section.findMany({
      where: { classId: parseInt(classId) }
    });
    console.log('✓ Sections found (with parseInt):', sectionsInt.length);
    
  } catch(error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
