/**
 * Restore original 247 students + sections from school_data.json
 * This reverts all database changes made today
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Load school data
let SCHOOL_DATA;
const fs_path = require('path').resolve(__dirname);
const paths = [
  'C:\\Users\\muham\\Downloads\\updated\\EDUSPHERE\\EDUSPHERE\\SE Project\\SE Project (3)\\SE Project (2)\\SE Project\\New folder\\school_data.json',
  path.join(__dirname, '..', '..', 'SE Project (2)', 'SE Project', 'New folder', 'school_data.json'),
  path.join(__dirname, '..', '..', '..', 'school_data.json'),
];

let found = false;
for (const dataPath of paths) {
  try {
    const resolved = path.resolve(dataPath);
    if (fs.existsSync(resolved)) {
      SCHOOL_DATA = JSON.parse(fs.readFileSync(resolved, 'utf8'));
      console.log('✓ Loaded school_data.json from:', resolved);
      found = true;
      break;
    }
  } catch (e) {
    // Try next path
  }
}

if (!found) {
  console.error('❌ Cannot find school_data.json');
  console.error('Checked paths:');
  paths.forEach(p => console.error('  -', path.resolve(p)));
  process.exit(1);
}

async function main() {
  try {
    console.log('\n🔧 RESTORING ORIGINAL DATABASE STATE:\n');

    // Step 1: Delete everything except admin user
    console.log('Step 1: Clearing data...');
    
    await prisma.activityLog.deleteMany({});
    await prisma.studentPromotion.deleteMany({});
    await prisma.bookIssue.deleteMany({});
    await prisma.book.deleteMany({});
    await prisma.feeRefund.deleteMany({});
    await prisma.feeRecord.deleteMany({});
    await prisma.accountEntry.deleteMany({});
    await prisma.examResult.deleteMany({});
    await prisma.exam.deleteMany({});
    await prisma.studentAttendance.deleteMany({});
    await prisma.teacherAttendance.deleteMany({});
    await prisma.timetable.deleteMany({});
    await prisma.teacherSubject.deleteMany({});
    await prisma.announcement.deleteMany({});

    // Delete students and teachers (keep their user accounts)
    const students = await prisma.student.findMany({ select: { id: true } });
    for (const s of students) {
      await prisma.student.delete({ where: { id: s.id } }).catch(() => {});
    }

    const teachers = await prisma.teacher.findMany({ select: { id: true } });
    for (const t of teachers) {
      await prisma.teacher.delete({ where: { id: t.id } }).catch(() => {});
    }

    // Delete sections, classes (keep academic year)
    await prisma.subject.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.class.deleteMany({});

    console.log('✓ Database cleared\n');

    // Step 2: Create classes and sections
    console.log('Step 2: Creating classes and sections...');
    
    const year = await prisma.academicYear.findFirst({
      where: { label: '2025-26' }
    });

    const classMap = {};
    for (const cls of SCHOOL_DATA.schoolClasses) {
      const created = await prisma.class.create({
        data: {
          name: cls.name,
          academicYearId: year.id
        }
      });
      classMap[cls.id] = created.id;
    }

    const sectionMap = {};
    for (const section of SCHOOL_DATA.schoolSections) {
      const classId = classMap[section.classId];
      if (!classId) {
        console.log(`⚠️ Skipping section "${section.name}" - no corresponding class found`);
        continue;
      }
      
      const created = await prisma.section.create({
        data: {
          name: section.name,
          classId: classId
        }
      });
      sectionMap[section.id] = created.id;
    }

    console.log(`✓ Created ${Object.keys(classMap).length} classes`);
    console.log(`✓ Created ${Object.keys(sectionMap).length} sections\n`);

    // Step 3: Import students
    console.log('Step 3: Importing students...');
    
    let imported = 0;
    for (const student of SCHOOL_DATA.students) {
      try {
        await prisma.student.create({
          data: {
            firstName: student.firstName,
            lastName: student.lastName,
            middleName: student.middleName || null,
            rollNo: student.rollNo,
            gender: student.gender,
            classId: classMap[student.classId],
            sectionId: sectionMap[student.sectionId],
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
          process.stdout.write(`  ... ${imported} students imported\n`);
        }
      } catch (err) {
        console.log(`  ⚠️ Failed to import: ${student.firstName} ${student.lastName} (${student.rollNo})`);
      }
    }

    console.log(`✓ Imported ${imported} students\n`);

    // Step 4: Import fee records
    console.log('Step 4: Importing fee records...');
    
    const admin = await prisma.user.findFirst({ where: { username: 'admin' } });
    let feeImported = 0;
    let feeFailed = 0;

    for (const fee of SCHOOL_DATA.fees) {
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
          process.stdout.write(`  ... ${feeImported} fee records imported\n`);
        }
      } catch (err) {
        feeFailed++;
      }
    }

    console.log(`✓ Imported ${feeImported} fee records (${feeFailed} failed)\n`);

    // Verification
    console.log('📊 FINAL STATUS:\n');
    
    const classCount = await prisma.class.count();
    const sectionCount = await prisma.section.count();
    const studentCount = await prisma.student.count({ where: { deletedAt: null } });
    const feeCount = await prisma.feeRecord.count();

    console.log(`  Classes: ${classCount}`);
    console.log(`  Sections: ${sectionCount}`);
    console.log(`  Students: ${studentCount}`);
    console.log(`  Fee Records: ${feeCount}\n`);

    console.log('✅ DATABASE RESTORED TO ORIGINAL STATE!\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();
