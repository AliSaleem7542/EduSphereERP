/**
 * VERIFY CURRENT DATABASE STATE
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('DATABASE CURRENT STATE VERIFICATION');
    console.log('='.repeat(70) + '\n');

    const totalCount = await prisma.student.count();
    console.log(`Total Students in DB: ${totalCount}\n`);

    const sections = await prisma.section.findMany({
      include: {
        _count: { select: { students: true } },
        class: true
      },
      orderBy: { name: 'asc' }
    });

    console.log('Students by Section:\n');
    let totalStudents = 0;
    for (const section of sections) {
      if (section._count.students > 0) {
        console.log(`  ${section.name} (${section.class.name}): ${section._count.students} students`);
        totalStudents += section._count.students;
      }
    }

    console.log(`\n  ═════════════════════════════════════`);
    console.log(`  TOTAL: ${totalStudents} students`);
    console.log(`  ═════════════════════════════════════\n`);

    // Check for duplicates
    const duplicates = await prisma.student.groupBy({
      by: ['rollNo'],
      _count: true,
      having: {
        rollNo: {
          _count: {
            gt: 1
          }
        }
      }
    });

    if (duplicates.length > 0) {
      console.log(`⚠️  DUPLICATES FOUND: ${duplicates.length} duplicate roll numbers`);
    } else {
      console.log('✓ No duplicates found');
    }

    console.log('\n' + '='.repeat(70) + '\n');

  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
