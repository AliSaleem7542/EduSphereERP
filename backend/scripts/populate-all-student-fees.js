const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// Parse CSV file for available fee data
function parseCSV(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').slice(1);
  
  const feeMap = {}; // section-rollNo => fees
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const parts = line.split(',');
    if (parts.length < 8) continue;
    
    const section = parts[0].trim();
    const rollNo = parts[1].trim();
    const annual = parseInt(parts[5]) || 0;
    const tuition = parseInt(parts[6]) || 0;
    const pkg = parseInt(parts[7]) || 0;
    
    if (section && rollNo) {
      feeMap[`${section}-${rollNo}`] = { annual, tuition, pkg };
    }
  }
  
  return feeMap;
}

// Standard fee structure for different stream/class combinations
const feeStructure = {
  'default': { annual: 8000, tuition: 2000, package: 30000 },
  'commerce': { annual: 8000, tuition: 2200, package: 30000 },
  'science': { annual: 8000, tuition: 2500, package: 33000 },
  'general': { annual: 8000, tuition: 1800, package: 26000 },
};

async function populateAllStudentFees() {
  try {
    console.log('🔄 Populating fee details for ALL 249 students...\n');
    
    const csvPath = path.join(__dirname, '../..', 'fee_records_data.csv');
    const feeMap = parseCSV(csvPath);
    console.log(`✅ Loaded fee data for ${Object.keys(feeMap).length} students from CSV\n`);
    
    // Get all students
    const allStudents = await prisma.student.findMany({
      include: { section: true },
      orderBy: [
        { section: { name: 'asc' } },
        { rollNo: 'asc' }
      ]
    });
    
    console.log(`📊 Total students to update: ${allStudents.length}\n`);
    
    let updated = 0;
    let fromCSV = 0;
    let fromDefault = 0;
    const bySection = {};
    
    for (const student of allStudents) {
      const key = `${student.section?.name}-${student.rollNo}`;
      let fees;
      
      if (feeMap[key]) {
        // Use data from CSV
        fees = feeMap[key];
        fromCSV++;
      } else {
        // Use default fees based on section
        const sectionName = student.section?.name || '';
        let structure = feeStructure.default;
        
        if (sectionName.includes('Science') || sectionName.includes('M-') || sectionName.includes('IT-')) {
          structure = feeStructure.science;
        } else if (sectionName.includes('I.Com') || sectionName.includes('Eco')) {
          structure = feeStructure.commerce;
        } else {
          structure = feeStructure.general;
        }
        
        fees = structure;
        fromDefault++;
      }
      
      try {
        await prisma.student.update({
          where: { id: student.id },
          data: {
            annualCharges: fees.annual,
            tuitionFee: fees.tuition,
            packageTotal: fees.pkg,
          }
        });
        
        updated++;
        
        // Track by section
        const secName = student.section?.name || 'Unknown';
        if (!bySection[secName]) {
          bySection[secName] = { count: 0, totalPkg: 0 };
        }
        bySection[secName].count++;
        bySection[secName].totalPkg += fees.pkg;
        
        if (updated % 30 === 0) {
          console.log(`✓ Updated ${updated}/${allStudents.length} students...`);
        }
      } catch (err) {
        console.error(`✗ Error updating ${key}: ${err.message}`);
      }
    }
    
    console.log(`\n✅ UPDATE COMPLETE!\n`);
    console.log(`📊 STATISTICS:`);
    console.log(`   ✓ Total Updated: ${updated}`);
    console.log(`   ✓ From CSV Data: ${fromCSV}`);
    console.log(`   ✓ Using Defaults: ${fromDefault}\n`);
    
    console.log(`📈 BY SECTION:`);
    for (const [section, data] of Object.entries(bySection)) {
      console.log(`   ${section}: ${data.count} students | Total Package: PKR ${data.totalPkg.toLocaleString('en-PK')}`);
    }
    
    // Final verification
    const verified = await prisma.student.findMany({
      where: {
        AND: [
          { packageTotal: { not: null } },
          { annualCharges: { not: null } },
          { tuitionFee: { not: null } }
        ]
      },
      select: { id: true }
    });
    
    console.log(`\n✅ VERIFICATION: ${verified.length}/${allStudents.length} students have complete fee details`);
    
    if (verified.length === allStudents.length) {
      console.log('🎉 ALL STUDENTS UPDATED SUCCESSFULLY!');
    }
    
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

populateAllStudentFees();
