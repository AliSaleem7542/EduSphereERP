/**
 * Import Installment-Based Fee Records from Excel
 * 
 * This script reads the Excel file with fee structure and creates
 * multiple FeeRecord entries per student based on installments:
 * - Annual Charges (if paid)
 * - 1st Installment
 * - 2nd Installment
 * - 3rd Installment
 * - 4th Installment
 * 
 * Each installment includes: amount, date (from receipt), remarks, transport amount, transport remarks
 * 
 * Usage: 
 * node scripts/import-installment-fees.js
 */

const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const fs = require('fs');

const prisma = new PrismaClient();

// Excel file path - same file used for student import
const EXCEL_FILE_PATH = './2nd file.xlsx';

/**
 * HARD DELETE all existing fee records before importing new ones
 * This is necessary because the receiptNo field has a unique constraint
 * and we need to prevent duplicate receiptNo errors during import
 */
async function deleteExistingFees() {
  console.log('\n🗑️  DELETE ALL FEE RECORDS - Starting...');
  console.log('=' .repeat(60));
  
  try {
    // Count all fee records (including soft-deleted)
    const totalFees = await prisma.feeRecord.count();
    
    console.log(`📊 Found ${totalFees} total fee records in database`);
    
    if (totalFees === 0) {
      console.log('✅ No fee records to delete');
      return { count: 0 };
    }
    
    // HARD DELETE all fee records to clear receiptNo unique constraint
    console.log('⚠️  HARD DELETING all fee records to prevent duplicate receiptNo errors...');
    const result = await prisma.feeRecord.deleteMany({});
    
    console.log(`✅ Deleted ${result.count} fee records`);
    console.log('💡 Database cleared - ready for fresh import');
    
    return result;
  } catch (error) {
    console.error('❌ Error during delete:', error.message);
    throw error;
  }
}

/**
 * Parse date and receipt number from remarks
 * Example: "24-5-25 r#1962" → { date: Date, receiptNo: "1962", remarks: "24-5-25 r#1962" }
 */
function parseRemarks(remarksStr) {
  if (!remarksStr || remarksStr.trim() === '' || remarksStr === '-') {
    return { date: null, receiptNo: null, remarks: null };
  }
  
  const str = String(remarksStr).trim();
  
  // Extract receipt number: r#123 or R#123
  const receiptMatch = str.match(/r#(\d+)/i);
  const receiptNo = receiptMatch ? receiptMatch[1] : null;
  
  // Extract date: various formats like 24-5-25, 10-9-25, 5-11-25, etc.
  const dateMatch = str.match(/(\d{1,2})-(\d{1,2})-(\d{2,4})/);
  let date = null;
  
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1; // JS months are 0-indexed
    let year = parseInt(dateMatch[3]);
    
    // Handle 2-digit years: assume 25 = 2025, 26 = 2026
    if (year < 100) {
      year = 2000 + year;
    }
    
    date = new Date(year, month, day);
  }
  
  return {
    date: date,
    receiptNo: receiptNo,
    remarks: str,
  };
}

/**
 * Parse amount from string
 * Handles formats like: "8000", " 8,000 ", "18000", etc.
 */
function parseAmount(amountStr) {
  if (!amountStr || amountStr.trim() === '' || amountStr.trim() === '-') {
    return null;
  }
  
  const cleanStr = String(amountStr).replace(/[^\d.]/g, ''); // Remove non-digits except decimal point
  const amount = parseFloat(cleanStr);
  
  return isNaN(amount) || amount === 0 ? null : amount;
}

/**
 * Generate unique receipt number
 */
let receiptCounter = 1000;
function generateReceiptNo(prefix = 'IMP') {
  receiptCounter++;
  return `${prefix}-${Date.now()}-${receiptCounter}`;
}

/**
 * Import fee records from Excel
 */
