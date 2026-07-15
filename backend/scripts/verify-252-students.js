require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 VERIFYING STUDENT DATA INTEGRITY\n');
  console.log('='.repeat(70));

  try {
    // Count active and deleted students
    const activeCount = await prisma.student.count({
      where: { deletedAt: null }
    });

    const deletedCount = await prisma.student.count({
      where: { deletedAt: { not: null } }
    });

    console.log(`\n📊 Overall Statistics:`);
    console.log(`  • Active (non-deleted) students: ${activeCount}`);
    console.log(`  • Soft-deleted students: ${deletedCount}`);
    console.log(`  • Total in DB: ${activeCount + deletedCount}`);

    // Check for duplicates (by rollNo among active students)
    const duplicateRollNos = await prisma.$queryRaw`
      SELECT "rollNo", COUNT(*) as count
      FROM students
      WHERE "deletedAt" IS NULL
      GROUP BY "rollNo"
      HAVING COUNT(*) > 1
    `;

    console.log(`\n⚠️  Duplicate Roll Numbers:`);
    if (duplicateRollNos.length === 0) {
      console.log(`  ✓ No duplicates found!`);
    } else {
      console.log(`  ❌ Found ${duplicateRollNos.length} duplicate roll numbers:`);
      duplicateRollNos.forEach(row => {
        console.log(`    - Roll ${row.rollNo}: ${row.count} occurrences`);
      });
    }

    // Breakdown by class
    const byClass = await prisma.class.findMany({
      select: {
        name: true,
        _count: {
          select: { students: { where: { deletedAt: null } } }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`\n📚 Breakdown by Class:`);
    let totalByClass = 0;
    byClass.forEach(cls => {
      console.log(`  • ${cls.name}: ${cls._count.students} students`);
      totalByClass += cls._count.students;
    });

    // Check for missing roll numbers
    console.log(`\n🔎 Expected vs Actual:`);
    const expected = {
      'C-1': 33,
      'M-1': 44,
      'C-2': 10,
      'E-1': 4,
      'I.Com 1': 4,
      'IT-1': 3,
      'M-4': 25,
      'E-2': 19,
      'C-3': 40,
      'C-4': 34,
      'C-5': 19,
      'IT-2': 14
    };

    let totalExpected = 0;
    let matches = 0;
    for (const [className, expectedCount] of Object.entries(expected)) {
      const actual = byClass.find(c => c.name === className)?._count.students || 0;
      const status = actual === expectedCount ? '✓' : '✗';
      console.log(`  ${status} ${className}: ${actual}/${expectedCount}`);
      totalExpected += expectedCount;
      if (actual === expectedCount) matches++;
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`FINAL STATUS:`);
    console.log(`${'='.repeat(70)}`);
    console.log(`  • Expected total: ${totalExpected}`);
    console.log(`  • Actual total: ${activeCount}`);
    console.log(`  • Classes matching: ${matches}/${Object.keys(expected).length}`);
    console.log(`  • Has duplicates: ${duplicateRollNos.length > 0 ? 'YES ❌' : 'NO ✓'}`);

    if (activeCount === 252 && duplicateRollNos.length === 0 && matches === Object.keys(expected).length) {
      console.log(`\n✅ ALL CHECKS PASSED - DATA IS CLEAN!\n`);
    } else {
      console.log(`\n⚠️  REVIEW REQUIRED - SOME CHECKS FAILED\n`);
    }

  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error(e);
  }

  await prisma.$disconnect();
}

main();
