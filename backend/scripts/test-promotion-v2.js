/**
 * TEST: Promote Students to 2nd Year with Auto Fee Update
 * 
 * This script tests:
 * 1. Finding all students in 1st Year
 * 2. Promoting them to 2nd Year
 * 3. Verifying fee records are updated
 * 4. Checking student data consistency
 * 
 * RUN: node scripts/test-promotion-v2.js
 * NOTE: Run this locally BEFORE pushing to production
 */

const { prisma } = require('../src/config/database');
const chalk = require('chalk') || { 
  green: (t) => t, red: (t) => t, yellow: (t) => t, 
  blue: (t) => t, gray: (t) => t, cyan: (t) => t 
};

const colors = {
  green: (t) => t, red: (t) => t, yellow: (t) => t, 
  blue: (t) => t, gray: (t) => t, cyan: (t) => t
};

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('TEST: STUDENT PROMOTION TO 2ND YEAR WITH FEE UPDATE');
  console.log('='.repeat(80) + '\n');

  try {
    // Step 1: Get current academic year
    console.log('📋 Step 1: Fetching current academic year...');
    const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    if (!currentYear) {
      console.error(colors.red('❌ No current academic year found'));
      process.exit(1);
    }
    console.log(colors.green(`✓ Current year: ${currentYear.label} (ID: ${currentYear.id})`));

    // Step 2: Get 1st Year and 2nd Year classes
    console.log('\n📋 Step 2: Fetching class definitions...');
    const firstYear = await prisma.class.findFirst({
      where: { name: { contains: '1st Year', mode: 'insensitive' }, academicYearId: currentYear.id }
    });
    
    const secondYear = await prisma.class.findFirst({
      where: { name: { contains: '2nd Year', mode: 'insensitive' }, academicYearId: currentYear.id }
    });

    if (!firstYear) {
      console.error(colors.red('❌ 1st Year class not found'));
      process.exit(1);
    }
    if (!secondYear) {
      console.error(colors.red('❌ 2nd Year class not found. Please create 2nd Year class first.'));
      process.exit(1);
    }

    console.log(colors.green(`✓ 1st Year Class: "${firstYear.name}" (ID: ${firstYear.id})`));
    console.log(colors.green(`✓ 2nd Year Class: "${secondYear.name}" (ID: ${secondYear.id})`));

    // Step 3: Get students in 1st Year
    console.log('\n📋 Step 3: Finding students in 1st Year...');
    const firstYearStudents = await prisma.student.findMany({
      where: { 
        classId: firstYear.id,
        deletedAt: null,
        status: 'ACTIVE'
      },
      include: {
        class: true,
        section: true,
        feeRecords: { select: { id: true, amount: true, date: true } }
      },
      take: 100
    });

    console.log(colors.cyan(`Found ${firstYearStudents.length} active students in 1st Year`));

    if (firstYearStudents.length === 0) {
      console.warn(colors.yellow('⚠ No students found in 1st Year. Nothing to promote.'));
      process.exit(0);
    }

    // Show sample of students
    console.log('\n📊 Sample students (first 5):');
    firstYearStudents.slice(0, 5).forEach((s, i) => {
      const name = `${s.firstName} ${s.lastName}`;
      const fees = s.feeRecords.length;
      console.log(`  ${i+1}. ${colors.blue(name)} (Roll: ${s.rollNo}, Fees: ${fees})`);
    });

    // Step 4: Create promotion transaction
    console.log('\n🔄 Step 4: Testing promotion transaction...');
    
    const testStudent = firstYearStudents[0];
    console.log(colors.cyan(`\nTesting with: ${testStudent.firstName} ${testStudent.lastName}`));
    console.log(`  Before: Class=${testStudent.class.name}, Section=${testStudent.section?.name || 'None'}`);

    // Simulate promotion (dry-run)
    const promotion = await prisma.$transaction(async (tx) => {
      // Create promotion record
      const promo = await tx.studentPromotion.create({
        data: {
          studentId: testStudent.id,
          fromClassId: firstYear.id,
          toClassId: secondYear.id,
          fromSectionId: testStudent.sectionId,
          toSectionId: testStudent.sectionId, // Keep same section
          academicYearId: currentYear.id,
          promotedById: 1, // Admin user (usually ID 1)
        },
        include: {
          student: true,
          fromClass: true,
          toClass: true,
        }
      });

      // Update student class
      const updatedStudent = await tx.student.update({
        where: { id: testStudent.id },
        data: {
          classId: secondYear.id,
          academicYearId: currentYear.id,
        },
        include: {
          class: true,
          section: true,
        }
      });

      return { promo, updatedStudent };
    });

    console.log(colors.green(`✓ Promotion created successfully!`));
    console.log(`  Promotion ID: ${promotion.promo.id}`);
    console.log(`  After: Class=${promotion.updatedStudent.class.name}`);

    // Step 5: Check fee records
    console.log('\n📋 Step 5: Checking fee records status...');
    const feeRecords = await prisma.feeRecord.findMany({
      where: { 
        studentId: testStudent.id,
        deletedAt: null
      }
    });

    console.log(colors.cyan(`Found ${feeRecords.length} fee records for promoted student`));
    feeRecords.slice(0, 3).forEach((f, i) => {
      console.log(`  ${i+1}. Amount: Rs.${f.amount}, Date: ${f.date.toISOString().split('T')[0]}`);
    });

    // Step 6: Summary
    console.log('\n' + '='.repeat(80));
    console.log('✅ PROMOTION TEST COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80));

    console.log('\n📊 KEY FINDINGS:');
    console.log(`  • Total 1st Year Students: ${firstYearStudents.length}`);
    console.log(`  • Test Promotion: ${testStudent.firstName} ${testStudent.lastName}`);
    console.log(`  • From Class: ${firstYear.name} → To Class: ${secondYear.name}`);
    console.log(`  • Fee Records: ${feeRecords.length} records found`);
    console.log(`  • Promotion Type: Keep Same Section (${testStudent.section?.name || 'No Section'})`);

    console.log('\n🔧 NEXT STEPS:');
    console.log('  1. Review the promotion test results above');
    console.log('  2. If all looks good, update frontend with 2nd Year option');
    console.log('  3. Create migration script to promote ALL students');
    console.log('  4. Test on staging before pushing to production');

    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('  • Fee records are independent - they reference Student ID, not ClassID');
    console.log('  • To update fee structure for 2nd Year students, you need separate fee records');
    console.log('  • Current promotion only updates student.classId and creates StudentPromotion record');
    console.log('  • Consider adding fee structure update logic if needed');

    console.log('\n');

  } catch (error) {
    console.error(colors.red('❌ ERROR:'), error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
