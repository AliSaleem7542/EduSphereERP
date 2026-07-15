require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 FINDING AND REMOVING DUPLICATES\n');
  console.log('='.repeat(60));

  try {
    // Find all students grouped by rollNo
    const allStudents = await prisma.student.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`\n📊 Total students before cleanup: ${allStudents.length}`);

    // Group by rollNo
    const byRollNo = {};
    allStudents.forEach(stu => {
      if (!byRollNo[stu.rollNo]) {
        byRollNo[stu.rollNo] = [];
      }
      byRollNo[stu.rollNo].push(stu);
    });

    // Find duplicates
    const duplicates = Object.entries(byRollNo)
      .filter(([_, students]) => students.length > 1)
      .map(([rollNo, students]) => ({ rollNo, count: students.length, ids: students.map(s => s.id) }));

    console.log(`\n⚠️  Found ${duplicates.length} duplicate roll numbers\n`);

    if (duplicates.length > 0) {
      console.log('Duplicates (keeping first, removing rest):\n');
      duplicates.slice(0, 10).forEach(dup => {
        console.log(`  Roll No ${dup.rollNo}: ${dup.count} copies - Removing ${dup.count - 1} copies`);
      });

      if (duplicates.length > 10) {
        console.log(`  ... and ${duplicates.length - 10} more\n`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('🗑️  Removing duplicates...\n');

    let deletedCount = 0;

    // For each duplicate, keep first and delete rest
    for (const dup of duplicates) {
      const idsToDelete = dup.ids.slice(1); // Keep first, delete rest
      
      for (const id of idsToDelete) {
        await prisma.student.update({
          where: { id },
          data: { deletedAt: new Date() }
        });
        deletedCount++;
        process.stdout.write('.');
      }
    }

    console.log(`\n\n✅ CLEANUP COMPLETE!`);
    console.log(`${'='.repeat(60)}`);

    // Final count
    const finalCount = await prisma.student.count({
      where: { deletedAt: null }
    });

    console.log(`\n✓ Deleted (marked): ${deletedCount} duplicate records`);
    console.log(`✓ Remaining students: ${finalCount}\n`);

    console.log(`${'='.repeat(60)}\n`);

  } catch (e) {
    console.error('❌ Error:', e.message);
  }

  await prisma.$disconnect();
}

main();
