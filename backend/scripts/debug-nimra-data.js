/**
 * Debug NIMRA BASHIR's complete fee data
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 DEBUGGING NIMRA BASHIR FEE DATA\n');
  console.log('='.repeat(80));
  
  // Find NIMRA BASHIR
  const student = await prisma.student.findFirst({
    where: {
      firstName: { contains: 'NIMRA', mode: 'insensitive' },
      lastName: { contains: 'BASHIR', mode: 'insensitive' },
      deletedAt: null
    },
    include: {
      feeRecords: {
        where: { deletedAt: null },
        orderBy: { date: 'asc' }
      },
      class: true,
      section: true
    }
  });
  
  if (!student) {
    console.log('❌ Student not found!');
    return;
  }
  
  console.log('\n👤 STUDENT INFO:');
  console.log(`   ID: ${student.id}`);
  console.log(`   Name: ${student.firstName} ${student.lastName}`);
  console.log(`   Roll No: ${student.rollNo}`);
  console.log(`   Section: ${student.section ? student.section.name : 'N/A'}`);
  console.log(`   Annual Charges: Rs. ${Number(student.annualCharges || 0).toLocaleString()}`);
  console.log(`   Tuition Fee: Rs. ${Number(student.tuitionFee || 0).toLocaleString()}`);
  console.log(`   Package Total: Rs. ${Number(student.packageTotal || 0).toLocaleString()}`);
  
  console.log('\n\n💰 FEE RECORDS:');
  console.log('   ' + '-'.repeat(76));
  console.log('   Receipt No          Installment    Amount       Transport    Date');
  console.log('   ' + '-'.repeat(76));
  
  let totalAmount = 0;
  let totalTransport = 0;
  
  student.feeRecords.forEach((rec) => {
    const amt = Number(rec.amount);
    const trans = Number(rec.transportAmount || 0);
    totalAmount += amt;
    totalTransport += trans;
    
    console.log(`   ${(rec.receiptNo || '').padEnd(20)} ${(rec.installment || 'N/A').padEnd(14)} Rs. ${String(amt.toLocaleString()).padEnd(9)} Rs. ${String(trans.toLocaleString()).padEnd(9)} ${rec.date.toISOString().split('T')[0]}`);
  });
  
  console.log('   ' + '-'.repeat(76));
  console.log(`   TOTALS:${' '.repeat(28)} Rs. ${String(totalAmount.toLocaleString()).padEnd(9)} Rs. ${totalTransport.toLocaleString()}`);
  console.log('   ' + '-'.repeat(76));
  
  const remaining = Number(student.packageTotal || 0) - totalAmount;
  
  console.log('\n\n📊 CALCULATION:');
  console.log(`   Package Total:        Rs. ${Number(student.packageTotal || 0).toLocaleString()}`);
  console.log(`   Total Paid (amount):  Rs. ${totalAmount.toLocaleString()}`);
  console.log(`   Total Transport:      Rs. ${totalTransport.toLocaleString()}`);
  console.log(`   Remaining:            Rs. ${remaining.toLocaleString()} ${remaining === 0 ? '✅' : '⚠️'}`);
  
  console.log('\n\n🔍 WHAT FRONTEND SHOULD SHOW:');
  console.log(`   Total Paid = ${totalAmount.toLocaleString()} (only "amount" field, NOT transport)`);
  console.log(`   Remaining = ${remaining.toLocaleString()}`);
  
  console.log('\n' + '='.repeat(80) + '\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
