require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  SOFT DELETING ALL EXISTING STUDENTS\n');
  console.log('='.repeat(60));

  try {
    // Soft delete all active students
    const result = await prisma.student.updateMany({
      where: { 
        deletedAt: null,
        isActive: true
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
        status: 'INACTIVE'
      }
    });

    console.log(`\n✓ Soft deleted students: ${result.count}`);

    // Show current status
    const activeCount = await prisma.student.count({
      where: { deletedAt: null }
    });
    
    const deletedCount = await prisma.student.count({
      where: { deletedAt: { not: null } }
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ SOFT DELETE COMPLETE`);
    console.log(`${'='.repeat(60)}`);
    console.log(`\nActive students (non-deleted): ${activeCount}`);
    console.log(`Soft deleted students: ${deletedCount}\n`);

  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error(e);
  }

  await prisma.$disconnect();
}

main();
