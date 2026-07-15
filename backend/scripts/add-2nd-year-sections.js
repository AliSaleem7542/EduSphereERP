const { prisma } = require('../src/config/database');

const SECTIONS = [
  'C-1', 'C-2', 'C-3', 'C-4', 'C-5',  // Commerce
  'M-1', 'M-4',                        // Math
  'E-1', 'E-2',                        // Engineering
  'I.Com 1',                           // Islamic Commerce
  'IT-1', 'IT-2'                       // IT
];

(async () => {
  try {
    console.log('🔍 Adding sections to 2nd Year class...\n');

    // Get 2nd Year class
    const class2nd = await prisma.class.findFirst({
      where: { name: '2nd Year' }
    });

    if (!class2nd) {
      console.log('❌ 2nd Year class not found!');
      console.log('First, creating 2nd Year class...\n');
      
      // Get current academic year
      const currentYear = await prisma.academicYear.findFirst({
        where: { isCurrent: true }
      });
      
      if (!currentYear) {
        console.error('❌ No current academic year found');
        process.exit(1);
      }

      // Create 2nd Year class
      const newClass = await prisma.class.create({
        data: {
          name: '2nd Year',
          academicYearId: currentYear.id
        }
      });
      console.log('✓ Created 2nd Year class (ID:', newClass.id, ')\n');
      class2nd = newClass;
    } else {
      console.log('✓ Found 2nd Year class (ID:', class2nd.id, ')\n');
    }

    // Get existing sections for 2nd Year
    const existingSections = await prisma.section.findMany({
      where: { classId: class2nd.id }
    });

    console.log('Current sections in 2nd Year:', existingSections.length);
    if (existingSections.length > 0) {
      existingSections.forEach(s => console.log('  -', s.name));
      console.log('');
    }

    // Add missing sections
    let addedCount = 0;
    for (const sectionName of SECTIONS) {
      const existing = existingSections.find(s => s.name === sectionName);
      
      if (existing) {
        console.log('✓ Section', sectionName, 'already exists (ID:', existing.id + ')');
      } else {
        const newSection = await prisma.section.create({
          data: {
            name: sectionName,
            classId: class2nd.id
          }
        });
        console.log('✓ Created section', sectionName, '(ID:', newSection.id + ')');
        addedCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log('  - Total sections in 2nd Year:', SECTIONS.length);
    console.log('  - New sections added:', addedCount);
    console.log('  - Already existed:', existingSections.length);

    // Verify all sections are there
    const allSections = await prisma.section.findMany({
      where: { classId: class2nd.id },
      orderBy: { name: 'asc' }
    });

    console.log('\n✅ Final sections in 2nd Year:');
    allSections.forEach(s => console.log('  -', s.name));

    console.log('\n✅ All sections added successfully!');
    console.log('\n📋 Now students from 1st Year can be promoted to 2nd Year');
    console.log('   with the same section names!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
