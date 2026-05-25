/**
 * EDU-SPHERE — Import Controller
 * Handles bulk import of school data from JSON payload or Excel file.
 * Connects the frontend Import Data UI to the real PostgreSQL database.
 */

const { prisma } = require('../../config/database');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const { logActivity } = require('../../utils/activityLogger');

// ─── Helper: split full name ──────────────────────────────────────────────────
function splitName(fullName) {
  const parts = (fullName || '').trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return { firstName: 'Unknown', lastName: 'Unknown' };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

// ─── Helper: safe unique rollNo ───────────────────────────────────────────────
function makeRollNo(rollNo, studentId, section) {
  const base = String(rollNo || '').trim();
  if (!base) return `AUTO-${studentId}`;
  return `${section}-${base}`;
}

// ─── POST /api/v1/import/school-data ─────────────────────────────────────────
// Accepts the SCHOOL_DATA JSON from the frontend and imports into PostgreSQL
async function importSchoolData(req, res, next) {
  try {
    const { schoolClasses, schoolSections, students, feeRecords, clearExisting } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return sendError(res, 'students array is required and must not be empty', 400);
    }

    const stats = {
      classes: 0, sections: 0,
      studentsImported: 0, studentsSkipped: 0, studentsFailed: 0,
      feesImported: 0, feesFailed: 0,
      errors: [],
    };

    // ── Get or create current academic year ───────────────────────────────────
    let year = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    if (!year) {
      year = await prisma.academicYear.create({
        data: {
          label: '2025-26',
          startDate: new Date('2025-04-01'),
          endDate: new Date('2026-03-31'),
          isCurrent: true,
        },
      });
    }

    // ── Optional: clear existing data ─────────────────────────────────────────
    if (clearExisting) {
      await prisma.feeRecord.deleteMany({});
      const existingStudents = await prisma.student.findMany({ select: { id: true, userId: true } });
      for (const s of existingStudents) {
        await prisma.student.delete({ where: { id: s.id } }).catch(() => {});
        if (s.userId) await prisma.user.delete({ where: { id: s.userId } }).catch(() => {});
      }
      await prisma.section.deleteMany({});
      await prisma.class.deleteMany({});
    }

    // ── Import classes ─────────────────────────────────────────────────────────
    const classMap = {};
    const classesToCreate = schoolClasses || [{ name: '1st Year' }];
    for (const cls of classesToCreate) {
      try {
        const created = await prisma.class.upsert({
          where: { name_academicYearId: { name: cls.name, academicYearId: year.id } },
          update: {},
          create: { name: cls.name, academicYearId: year.id },
        });
        classMap[cls.name] = created;
        stats.classes++;
      } catch (e) {
        stats.errors.push(`Class "${cls.name}": ${e.message}`);
      }
    }

    // ── Import sections ────────────────────────────────────────────────────────
    const sectionMap = {};
    const sectionsToCreate = schoolSections || [];
    for (const sec of sectionsToCreate) {
      try {
        const cls = classMap[sec.class];
        if (!cls) continue;
        const created = await prisma.section.upsert({
          where: { name_classId: { name: sec.name, classId: cls.id } },
          update: {},
          create: { name: sec.name, classId: cls.id },
        });
        sectionMap[sec.name] = created;
        stats.sections++;
      } catch (e) {
        stats.errors.push(`Section "${sec.name}": ${e.message}`);
      }
    }

    // ── Import students ────────────────────────────────────────────────────────
    const studentMap = {}; // original id → DB student
    const seenRollNos = new Set();

    // Pre-load existing rollNos to avoid duplicates
    const existingRollNos = await prisma.student.findMany({ select: { rollNo: true } });
    existingRollNos.forEach((s) => seenRollNos.add(s.rollNo));

    const feeCatMap = { Regular: 'REGULAR', Scholarship: 'SCHOLARSHIP', 'Half Fee': 'HALF_FEE', Free: 'FREE' };
    const admTypeMap = { 'New Admission': 'NEW', Transfer: 'TRANSFER', Readmission: 'READMISSION' };

    for (const s of students) {
      try {
        // Validate name
        const { firstName, lastName } = splitName(s.name);
        if (!firstName || firstName === 'Unknown') {
          stats.studentsSkipped++;
          stats.errors.push(`Row ${s.id}: empty name, skipped`);
          continue;
        }

        // Resolve class
        const cls = classMap[s.class];
        if (!cls) {
          // Try to create class on the fly
          try {
            const newCls = await prisma.class.upsert({
              where: { name_academicYearId: { name: s.class, academicYearId: year.id } },
              update: {},
              create: { name: s.class, academicYearId: year.id },
            });
            classMap[s.class] = newCls;
          } catch (e) {
            stats.studentsSkipped++;
            stats.errors.push(`Student "${s.name}": class "${s.class}" not found`);
            continue;
          }
        }

        // Resolve section
        let sec = sectionMap[s.section];
        if (!sec && s.section) {
          try {
            const newSec = await prisma.section.upsert({
              where: { name_classId: { name: s.section, classId: classMap[s.class].id } },
              update: {},
              create: { name: s.section, classId: classMap[s.class].id },
            });
            sectionMap[s.section] = newSec;
            sec = newSec;
          } catch (e) {
            // section creation failed, continue without section
          }
        }

        // Generate unique rollNo
        let rollNo = makeRollNo(s.rollNo, s.id, s.section);
        if (seenRollNos.has(rollNo)) {
          rollNo = `${rollNo}-${s.id}`;
        }
        seenRollNos.add(rollNo);

        const feeCategory = feeCatMap[s.feeCategory] || 'REGULAR';
        const transport = (s.transportFee && Number(s.transportFee) > 0) ? 'SCHOOL_BUS' : 'NONE';
        const admissionType = admTypeMap[s.admissionType] || 'NEW';

        const student = await prisma.student.create({
          data: {
            rollNo,
            firstName,
            lastName,
            gender: s.gender === 'Male' ? 'MALE' : s.gender === 'Female' ? 'FEMALE' : 'FEMALE',
            admissionDate: s.admissionDate ? new Date(s.admissionDate) : new Date('2025-04-01'),
            admissionType,
            classId: classMap[s.class].id,
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
        stats.studentsImported++;
      } catch (err) {
        stats.studentsFailed++;
        stats.errors.push(`Student "${s.name}": ${err.message}`);
      }
    }

    // ── Import fee records ─────────────────────────────────────────────────────
    if (feeRecords && Array.isArray(feeRecords) && feeRecords.length > 0) {
      const feeTypeMap = {
        'Tuition Fee': 'MONTHLY',
        'Annual Package': 'ADMISSION',
        'Transport Fee': 'TRANSPORT',
        'Exam Fee': 'EXAM',
        'Library Fee': 'LIBRARY',
      };

      const seenReceipts = new Set();
      const existingReceipts = await prisma.feeRecord.findMany({ select: { receiptNo: true } });
      existingReceipts.forEach((r) => seenReceipts.add(r.receiptNo));

      for (const f of feeRecords) {
        try {
          const student = studentMap[f.studentId];
          if (!student) { stats.feesFailed++; continue; }

          let receiptNo = String(f.receiptNo || '').trim();
          if (!receiptNo) receiptNo = `AUTO-${f.id}`;
          if (seenReceipts.has(receiptNo)) receiptNo = `${receiptNo}-${f.id}`;
          seenReceipts.add(receiptNo);

          const feeType = feeTypeMap[f.feeType] || 'OTHER';

          await prisma.feeRecord.create({
            data: {
              receiptNo,
              studentId: student.id,
              feeType,
              period: f.period || null,
              installment: f.installment || null,
              amount: parseFloat(f.amount) || 0,
              transportAmount: f.transportAmount ? parseFloat(f.transportAmount) : null,
              paymentMethod: 'CASH',
              remarks: f.remarks || null,
              date: f.date ? new Date(f.date) : new Date(),
              status: 'PAID',
              collectedById: req.user.id,
            },
          });
          stats.feesImported++;
        } catch (err) {
          stats.feesFailed++;
        }
      }
    }

    // ── Log activity ───────────────────────────────────────────────────────────
    await logActivity({
      userId: req.user.id,
      action: 'BULK_IMPORT',
      entity: 'Student',
      details: { studentsImported: stats.studentsImported, feesImported: stats.feesImported },
      ipAddress: req.ip,
    });

    return sendSuccess(res, stats, 'Import completed successfully', 201);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/v1/import/reset ────────────────────────────────────────────────
// Clears all ERP data and re-seeds admin
async function resetData(req, res, next) {
  try {
    // Delete in dependency order
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

    // Delete students
    const students = await prisma.student.findMany({ select: { id: true, userId: true } });
    for (const s of students) {
      await prisma.student.delete({ where: { id: s.id } }).catch(() => {});
      if (s.userId) await prisma.user.delete({ where: { id: s.userId } }).catch(() => {});
    }

    // Delete teachers
    const teachers = await prisma.teacher.findMany({ select: { id: true, userId: true } });
    for (const t of teachers) {
      await prisma.teacher.delete({ where: { id: t.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: t.userId } }).catch(() => {});
    }

    await prisma.subject.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.class.deleteMany({});

    return sendSuccess(res, { cleared: true }, 'Database reset successfully');
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/v1/import/status ────────────────────────────────────────────────
async function getImportStatus(req, res, next) {
  try {
    const [students, teachers, classes, sections, feeRecords, announcements] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.section.count(),
      prisma.feeRecord.count(),
      prisma.announcement.count(),
    ]);

    return sendSuccess(res, { students, teachers, classes, sections, feeRecords, announcements });
  } catch (err) {
    next(err);
  }
}

module.exports = { importSchoolData, resetData, getImportStatus };
