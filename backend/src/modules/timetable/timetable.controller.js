const { prisma } = require('../../config/database');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const include = { subject: true, teacher: true, class: true, section: true };

async function getAll(req, res, next) {
  try {
    const { classId, sectionId, teacherId, academicYearId } = req.query;
    const where = {};
    if (classId)       where.classId       = parseInt(classId);
    if (sectionId)     where.sectionId     = parseInt(sectionId);
    if (teacherId)     where.teacherId     = parseInt(teacherId);
    if (academicYearId) where.academicYearId = parseInt(academicYearId);
    const rows = await prisma.timetable.findMany({ where, include, orderBy: [{ day: 'asc' }, { periodNo: 'asc' }] });
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const body = req.body;

    // Auto-resolve academicYearId
    let yearId = body.academicYearId ? parseInt(body.academicYearId) : null;
    if (!yearId) {
      const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
      if (!currentYear) return sendError(res, 'No current academic year found', 400);
      yearId = currentYear.id;
    }

    const data = {
      classId:       parseInt(body.classId),
      subjectId:     parseInt(body.subjectId),
      periodNo:      parseInt(body.periodNo),
      day:           body.day,
      startTime:     body.startTime || null,
      endTime:       body.endTime   || null,
      room:          body.room      || null,
      academicYearId: yearId,
    };
    if (body.sectionId) data.sectionId = parseInt(body.sectionId);
    if (body.teacherId) data.teacherId = parseInt(body.teacherId);

    const row = await prisma.timetable.create({ data, include });
    return sendSuccess(res, row, 'Period added', 201);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    
    // Mass Assignment Prevention: Whitelist only allowed fields
    const allowedFields = ['classId', 'sectionId', 'subjectId', 'teacherId', 'day', 'periodNo', 'startTime', 'endTime', 'room', 'academicYearId'];
    const data = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Allow explicit null for optional fields
        if ((field === 'sectionId' || field === 'room') && req.body[field] === null) {
          data[field] = null;
        } else if (req.body[field] !== '') {
          data[field] = req.body[field];
        }
      }
    });
    
    // Coerce numeric fields
    const numericFields = ['classId', 'sectionId', 'subjectId', 'teacherId', 'periodNo', 'academicYearId'];
    numericFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null) {
        data[field] = parseInt(data[field]);
      }
    });
    
    if (Object.keys(data).length === 0) {
      return sendError(res, 'No valid fields to update', 400);
    }
    
    const row = await prisma.timetable.update({ where: { id }, data, include });
    return sendSuccess(res, row, 'Period updated');
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await prisma.timetable.delete({ where: { id: parseInt(req.params.id) } });
    return sendSuccess(res, null, 'Period deleted');
  } catch (err) { next(err); }
}

async function getTeacherSchedule(req, res, next) {
  try {
    const rows = await prisma.timetable.findMany({ where: { teacherId: parseInt(req.params.teacherId) }, include, orderBy: [{ day: 'asc' }, { periodNo: 'asc' }] });
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

async function getClassTimetable(req, res, next) {
  try {
    const rows = await prisma.timetable.findMany({ where: { classId: parseInt(req.params.classId), sectionId: parseInt(req.params.sectionId) }, include, orderBy: [{ day: 'asc' }, { periodNo: 'asc' }] });
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

module.exports = { getAll, create, update, remove, getTeacherSchedule, getClassTimetable };
