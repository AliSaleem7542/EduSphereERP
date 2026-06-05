/**
 * Extracts SCHOOL_DATA from import-students.html and re-imports everything
 * including all 686 fee records into PostgreSQL.
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ── Extract SCHOOL_DATA from import-students.html ─────────────────────────────
const htmlPath = path.join(
  __dirname, '..', '..', 'SE Project (2)', 'SE Project', 'New folder', 'import-students.html'
);
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract the var SCHOOL_DATA = {...}; block
const match = html.match(/var SCHOOL_DATA\s*=\s*(\{[\s\S]*?\});\s*\n/);
if (!match) {
  console.error('❌ Could not find SCHOOL_DATA in import-students.html');
  process.exit(1);
}

let SCHOOL_DATA;
try {
  SCHOOL_DATA = JSON.parse(match[1]);
} catch (e) {
  console.error('❌ Failed to parse SCHOOL_DATA JSON:', e.message);
  process.exit(1);
}

console.log('✅ Extracted from import-students.html:');
console.log('   Students   :', SCHOOL_DATA.students.length);
console.log('   Sections   :', SCHOOL_DATA.schoolSections.length);
console.log('   Classes    :', SCHOOL_DATA.schoolClasses.length);
console.log('   FeeRecords :', SCHOOL_DATA.feeRecords.length);

const stats = { imported: 0, skipped: 0, failed: 0, fees: 0, feesFailed: 0 };

function splitName(fullName) {
  const parts = (fullName || '').trim().split(/\s+/);
  if (!parts[0]) return { firstName: 'Unknown', lastName: 'Unknown' };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  EDU-SPHERE — Full Re-Import with 686 Fee Records');
  console.log('═══════════════════════════════════════════════════════');

  // ── Phase 1: Clear existing data ──────────────────────────────────────────
  console.log('\n🗑️  Clearing existing ERP data...');
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

  const students = await prisma.student.findMany({ select: { id: true, userId: true } });
  for (const s of students) {
    await prisma.student.delete({ where: { id: s.id } }).catch(() => {});
    if (s.userId) await prisma.user.delete({ where: { id: s.userId } }).catch(() => {});
  }
  const teachers = await prisma.teacher.findMany({ select: { id: true, userId: true } });
  for (const t of teachers) {
    await prisma.teacher.delete({ where: { id: t.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: t.userId } }).catch(() => {});
  }
  await prisma.subject.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.class.deleteMany({});
  console.log('✅ Cleared');

  // ── Phase 2: Admin + Academic Year ────────────────────────────────────────
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const hash = await bcrypt.hash('admin123', saltRounds);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: hash, isActive: true },
    create: { username: 'admin', passwordHash: hash, role: 'ADMIN', isActive: true },
  });
  const year = await prisma.academicYear.upsert({
    where: { label: '2025-26' },
    update: { isCurrent: true },
    create: { label: '2025-26', startDate: new Date('2025-04-01'), endDate: new Date('2026-03-31'), isCurrent: true },
  });
  console.log('✅ Admin + Academic Year ready');

  // ── Phase 3: Classes & Sections ───────────────────────────────────────────
  const classMap = {};
  for (const cls of SCHOOL_DATA.schoolClasses) {
    const c = await prisma.class.upsert({
      where: { name_academicYearId: { name: cls.name, academicYearId: year.id } },
      update: {},
      create: { name: cls.name, academicYearId: year.id },
    });
    classMap[cls.name] = c;
  }
  const sectionMap = {};
  for (const sec of SCHOOL_DATA.schoolSections) {
    const cls = classMap[sec.class];
    if (!cls) continue;
    const s = await prisma.section.upsert({
      where: { name_classId: { name: sec.name, classId: cls.id } },
      update: {},
      create: { name: sec.name, classId: cls.id },
    });
    sectionMap[sec.name] = s;
  }
  console.log(`✅ ${Object.keys(classMap).length} classes, ${Object.keys(sectionMap).length} sections`);

  // ── Phase 4: Students ─────────────────────────────────────────────────────
  console.log('\n🎓 Importing students...');
  const studentMap = {};
  const seenRollNos = new Set();
  const feeCatMap = { Regular: 'REGULAR', Scholarship: 'SCHOLARSHIP', 'Half Fee': 'HALF_FEE', Free: 'FREE' };
  const admTypeMap = { 'New Admission': 'NEW', Transfer: 'TRANSFER', Readmission: 'READMISSION' };

  for (const s of SCHOOL_DATA.students) {
    try {
      const { firstName, lastName } = splitName(s.name);
      if (!firstName || firstName === 'Unknown') { stats.skipped++; continue; }

      const cls = classMap[s.class];
      if (!cls) { stats.skipped++; continue; }
      const sec = sectionMap[s.section];

      let rollNo = s.rollNo ? `${s.section}-${s.rollNo}` : `AUTO-${s.id}`;
      if (seenRollNos.has(rollNo)) rollNo = `${rollNo}-${s.id}`;
      seenRollNos.add(rollNo);

      const student = await prisma.student.create({
        data: {
          rollNo,
          firstName,
          lastName,
          gender: (function() {
            var g = String(s.gender || '').toUpperCase();
            return g === 'FEMALE' ? 'FEMALE' : g === 'OTHER' ? 'OTHER' : 'MALE';
          })(),
          admissionDate: s.admissionDate ? new Date(s.admissionDate) : new Date('2025-04-01'),
          admissionType: admTypeMap[s.admissionType] || 'NEW',
          classId: cls.id,
          sectionId: sec ? sec.id : null,
          academicYearId: year.id,
          feeCategory: feeCatMap[s.feeCategory] || 'REGULAR',
          transport: (s.transportFee && Number(s.transportFee) > 0) ? 'SCHOOL_BUS' : 'NONE',
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
      if (stats.imported % 50 === 0) process.stdout.write(`  ... ${stats.imported}\n`);
    } catch (err) {
      stats.failed++;
    }
  }
  console.log(`✅ Students: ${stats.imported} imported, ${stats.skipped} skipped, ${stats.failed} failed`);

  // ── Phase 5: Fee Records (all 686) ────────────────────────────────────────
  console.log('\n💰 Importing fee records...');
  const feeTypeMap = {
    'Tuition Fee': 'MONTHLY', 'Annual Package': 'ADMISSION',
    'Transport Fee': 'TRANSPORT', 'Exam Fee': 'EXAM', 'Library Fee': 'LIBRARY',
  };
  const seenReceipts = new Set();

  for (const f of SCHOOL_DATA.feeRecords) {
    try {
      const student = studentMap[f.studentId];
      if (!student) { stats.feesFailed++; continue; }

      let receiptNo = String(f.receiptNo || '').trim();
      if (!receiptNo) receiptNo = `AUTO-${f.id}`;
      if (seenReceipts.has(receiptNo)) receiptNo = `${receiptNo}-${f.id}`;
      seenReceipts.add(receiptNo);

      await prisma.feeRecord.create({
        data: {
          receiptNo,
          studentId: student.id,
          feeType: feeTypeMap[f.feeType] || 'OTHER',
          period: f.period || null,
          installment: f.installment || null,
          amount: parseFloat(f.amount) || 0,
          transportAmount: f.transportAmount ? parseFloat(f.transportAmount) : null,
          paymentMethod: 'CASH',
          remarks: f.remarks || null,
          date: f.date ? new Date(f.date) : new Date(),
          status: 'PAID',
          collectedById: admin.id,
        },
      });
      stats.fees++;
    } catch (err) {
      stats.feesFailed++;
    }
  }
  console.log(`✅ Fee records: ${stats.fees} imported, ${stats.feesFailed} failed`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  FINAL SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Students imported : ${stats.imported}`);
  console.log(`  Students skipped  : ${stats.skipped}`);
  console.log(`  Fee records       : ${stats.fees}`);
  console.log(`  Fee records failed: ${stats.feesFailed}`);
  console.log('───────────────────────────────────────────────────────');
  console.log('  Admin: username=admin  password=admin123');
  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
