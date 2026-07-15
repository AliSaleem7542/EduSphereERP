/**
 * FINAL RESTORATION SCRIPT
 * Restores database to original 247 students from school_data.json
 * This script runs on Render and restores everything
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

console.log('\n' + '='.repeat(70));
console.log('🔧 FINAL DATABASE RESTORATION');
console.log('='.repeat(70) + '\n');

console.log('Loading configuration...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '❌ NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development\n');

// Load school data
let SCHOOL_DATA;
const dataPath = path.join(__dirname, '..', '..', 'SE Project (2)', 'SE Project', 'New folder', 'school_data.json');

try {
  if (fs.existsSync(dataPath)) {
    SCHOOL_DATA = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log('✓ Loaded school_data.json\n');
  } else {
    console.error('❌ school_data.json not found at:', dataPath);
    process.exit(1);
  }
} catch (e) {
  console.error('❌ Error loading school_data.json:', e.message);
  process.exit(1);
}

async function main() {
  try {
    // PHASE 1: Clear data
    console.log('PHASE 1: Clearing corrupted data...\n');

    const counts = {
      students: await prisma.student.count(),
      fees: await prisma.feeRecord.count(),
      classes: await prisma.class.count(),
      sections: await prisma.section.count(),
    };

    console.log('Before cleanup:');
    console.log(`  Students: ${counts.students}`);
    console.log(`  Fee Records: ${counts.fees}`);
    console.log(`  Classes: ${counts.classes}`);
    console.log(`  Sections: ${counts.sections}\n`);

    // Delete in dependency order
    console.log('Deleting dependent records...');
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
    console.log('✓ Deleted dependent records');

    console.log('Deleting students...');
    const studentDel = await prisma.student.deleteMany({});
    console.log(`✓ Deleted ${studentDel.count} students`);

    console.log('Deleting teachers...');
    const teacherDel = await prisma.teacher.deleteMany({});
    console.log(`✓ Deleted ${teacherDel.count} teachers`);

    console.log('Deleting sections and classes...');
    await prisma.subject.deleteMany({});
    await prisma.section.deleteMany({});
    const classDel = await prisma.class.deleteMany({});
    console.log(`✓ Deleted ${classDel.count} classes\n`);

    // PHASE 2: Recreate structure
    console.log('PHASE 2: Creating classes and sections...\n');

    const year = await prisma.academicYear.findFirst({
      where: { label: '2025-26' }
    });

    if (!year) {
      console.error('❌ Academic year 2025-26 not found!');
      process.exit(1);
    }

    const classMap = {};
    console.log('Creating classes:');
    for (const cls of SCHOOL_DATA.schoolClasses) {
      const created = await prisma.class.create({
        data: {
          name: cls.name,
          academicYearId: year.id
        }
      });
      classMap[cls.id] = created.id;
      console.log(`  ✓ ${cls.name}`);
    }

    const sectionMap = {};
    console.log('\nCreating sections:');
    for (const section of SCHOOL_DATA.schoolSections) {
      const classId = classMap[section.classId];
      if (!classId) continue;

      const created = await prisma.section.create({
        data: {
          name: section.name,
          classId: classId
        }
      });
      sectionMap[section.id] = created.id;
      console.log(`  ✓ ${section.name}`);
    }

    console.log(`\nCreated ${Object.keys(classMap).length} classes`);
    console.log(`Created ${Object.keys(sectionMap).length} sections\n`);

    // PHASE 3: Import students
    console.log('PHASE 3: Importing students...\n');

    let imported = 0;
    let failed = 0;

    for (const student of SCHOOL_DATA.students) {
      try {
        const classId = classMap[student.classId];
        const sectionId = sectionMap[student.sectionId];

        if (!classId) {
          failed++;
          continue;
        }

        await prisma.student.create({
          data: {
            firstName: student.firstName,
            lastName: student.lastName,
            middleName: student.middleName || null,
            rollNo: student.rollNo,
            gender: student.gender || 'FEMALE',
            classId: classId,
            sectionId: sectionId || null,
            academicYearId: year.id,
            admissionDate: new Date(student.admissionDate),
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

        if (imported % 50 === 0) {
          console.log(`  ... ${imported} students imported`);
        }
      } catch (err) {
        failed++;
      }
    }

    console.log(`✓ Imported ${imported} students`);
    if (failed > 0) console.log(`⚠️  Failed: ${failed}\n`);

    // PHASE 4: Import fee records
    console.log('PHASE 4: Importing fee records...\n');

    const admin = await prisma.user.findFirst({ where: { username: 'admin' } });
    let feeImported = 0;
    let feeFailed = 0;

    for (const fee of (SCHOOL_DATA.fees || [])) {
      try {
        const student = await prisma.student.findFirst({
          where: { rollNo: fee.rollNo }
        });

        if (!student) {
          feeFailed++;
          continue;
        }

        await prisma.feeRecord.create({
          data: {
            receiptNo: fee.receiptNo || `REC-${Date.now()}-${feeImported}`,
            studentId: student.id,
            feeType: 'MONTHLY',
            period: fee.period || 'Monthly',
            amount: parseFloat(fee.amount) || 0,
            paymentMethod: 'CASH',
            date: new Date(fee.date || new Date()),
            status: 'PAID',
            collectedById: admin.id,
            isActive: true,
            deletedAt: null
          }
        });
        feeImported++;

        if (feeImported % 100 === 0) {
          console.log(`  ... ${feeImported} fee records imported`);
        }
      } catch (err) {
        feeFailed++;
      }
    }

    console.log(`✓ Imported ${feeImported} fee records`);
    if (feeFailed > 0) console.log(`⚠️  Failed: ${feeFailed}\n`);

    // PHASE 5: Verification
    console.log('PHASE 5: Verification\n');

    const finalCounts = {
      students: await prisma.student.count({ where: { deletedAt: null } }),
      fees: await prisma.feeRecord.count(),
      classes: await prisma.class.count(),
      sections: await prisma.section.count(),
    };

    console.log('After restoration:');
    console.log(`  ✓ Students: ${finalCounts.students}`);
    console.log(`  ✓ Fee Records: ${finalCounts.fees}`);
    console.log(`  ✓ Classes: ${finalCounts.classes}`);
    console.log(`  ✓ Sections: ${finalCounts.sections}\n`);

    // Get section-wise count
    const sections = await prisma.section.findMany({
      include: {
        _count: { select: { students: true } }
      },
      orderBy: { name: 'asc' }
    });

    console.log('Students by section:');
    sections.forEach(s => {
      if (s._count.students > 0) {
        console.log(`  ${s.name}: ${s._count.students}`);
      }
    });

    console.log('\n' + '='.repeat(70));
    console.log('✅ DATABASE RESTORATION COMPLETE!');
    console.log('='.repeat(70));
    console.log('\nYou can now:\n');
    console.log('1. Refresh the application in your browser');
    console.log('2. Login with: admin / admin123');
    console.log('3. Go to Manage Students');
    console.log('4. All sections should now show correct student counts\n');

  } catch (err) {
    console.error('\n❌ ERROR DURING RESTORATION:\n');
    console.error(err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
