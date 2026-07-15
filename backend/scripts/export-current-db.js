/**
 * EXPORT CURRENT DATABASE STATE
 * Exports all students currently in the database to a JSON file
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('EXPORTING CURRENT DATABASE STATE');
    console.log('='.repeat(70) + '\n');

    const students = await prisma.student.findMany({
      include: {
        class: true,
        section: true
      },
      orderBy: [{ class: { name: 'asc' } }, { section: { name: 'asc' } }, { rollNo: 'asc' }]
    });

    console.log(`Found ${students.length} students in database\n`);

    if (students.length > 0) {
      console.log('First 5 students:');
      students.slice(0, 5).forEach(s => {
        console.log(`  ${s.rollNo} - ${s.firstName} ${s.lastName} (${s.section.name})`);
      });
      console.log('...\n');
    }

    // Export to file
    const outputPath = path.join(__dirname, '..', '..', 'current-db-export.json');
    const exportData = {
      version: '1.0',
      date: new Date().toISOString(),
      totalStudents: students.length,
      data: students
    };

    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
    console.log(`✓ Exported to: current-db-export.json`);

    // Summary by section
    const sections = await prisma.section.findMany({
      include: {
        _count: { select: { students: true } },
        class: true
      },
      orderBy: { name: 'asc' }
    });

    console.log('\nStudents by section:');
    let total = 0;
    for (const sec of sections) {
      if (sec._count.students > 0) {
        console.log(`  ${sec.name}: ${sec._count.students}`);
        total += sec._count.students;
      }
    }
    console.log(`\nTOTAL: ${total}`);

    console.log('\n' + '='.repeat(70) + '\n');

  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
