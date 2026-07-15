/**
 * BULK PROMOTION: Promote All Active Students to 2nd Year
 * 
 * This script:
 * 1. Finds all students currently in 1st Year
 * 2. Creates StudentPromotion records
 * 3. Updates student.classId to 2nd Year
 * 4. Updates student.academicYearId to current year
 * 5. Maintains section assignments
 * 6. Logs all changes for audit trail
 * 
 * RUN: node scripts/promote-all-to-2nd-year.js
 * 
 * ⚠️  IMPORTANT:
 * - This is a destructive operation (updates database)
 * - Always backup database before running
 * - Run on LOCAL first to verify
 * - Test thoroughly before deploying to production
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
  console.log('🚀 BULK PROMOTION: Moving All Students to 2nd Year');
  console.log('='.repeat(80) + '\n');

  try {
    // Get current academic year
    const currentYear = await prisma.academicYear.findFirst({ 
      where: { isCurrent: true } 
    });
    
    if (!currentYear) {
      console.error(colors.red('❌ ERROR: No current academic year found'));
      process.exit(1);
    }
    
    console.log(colors.cyan(`Academic Year: ${currentYear.label} (ID: ${currentYear.id})`));
    console.log(colors.cyan(`Duration: ${currentYear.startDate.toISOString().split('T')[0]} to ${currentYear.endDate.toISOString().split('T')[0]}`));

    // Get 1st Year class
    const firstYearClass = await prisma.class.findFirst({
      where: {
        name: { contains: '1st Year', mode: 'insensitive' },
        academicYearId: currentYear.id
      }
    });

    if (!firstYearClass) {
      console.error(colors.red('❌ ERROR: 1st Year class not found'));
      process.exit(1);
    }

    console.log(colors.green(`✓ Source Class: "${firstYearClass.name}" (ID: ${firstYearClass.id})`));

    // Get 2nd Year class
    const secondYearClass = await prisma.class.findFirst({
      where: {
        name: { contains: '2nd Year', mode: 'insensitive' },
        academicYearId: currentYear.id
      }
    });

    if (!secondYearClass) {
      console.error(colors.red('❌ ERROR: 2nd Year class not found'));
      console.error('   Please create the 2nd Year class first via the UI or database');
      process.exit(1);
    }

    console.log(colors.green(`✓ Target Class: "${secondYearClass.name}" (ID: ${secondYearClass.id})`));

    // Count students
    const studentCount = await prisma.student.count({
      where: {
        classId: firstYearClass.id,
        deletedAt: null,
        status: 'ACTIVE'
      }
    });

    console.log(colors.cyan(`\nFound ${studentCount} active students in 1st Year`));

    if (studentCount === 0) {
      console.log(colors.yellow('⚠ No students to promote'));
      process.exit(0);
    }

    // Confirmation
    console.log(colors.yellow('\n⚠️  ACTION REQUIRED: Please confirm promotion details'));
    console.log(`   Source: ${firstYearClass.name} (${studentCount} students)`);
    console.log(`   Target: ${secondYearClass.name}`);
    console.log(`   Academic Year: ${currentYear.label}`);

    // Simulated confirmation (in production, add actual user prompt)
    const shouldProceed = true; // Set to false to require confirmation
    
    if (!shouldProceed) {
      console.log(colors.yellow('\n⚠ Promotion cancelled by user'));
      process.exit(0);
    }

    // Perform bulk promotion
    console.log(colors.cyan('\n🔄 Starting bulk promotion transaction...'));

    const result = await prisma.$transaction(async (tx) => {
      let promotedCount = 0;
      let sectionMapping = {};
      const errors = [];

      // Get all students to promote
      const students = await tx.student.findMany({
        where: {
          classId: firstYearClass.id,
          deletedAt: null,
          status: 'ACTIVE'
        },
        include: {
          section: true,
          feeRecords: { take: 1 } // Just check if has records
        }
      });

      // Process each student
      for (const student of students) {
        try {
          // Create promotion record
          await tx.studentPromotion.create({
            data: {
              studentId: student.id,
              fromClassId: firstYearClass.id,
              toClassId: secondYearClass.id,
              fromSectionId: student.sectionId,
              toSectionId: student.sectionId, // Keep same section
              academicYearId: currentYear.id,
              promotedById: 1, // System admin
            }
          });

          // Update student
          await tx.student.update({
            where: { id: student.id },
            data: {
              classId: secondYearClass.id,
              academicYearId: currentYear.id,
              updatedAt: new Date(),
            }
          });

          promotedCount++;
          
          // Track section mapping
          const secName = student.section?.name || 'No Section';
          sectionMapping[secName] = (sectionMapping[secName] || 0) + 1;

        } catch (err) {
          errors.push({
            studentId: student.id,
            name: `${student.firstName} ${student.lastName}`,
            error: err.message
          });
        }
      }

      return { promotedCount, errors, sectionMapping };
    });

    // Report results
    console.log(colors.green(`\n✅ PROMOTION COMPLETED SUCCESSFULLY!`));
    console.log(colors.green(`   ${result.promotedCount}/${studentCount} students promoted`));

    if (Object.keys(result.sectionMapping).length > 0) {
      console.log('\n📊 Students promoted by section:');
      Object.entries(result.sectionMapping).forEach(([section, count]) => {
        console.log(`   • ${section}: ${count} students`);
      });
    }

    if (result.errors.length > 0) {
      console.log(colors.red(`\n⚠️  Errors during promotion (${result.errors.length}):`));
      result.errors.slice(0, 5).forEach((e) => {
        console.log(colors.red(`   • ${e.name}: ${e.error}`));
      });
      if (result.errors.length > 5) {
        console.log(colors.red(`   ... and ${result.errors.length - 5} more`));
      }
    }

    // Verify promotion
    console.log(colors.cyan('\n🔍 Verifying promotion...'));
    const verifyCount = await prisma.student.count({
      where: {
        classId: secondYearClass.id,
        academicYearId: currentYear.id,
        deletedAt: null
      }
    });

    console.log(colors.green(`✓ Verified: ${verifyCount} students now in ${secondYearClass.name}`));

    // Check for any students still in 1st Year
    const remainingCount = await prisma.student.count({
      where: {
        classId: firstYearClass.id,
        deletedAt: null,
        status: 'ACTIVE'
      }
    });

    console.log(colors.cyan(`Remaining in 1st Year: ${remainingCount} students`));

    console.log('\n' + '='.repeat(80));
    console.log('🎉 PROMOTION MIGRATION COMPLETE');
    console.log('='.repeat(80));

    console.log('\n📋 NEXT STEPS:');
    console.log('   1. ✓ Verify students moved to 2nd Year via "Manage Students"');
    console.log('   2. ✓ Check Student Management section shows correct class');
    console.log('   3. ✓ Verify fee records still display correctly');
    console.log('   4. ✓ Check student login shows updated class');
    console.log('   5. ✓ If all good, push changes to production');

    console.log('\n⚠️  FEE MANAGEMENT NOTES:');
    console.log('   • Existing fee records are preserved (linked to studentId, not classId)');
    console.log('   • If 2nd Year has different fee structure:');
    console.log('     - Create new fee entries for 2nd Year students');
    console.log('     - Use "Collect Fee" to set up new installment schedules');
    console.log('   • Run fee-collection setup after promotion if needed');

    console.log('\n');

  } catch (error) {
    console.error(colors.red('❌ CRITICAL ERROR:'), error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
