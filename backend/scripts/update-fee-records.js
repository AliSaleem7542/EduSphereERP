/**
 * Update Fee Records for New Students
 * 
 * This script:
 * 1. Soft deletes old fee records linked to soft-deleted students
 * 2. Creates initial fee records for newly imported students
 * 
 * Usage: node scripts/update-fee-records.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('  EDU-SPHERE - UPDATE FEE RECORDS SCRIPT');
  console.log('═'.repeat(60));
  
  try {
    // Step 1: Soft delete old fee records
    console.log('\n🗑️  STEP 1: Soft Deleting Old Fee Records...');
    console.log('='.repeat(60));
    
    // Get all soft-deleted student IDs
    const softDeletedStudents = await prisma.student.findMany({
      where: { deletedAt: { not: null } },
      select: { id: true }
    });
    
    const softDeletedStudentIds = softDeletedStudents.map(s => s.id);
    console.log(`📊 Found ${softDeletedStudentIds.length} soft-deleted students`);
    
    // Soft delete their fee records
    const feeRecordsResult = await prisma.feeRecord.updateMany({
      where: {
        studentId: { in: softDeletedStudentIds },
        deletedAt: null
      },
      data: {
        deletedAt: new Date(),
        isActive: false
      }
    });
    
    console.log(`✅ Soft deleted ${feeRecordsResult.count} old fee records`);
    
    // Soft delete refunds for those fee records
    const refundsResult = await prisma.feeRefund.updateMany({
      where: {
        studentId: { in: softDeletedStudentIds },
        deletedAt: null
      },
      data: {
        deletedAt: new Date(),
        isActive: false
      }
    });
    
    console.log(`✅ Soft deleted ${refundsResult.count} old fee refunds`);
    
    // Step 2: Create initial fee records for new students
    console.log('\n📝 STEP 2: Creating Fee Records for New Students...');
    console.log('='.repeat(60));
    
    // Get admin user for collectedById
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!admin) {
      console.error('❌ No admin user found');
      return;
    }
    
    console.log(`✅ Using admin: ${admin.username}`);
    
    // Get all active students who don't have any active fee records
    const activeStudents = await prisma.student.findMany({
      where: {
        deletedAt: null,
        isActive: true
      },
      include: {
        feeRecords: {
          where: { deletedAt: null }
        }
      }
    });
    
    console.log(`📊 Found ${activeStudents.length} active students`);
    
    const stats = {
      processed: 0,
      created: 0,
      skipped: 0,
      errors: []
    };
    
    for (const student of activeStudents) {
      stats.processed++;
      
      try {
        // Skip if student already has active fee records
        if (student.feeRecords.length > 0) {
          stats.skipped++;
          continue;
        }
        
        // Skip if student has no fee data
        if (!student.annualCharges && !student.tuitionFee && !student.packageTotal) {
          stats.skipped++;
          continue;
        }
        
        // Generate unique receipt number
        const receiptNo = `RCP-${Date.now()}-${student.id}`;
        
        // Determine fee amount (use packageTotal if available, else annualCharges)
        const feeAmount = student.packageTotal || student.annualCharges || student.tuitionFee || 0;
        
        // Create initial fee record (marking as unpaid/pending)
        await prisma.feeRecord.create({
          data: {
            receiptNo: receiptNo,
            studentId: student.id,
            feeType: 'ADMISSION',
            period: '2025-26',
            amount: feeAmount,
            transportAmount: student.transportFee || null,
            paymentMethod: 'CASH',
            remarks: 'Initial fee record - imported from Excel',
            date: student.admissionDate || new Date(),
            status: 'PAID', // Mark as PAID since these are existing students
            collectedById: admin.id,
            isActive: true
          }
        });
        
        stats.created++;
        
        if (stats.created % 25 === 0) {
          console.log(`   ... ${stats.created}/${activeStudents.length} processed`);
        }
        
      } catch (error) {
        stats.errors.push({
          studentId: student.id,
          name: `${student.firstName} ${student.lastName}`,
          error: error.message
        });
        console.error(`❌ Error for student ${student.id}: ${error.message}`);
      }
    }
    
    // Summary
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('  📊 FINAL SUMMARY');
    console.log('═'.repeat(60));
    console.log(`📝 Total Students Processed:  ${stats.processed}`);
    console.log(`✅ Fee Records Created:       ${stats.created}`);
    console.log(`⏭️  Skipped:                   ${stats.skipped} (already have records or no fee data)`);
    console.log(`❌ Errors:                    ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ ERROR DETAILS:');
      stats.errors.forEach((err) => {
        console.log(`   Student ${err.studentId} (${err.name}): ${err.error}`);
      });
    }
    
    console.log('\n✅ Fee records update completed!');
    console.log('═'.repeat(60));
    console.log('\n');
    
  } catch (error) {
    console.error('\n');
    console.error('═'.repeat(60));
    console.error('  ❌ SCRIPT FAILED');
    console.error('═'.repeat(60));
    console.error(error);
    console.error('\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();
