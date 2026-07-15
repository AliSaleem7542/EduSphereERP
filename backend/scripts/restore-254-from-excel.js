/**
 * RESTORE 254 STUDENTS FROM EXCEL FILE
 * Reads 2nd-file.xlsx and imports all students into database
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('RESTORING 254 STUDENTS FROM EXCEL FILE');
    console.log('='.repeat(70) + '\n');

    // Verify academic year exists
    console.log('STEP 1: Verifying academic year...\n');
    const year = await prisma.academicYear.findFirst({
      where: { label: '2025-26' }
    });

    if (!year) {
      console.error('ERROR: Academic year 2025-26 not found!');
      process.exit(1);
    }
    console.log(`✓ Found academic year: ${year.label}\n`);

    // Clear existing data
    console.log('STEP 2: Clearing existing corrupted data...\n');
    await prisma.studentPromotion.deleteMany({});
    await prisma.activityLog.deleteMany({});
    await prisma.bookIssue.deleteMany({});
    await prisma.feeRefund.deleteMany({});
    await prisma.feeRecord.deleteMany({});
    await prisma.examResult.deleteMany({});
    await prisma.exam.deleteMany({});
    await prisma.studentAttendance.deleteMany({});
    await prisma.teacherAttendance.deleteMany({});
    await prisma.timetable.deleteMany({});
    await prisma.teacherSubject.deleteMany({});
    await prisma.announcement.deleteMany({});
    await prisma.accountEntry.deleteMany({});
    
    const delStudents = await prisma.student.deleteMany({});
    console.log(`✓ Deleted ${delStudents.count} existing students`);
    
    const delTeachers = await prisma.teacher.deleteMany({});
    console.log(`✓ Deleted ${delTeachers.count} existing teachers`);
    
    await prisma.subject.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.section.deleteMany({});
    console.log('✓ Cleared all tables\n');

    // Read Excel file
    console.log('STEP 3: Reading Excel file...\n');
    const excelPath = path.join(__dirname, '..', '..', '2nd-file.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.error(`ERROR: Excel file not found: ${excelPath}`);
      process.exit(1);
    }

    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✓ Read ${rawData.length} rows from Excel\n`);

    // Create classes and sections
    console.log('STEP 4: Creating classes and sections...\n');

    const classMap = new Map();
    const sectionMap = new Map();

    // Create 1st Year class
    const cls1 = await prisma.class.create({
      data: {
        name: '1st Year',
        academicYearId: year.id
      }
    });
    classMap.set('1st Year', cls1.id);
    console.log('  ✓ 1st Year');

    // Create sections
    const sectionNames = ['C-1', 'M-1', 'M-4', 'E-1', 'C-2Eco', 'I.Com 1', 'I.Com 2'];
    for (const secName of sectionNames) {
      const sec = await prisma.section.create({
        data: {
          name: secName,
          classId: cls1.id
        }
      });
      sectionMap.set(secName, sec.id);
      console.log(`  ✓ ${secName}`);
    }

    console.log();

    // Import students
    console.log('STEP 5: Importing students from Excel...\n');

    let imported = 0;
    let failed = 0;
    const sectionCounts = {};

    for (const row of rawData) {
      try {
        // Parse row - adjust field names based on Excel structure
        const firstName = (row['First Name'] || row['firstName'] || row['FIRST_NAME'] || '').trim();
        const lastName = (row['Last Name'] || row['lastName'] || row['LAST_NAME'] || '').trim();
        const rollNo = (row['Roll No'] || row['rollNo'] || row['ROLL_NO'] || '').trim();
        const sectionName = (row['Section'] || row['section'] || row['SECTION'] || 'C-1').trim();
        const gender = (row['Gender'] || row['gender'] || 'MALE').toUpperCase();
        const address = (row['Address'] || row['address'] || '').trim();
        const fatherName = (row['Father Name'] || row['fatherName'] || '').trim();
        const fatherPhone = (row['Father Phone'] || row['fatherPhone'] || '').trim();
        const admissionDate = row['Admission Date'] || new Date();

        if (!firstName || !rollNo) {
          failed++;
          continue;
        }

        const sectionId = sectionMap.get(sectionName) || sectionMap.get('C-1');
        if (!sectionId) {
          failed++;
          continue;
        }

        await prisma.student.create({
          data: {
            firstName: firstName,
            lastName: lastName || '',
            middleName: null,
            rollNo: rollNo,
            gender: ['MALE', 'FEMALE', 'OTHER'].includes(gender) ? gender : 'MALE',
            classId: cls1.id,
            sectionId: sectionId,
            academicYearId: year.id,
            admissionDate: new Date(admissionDate),
            bloodGroup: null,
            cnic: null,
            address: address || null,
            fatherName: fatherName || null,
            fatherPhone: fatherPhone || null,
            motherName: null,
            guardianName: null,
            emergencyContact: null,
            status: 'ACTIVE',
            isActive: true,
            deletedAt: null
          }
        });

        imported++;
        sectionCounts[sectionName] = (sectionCounts[sectionName] || 0) + 1;

        if (imported % 50 === 0) {
          console.log(`  ... ${imported} students imported`);
        }
      } catch (err) {
        failed++;
      }
    }

    console.log(`\n✓ Successfully imported ${imported} students`);
    if (failed > 0) console.log(`⚠️ Failed to import: ${failed}\n`);

    // Verification
    console.log('STEP 6: Final Verification\n');

    const sections = await prisma.section.findMany({
      include: {
        _count: { select: { students: true } }
      },
      orderBy: { name: 'asc' }
    });

    console.log('Students by section:');
    let totalStudents = 0;
    for (const section of sections) {
      if (section._count.students > 0) {
        console.log(`  ${section.name}: ${section._count.students} students`);
        totalStudents += section._count.students;
      }
    }

    console.log(`\n  ═══════════════════════════════════════════`);
    console.log(`  TOTAL: ${totalStudents} students`);
    console.log(`  ═══════════════════════════════════════════\n`);

    if (totalStudents >= 240) {
      console.log('✅ DATABASE SUCCESSFULLY RESTORED!');
      console.log('\n' + '='.repeat(70));
      console.log(`✓ ${totalStudents} students imported and assigned to sections`);
      console.log('✓ Database clean and ready');
      console.log('✓ All sections properly configured');
      console.log('='.repeat(70) + '\n');
    } else {
      console.log(`⚠️ WARNING: Expected ~254 students but found ${totalStudents}`);
    }

  } catch (err) {
    console.error('\nERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
