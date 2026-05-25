/**
 * EDU-SPHERE — Database Reset + School Data Import Script
 * Clears all ERP data, preserves admin, imports 252 students + fee records
 * Run: node scripts/reset-and-import.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// ─── Load school data ─────────────────────────────────────────────────────────
const dataPath = path.join(__dirname, '..', '..', 'SE Project (2)', 'SE Project', 'New folder', 'school_data.json');
let SCHOOL_DATA;
try {
  SCHOOL_DATA = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (e) {
  // Try root-level copy
  const rootPath = path.join(__dirname, '..', '..', '..', 'school_data.json');
  try {
    SCHOOL_DATA = JSON.parse(fs.readFileSync(rootPath, 'utf8'));
  } catch (e2) {
    console.error('❌ Cannot find school_data.json. Tried:', dataPath, 'and', rootPath);
    process.exit(1);
  }
}

const stats = { imported: 0, skipped: 0, failed: 0, fees: 0, feesFailed: 0 };

async function resetDatabase() {
  console.log('\n🗑️  PHASE 1: Clearing existing ERP data...');

  // Delete in dependency order (children first)
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

  // Delete students (and their user accounts)
  const students = await prisma.student.findMany({ select: { id: true, userId: true } });
  for (const s of students) {
    await prisma.student.delete({ where: { id: s.id } });
    if (s.userId) {
      await prisma.user.delete({ where: { id: s.userId } }).catch(() => {});
    }
  }

  // Delete teachers (and their user accounts)
  const teachers = await prisma.teacher.findMany({ select: { id: true, userId: true } });
  for (const t of teachers) {
    await prisma.teacher.delete({ where: { id: t.id } });
    await prisma.user.delete({ where: { id: t.userId } }).catch(() => {});
  }

  // Delete subjects, sections, classes
  await prisma.subject.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.class.deleteMany({});

  console.log('✅ All ERP data cleared');
}

async function ensureAdmin() {
  console.log('\n👤 PHASE 2: Ensuring admin account...');
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const hash = await bcrypt.hash('admin123', saltRounds);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: hash, isActive: true },
    create: {
      username: 'admin',
      passwordHash: hash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  // Ensure academic year
  const year = await prisma.academicYear.upsert({
    where: { label: '2025-26' },
    update: { isCurrent: true },
    create: {
      label: '2025-26',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      isCurrent: true,
    },
  });

  console.log(`✅ Admin: admin@edusphere.com / admin123 (username: admin)`);
  console.log(`✅ Academic year: ${year.label}`);
  return { admin, year };
}

async function importClasses(year) {
  console.log('\n📚 PHASE 3: Importing classes & sections...');
  const classMap = {}; // "1st Year" → Class record
  const sectionMap = {}; // "C-1" → Section record

  // Create class
  for (const cls of SCHOOL_DATA.schoolClasses) {
    const created = await prisma.class.upsert({
      where: { name_academicYearId: { name: cls.name, academicYearId: year.id } },
      update: {},
      create: { name: cls.name, academicYearId: year.id },
    });
    classMap[cls.name] = created;
  }

  // Create sections
  for (const sec of SCHOOL_DATA.schoolSections) {
    const cls = classMap[sec.class];
    if (!cls) continue;
    const created = await prisma.section.upsert({
      where: { name_classId: { name: sec.name, classId: cls.id } },
      update: {},
      create: { name: sec.name, classId: cls.id },
    });
    sectionMap[sec.name] = created;
  }

  console.log(`✅ ${Object.keys(classMap).length} classes, ${Object.keys(sectionMap).length} sections created`);
  return { classMap, sectionMap };
}

function splitName(fullName) {
  const parts = (fullName || '').trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}

function safeRollNo(rollNo, studentId, section) {
  // Make rollNo unique: section_rollNo or fallback to id
  const base = String(rollNo || '').trim();
  if (!base) return `AUTO-${studentId}`;
  return `${section}-${base}`;
}

async function importStudents(year, classMap, sectionMap, admin) {
  console.log('\n🎓 PHASE 4: Importing 252 students...');
  const studentMap = {}; // original id → DB student

  const seenRollNos = new Set();

  for (const s of SCHOOL_DATA.students) {
    try {
      const cls = classMap[s.class];
      const sec = sectionMap[s.section];

      if (!cls) {
        console.warn(`  ⚠️  Skip student ${s.name}: class "${s.class}" not found`);
        stats.skipped++;
        continue;
      }

      const { firstName, lastName } = splitName(s.name);
      if (!firstName) {
        stats.skipped++;
        continue;
      }

      // Generate unique rollNo
      let rollNo = safeRollNo(s.rollNo, s.id, s.section);
      if (seenRollNos.has(rollNo)) {
        rollNo = `${rollNo}-${s.id}`;
      }
      seenRollNos.add(rollNo);

      // Map feeCategory
      const feeCatMap = { Regular: 'REGULAR', Scholarship: 'SCHOLARSHIP', 'Half Fee': 'HALF_FEE', Free: 'FREE' };
      const feeCategory = feeCatMap[s.feeCategory] || 'REGULAR';

      // Map transport
      let transport = 'NONE';
      if (s.transportFee && Number(s.transportFee) > 0) transport = 'SCHOOL_BUS';

      // Map admissionType
      const admTypeMap = { 'New Admission': 'NEW', Transfer: 'TRANSFER', Readmission: 'READMISSION' };
      const admissionType = admTypeMap[s.admissionType] || 'NEW';

      const student = await prisma.student.create({
        data: {
          rollNo,
          firstName,
          lastName,
          gender: 'FEMALE', // default — data doesn't have gender
          admissionDate: s.admissionDate ? new Date(s.admissionDate) : new Date('2025-04-01'),
          admissionType,
          classId: cls.id,
          sectionId: sec ? sec.id : null,
          academicYearId: year.id,
          feeCategory,
          transport,
          transportFee: s.transportFee ? parseFloat(s.transportFee) : null,
          annualCharges: s.annualCharges ? parseFloat(s.annualCharges) : null,
          tuitionFee: s.tuitionFee ? parseFloat(s.tuitionFee) : null,
          packageTotal: s.packageTotal ? parseFloat(s.packageTotal) : null,
          fatherName: s.fatherName || null,
          fatherPhone: s.fatherPhone || null,
          address: s.address || null,
          status: 'ACTIVE',
        },
      });

      studentMap[s.id] = student;
      stats.imported++;

      if (stats.imported % 50 === 0) {
        process.stdout.write(`  ... ${stats.imported} students imported\n`);
      }
    } catch (err) {
      console.warn(`  ⚠️  Failed student ${s.name}: ${err.message}`);
      stats.failed++;
    }
  }

  console.log(`✅ Students: ${stats.imported} imported, ${stats.skipped} skipped, ${stats.failed} failed`);
  return studentMap;
}

async function importFeeRecords(studentMap, admin) {
  console.log('\n💰 PHASE 5: Importing fee records...');

  const feeTypeMap = {
    'Tuition Fee': 'MONTHLY',
    'Annual Package': 'ADMISSION',
    'Transport Fee': 'TRANSPORT',
    'Exam Fee': 'EXAM',
    'Library Fee': 'LIBRARY',
  };

  const seenReceipts = new Set();

  for (const f of SCHOOL_DATA.feeRecords) {
    try {
      const student = studentMap[f.studentId];
      if (!student) {
        stats.feesFailed++;
        continue;
      }

      // Make receiptNo unique
      let receiptNo = String(f.receiptNo || '').trim();
      if (!receiptNo) receiptNo = `AUTO-${f.id}`;
      if (seenReceipts.has(receiptNo)) {
        receiptNo = `${receiptNo}-${f.id}`;
      }
      seenReceipts.add(receiptNo);

      const feeType = feeTypeMap[f.feeType] || 'OTHER';

      // Map installment to period
      const period = f.period || null;
      const installment = f.installment || null;

      await prisma.feeRecord.create({
        data: {
          receiptNo,
          studentId: student.id,
          feeType,
          period,
          installment,
          amount: parseFloat(f.amount) || 0,
          transportAmount: f.transportAmount ? parseFloat(f.transportAmount) : null,
          paymentMethod: 'CASH',
          remarks: f.remarks || null,
          date: f.date ? new Date(f.date) : new Date(),
          status: f.status === 'Paid' ? 'PAID' : 'PAID',
          collectedById: admin.id,
        },
      });

      stats.fees++;
    } catch (err) {
      stats.feesFailed++;
    }
  }

  console.log(`✅ Fee records: ${stats.fees} imported, ${stats.feesFailed} failed`);
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  EDU-SPHERE — Database Reset + School Data Import');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Data source: ${SCHOOL_DATA.students.length} students, ${SCHOOL_DATA.feeRecords.length} fee records`);

  await resetDatabase();
  const { admin, year } = await ensureAdmin();
  const { classMap, sectionMap } = await importClasses(year);
  const studentMap = await importStudents(year, classMap, sectionMap, admin);
  await importFeeRecords(studentMap, admin);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  IMPORT SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Students imported : ${stats.imported}`);
  console.log(`  Students skipped  : ${stats.skipped}`);
  console.log(`  Students failed   : ${stats.failed}`);
  console.log(`  Fee records       : ${stats.fees}`);
  console.log(`  Fee records failed: ${stats.feesFailed}`);
  console.log('───────────────────────────────────────────────────────');
  console.log('  Admin login: username=admin  password=admin123');
  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e.message);
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
