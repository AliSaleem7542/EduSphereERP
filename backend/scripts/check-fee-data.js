/**
 * Check Fee Data Quality
 * Quick script to verify student and fee record data
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 CHECKING FEE DATA QUALITY\n');
  console.log('='.repeat(70));
  
  // Check students with packages
  const students = await prisma.student.findMany({
    where: { deletedAt: null },
    include: {
      feeRecords: {
        where: { deletedAt: null, status: 'PAID' }
      }
    },
    take: 5
  });
  
  console.log(`\n✅ Found ${students.length} students (showing first 5):\n`);
  
  students.forEach((s, i) => {
    const totalPaid = s.feeRecords.reduce((sum, r) => sum + Number(r.amount), 0);
    const remaining = Number(s.packageTotal || 0) - totalPaid;
    
    console.log(`${i + 1}. ${s.firstName} ${s.lastName} (${s.rollNo})`);
    console.log(`   Package Total: Rs. ${Number(s.packageTotal || 0).toLocaleString()}`);
    console.log(`   Annual Charges: Rs. ${Number(s.annualCharges || 0).toLocaleString()}`);
    console.log(`   Tuition Fee: Rs. ${Number(s.tuitionFee || 0).toLocaleString()}`);
    console.log(`   Fee Records: ${s.feeRecords.length}`);
    console.log(`   Total Paid: Rs. ${totalPaid.toLocaleString()}`);
    console.log(`   Remaining: Rs. ${remaining.toLocaleString()}`);
    console.log('');
  });
  
  // Check fee records
  const feeCount = await prisma.feeRecord.count({
    where: { deletedAt: null }
  });
  
  console.log(`\n💰 Total Fee Records in Database: ${feeCount}`);
  
  // Sample fee records
  const sampleFees = await prisma.feeRecord.findMany({
    where: { deletedAt: null },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          rollNo: true,
          packageTotal: true,
          annualCharges: true,
          tuitionFee: true
        }
      }
    },
    take: 3
  });
  
  console.log(`\n📝 Sample Fee Records (first 3):\n`);
  sampleFees.forEach((f, i) => {
    console.log(`${i + 1}. Receipt: ${f.receiptNo}`);
    console.log(`   Student: ${f.student.firstName} ${f.student.lastName} (${f.student.rollNo})`);
    console.log(`   Student Package: Rs. ${Number(f.student.packageTotal || 0).toLocaleString()}`);
    console.log(`   Installment: ${f.installment || 'N/A'}`);
    console.log(`   Amount: Rs. ${Number(f.amount).toLocaleString()}`);
    console.log(`   Transport: Rs. ${Number(f.transportAmount || 0).toLocaleString()}`);
    console.log(`   Date: ${f.date}`);
    console.log('');
  });
  
  console.log('='.repeat(70));
  console.log('\n✅ Check complete!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
