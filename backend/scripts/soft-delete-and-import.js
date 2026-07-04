/**
 * Soft Delete Existing Students and Import New Data from Excel
 * 
 * Usage: 
 * node scripts/soft-delete-and-import.js <path-to-excel-file>
 * 
 * Example:
 * node scripts/soft-delete-and-import.js "C:\Users\muham\Downloads\2nd file.xlsx"
 */

const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Get Excel file path from command line argument
const EXCEL_FILE_PATH = process.argv[2];

/**
 * Soft delete all existing students
 * Sets deletedAt timestamp and isActive = false
 */
async function softDeleteExistingStudents() {
  console.log('\n🗑️  SOFT DELETE - Starting...');
  console.log('=' .repeat(60));
  
  try {
    // Count current active students
    const activeCount = await prisma.student.count({
      where: { deletedAt: null }
    });
    
    console.log(`📊 Found ${activeCount} active students to soft delete`);
    
    if (activeCount === 0) {
      console.log('✅ No active students to delete');
      return { count: 0 };
    }
    
    // Soft delete all active students
    const result = await prisma.student.updateMany({
      where: { deletedAt: null },
      data: {
        deletedAt: new Date(),
        isActive: false,
      }
    });
    
    console.log(`✅ Soft deleted ${result.count} students`);
    console.log('💾 All records retained as backup (can be restored if needed)');
    
    return result;
  } catch (error) {
    console.error('❌ Error during soft delete:', error.message);
    throw error;
  }
}

/**
 * Import students from Excel file
 * Only imports supported fields, validates data, skips invalid rows
 */
