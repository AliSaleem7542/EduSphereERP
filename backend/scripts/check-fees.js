const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFees() {
  try {
    const total = await prisma.feeRecord.count();
    console.log(`Total Fee Records: ${total}`);
    
    const byStatus = await prisma.feeRecord.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    
    console.log('\nBy Status:');
    byStatus.forEach(row => {
      console.log(`  ${row.status}: ${row._count.id}`);
    });
    
    const uniqueStudents = await prisma.feeRecord.findMany({
      distinct: ['studentId'],
      select: { studentId: true }
    });
    
    console.log(`\nUnique Students with Fees: ${uniqueStudents.length}`);
    
    const pending = await prisma.feeRecord.findMany({
      where: { status: 'PARTIAL' },
      include: { student: { select: { rollNo: true, firstName: true, lastName: true, section: { select: { name: true } } } } },
      take: 10
    });
    
    console.log(`\nSample Outstanding Students (showing 10):`);
    pending.forEach(fee => {
      const name = `${fee.student.firstName} ${fee.student.lastName}`;
      console.log(`  ${fee.student.section.name}-${fee.student.rollNo}: ${name} - Outstanding: ${fee.amount}`);
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFees();
