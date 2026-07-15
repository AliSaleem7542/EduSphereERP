/**
 * Import Students from 2nd file.xlsx
 * Extract student data with classes, sections, and fee records
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

function ensureSSL(url) {
  if (!url) return url;
  if (url.includes('sslmode=') || url.includes('ssl=')) return url;
  if (url.includes('neon.tech') || url.includes('amazonaws.com')) {
    return url + (url.includes('?') ? '&' : '?') + 'sslmode=require';
  }
  return url;
}

const dbUrl = ensureSSL(process.env.DIRECT_URL || process.env.DATABASE_URL);
process.env.DATABASE_URL = dbUrl;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

const applyChanges = process.argv.includes('--apply');

// Map section codes to class names
const SECTION_TO_CLASS = {
  'C-1': '1st Year', 'C-2': '2nd Year - Commerce', 'C-3': '3rd Year',
  'C-4': '4th Year', 'C-5': '5th Year',
  'M-1': 'MCP-1st Year', 'M-4': 'MCP-4th Year',
  'E-1': 'Engineering-1st', 'E-2': 'Engineering-2nd',
  'I.Com 1': 'Intermediate Commerce',
  'IT-1': 'IT-1st Year', 'IT-2': 'IT-2nd Year'
};

async function main() {
  console.log('\n📂 Import Students from 2nd file.xlsx\n');
  await prisma.$connect();

  try {
    const filePath = path.join(__dirname, '../../2nd-file.xlsx');
    
    console.log(`📖 Reading: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    
    // Read first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`✅ Found ${data.length} rows from sheet "${sheetName}"\n`);

    // Parse student data
    const students = [];
    for (const row of data) {
      // Skip header rows and empty rows
      if (!row['Student Name'] || row['Student Name'].toString().toLowerCase().includes('student name')) continue;
      
      const section = (row['Section'] || '').toString().trim();
      const rollNo = (row['Roll No'] || '').toString().trim();
      const name = (row['Student Name'] || '').toString().trim();
      const fatherName = (row['Father\'s Name'] || row['Father\'s Name'] || '').toString().trim();
      const phone = (row['Contact #'] || '').toString().trim();
      const address = (row['Address'] || '').toString().trim();
      const annualCharges = parseFloat(row['Annual Charges'] || 0);
      const tuitionFee = parseFloat(row['Tuition Fee'] || 0);

      if (!name || !section || !rollNo) continue;

      // Parse name
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');

      students.push({
        section,
        rollNo,
        firstName: firstName.toUpperCase(),
        lastName: lastName.toUpperCase(),
        fatherName: fatherName.toUpperCase(),
        phone,
        address: address.toUpperCase(),
        annualCharges,
        tuitionFee,
        className: SECTION_TO_CLASS[section] || section
      });
    }

    console.log(`� Parsed ${students.length} valid students\n`);
    console.log('Sample data (first 5):');
    students.slice(0, 5).forEach((s, i) => {
      console.log(`${i+1}. ${s.rollNo} | ${s.firstName} ${s.lastName} | ${s.section} | Fee: PKR ${s.annualCharges + s.tuitionFee}`);
    });
    console.log('');

    if (applyChanges) {
      console.log(`⚠️  Importing ${students.length} students to database...\n`);

      // Get or create academic year
      let academicYear = await prisma.academicYear.findFirst({
        where: { isCurrent: true }
      });

      if (!academicYear) {
        academicYear = await prisma.academicYear.create({
          data: {
            label: '2025-2026',
            startDate: new Date('2025-04-01'),
            endDate: new Date('2026-03-31'),
            isCurrent: true
          }
        });
        console.log('✅ Created Academic Year: 2025-2026\n');
      }

      let importedCount = 0;
      let errorCount = 0;
      const classCache = {};
      const sectionCache = {};

      for (const stu of students) {
        try {
          // Get or create class
          let classObj = classCache[stu.className];
          if (!classObj) {
            classObj = await prisma.class.findFirst({
              where: { name: stu.className, academicYearId: academicYear.id }
            });
            if (!classObj) {
              classObj = await prisma.class.create({
                data: { name: stu.className, academicYearId: academicYear.id }
              });
            }
            classCache[stu.className] = classObj;
          }

          // Get or create section
          const sectionKey = `${classObj.id}-${stu.section}`;
          let sectionObj = sectionCache[sectionKey];
          if (!sectionObj) {
            sectionObj = await prisma.section.findFirst({
              where: { name: stu.section, classId: classObj.id }
            });
            if (!sectionObj) {
              sectionObj = await prisma.section.create({
                data: { name: stu.section, classId: classObj.id }
              });
            }
            sectionCache[sectionKey] = sectionObj;
          }

          // Create student
          const totalFee = (stu.annualCharges || 0) + (stu.tuitionFee || 0);
          const newStudent = await prisma.student.create({
            data: {
              rollNo: stu.rollNo,
              firstName: stu.firstName,
              lastName: stu.lastName,
              gender: 'MALE', // Default, can be updated later
              fatherName: stu.fatherName,
              fatherPhone: stu.phone,
              address: stu.address,
              feeCategory: 'REGULAR',
              annualCharges: String(stu.annualCharges || 0),
              tuitionFee: String(stu.tuitionFee || 0),
              packageTotal: String(totalFee),
              classId: classObj.id,
              sectionId: sectionObj.id,
              academicYearId: academicYear.id,
              admissionDate: new Date('2025-04-01'),
              admissionType: 'NEW',
              status: 'ACTIVE',
              isActive: true
            }
          });

          // Create fee record if there's a fee
          if (totalFee > 0) {
            await prisma.feeRecord.create({
              data: {
                studentId: newStudent.id,
                amount: String(totalFee),
                dueDate: new Date('2025-04-30'),
                paidAmount: '0',
                status: 'PENDING',
                month: 'ANNUAL',
                academicYearId: academicYear.id
              }
            });
          }

          importedCount++;
          process.stdout.write('.');

        } catch (e) {
          errorCount++;
          if (errorCount <= 5) {
            console.error(`\n⚠️  Error importing ${stu.rollNo}:`, e.message);
          }
        }
      }

      console.log(`\n\n✅ Import complete!`);
      console.log(`   ✓ Imported: ${importedCount}`);
      console.log(`   ✗ Errors: ${errorCount}\n`);

    } else {
      console.log(`📝 DRY RUN - showing what would be imported\n`);
      console.log(`To apply this import, run:`);
      console.log(`   node scripts/import-from-2nd-file.js --apply\n`);
    }

  } catch(e) {
    console.error('❌ Error:', e.message);
  }

  await prisma.$disconnect();
}

main();
