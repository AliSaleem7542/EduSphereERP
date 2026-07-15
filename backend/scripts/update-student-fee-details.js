const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// Parse CSV file
function parseCSV(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').slice(1); // Skip header
  
  const records = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const parts = line.split(',');
    if (parts.length < 8) continue;
    
    records.push({
      section: parts[0].trim(),
      rollNo: parts[1].trim(),
      name: parts[2].trim(),
      fatherName: parts[3].trim(),
      contact: parts[4].trim(),
      annual: parseInt(parts[5]) || 0,
      tuition: parseInt(parts[6]) || 0,
      package: parseInt(parts[7]) || 0,
    });
  }
  
  return records;
}

async function updateStudentFeeDetails() {
  try {
    console.log('🔄 Updating student fee details (Annual, Tuition, Package)...\n');
    
    const csvPath = path.join(__dirname, '../..', 'fee_records_data.csv');
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }
    
    const feeData = parseCSV(csvPath);
    console.log(`✅ Parsed ${feeData.length} records from CSV\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const grouped = {};
    
    // Group by section
    for (const fee of feeData) {
      if (!grouped[fee.section]) {
        grouped[fee.section] = [];
      }
      grouped[fee.section].push(fee);
    }
    
    console.log(`📊 Sections found: ${Object.keys(grouped).join(', ')}\n`);
    
    // Process each record
    for (const fee of feeData) {
      try {
        const student = await prisma.student.findFirst({
          where: {
            rollNo: fee.rollNo,
            section: { name: fee.section },
          },
        });
        
        if (!student) {
          errors.push(`${fee.section}-${fee.rollNo}: ${fee.name} - Not found`);
          errorCount++;
          continue;
        }
        
        // Update student with fee details
        await prisma.student.update({
          where: { id: student.id },
          data: {
            annualCharges: fee.annual > 0 ? fee.annual : null,
            tuitionFee: fee.tuition > 0 ? fee.tuition : null,
            packageTotal: fee.package > 0 ? fee.package : null,
          },
        });
        
        successCount++;
        if ((successCount) % 20 === 0) {
          console.log(`✓ Updated ${successCount} students...`);
        }
      } catch (err) {
        errors.push(`${fee.section}-${fee.rollNo}: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n✅ UPDATE COMPLETE!\n`);
    console.log(`📊 SUMMARY:`);
    console.log(`   ✓ Students updated: ${successCount}`);
    console.log(`   ✗ Errors: ${errorCount}`);
    
    // Show statistics by section
    console.log(`\n📈 UPDATES BY SECTION:`);
    for (const [section, records] of Object.entries(grouped)) {
      const totalPkg = records.reduce((sum, r) => sum + r.package, 0);
      const totalAnnual = records.reduce((sum, r) => sum + r.annual, 0);
      const totalTuition = records.reduce((sum, r) => sum + r.tuition, 0);
      
      console.log(`   ${section}: ${records.length} students`);
      console.log(`      └─ Annual: PKR ${totalAnnual.toLocaleString('en-PK')}`);
      console.log(`      └─ Tuition: PKR ${totalTuition.toLocaleString('en-PK')}`);
      console.log(`      └─ Package: PKR ${totalPkg.toLocaleString('en-PK')}`);
    }
    
    if (errors.length > 0) {
      console.log(`\n⚠️  Errors (showing first 10):`);
      errors.slice(0, 10).forEach(e => console.log(`   - ${e}`));
      if (errors.length > 10) {
        console.log(`   ... and ${errors.length - 10} more`);
      }
    }
    
    // Verify updates
    const updated = await prisma.student.findMany({
      where: {
        OR: [
          { annualCharges: { not: null } },
          { tuitionFee: { not: null } },
          { packageTotal: { not: null } }
        ]
      },
      select: {
        id: true,
        rollNo: true,
        firstName: true,
        lastName: true,
        section: { select: { name: true } },
        annualCharges: true,
        tuitionFee: true,
        packageTotal: true,
      },
    });
    
    console.log(`\n✅ VERIFICATION:`);
    console.log(`   Total students with fee details: ${updated.length}`);
    
    if (updated.length > 0) {
      console.log(`\n   Sample updated students:`);
      updated.slice(0, 5).forEach(s => {
        const name = `${s.firstName} ${s.lastName}`;
        console.log(`   - ${s.section?.name}-${s.rollNo}: ${name}`);
        console.log(`     Annual: ${s.annualCharges || '-'}, Tuition: ${s.tuitionFee || '-'}, Package: ${s.packageTotal || '-'}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

updateStudentFeeDetails();