async function importStudentsFromExcel() {
  console.log('\n📥 IMPORT - Starting...');
  console.log('=' .repeat(60));
  
  try {
    // Check if file path is provided
    if (!EXCEL_FILE_PATH) {
      console.error('❌ Excel file path not provided');
      console.log('\n💡 Usage: node scripts/soft-delete-and-import.js <path-to-excel-file>');
      console.log('💡 Example: node scripts/soft-delete-and-import.js "C:\\Users\\muham\\Downloads\\2nd file.xlsx"');
      return null;
    }
    
    // Check if file exists
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      console.error('❌ Excel file not found:', EXCEL_FILE_PATH);
      console.log('\n💡 Please check the file path and try again');
      return null;
    }
    
    console.log('✅ Excel file found:', EXCEL_FILE_PATH);
    
    // Read Excel file
    console.log('📖 Reading Excel file...');
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    console.log(`✅ Reading sheet: "${sheetName}"`);
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON - Row 2 is header (0-indexed row 1), Row 3+ is data
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      range: 1, // Start from row 2 (0-indexed) which has headers
      defval: '', // Default value for empty cells
      raw: false, // Get formatted values instead of raw
    });
    
    console.log(`📊 Raw rows read: ${jsonData.length}`);
    
    // Display first row keys to understand structure
    if (jsonData.length > 0) {
      console.log('\n📋 Excel columns detected:');
      console.log(Object.keys(jsonData[0]).join(', '));
      console.log('\n📋 Sample row (first student):');
      console.log(JSON.stringify(jsonData[0], null, 2));
    }
    
    // Get academic year
    const year = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
    });
    
    if (!year) {
      console.error('❌ No active academic year found');
      console.log('💡 Run: npx prisma db seed');
      return null;
    }
    
    console.log(`✅ Academic year: ${year.label}`);
    
    // Get or create default class
    let defaultClass = await prisma.class.findFirst({
      where: { 
        name: '1st Year',
        academicYearId: year.id 
      },
    });
    
    if (!defaultClass) {
      console.log('📝 Creating default class: 1st Year');
      defaultClass = await prisma.class.create({
        data: {
          name: '1st Year',
          academicYearId: year.id,
        },
      });
    }
    
    console.log(`✅ Default class: ${defaultClass.name} (ID: ${defaultClass.id})`);
    
    // Import statistics
    const stats = {
      total: 0,
      imported: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };
    
    // Cache for sections
    const sectionCache = {};
    
    console.log('\n🎓 Starting student import...\n');
    
    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      stats.total++;
      
      try {
        // Extract fields - use exact column names from Excel (with __EMPTY prefix)
        const sectionRaw = row['__EMPTY_1'] || row['Section'] || '';
        const rollNoRaw = row['__EMPTY_2'] || row['Roll No'] || '';
        const studentNameRaw = row['__EMPTY_3'] || row['Student Name'] || '';
        const fatherNameRaw = row['__EMPTY_4'] || row["Father's Name"] || '';
        const contactRaw = row['__EMPTY_5'] || row['Contact #'] || '';
        const addressRaw = row['__EMPTY_6'] || row['Address'] || '';
        const annualChargesRaw = row['__EMPTY_7'] || row['Annual Charges'] || '';
        const tuitionFeeRaw = row['__EMPTY_8'] || row['Tuition Fee'] || '';
        const packageTotalRaw = row['__EMPTY_9'] || row['Package Decided'] || '';
        
        // Clean and validate data
        const section = String(sectionRaw).trim();
        const rollNo = String(rollNoRaw).trim();
        const studentName = String(studentNameRaw).trim();
        const fatherName = String(fatherNameRaw).trim();
        const contact = String(contactRaw).replace(/\D/g, ''); // Remove non-digits
        const address = String(addressRaw).trim();
        
        // Validation: Skip if no student name
        if (!studentName) {
          stats.skipped++;
          console.log(`⏭️  Row ${i + 1}: Skipped (no student name)`);
          continue;
        }
        
        // Validation: Skip if no roll number
        if (!rollNo) {
          stats.skipped++;
          console.log(`⏭️  Row ${i + 1}: ${studentName} - Skipped (no roll number)`);
          continue;
        }
        
        // Parse student name into first and last name
        const nameParts = studentName.trim().split(/\s+/);
        const firstName = nameParts[0] || studentName;
        const lastName = nameParts.slice(1).join(' ') || nameParts[0]; // Use firstName as lastName if only one word
        
        // Parse fees - only supported fields
        const annualCharges = annualChargesRaw ? parseFloat(String(annualChargesRaw).replace(/[^\d.]/g, '')) : null;
        const tuitionFee = tuitionFeeRaw ? parseFloat(String(tuitionFeeRaw).replace(/[^\d.]/g, '')) : null;
        const packageTotal = packageTotalRaw ? parseFloat(String(packageTotalRaw).replace(/[^\d.]/g, '')) : null;
        
        // Get or create section
        let sectionObj = null;
        if (section) {
          const sectionKey = `${section}-${defaultClass.id}`;
          
          if (!sectionCache[sectionKey]) {
            sectionObj = await prisma.section.findFirst({
              where: {
                name: section,
                classId: defaultClass.id,
              },
            });
            
            if (!sectionObj) {
              sectionObj = await prisma.section.create({
                data: {
                  name: section,
                  classId: defaultClass.id,
                },
              });
              console.log(`   📝 Created section: ${section}`);
            }
            
            sectionCache[sectionKey] = sectionObj;
          } else {
            sectionObj = sectionCache[sectionKey];
          }
        }
        
        // Create unique roll number (section-rollno format)
        let uniqueRollNo = section ? `${section}-${rollNo}` : rollNo;
        
        // If rollNo is empty or invalid, generate auto rollNo
        if (!rollNo || rollNo === 'undefined' || rollNo.trim() === '') {
          uniqueRollNo = `AUTO-${Date.now()}-${i}`;
          console.log(`   📝 Auto-generated roll number: ${uniqueRollNo}`);
        }
        
        // Check if student with this roll number already exists (only active ones)
        const existing = await prisma.student.findFirst({
          where: { 
            rollNo: uniqueRollNo,
            deletedAt: null  // Only check active students
          }
        });
        
        if (existing) {
          // If duplicate found, append timestamp to make it unique
          const timestamp = Date.now();
          uniqueRollNo = `${uniqueRollNo}-DUP-${timestamp}`;
          console.log(`   ⚠️  Duplicate detected, using: ${uniqueRollNo}`);
        }
        
        // Create student record - ONLY supported fields
        const studentData = {
          rollNo: uniqueRollNo,
          firstName: firstName,
          lastName: lastName,
          gender: 'MALE', // Default - can be updated later
          admissionDate: new Date('2025-04-01'), // Default admission date
          admissionType: 'NEW',
          classId: defaultClass.id,
          sectionId: sectionObj?.id || null,
          academicYearId: year.id,
          feeCategory: 'REGULAR',
          transport: 'NONE',
          status: 'ACTIVE',
          isActive: true,
        };
        
        // Add optional fields only if they have values
        if (fatherName) studentData.fatherName = fatherName;
        if (contact) studentData.fatherPhone = contact;
        if (address) studentData.address = address;
        if (annualCharges !== null && !isNaN(annualCharges)) studentData.annualCharges = annualCharges;
        if (tuitionFee !== null && !isNaN(tuitionFee)) studentData.tuitionFee = tuitionFee;
        if (packageTotal !== null && !isNaN(packageTotal)) studentData.packageTotal = packageTotal;
        
        // Create student
        await prisma.student.create({ data: studentData });
        
        stats.imported++;
        console.log(`✅ Row ${i + 1}: ${studentName} → Roll: ${uniqueRollNo}, Section: ${section || 'N/A'}`);
        
        // Progress indicator
        if (stats.imported % 25 === 0) {
          console.log(`   ... ${stats.imported}/${stats.total} processed`);
        }
        
      } catch (error) {
        stats.failed++;
        stats.errors.push({
          row: i + 1,
          name: row['Student Name'] || row['Name'] || 'Unknown',
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
  console.log('  EDU-SPHERE - SOFT DELETE & IMPORT SCRIPT');
  console.log('═'.repeat(60));
  
  try {
    // Step 1: Soft delete existing students
    const deleteResult = await softDeleteExistingStudents();
    
    // Step 2: Import new students
    const importStats = await importStudentsFromExcel();
    
    if (!importStats) {
      console.log('\n❌ Import failed - see errors above');
      process.exit(1);
    }
    
    // Summary
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('  📊 FINAL SUMMARY');
    console.log('═'.repeat(60));
    console.log(`🗑️  Soft Deleted:     ${deleteResult.count} students (retained as backup)`);
    console.log(`📝 Total Rows:       ${importStats.total}`);
    console.log(`✅ Imported:         ${importStats.imported} students`);
    console.log(`⏭️  Skipped:          ${importStats.skipped} (duplicates/invalid)`);
    console.log(`❌ Failed:           ${importStats.failed}`);
    
    if (importStats.errors.length > 0) {
      console.log('\n❌ ERROR DETAILS:');
      importStats.errors.forEach((err) => {
        console.log(`   Row ${err.row} (${err.name}): ${err.error}`);
      });
    }
    
    console.log('\n✅ Process completed successfully!');
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Verify the imported data in Student Module');
    console.log('   2. Check Fee Module to ensure fee data is accessible');
    console.log('   3. Soft-deleted students can be restored if needed');
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
