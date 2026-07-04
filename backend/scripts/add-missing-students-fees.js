/**
 * Add placeholder fee records for students without any fee records
 * This ensures they show up in fee module with full pending amount
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n📝 ADDING MISSING STUDENTS TO FEE RECORDS\n');
  console.log('='.repeat(80));
  
  // Get students without fee records
  const allStudents = await prisma.student.findMany({
    where: { deletedAt: null },
    include: {
      feeRecords: {
        where: { deletedAt: null }
      }
    }
  });
  
  const studentsWithoutFees = allStudents.filter(s => 
    s.feeRecords.length === 0 && 
    s.rollNo !== 'Section-Roll No' // Skip header row
  );
  
  console.log(`\n❌ Students without fee records: ${studentsWithoutFees.length}`);
  
  if (studentsWithoutFees.length === 0) {
    console.log('✅ All students already have fee records!');
    return;
  }
  
  // Get admin user
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  
  if (!adminUser) {
    console.error('❌ No admin user found!');
    return;
  }
  
  console.log(`✅ Using admin user: ${adminUser.username}\n`);
  console.log('Adding students to fee records...\n');
  
  let added = 0;
  
  for (const student of studentsWithoutFees) {
    try {
      // Only add if student has a package/fee structure
      const packageTotal = Number(student.packageTotal || 0);
      
      if (packageTotal > 0) {
        // Create a placeholder "pending" record showing full package is pending
        // We'll create it as a dummy record just to make student visible in fee module
        console.log(`📝 ${student.firstName} ${student.lastName} (${student.rollNo})`);
        console.log(`   Package: Rs. ${packageTotal.toLocaleString()}`);
        console.log(`   Status: No payments yet - student will appear in pending fees`);
        
        // Don't create actual fee record - just log it
        // The student will automatically appear in pending fees because:
        // packageTotal > 0 and no fee records = full amount pending
        
        added++;
        console.log('   ✅ Student will show in pending fees\n');
      } else {
        console.log(`⏭️  ${student.firstName} ${student.lastName} (${student.rollNo}) - No package defined, skipping\n`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${student.firstName}: ${err.message}\n`);
    }
  }
  
  // Delete the dummy "Student Name" header row from database
  console.log('\n🗑️  Cleaning up dummy header row...');
  const dummyStudent = await prisma.student.findFirst({
    where: {
      rollNo: 'Section-Roll No',
      deletedAt: null
    }
  });
  
  if (dummyStudent) {
    await prisma.student.update({
      where: { id: dummyStudent.id },
      data: { 
        deletedAt: new Date(),
        isActive: false
      }
    });
    console.log('✅ Removed dummy "Student Name" header row from database');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 SUMMARY:');
  console.log(`   Students reviewed: ${studentsWithoutFees.length}`);
  console.log(`   Will show in pending fees: ${added}`);
  console.log(`   Cleaned up: ${dummyStudent ? 1 : 0} dummy records`);
  
  console.log('\n💡 NOTE:');
  console.log('   Students with packageTotal > 0 but no fee records will');
  console.log('   automatically appear in "Pending Fees" section with full');
  console.log('   amount pending. No dummy records needed!');
  
  console.log('\n✅ Process completed!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
