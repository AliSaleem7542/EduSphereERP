const { prisma } = require('../../config/database');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const include = { class: true, subject: true };

async function getAll(req, res, next) {
  try {
    const { classId, type, academicYearId } = req.query;
    const where = {};
    if (classId)       where.classId       = parseInt(classId);
    if (type)          where.type          = type;
    if (academicYearId) where.academicYearId = parseInt(academicYearId);
    const exams = await prisma.exam.findMany({ where, include, orderBy: { startDate: 'desc' } });
    return sendSuccess(res, exams);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const exam = await prisma.exam.findUnique({ where: { id: parseInt(req.params.id) }, include });
    if (!exam) return sendError(res, 'Exam not found', 404);
    return sendSuccess(res, exam);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    // Auto-resolve academicYearId if not provided
    let yearId = req.body.academicYearId ? parseInt(req.body.academicYearId) : null;
    if (!yearId) {
      const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
      if (!currentYear) return sendError(res, 'No current academic year found', 400);
      yearId = currentYear.id;
    }

    const data = {
      ...req.body,
      classId:       req.body.classId       ? parseInt(req.body.classId)       : null,
      subjectId:     req.body.subjectId     ? parseInt(req.body.subjectId)     : null,
      academicYearId: yearId,
      totalMarks:    parseInt(req.body.totalMarks)   || 100,
      passingMarks:  parseInt(req.body.passingMarks) || 40,
      startDate:     new Date(req.body.startDate),
      endDate:       new Date(req.body.endDate),
      createdById:   req.user.id,
    };
    const exam = await prisma.exam.create({ data, include });
    return sendSuccess(res, exam, 'Exam created', 201);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const body = req.body;
    const VALID_TYPES = ['MID_TERM', 'FINAL_TERM', 'UNIT_TEST', 'MONTHLY_TEST', 'MOCK'];
    const data = {};
    if (body.title)        data.title        = String(body.title).trim();
    if (body.type && VALID_TYPES.includes(body.type)) data.type = body.type;
    if (body.classId)      data.classId      = parseInt(body.classId);
    if (body.subjectId)    data.subjectId    = parseInt(body.subjectId);
    if (body.startDate)    data.startDate    = new Date(body.startDate);
    if (body.endDate)      data.endDate      = new Date(body.endDate);
    if (body.totalMarks)   data.totalMarks   = parseInt(body.totalMarks);
    if (body.passingMarks) data.passingMarks = parseInt(body.passingMarks);
    if (body.venue   !== undefined) data.venue  = body.venue   || null;
    if (body.notes   !== undefined) data.notes  = body.notes   || null;
    if (body.academicYearId) data.academicYearId = parseInt(body.academicYearId);
    const exam = await prisma.exam.update({ where: { id: parseInt(req.params.id) }, data, include });
    return sendSuccess(res, exam, 'Exam updated');
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    // Delete results first to avoid FK constraint error
    await prisma.examResult.deleteMany({ where: { examId: id } });
    await prisma.exam.delete({ where: { id } });
    return sendSuccess(res, null, 'Exam deleted');
  } catch (err) { next(err); }
}

async function getUpcoming(req, res, next) {
  try {
    const today = new Date();
    const exams = await prisma.exam.findMany({
      where: { startDate: { gte: today } },
      include,
      orderBy: { startDate: 'asc' },
      take: 10,
    });
    return sendSuccess(res, exams);
  } catch (err) { next(err); }
}

module.exports = { getAll, getOne, create, update, remove, getUpcoming };
