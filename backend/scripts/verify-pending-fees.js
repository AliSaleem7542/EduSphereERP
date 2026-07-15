const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyPending() {
  try {
    console.log('📊 FEE RECORDS VERIFICATION - Pending & Outstanding Balances\n');
    console.log('═'.repeat(70));
    
    // Get all students with pending/partial fees
    const pendingRecords = await prisma.feeRecord.findMany({
      where: { status: 'PARTIAL' },
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            firstName: true,
            lastName: true,
            section: { select: { name: true } },
            feeRecords: { 
              select: { 
                installment: true,
                amount: true,
                status: true,
                date: true
              }
            }
          }
        }
      },
      orderBy: [
        { student: { section: { name: 'asc' } } },
        { student: { rollNo: 'asc' } }
      ]
    });
    
    console.log(`\n✅ Students with Outstanding/Pending Balances: ${pendingRecords.length}\n`);
    
    let totalOutstanding = 0;
    for (const pending of pendingRecords) {
      const name = `${pending.student.firstName} ${pending.student.lastName}`;
      const section = pending.student.section?.name || 'N/A';
      totalOutstanding += pending.amount;
      
      // Calculate total paid for this student
      const allFees = pending.student.feeRecords;
      const totalPaid = allFees
        .filter(f => f.status === 'PAID')
        .reduce((sum, f) => sum + parseInt(f.amount), 0);
      
      const outstanding = pending.amount;
      
      console.log(`📌 ${section}-${pending.student.rollNo}: ${name}`);
      console.log(`   └─ Outstanding Amount: PKR ${outstanding.toLocaleString('en-PK')}`);
      console.log(`   └─ Total Paid So Far: PKR ${totalPaid.toLocaleString('en-PK')}`);
      console.log(`   └─ Total Fees: ${allFees.length} records`);
      console.log(`   └─ Pending Since: ${new Date(pending.date).toLocaleDateString('en-PK')}`);
      console.log('');
    }
    
    console.log('═'.repeat(70));
    console.log(`\n💰 SUMMARY`);
    console.log(`   Total Outstanding Amount: PKR ${totalOutstanding.toLocaleString('en-PK')}`);
    console.log(`   Students with Outstanding: ${pendingRecords.length}`);
    console.log(`   Sections with Outstanding: ${new Set(pendingRecords.map(p => p.student.section?.name)).size}`);
    
    // Get overall statistics
    const allStats = await prisma.feeRecord.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true }
    });
    
    console.log(`\n📈 OVERALL FEE STATISTICS`);
    for (const stat of allStats) {
      const amount = stat._sum.amount || 0;
      console.log(`   ${stat.status}: ${stat._count.id} records | Total: PKR ${parseInt(amount).toLocaleString('en-PK')}`);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPending();
