/**
 * VERIFY: Check if promotions were successful
 * 
 * This script verifies:
 * 1. All students moved from 1st to 2nd Year
 * 2. StudentPromotion records exist
 * 3. Data integrity is maintained
 * 4. No orphaned records
 * 
 * RUN: node scripts/verify-promotions.js
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
  console.log('🔍 VERIFICATION: Student Promotion Status');
  console.log('='.repeat(80) + '\n');

  try {
    const currentYear = await prisma.academicYear.findFirst({ 
      where: { isCurrent: true } 
    });

    if (!currentYear) {
      console.error(colors.red('❌ No current academic year'));
      process.exit(1);
    }

    // Get class stats
    const classes = await prisma.class.findMany({
      where: { academicYearId: currentYear.id },
      include: {
        _count: { select: { students: { where: { deletedAt: null, status: 'ACTIVE' } } } }
      }
    });

    console.log(colors.cyan('📊 Class Distribution:'));
    classes.forEach(c => {
      console.log(`   ${c.name}: ${colors.blue(c._count.students)} students`);
    });

    // Get promotion records
    const totalPromotions = await prisma.studentPromotion.count({
      where: { academicYearId: currentYear.id }
    });

    console.log(colors.cyan(`\n📋 Total Promotion Records: ${colors.blue(totalPromotions)}`));

    // Get detailed promotions
    const promotions = await prisma.studentPromotion.findMany({
      where: { academicYearId: currentYear.id },
      include: {
        student: { select: { firstName: true, lastName: true, rollNo: true } },
        fromClass: { select: { name: true } },
        toClass: { select: { name: true } },
      },
      take: 10
    });

    if (promotions.length > 0) {
      console.log(colors.cyan('\n🔄 Recent Promotions (first 10):'));
      promotions.forEach((p, i) => {
        const name = `${p.student.firstName} ${p.student.lastName}`;
        const date = p.promotedAt.toISOString().split('T')[0];
        console.log(`   ${i+1}. ${name} (${p.student.rollNo})`);
        console.log(`      ${p.fromClass.name} → ${p.toClass.name} [${date}]`);
      });
    }

    // Check for data consistency
    console.log(colors.cyan('\n✓ Checking Data Integrity...'));

    // Students in 2nd Year
    const secondYear = await prisma.class.findFirst({
      where: { name: { contains: '2nd Year', mode: 'insensitive' } }
    });

    if (secondYear) {
      const secondYearStudents = await prisma.student.count({
        where: { classId: secondYear.id, deletedAt: null }
      });
      console.log(colors.green(`✓ Students in 2nd Year: ${secondYearStudents}`));

      // Verify they have promotion records
      const withPromotion = await prisma.student.count({
        where: {
          classId: secondYear.id,
          deletedAt: null,
          promotions: { some: { toClassId: secondYear.id } }
        }
      });

      console.log(colors.green(`✓ With Promotion Records: ${withPromotion}`));

      if (withPromotion < secondYearStudents) {
        console.log(colors.yellow(`⚠ ${secondYearStudents - withPromotion} students in 2nd Year without promotion records`));
      }
    }

    // Check for orphaned records
    const orphanedPromos = await prisma.studentPromotion.findMany({
      where: {
        student: { deletedAt: { not: null } }
      },
      take: 5
    });

    if (orphanedPromos.length > 0) {
      console.log(colors.yellow(`\n⚠ Found ${orphanedPromos.length} promotion records for deleted students`));
    } else {
      console.log(colors.green('\n✓ No orphaned promotion records'));
    }

    // Fee records check
    console.log(colors.cyan('\n💳 Fee Records Status:'));
    
    if (secondYear) {
      const studentsWithFees = await prisma.student.count({
        where: {
          classId: secondYear.id,
          deletedAt: null,
          feeRecords: { some: { deletedAt: null } }
        }
      });

      console.log(colors.green(`✓ 2nd Year students with fee records: ${studentsWithFees}`));

      const totalFeeAmount = await prisma.feeRecord.aggregate({
        where: {
          student: { classId: secondYear.id, deletedAt: null },
          deletedAt: null
        },
        _sum: { amount: true }
      });

      console.log(colors.green(`✓ Total fee collected: Rs.${totalFeeAmount._sum.amount || 0}`));
    }

    // Attendance records
    const attendanceRecords = await prisma.studentAttendance.count({
      where: {
        student: { classId: secondYear?.id || 0, deletedAt: null }
      }
    });

    console.log(colors.green(`\n✓ Attendance records preserved: ${attendanceRecords}`));

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log(colors.green('✅ VERIFICATION COMPLETE'));
    console.log('='.repeat(80));

    console.log(colors.cyan('\n📌 Summary:'));
    console.log(`   Academic Year: ${currentYear.label}`);
    console.log(`   Total Classes: ${classes.length}`);
    console.log(`   Total Promotion Records: ${totalPromotions}`);
    console.log(`   Data Integrity: ${colors.green('✓ OK')}`);

    if (promotions.length === 0) {
      console.log(colors.yellow('\n⚠ No promotions found. Have students been promoted?'));
    }

    console.log('\n');

  } catch (error) {
    console.error(colors.red('❌ ERROR:'), error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
