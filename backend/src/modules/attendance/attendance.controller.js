const { prisma } = require('../../config/database');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

async function getStudentAttendance(req, res, next) {
  try {
    const { date, classId, sectionId } = req.query;
    const where = {};
    if (date)      where.date    = new Date(date);
    if (classId)   where.classId = parseInt(classId);
    if (sectionId) where.student = { sectionId: parseInt(sectionId) };
    const records = await prisma.studentAttendance.findMany({
      where,
      include: { student: { include: { section: true } } },
      orderBy: { date: 'desc' },
    });
    return sendSuccess(res, records);
  } catch (err) { next(err); }
}

async function markStudentAttendance(req, res, next) {
  try {
    // req.body.records = [{ studentId, classId, date, status, remarks }]
    const { records } = req.body;
    if (!Array.isArray(records) || !records.length) {
      return sendError(res, 'records array is required', 400);
    }

    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.id } });

    // If the user is an ADMIN without a teacher profile, we need a fallback teacher id.
    // Find or create a system/admin teacher record to satisfy the non-nullable FK.
    let markedById = teacher ? teacher.id : null;
    if (!markedById) {
      // Try to find any active teacher to use as the marker (admin proxy)
      const anyTeacher = await prisma.teacher.findFirst({ where: { status: 'ACTIVE' } });
      if (!anyTeacher) {
        return sendError(res, 'No teacher profile found. Please create a teacher record first before marking attendance.', 400);
      }
      markedById = anyTeacher.id;
    }

    const upserts = records.map((r) =>
      prisma.studentAttendance.upsert({
        where: { studentId_date: { studentId: r.studentId, date: new Date(r.date) } },
        update: { status: r.status, remarks: r.remarks || null, markedById },
        create: {
          studentId: r.studentId,
          classId: r.classId,
          date: new Date(r.date),
          status: r.status,
          remarks: r.remarks || null,
          markedById,
        },
      })
    );

    await prisma.$transaction(upserts);
    return sendSuccess(res, null, `${records.length} attendance records saved`);
  } catch (err) { next(err); }
}

async function getAttendanceReport(req, res, next) {
  try {
    const { startDate, endDate, classId } = req.query;
    const where = {};
    if (classId) where.classId = parseInt(classId);
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate)   where.date.lte = new Date(endDate);
    }

    // Fetch all records with student info in one query
    const records = await prisma.studentAttendance.findMany({
      where,
      include: { student: { include: { class: true } } },
      orderBy: { date: 'desc' },
    });

    // Aggregate per student
    const studentMap = {};
    records.forEach((r) => {
      const id = r.studentId;
      if (!studentMap[id]) {
        studentMap[id] = {
          studentId: id,
          studentName: r.student
            ? (r.student.firstName + ' ' + (r.student.lastName || '')).trim()
            : '—',
          rollNo:    r.student ? r.student.rollNo    : '—',
          className: r.student && r.student.class ? r.student.class.name : '—',
          total:   0,
          present: 0,
          absent:  0,
          late:    0,
          leave:   0,
        };
      }
      studentMap[id].total++;
      if (r.status === 'PRESENT') studentMap[id].present++;
      else if (r.status === 'ABSENT') studentMap[id].absent++;
      else if (r.status === 'LATE')   studentMap[id].late++;
      else if (r.status === 'LEAVE')  studentMap[id].leave++;
    });

    const result = Object.values(studentMap).map((s) => ({
      ...s,
      percentage: s.total ? Math.round((s.present / s.total) * 100) : 0,
    }));

    return sendSuccess(res, result);
  } catch (err) { next(err); }
}

async function getTeacherAttendance(req, res, next) {
  try {
    const { date } = req.query;
    const where = date ? { date: new Date(date) } : {};
    const records = await prisma.teacherAttendance.findMany({ where, include: { teacher: true }, orderBy: { date: 'desc' } });
    return sendSuccess(res, records);
  } catch (err) { next(err); }
}

async function markTeacherAttendance(req, res, next) {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || !records.length) return sendError(res, 'records array is required', 400);

    const upserts = records.map((r) =>
      prisma.teacherAttendance.upsert({
        where: { teacherId_date: { teacherId: r.teacherId, date: new Date(r.date) } },
        update: { status: r.status, remarks: r.remarks || null, markedById: req.user.id },
        create: { teacherId: r.teacherId, date: new Date(r.date), status: r.status, remarks: r.remarks || null, markedById: req.user.id },
      })
    );

    await prisma.$transaction(upserts);
    return sendSuccess(res, null, `${records.length} teacher attendance records saved`);
  } catch (err) { next(err); }
}

async function getTodaySummary(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [present, absent, leave] = await Promise.all([
      prisma.studentAttendance.count({ where: { date: today, status: 'PRESENT' } }),
      prisma.studentAttendance.count({ where: { date: today, status: 'ABSENT' } }),
      prisma.studentAttendance.count({ where: { date: today, status: 'LEAVE' } }),
    ]);

    return sendSuccess(res, { present, absent, leave, total: present + absent + leave });
  } catch (err) { next(err); }
}

module.exports = { getStudentAttendance, markStudentAttendance, getAttendanceReport, getTeacherAttendance, markTeacherAttendance, getTodaySummary };
