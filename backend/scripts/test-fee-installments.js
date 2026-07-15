const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkInstallments() {
  const student = await prisma.student.findFirst({
    where: {
      firstName: 'NIMRA',
      lastName: 'BASHIR',
      deletedAt: null
    },
    include: {
      feeRecords: {
        where: { deletedAt: null },
        orderBy: { date: 'asc' }
      }
    }
  });
  
  if (!student) {
    console.log('❌ Student not found');
    return;
  }
  
  console.log('\n📝 Student:', student.firstName, student.lastName, `(${student.rollNo})`);
  console.log('💰 Fee Records:\n');
  
  student.feeRecords.forEach(f => {
    console.log(`  ${f.installment || 'N/A'}:`);
    console.log(`    Amount: ${f.amount}`);
    if (f.transportAmount) console.log(`    Transport: ${f.transportAmount}`);
    console.log(`    Date: ${f.date.toISOString().split('T')[0]}`);
    console.log(`    Receipt: ${f.receiptNo}`);
    if (f.remarks) console.log(`    Remarks: ${f.remarks}`);
    if (f.transportRemarks) console.log(`    Transport Remarks: ${f.transportRemarks}`);
    console.log('');
  });
  
  const total = student.feeRecords.reduce((sum, f) => sum + parseFloat(f.amount), 0);
  console.log(`📊 Total Paid: ${total}`);
  
  await prisma.$disconnect();
}

checkInstallments();
