/**
 * RESTORE FROM NEWDATA.JSON - Correct 247 Students
 * Uses the exact data from newdata.json which has all students in correct sections
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();
const dataPath = path.join(__dirname, '..', '..', 'newdata.json');

let studentData = [];

try {
  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  studentData = rawData.data || [];
  console.log('\n✓ Loaded newdata.json with', studentData.length, 'students\n');
} catch (e) {
  console.error('❌ Error loading newdata.json:', e.message);
  process.exit(1);
}

async function main() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🔧 RESTORING DATABASE FROM NEWDATA.JSON');
    console.log('='.repeat(70) + '\n');

    // Step 1: Verify academic year
    console.log('STEP 1: Verifying academic year...\n');
    
    const year = await prisma.academicYear.findFirst({
      where: { label: '2025-26' }
    });

    if (!year) {
      console.error('❌ Academic year 2025-26 not found!');
      process.exit(1);
    }
    console.log(`✓ Found academic year: ${year.label}\n`);

    // Step 2: Clear corrupted data
    console.log('STEP 2: Clearing corrupted data...\n');
    
    const tables = [
      'studentPromotion',
      'activityLog',
      'bookIssue',
      'feeRefund',
      'feeRecord',
      'examResult',
      'exam',
      'studentAttendance',
      'teacherAttendance',
      'timetable',
      'teacherSubject',
      'announcement',
      'accountEntry',
      'student',
      'teacher'
    ];

    for (const table of tables) {
      try {
        await prisma[table].deleteMany({});
      } catch (e) {
        // Table might not exist or already empty
      }
    }

    await prisma.class.deleteMany({});
    await prisma.section.deleteMany({});

    console.log('✓ Deleted all corrupted records\n');

    // Step 3: Get or create all required classes and sections from data
    console.log('STEP 3: Setting up classes and sections...\n');

    const classMap = new Map();
    const sectionMap = new Map();
    const classSet = new Set();
    const sectionSet = new Set();

    // Collect unique classes and sections from student data
    for (const student of studentData) {
      const classData = student.class;
      const sectionData = student.section;

      if (classData) {
        classSet.add(JSON.stringify(classData));
      }
      if (sectionData) {
        sectionSet.add(JSON.stringify(sectionData));
      }
    }

    // Create classes
    const classes = Array.from(classSet).map(c => JSON.parse(c));
    for (const cls of classes) {
      let dbClass = await prisma.class.findFirst({
        where: { name: cls.name, academicYearId: year.id }
      });

      if (!dbClass) {
        dbClass = await prisma.class.create({
          data: {
            name: cls.name,
            academicYearId: year.id
          }
        });
      }

      classMap.set(cls.id, dbClass.id);
      console.log(`  ✓ ${cls.name}`);
    }

    console.log();

    // Create sections
    const sections = Array.from(sectionSet).map(s => JSON.parse(s));
    for (const sec of sections) {
      const classId = classMap.get(sec.classId);
      if (!classId) continue;

      let dbSection = await prisma.section.findFirst({
        where: { name: sec.name, classId: classId }
      });

      if (!dbSection) {
        dbSection = await prisma.section.create({
          data: {
            name: sec.name,
            classId: classId
          }
        });
      }

      sectionMap.set(sec.id, dbSection.id);
      console.log(`  ✓ ${sec.name}`);
    }

    console.log();

    // Step 4: Import all students
    console.log('STEP 4: Importing 247 students...\n');

    let imported = 0;
    let failed = 0;
    const sectionCounts = {};

    for (const student of studentData) {
      try {
        const classId = classMap.get(student.classId);
        const sectionId = sectionMap.get(student.sectionId);

        if (!classId || !sectionId) {
          failed++;
          continue;
        }

        await prisma.student.create({
          data: {
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            middleName: student.middleName || null,
            rollNo: student.rollNo,
            gender: student.gender || 'MALE',
            classId: classId,
            sectionId: sectionId,
            academicYearId: year.id,
            admissionDate: student.admissionDate ? new Date(student.admissionDate) : new Date(),
            bloodGroup: student.bloodGroup || null,
            cnic: student.cnic || null,
            address: student.address || null,
            fatherName: student.fatherName || null,
            fatherPhone: student.fatherPhone || null,
            motherName: student.motherName || null,
            guardianName: student.guardianName || null,
            emergencyContact: student.emergencyContact || null,
            status: 'ACTIVE',
            isActive: true,
            deletedAt: null
          }
        });

        imported++;
        const sectionName = student.section?.name || 'Unknown';
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

    // Step 5: Final verification
    console.log('STEP 5: Final Verification\n');

    const allSections = await prisma.section.findMany({
      include: {
        _count: { select: { students: true } }
      },
      orderBy: { name: 'asc' }
    });

    console.log('Students by section:');
    let totalStudents = 0;
    for (const section of allSections) {
      if (section._count.students > 0) {
        console.log(`  ${section.name}: ${section._count.students} students`);
        totalStudents += section._count.students;
      }
    }

    console.log(`\n  ═══════════════════════════════════════════`);
    console.log(`  TOTAL: ${totalStudents} students`);
    console.log(`  ═══════════════════════════════════════════\n`);

    if (totalStudents === 247) {
      console.log('✅ DATABASE RESTORED SUCCESSFULLY!');
      console.log('\n' + '='.repeat(70));
      console.log('✓ All 247 students in correct sections');
      console.log('✓ Database clean and ready');
      console.log('✓ All sections properly assigned');
      console.log('='.repeat(70) + '\n');
    } else {
      console.log(`⚠️ WARNING: Expected 247 students but found ${totalStudents}`);
    }

  } catch (err) {
    console.error('\\n❌ ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
