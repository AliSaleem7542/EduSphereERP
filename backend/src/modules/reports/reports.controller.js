const { prisma } = require('../../config/database');
const { sendSuccess } = require('../../utils/apiResponse');

async function getDashboard(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalStudents, totalTeachers,
      todayPresent, pendingFeeCount,
      totalFeeCollected, booksIssued,
      totalAnnouncements, totalExams,
    ] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.teacher.count({ where: { status: 'ACTIVE' } }),
      prisma.studentAttendance.count({ where: { date: today, status: 'PRESENT' } }),
      prisma.student.count({ where: { status: 'ACTIVE', packageTotal: { gt: 0 } } }),
      prisma.feeRecord.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.bookIssue.count({ where: { status: 'ISSUED' } }),
      prisma.announcement.count(),
      prisma.exam.count(),
    ]);

    return sendSuccess(res, {
      totalStudents,
      totalTeachers,
      todayPresent,
      pendingFeeCount,
      totalFeeCollected: Number(totalFeeCollected._sum.amount || 0),
      booksIssued,
      totalAnnouncements,
      totalExams,
    });
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
    const grouped = await prisma.studentAttendance.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });
    return sendSuccess(res, grouped);
  } catch (err) { next(err); }
}

async function getFeesReport(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const where = { status: 'PAID' };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate)   where.date.lte = new Date(endDate);
    }
    const grouped = await prisma.feeRecord.groupBy({
      by: ['feeType'],
      where,
      _sum: { amount: true },
      _count: { id: true },
    });
    return sendSuccess(res, grouped);
  } catch (err) { next(err); }
}

async function getResultsReport(req, res, next) {
  try {
    const { examId } = req.query;
    const where = examId ? { examId: parseInt(examId) } : {};
    const grouped = await prisma.examResult.groupBy({
      by: ['grade'],
      where,
      _count: { grade: true },
    });
    return sendSuccess(res, grouped);
  } catch (err) { next(err); }
}

async function getLibraryReport(req, res, next) {
  try {
    const [issued, returned, overdue, totalBooks] = await Promise.all([
      prisma.bookIssue.count({ where: { status: 'ISSUED' } }),
      prisma.bookIssue.count({ where: { status: 'RETURNED' } }),
      prisma.bookIssue.count({ where: { status: 'ISSUED', dueDate: { lt: new Date() } } }),
      prisma.book.count(),
    ]);
    return sendSuccess(res, { totalBooks, issued, returned, overdue });
  } catch (err) { next(err); }
}

module.exports = { getDashboard, getAttendanceReport, getFeesReport, getResultsReport, getLibraryReport };
