/**
 * Import students from "2nd file.xlsx"
 * Reads Excel file and imports into PostgreSQL database
 * 
 * Usage: node scripts/import-from-excel.js
 */

const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

const EXCEL_FILE_PATH = path.join(
  __dirname,
  '..',
  '..',
  'SE Project (2)',
  'SE Project',
  'New folder',
  '2nd file.xlsx'
);

async function main() {
  try {
    console.log('📊 EDU-SPHERE — Excel Import Script');
    console.log('=' .repeat(50));
    
    // Check if file exists
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      console.error('❌ Excel file not found:', EXCEL_FILE_PATH);
      process.exit(1);
    }
    
    console.log('✅ Excel file found:', EXCEL_FILE_PATH);
    
    // Read Excel file
    console.log('\n📖 Reading Excel file...');
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    
    // Use first sheet (Head Sheet)
    const sheetName = workbook.SheetNames[0];
    console.log(`✅ Reading sheet: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON - Row 3 is header, Row 4 onwards is data
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      range: 3, // Start from row 3 (0-indexed, so row 4 in Excel)
      defval: '', // Default value for empty cells
      header: ['srNo', 'blank1', 'section', 'rollNo', 'studentName', 'fatherName', 'contactNo', 'address', 'annualCharges'],
    });
    
    // Filter out empty rows
    const validData = data.filter(row => row.studentName && row.studentName.trim() !== '');
    
    console.log(`✅ Found ${validData.length} valid student records in Excel`);
    
    // Display first row as sample
    if (validData.length > 0) {
      console.log('\n📋 Sample row (first student):');
      console.log(JSON.stringify(validData[0], null, 2));
    }
    
    // Get admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    
    if (!admin) {
      console.error('❌ No admin user found in database');
      process.exit(1);
    }
    
    console.log(`✅ Admin user: ${admin.username}`);
    
    // Get academic year
    const year = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
    });
    
    if (!year) {
      console.error('❌ No active academic year found');
      process.exit(1);
    }
    
    console.log(`✅ Academic year: ${year.label}`);
    
    // Get or create class
    let schoolClass = await prisma.class.findFirst({
      where: { name: '1st Year' },
    });
    
    if (!schoolClass) {
      console.log('📝 Creating class: 1st Year');
      schoolClass = await prisma.class.create({
        data: {
          name: '1st Year',
          academicYearId: year.id,
        },
      });
    }
    
    console.log(`✅ Class: ${schoolClass.name} (ID: ${schoolClass.id})`);
    
    // Stats
    const stats = {
      total: validData.length,
      imported: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };
    
    console.log('\n🎓 Starting student import...\n');
    
    // Import students
    for (let i = 0; i < validData.length; i++) {
      const row = validData[i];
      
      try {
        // Extract data from row
        const rollNo = row.rollNo ? String(row.rollNo).trim() : `${1000 + i}`;
        const name = row.studentName ? String(row.studentName).trim() : '';
        const fatherName = row.fatherName ? String(row.fatherName).trim() : '';
        const phone = row.contactNo ? String(row.contactNo).replace(/\D/g, '') : '';
        const section = row.section ? String(row.section).trim() : '';
        const address = row.address ? String(row.address).trim() : '';
        
        if (!name) {
          stats.skipped++;
          console.log(`⏭️  Row ${i + 1}: Skipped (no name)`);
          continue;
        }
        
        // Check if student already exists
        const existing = await prisma.student.findFirst({
          where: {
            OR: [
              { rollNo: String(rollNo) },
              {
                AND: [
                  { firstName: name.split(' ')[0] },
                  { lastName: name.split(' ').slice(1).join(' ') || '' },
                ],
              },
            ],
          },
        });
        
        if (existing) {
          stats.skipped++;
          console.log(`⏭️  Row ${i + 1}: ${name} - Already exists`);
          continue;
        }
        
        // Get or create section
        let sectionObj = null;
        if (section) {
          sectionObj = await prisma.section.findFirst({
            where: {
              name: String(section),
              classId: schoolClass.id,
            },
          });
          
          if (!sectionObj) {
            sectionObj = await prisma.section.create({
              data: {
                name: String(section),
                classId: schoolClass.id,
              },
            });
          }
        }
        
        // Parse name
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || name;
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Parse annual charges
        const annualCharges = row.annualCharges 
          ? parseFloat(String(row.annualCharges).replace(/[^\d.]/g, '')) 
          : null;
        
        // Create student - only fill fields that exist in schema
        const student = await prisma.student.create({
          data: {
            rollNo: String(rollNo),
            firstName: firstName,
            lastName: lastName,
            fatherName: fatherName || null,
            fatherPhone: phone || null,
            address: address || null,
            classId: schoolClass.id,
            sectionId: sectionObj?.id || null,
            academicYearId: year.id,
            gender: 'FEMALE', // Default - adjust if needed
            admissionDate: new Date(),
            admissionType: 'NEW', // Correct enum value
            feeCategory: 'REGULAR',
            status: 'ACTIVE',
            annualCharges: annualCharges,
          },
        });
        
        stats.imported++;
        console.log(`✅ Row ${i + 1}: ${name} → Roll No: ${rollNo}, Section: ${section || 'N/A'}`);
        
        if (stats.imported % 10 === 0) {
          console.log(`   ... ${stats.imported}/${stats.total} imported`);
        }
        
      } catch (error) {
        stats.failed++;
        stats.errors.push({
          row: i + 1,
          data: row,
          error: error.message,
        });
        console.error(`❌ Row ${i + 1}: Error - ${error.message}`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total rows:      ${stats.total}`);
    console.log(`✅ Imported:      ${stats.imported}`);
    console.log(`⏭️  Skipped:       ${stats.skipped} (duplicates or no name)`);
    console.log(`❌ Failed:        ${stats.failed}`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      stats.errors.forEach((err) => {
        console.log(`   Row ${err.row}: ${err.error}`);
      });
    }
    
    console.log('\n✅ Import completed!');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
