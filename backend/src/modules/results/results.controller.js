const { prisma } = require('../../config/database');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const { calculateGrade } = require('../../utils/gradeCalculator');

async function getAll(req, res, next) {
  try {
    const { examId, classId, studentId } = req.query;
    const where = {};
    if (examId)    where.examId    = parseInt(examId);
    if (studentId) where.studentId = parseInt(studentId);
    const results = await prisma.examResult.findMany({ where, include: { exam: true, student: true }, orderBy: { createdAt: 'desc' } });
    return sendSuccess(res, results);
  } catch (err) { next(err); }
}

async function saveBulk(req, res, next) {
  try {
    const { examId, marks } = req.body;
    // marks = [{ studentId, obtainedMarks }]
    if (!examId || !Array.isArray(marks)) return sendError(res, 'examId and marks[] required', 400);

    const exam = await prisma.exam.findUnique({ where: { id: parseInt(examId) } });
    if (!exam) return sendError(res, 'Exam not found', 404);

    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.id } });
    const enteredById = teacher ? teacher.id : null;
    // Admin can enter results without a teacher profile

    const upserts = marks.map(async (m) => {
        const obtained = parseFloat(m.obtainedMarks);
        const percentage = Math.round((obtained / exam.totalMarks) * 100);
        const grade = await calculateGrade(percentage);
        const isPassed = obtained >= exam.passingMarks;

        return prisma.examResult.upsert({
          where: { examId_studentId: { examId: parseInt(examId), studentId: m.studentId } },
          update: { obtainedMarks: obtained, percentage, grade, isPassed, enteredById },
          create: { examId: parseInt(examId), studentId: m.studentId, obtainedMarks: obtained, percentage, grade, isPassed, enteredById },
        });
      }
    );

    const results = await Promise.all(upserts);
    return sendSuccess(res, null, `${marks.length} results saved`);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    
    // Mass Assignment Prevention: Whitelist only allowed fields
    const allowedFields = ['obtainedMarks', 'percentage', 'grade', 'isPassed'];
    const data = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    });
    
    // Coerce numeric fields
    if (data.obtainedMarks) data.obtainedMarks = parseFloat(data.obtainedMarks);
    if (data.percentage) data.percentage = parseFloat(data.percentage);
    if (data.isPassed !== undefined) data.isPassed = Boolean(data.isPassed);
    
    if (Object.keys(data).length === 0) {
      return sendError(res, 'No valid fields to update', 400);
    }
    
    const result = await prisma.examResult.update({ where: { id }, data });
    return sendSuccess(res, result, 'Result updated');
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await prisma.examResult.delete({ where: { id: parseInt(req.params.id) } });
    return sendSuccess(res, null, 'Result deleted');
  } catch (err) { next(err); }
}

async function getByStudent(req, res, next) {
  try {
    const results = await prisma.examResult.findMany({ where: { studentId: parseInt(req.params.id) }, include: { exam: true }, orderBy: { createdAt: 'desc' } });
    return sendSuccess(res, results);
  } catch (err) { next(err); }
}

async function getByExam(req, res, next) {
  try {
    const results = await prisma.examResult.findMany({ where: { examId: parseInt(req.params.examId) }, include: { student: true }, orderBy: { obtainedMarks: 'desc' } });
    const pass = results.filter((r) => r.isPassed).length;
    const fail = results.length - pass;
    const avg  = results.length ? Math.round(results.reduce((s, r) => s + Number(r.percentage), 0) / results.length) : 0;
    return sendSuccess(res, { results, summary: { total: results.length, pass, fail, avgPercentage: avg } });
  } catch (err) { next(err); }
}

module.exports = { getAll, saveBulk, update, remove, getByStudent, getByExam };
