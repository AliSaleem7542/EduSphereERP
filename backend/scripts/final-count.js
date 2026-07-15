require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Count unique roll numbers per section
    const uniqueBySection = await prisma.$queryRaw`
      SELECT DISTINCT s."name" as section, COUNT(DISTINCT st."rollNo") as unique_roll_count
      FROM students st
      JOIN sections s ON st."sectionId" = s.id
      WHERE st."deletedAt" IS NULL
      GROUP BY s."name"
      ORDER BY s."name"
    `;

    console.log('\n📊 UNIQUE ROLL NUMBERS PER SECTION:\n');
    let totalUnique = 0;
    uniqueBySection.forEach(row => {
      console.log(`  ${row.section.padEnd(15)} : ${row.unique_roll_count} unique roll numbers`);
      totalUnique += row.unique_roll_count;
    });

    console.log(`\n  Total unique records: ${totalUnique}`);

    // Overall count
    const total = await prisma.student.count({ where: { deletedAt: null } });
    console.log(`  Total student records: ${total}`);
    console.log(`  Duplicate records: ${total - totalUnique}\n`);

  } catch (e) {
    console.error('Error:', e.message);
  }

  await prisma.$disconnect();
}

main();
