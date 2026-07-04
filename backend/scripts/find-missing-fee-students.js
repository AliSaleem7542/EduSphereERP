/**
 * Find students who exist in database but have no fee records
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 FINDING STUDENTS WITHOUT FEE RECORDS\n');
  console.log('='.repeat(80));
  
  // Get all active students
  const allStudents = await prisma.student.findMany({
    where: { deletedAt: null },
    include: {
      feeRecords: {
        where: { deletedAt: null }
      },
      section: true
    },
    orderBy: { rollNo: 'asc' }
  });
  
  console.log(`\n📊 Total Students in Database: ${allStudents.length}`);
  
  // Find students with no fee records
  const studentsWithoutFees = allStudents.filter(s => s.feeRecords.length === 0);
  
  console.log(`❌ Students WITHOUT Fee Records: ${studentsWithoutFees.length}\n`);
  
  if (studentsWithoutFees.length > 0) {
    console.log('Missing Students:');
    console.log('-'.repeat(80));
    
    studentsWithoutFees.forEach((s, i) => {
      console.log(`${i + 1}. ${s.firstName} ${s.lastName}`);
      console.log(`   Roll No: ${s.rollNo}`);
      console.log(`   Section: ${s.section ? s.section.name : 'N/A'}`);
      console.log(`   Father: ${s.fatherName || 'N/A'}`);
      console.log(`   Package: Rs. ${Number(s.packageTotal || 0).toLocaleString()}`);
      console.log(`   Annual Charges: Rs. ${Number(s.annualCharges || 0).toLocaleString()}`);
      console.log(`   Tuition Fee: Rs. ${Number(s.tuitionFee || 0).toLocaleString()}`);
      console.log('');
    });
  }
  
  // Students with fee records
  const studentsWithFees = allStudents.filter(s => s.feeRecords.length > 0);
  console.log(`✅ Students WITH Fee Records: ${studentsWithFees.length}`);
  
  // Compare with Excel import count
  const feeRecordCount = await prisma.feeRecord.count({
    where: { deletedAt: null }
  });
  
  console.log(`\n💰 Total Fee Records: ${feeRecordCount}`);
  console.log(`📊 Average Records per Student: ${(feeRecordCount / studentsWithFees.length).toFixed(2)}`);
  
  console.log('\n' + '='.repeat(80));
  
  // Check if missing students are in Excel data
  console.log('\n🔍 Checking Excel file for missing students...\n');
  
  const XLSX = require('xlsx');
  const fs = require('fs');
  const EXCEL_FILE = './2nd file.xlsx';
  
  if (fs.existsSync(EXCEL_FILE)) {
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
    
    console.log('Excel rows:', rows.length);
    
    studentsWithoutFees.forEach(s => {
      const found = rows.find(row => {
        const studentName = String(row[4] || '').trim().toUpperCase();
        const rollNo = String(row[3] || '').trim();
        const section = String(row[2] || '').trim();
        const fullRollNo = section ? `${section}-${rollNo}` : rollNo;
        
        return studentName === `${s.firstName} ${s.lastName}`.toUpperCase() || 
               fullRollNo === s.rollNo;
      });
      
      if (found) {
        console.log(`✅ ${s.firstName} ${s.lastName} (${s.rollNo}) - FOUND in Excel at row ${rows.indexOf(found) + 1}`);
      } else {
        console.log(`❌ ${s.firstName} ${s.lastName} (${s.rollNo}) - NOT FOUND in Excel`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
