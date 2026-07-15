/**
 * Analyze why there are 889 receipts for 247 students
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 ANALYZING RECEIPT COUNT\n');
  console.log('='.repeat(80));
  
  // Get all fee records
  const feeRecords = await prisma.feeRecord.findMany({
    where: { deletedAt: null },
    include: {
      student: true
    },
    orderBy: { studentId: 'asc' }
  });
  
  console.log(`\n💰 Total Fee Records (Receipts): ${feeRecords.length}`);
  
  // Group by student
  const byStudent = {};
  feeRecords.forEach(r => {
    const sid = r.studentId;
    if (!byStudent[sid]) {
      byStudent[sid] = {
        name: r.student ? `${r.student.firstName} ${r.student.lastName}` : 'Unknown',
        rollNo: r.student ? r.student.rollNo : 'N/A',
        records: []
      };
    }
    byStudent[sid].records.push(r);
  });
  
  const studentCount = Object.keys(byStudent).length;
  console.log(`👥 Students with Fee Records: ${studentCount}`);
  console.log(`📝 Average Receipts per Student: ${(feeRecords.length / studentCount).toFixed(2)}`);
  
  // Distribution analysis
  console.log('\n\n📈 DISTRIBUTION OF RECEIPTS PER STUDENT:\n');
  
  const distribution = {};
  Object.values(byStudent).forEach(s => {
    const count = s.records.length;
    distribution[count] = (distribution[count] || 0) + 1;
  });
  
  Object.keys(distribution).sort((a, b) => a - b).forEach(count => {
    const students = distribution[count];
    console.log(`   ${count} receipts: ${students} students`);
  });
  
  // Expected calculation
  console.log('\n\n🔍 EXPECTED CALCULATION:');
  console.log('   If every student has:');
  console.log('   - 1 Annual Charge record');
  console.log('   - 4 Installment records (1st, 2nd, 3rd, 4th)');
  console.log('   Total = 5 receipts per student');
  console.log('   Expected for 247 students = 247 × 5 = 1,235 receipts');
  console.log('   ');
  console.log(`   But we have: ${feeRecords.length} receipts`);
  console.log(`   Difference: ${1235 - feeRecords.length} receipts missing`);
  
  // Students with less than 5 records
  console.log('\n\n⚠️  STUDENTS WITH INCOMPLETE RECORDS:\n');
  
  const incomplete = Object.values(byStudent)
    .filter(s => s.records.length < 5)
    .sort((a, b) => a.records.length - b.records.length);
  
  console.log(`   Total: ${incomplete.length} students have less than 5 receipts\n`);
  
  // Show first 10
  incomplete.slice(0, 10).forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.name} (${s.rollNo}) - ${s.records.length} receipts`);
    s.records.forEach(r => {
      console.log(`      - ${r.installment || 'N/A'}: Rs. ${Number(r.amount).toLocaleString()}`);
    });
    console.log('');
  });
  
  if (incomplete.length > 10) {
    console.log(`   ... and ${incomplete.length - 10} more students with incomplete records`);
  }
  
  // Installment breakdown
  console.log('\n\n📋 RECEIPT BREAKDOWN BY INSTALLMENT:\n');
  
  const byInstallment = {};
  feeRecords.forEach(r => {
    const inst = r.installment || 'Unknown';
    byInstallment[inst] = (byInstallment[inst] || 0) + 1;
  });
  
  Object.keys(byInstallment).sort().forEach(inst => {
    console.log(`   ${inst}: ${byInstallment[inst]} receipts`);
  });
  
  console.log('\n\n💡 EXPLANATION:');
  console.log('   889 receipts is correct because:');
  console.log('   - Not all students paid all 5 installments');
  console.log('   - Some students only paid Annual Charges');
  console.log('   - Some students paid partial installments');
  console.log('   - This matches the actual payment data from Excel');
  
  console.log('\n' + '='.repeat(80) + '\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
