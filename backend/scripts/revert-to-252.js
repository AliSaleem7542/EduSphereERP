/**
 * Revert database to 252 students (remove the 22 extra students added from Excel)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Reverting to 252 students...\n');
  
  // Get current count
  const currentCount = await prisma.student.count();
  console.log(`Current student count: ${currentCount}`);
  
  if (currentCount <= 252) {
    console.log('✅ Already at 252 or fewer students. No action needed.');
    return;
  }
  
  // Find the 22 students we added (they should be the most recent ones)
  const studentsToRemove = [
    'SHUMAILA', 'Dania Mirza', 'HUSNA', 'ROMAIZAH', 'Muhammad Abdullah',
    'ZAID', 'FAIZAN', 'IHSANULLAH', 'Dawood Imran', 'HANZALA', 'TAYYAB',
    'MUHAMMAD', 'MUHAMMAD  MAMOON', 'ZAIN  ABDULLAH', 'MUEEZULLAH',
    'ALI  HAIDER', 'M  FIAZ ABDULLAH', 'ZULFIQAR', 'SAMIULLAH', 'Dawood Masih',
    'Muhammad Aoun'
  ];
  
  let removed = 0;
  
  for (const name of studentsToRemove) {
    const parts = name.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || '';
    
    try {
      // Find student
      const student = await prisma.student.findFirst({
        where: {
          firstName: firstName,
          lastName: lastName || undefined
        }
      });
      
      if (student) {
        console.log(`Removing: ${firstName} ${lastName} (ID: ${student.id}, Roll: ${student.rollNo})`);
        
        // Delete related records first
        await prisma.feeRecord.deleteMany({ where: { studentId: student.id } });
        await prisma.examResult.deleteMany({ where: { studentId: student.id } });
        await prisma.studentAttendance.deleteMany({ where: { studentId: student.id } });
        await prisma.bookIssue.deleteMany({ where: { studentId: student.id } });
        await prisma.feeRefund.deleteMany({ where: { studentId: student.id } });
        await prisma.studentPromotion.deleteMany({ where: { studentId: student.id } });
        
        // Delete student
        await prisma.student.delete({ where: { id: student.id } });
        
        removed++;
      }
    } catch (error) {
      console.error(`❌ Error removing ${name}:`, error.message);
    }
  }
  
  const finalCount = await prisma.student.count();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 REVERT SUMMARY');
  console.log('='.repeat(50));
  console.log(`Students removed: ${removed}`);
  console.log(`Final count: ${finalCount}`);
  console.log(`Target: 252`);
  
  if (finalCount === 252) {
    console.log('\n✅ Successfully reverted to 252 students!');
  } else if (finalCount < 252) {
    console.log(`\n⚠️  Warning: Count is below 252 (${252 - finalCount} students missing)`);
  } else {
    console.log(`\n⚠️  Warning: Count is above 252 (${finalCount - 252} extra students remaining)`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