async function importFeesFromExcel() {
  console.log('\n📥 IMPORT FEE RECORDS - Starting...');
  console.log('=' .repeat(60));
  
  try {
    // Check if file exists
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      console.error('❌ Excel file not found:', EXCEL_FILE_PATH);
      return null;
    }
    
    console.log('✅ Excel file found:', EXCEL_FILE_PATH);
    
    // Read Excel file
    console.log('📖 Reading Excel file...');
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    console.log(`✅ Reading sheet: "${sheetName}"`);
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Read as array of arrays to get exact cell positions
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1, // Return array of arrays
      defval: '', // Default value for empty cells
      raw: false, // Get formatted values
    });
    
    console.log(`📊 Total rows: ${rows.length}`);
    
    // Row 4 (index 3) has headers, data starts from row 5 (index 4)
    const headerRow = rows[3];
    console.log('\n📋 Headers detected:');
    headerRow.forEach((h, i) => {
      if (h) console.log(`  Col ${i}: ${h}`);
    });
    
    // Column indexes based on actual Excel structure
    const COL = {
      SECTION: 2,              // C
      ROLL_NO: 3,              // D
      STUDENT_NAME: 4,         // E
      FATHER_NAME: 5,          // F
      CONTACT: 6,              // G
      ADDRESS: 7,              // H
      ANNUAL_CHARGES: 8,       // I - from Package columns
      TUITION_FEE: 9,          // J
      PACKAGE_TOTAL: 10,       // K
      ANNUAL_PAID: 11,         // L - Annual Charges Paid
      ANNUAL_REMARKS: 12,      // M - Remarks for Annual Charges
      ANNUAL_TRANSPORT: 13,    // N - Transport for Annual Charges
      ANNUAL_TRANSPORT_REM: 14, // O - Transport Remarks
      INST1_AMOUNT: 15,        // P - 1st Installment
      INST1_REMARKS: 16,       // Q - 1st Remarks
      INST1_TRANSPORT: 17,     // R - 1st Transport
      INST1_TRANSPORT_REM: 18, // S - 1st Transport Remarks
      INST2_AMOUNT: 19,        // T - 2nd Installment
      INST2_REMARKS: 20,       // U - 2nd Remarks
      INST2_TRANSPORT: 21,     // V - 2nd Transport
      INST2_TRANSPORT_REM: 22, // W - 2nd Transport Remarks
      INST3_AMOUNT: 23,        // X - 3rd Installment
      INST3_REMARKS: 24,       // Y - 3rd Remarks
      INST4_AMOUNT: 25,        // Z - 4th Installment
      INST4_REMARKS: 26,       // AA - 4th Remarks
      TOTAL_RECEIVED: 27,      // AB - Total Received
      REMAINING: 28,           // AC - Remaining
    };
    
    // Get default admin user for collectedById
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      console.error('❌ No admin user found in database');
      return null;
    }
    
    console.log(`✅ Using admin user: ${adminUser.username} (ID: ${adminUser.id})`);
    
    // Statistics
    const stats = {
      studentsProcessed: 0,
      studentsNotFound: 0,
      feesCreated: 0,
      errors: [],
    };
    
    console.log('\n💰 Starting fee record import...\n');
    
    // Process data rows (starting from row 5, index 4)
    for (let i = 4; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows
      if (!row || row.length === 0 || !row[COL.STUDENT_NAME]) {
        continue;
      }
      
      try {
        const section = String(row[COL.SECTION] || '').trim();
        const rollNo = String(row[COL.ROLL_NO] || '').trim();
        const studentName = String(row[COL.STUDENT_NAME] || '').trim();
        
        if (!studentName || !rollNo) {
          stats.studentsNotFound++;
          console.log(`⏭️  Row ${i + 1}: Skipped (no name or roll number)`);
          continue;
        }
        
        // Create unique roll number (same format as import script)
        const uniqueRollNo = section ? `${section}-${rollNo}` : rollNo;
        
        // Find student by roll number
        const student = await prisma.student.findFirst({
          where: {
            rollNo: uniqueRollNo,
            deletedAt: null,
          }
        });
        
        if (!student) {
          stats.studentsNotFound++;
          console.log(`❌ Row ${i + 1}: Student not found - ${studentName} (${uniqueRollNo})`);
          continue;
        }
        
        stats.studentsProcessed++;
        let studentFees = 0;
        
        console.log(`\n📝 Row ${i + 1}: ${studentName} (${uniqueRollNo})`);
        
        // === ANNUAL CHARGES ===
        const annualPaid = parseAmount(row[COL.ANNUAL_PAID]);
        if (annualPaid && annualPaid > 0) {
          const annualData = parseRemarks(row[COL.ANNUAL_REMARKS]);
          const annualTransport = parseAmount(row[COL.ANNUAL_TRANSPORT]);
          const annualTransportRem = row[COL.ANNUAL_TRANSPORT_REM] ? String(row[COL.ANNUAL_TRANSPORT_REM]).trim() : null;
          
          await prisma.feeRecord.create({
            data: {
              receiptNo: annualData.receiptNo ? `ANN-${annualData.receiptNo}` : generateReceiptNo('ANN'),
              studentId: student.id,
              feeType: 'ADMISSION', // Annual charges treated as admission fee
              installment: 'Annual',
              amount: annualPaid,
              transportAmount: annualTransport,
              paymentMethod: 'CASH',
              remarks: annualData.remarks,
              transportRemarks: annualTransportRem || null,
              date: annualData.date || new Date(),
              status: 'PAID',
              collectedById: adminUser.id,
              isActive: true,
            }
          });
          
          studentFees++;
          console.log(`   ✅ Annual Charges: ${annualPaid}${annualTransport ? ` + Transport: ${annualTransport}` : ''}`);
        }
        
        // === 1ST INSTALLMENT ===
        const inst1Amount = parseAmount(row[COL.INST1_AMOUNT]);
        if (inst1Amount && inst1Amount > 0) {
          const inst1Data = parseRemarks(row[COL.INST1_REMARKS]);
          const inst1Transport = parseAmount(row[COL.INST1_TRANSPORT]);
          const inst1TransportRem = row[COL.INST1_TRANSPORT_REM] ? String(row[COL.INST1_TRANSPORT_REM]).trim() : null;
          
          await prisma.feeRecord.create({
            data: {
              receiptNo: inst1Data.receiptNo ? `1ST-${inst1Data.receiptNo}` : generateReceiptNo('1ST'),
              studentId: student.id,
              feeType: 'MONTHLY',
              installment: '1st',
              amount: inst1Amount,
              transportAmount: inst1Transport,
              paymentMethod: 'CASH',
              remarks: inst1Data.remarks,
              transportRemarks: inst1TransportRem || null,
              date: inst1Data.date || new Date(),
              status: 'PAID',
              collectedById: adminUser.id,
              isActive: true,
            }
          });
          
          studentFees++;
          console.log(`   ✅ 1st Installment: ${inst1Amount}${inst1Transport ? ` + Transport: ${inst1Transport}` : ''}`);
        }
        
        // === 2ND INSTALLMENT ===
        const inst2Amount = parseAmount(row[COL.INST2_AMOUNT]);
        if (inst2Amount && inst2Amount > 0) {
          const inst2Data = parseRemarks(row[COL.INST2_REMARKS]);
          const inst2Transport = parseAmount(row[COL.INST2_TRANSPORT]);
          const inst2TransportRem = row[COL.INST2_TRANSPORT_REM] ? String(row[COL.INST2_TRANSPORT_REM]).trim() : null;
          
          await prisma.feeRecord.create({
            data: {
              receiptNo: inst2Data.receiptNo ? `2ND-${inst2Data.receiptNo}` : generateReceiptNo('2ND'),
              studentId: student.id,
              feeType: 'MONTHLY',
              installment: '2nd',
              amount: inst2Amount,
              transportAmount: inst2Transport,
              paymentMethod: 'CASH',
              remarks: inst2Data.remarks,
              transportRemarks: inst2TransportRem || null,
              date: inst2Data.date || new Date(),
              status: 'PAID',
              collectedById: adminUser.id,
              isActive: true,
            }
          });
          
          studentFees++;
          console.log(`   ✅ 2nd Installment: ${inst2Amount}${inst2Transport ? ` + Transport: ${inst2Transport}` : ''}`);
        }
        
        // === 3RD INSTALLMENT ===
        const inst3Amount = parseAmount(row[COL.INST3_AMOUNT]);
        if (inst3Amount && inst3Amount > 0) {
          const inst3Data = parseRemarks(row[COL.INST3_REMARKS]);
          
          await prisma.feeRecord.create({
            data: {
              receiptNo: inst3Data.receiptNo ? `3RD-${inst3Data.receiptNo}` : generateReceiptNo('3RD'),
              studentId: student.id,
              feeType: 'MONTHLY',
              installment: '3rd',
              amount: inst3Amount,
              transportAmount: null,
              paymentMethod: 'CASH',
              remarks: inst3Data.remarks,
              transportRemarks: null,
              date: inst3Data.date || new Date(),
              status: 'PAID',
              collectedById: adminUser.id,
              isActive: true,
            }
          });
          
          studentFees++;
          console.log(`   ✅ 3rd Installment: ${inst3Amount}`);
        }
        
        // === 4TH INSTALLMENT ===
        const inst4Amount = parseAmount(row[COL.INST4_AMOUNT]);
        if (inst4Amount && inst4Amount > 0) {
          const inst4Data = parseRemarks(row[COL.INST4_REMARKS]);
          
          await prisma.feeRecord.create({
            data: {
              receiptNo: inst4Data.receiptNo ? `4TH-${inst4Data.receiptNo}` : generateReceiptNo('4TH'),
              studentId: student.id,
              feeType: 'MONTHLY',
              installment: '4th',
              amount: inst4Amount,
              transportAmount: null,
              paymentMethod: 'CASH',
              remarks: inst4Data.remarks,
              transportRemarks: null,
              date: inst4Data.date || new Date(),
              status: 'PAID',
              collectedById: adminUser.id,
              isActive: true,
            }
          });
          
          studentFees++;
          console.log(`   ✅ 4th Installment: ${inst4Amount}`);
        }
        
        stats.feesCreated += studentFees;
        
        if (studentFees === 0) {
          console.log(`   ⚠️  No fee records found for this student`);
        }
        
      } catch (error) {
        stats.errors.push({
          row: i + 1,
          error: error.message,
        });
        console.error(`❌ Row ${i + 1}: Error - ${error.message}`);
      }
    }
    
    return stats;
    
  } catch (error) {
    console.error('\n❌ Fatal error during import:', error.message);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('  EDU-SPHERE - IMPORT INSTALLMENT-BASED FEES');
  console.log('═'.repeat(60));
  
  try {
    // Step 1: Hard delete existing fee records
    const deleteResult = await deleteExistingFees();
    
    // Step 2: Import new fee records from Excel
    const importStats = await importFeesFromExcel();
    
    if (!importStats) {
      console.log('\n❌ Import failed - see errors above');
      process.exit(1);
    }
    
    // Summary
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('  📊 FINAL SUMMARY');
    console.log('═'.repeat(60));
    console.log(`🗑️  Deleted:             ${deleteResult.count} fee records (hard delete)`);
    console.log(`📝 Students Processed:  ${importStats.studentsProcessed}`);
    console.log(`❌ Students Not Found:  ${importStats.studentsNotFound}`);
    console.log(`✅ Fee Records Created: ${importStats.feesCreated}`);
    console.log(`❌ Errors:              ${importStats.errors.length}`);
    
    if (importStats.errors.length > 0) {
      console.log('\n❌ ERROR DETAILS:');
      importStats.errors.forEach((err) => {
        console.log(`   Row ${err.row}: ${err.error}`);
      });
    }
    
    console.log('\n✅ Process completed successfully!');
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Verify fee records in Fee Module');
    console.log('   2. Check installment breakdown for students');
    console.log('   3. Restart backend server to see changes in dashboard');
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
