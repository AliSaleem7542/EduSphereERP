require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Removing duplicates by (rollNo, sectionId)...\n');

  try {
    // Get all students ordered by creation time
    const allStudents = await prisma.student.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: { id: true, rollNo: true, sectionId: true, firstName: true }
    });

    // Track which (rollNo, sectionId) combos we've seen
    const seen = new Set();
    const toDelete = [];

    for (const student of allStudents) {
      const key = `${student.rollNo}_${student.sectionId}`;
      if (seen.has(key)) {
        toDelete.push(student.id);
        process.stdout.write('✗');
      } else {
        seen.add(key);
        process.stdout.write('.');
      }
    }

    console.log(`\n\nFound ${toDelete.length} duplicates to delete\n`);

    // Hard delete duplicates
    if (toDelete.length > 0) {
      const result = await prisma.student.deleteMany({
        where: { id: { in: toDelete } }
      });

      console.log(`✅ Hard deleted: ${result.count} duplicate records\n`);
    }

    // Final count
    const finalCount = await prisma.student.count({ where: { deletedAt: null } });
    console.log(`${'='.repeat(50)}`);
    console.log(`📊 FINAL COUNT: ${finalCount} active students\n`);

    await prisma.$disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
