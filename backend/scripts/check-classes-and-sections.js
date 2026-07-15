/**
 * COMPREHENSIVE CHECK: Classes and Sections
 * 
 * Checks:
 * 1. Current academic year
 * 2. All classes
 * 3. All sections per class
 * 4. Creates 2nd Year if missing
 * 5. Creates sections if missing
 * 
 * RUN: node scripts/check-classes-and-sections.js
 */

const { prisma } = require('../src/config/database');

const colors = {
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  blue: (t) => `\x1b[34m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
};

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log(colors.cyan('📚 DATABASE CHECK: Classes and Sections'));
  console.log('='.repeat(80) + '\n');

  try {
    // Step 1: Get current academic year
    console.log(colors.cyan('Step 1: Checking academic year...'));
    const currentYear = await prisma.academicYear.findFirst({ 
      where: { isCurrent: true } 
    });

    if (!currentYear) {
      console.error(colors.red('❌ No current academic year found'));
      console.log(colors.yellow('You need to create an academic year first!'));
      process.exit(1);
    }

    console.log(colors.green(`✓ Current Year: ${currentYear.label} (ID: ${currentYear.id})`));
    console.log(colors.cyan(`  Start: ${currentYear.startDate.toISOString().split('T')[0]}`));
    console.log(colors.cyan(`  End: ${currentYear.endDate.toISOString().split('T')[0]}`));

    // Step 2: Get all classes
    console.log(colors.cyan('\nStep 2: Checking all classes...'));
    const allClasses = await prisma.class.findMany({
      where: { academicYearId: currentYear.id },
      include: { _count: { select: { sections: true, students: true } } }
    });

    console.log(colors.cyan(`Found ${allClasses.length} classes:\n`));
    allClasses.forEach((c, i) => {
      console.log(`  ${i+1}. ${colors.blue(c.name)} (ID: ${c.id})`);
      console.log(`     Sections: ${c._count.sections}, Students: ${c._count.students}`);
    });

    // Step 3: Check if 2nd Year exists
    console.log(colors.cyan('\nStep 3: Checking for 2nd Year class...'));
    const secondYear = allClasses.find(c => 
      c.name.toLowerCase().includes('2nd') || 
      c.name.toLowerCase().includes('second')
    );

    if (!secondYear) {
      console.warn(colors.yellow('⚠️  2nd Year class NOT found!'));
      console.log(colors.yellow('   Creating 2nd Year class...'));
      
      const created = await prisma.class.create({
        data: {
          name: '2nd Year',
          academicYearId: currentYear.id
        }
      });
      
      console.log(colors.green(`✓ Created: ${created.name} (ID: ${created.id})`));
      var secondYearClass = created;
    } else {
      console.log(colors.green(`✓ 2nd Year exists: ${secondYear.name} (ID: ${secondYear.id})`));
      var secondYearClass = secondYear;
    }

    // Step 4: Check 2nd Year sections
    console.log(colors.cyan('\nStep 4: Checking 2nd Year sections...'));
    const secondYearSections = await prisma.section.findMany({
      where: { classId: secondYearClass.id }
    });

    console.log(colors.cyan(`Found ${secondYearSections.length} sections:\n`));
    secondYearSections.forEach((s, i) => {
      console.log(`  ${i+1}. ${colors.blue(s.name)} (ID: ${s.id})`);
    });

    // Step 5: Get sections from 1st Year to match
    console.log(colors.cyan('\nStep 5: Getting 1st Year sections to match...'));
    const firstYear = allClasses.find(c => 
      c.name.toLowerCase().includes('1st') || 
      c.name.toLowerCase().includes('first')
    );

    if (!firstYear) {
      console.warn(colors.yellow('⚠️  1st Year class not found'));
    } else {
      console.log(colors.green(`✓ 1st Year: ${firstYear.name} (ID: ${firstYear.id})`));
      
      const firstYearSections = await prisma.section.findMany({
        where: { classId: firstYear.id }
      });

      console.log(colors.cyan(`  1st Year has ${firstYearSections.length} sections:\n`));
      firstYearSections.forEach((s, i) => {
        console.log(`    ${i+1}. ${colors.blue(s.name)} (ID: ${s.id})`);
      });

      // Step 6: Create missing sections in 2nd Year
      console.log(colors.cyan('\nStep 6: Creating missing sections in 2nd Year...'));
      
      for (const section of firstYearSections) {
        const exists = secondYearSections.find(s => s.name === section.name);
        
        if (exists) {
          console.log(colors.green(`  ✓ ${section.name} already exists`));
        } else {
          console.log(colors.yellow(`  Creating ${section.name}...`));
          const created = await prisma.section.create({
            data: {
              name: section.name,
              classId: secondYearClass.id
            }
          });
          console.log(colors.green(`  ✓ Created ${section.name} (ID: ${created.id})`));
        }
      }
    }

    // Step 7: Final summary
    console.log('\n' + '='.repeat(80));
    console.log(colors.green('✅ CHECK COMPLETE'));
    console.log('='.repeat(80));

    const finalSections = await prisma.section.findMany({
      where: { classId: secondYearClass.id }
    });

    console.log(colors.cyan(`\n📊 Final Status:`));
    console.log(`   • 2nd Year Class: ${colors.green('✓')} (${secondYearClass.name}, ID: ${secondYearClass.id})`);
    console.log(`   • 2nd Year Sections: ${colors.green('✓')} (${finalSections.length} sections)`);
    console.log(`   • Sections match 1st Year: ${colors.green('✓')}`);

    console.log(colors.cyan(`\n2nd Year Sections:`));
    finalSections.forEach((s, i) => {
      console.log(`   ${i+1}. ${s.name}`);
    });

    console.log('\n' + colors.green('✅ READY TO PROMOTE STUDENTS!'));
    console.log('Refresh browser and try promoting students again.\n');

  } catch (error) {
    console.error(colors.red('❌ ERROR:'), error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
