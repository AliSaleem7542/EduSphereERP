const { prisma } = require('../../config/database');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

async function getAll(req, res, next) {
  try {
    const { academicYearId } = req.query;
    const where = academicYearId ? { academicYearId: parseInt(academicYearId) } : {};
    const classes = await prisma.class.findMany({ where, include: { sections: true }, orderBy: { name: 'asc' } });
    return sendSuccess(res, classes);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { name, academicYearId } = req.body;
    if (!name) return sendError(res, 'Class name is required', 400);

    // Auto-resolve academicYearId: use provided, or fall back to current year
    let yearId = academicYearId ? parseInt(academicYearId) : null;
    if (!yearId) {
      const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
      if (!currentYear) return sendError(res, 'No current academic year found. Please set one in System Settings.', 400);
      yearId = currentYear.id;
    }

    const cls = await prisma.class.create({ data: { name, academicYearId: yearId } });
    return sendSuccess(res, cls, 'Class created', 201);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const cls = await prisma.class.update({ where: { id: parseInt(req.params.id) }, data: req.body });
    return sendSuccess(res, cls, 'Class updated');
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await prisma.class.delete({ where: { id: parseInt(req.params.id) } });
    return sendSuccess(res, null, 'Class deleted');
  } catch (err) { next(err); }
}

async function getSections(req, res, next) {
  try {
    const sections = await prisma.section.findMany({
      where: { classId: parseInt(req.params.id) },
      include: { classTeacher: true },
    });
    return sendSuccess(res, sections);
  } catch (err) { next(err); }
}

async function createSection(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return sendError(res, 'Section name is required', 400);
    const section = await prisma.section.create({
      data: { name, classId: parseInt(req.params.id) },
    });
    return sendSuccess(res, section, 'Section created', 201);
  } catch (err) { next(err); }
}

async function updateSection(req, res, next) {
  try {
    const section = await prisma.section.update({ where: { id: parseInt(req.params.sectionId) }, data: req.body });
    return sendSuccess(res, section, 'Section updated');
  } catch (err) { next(err); }
}

async function deleteSection(req, res, next) {
  try {
    await prisma.section.delete({ where: { id: parseInt(req.params.sectionId) } });
    return sendSuccess(res, null, 'Section deleted');
  } catch (err) { next(err); }
}

async function assignClassTeacher(req, res, next) {
  try {
    const section = await prisma.section.update({
      where: { id: parseInt(req.params.sectionId) },
      data: { classTeacherId: parseInt(req.body.teacherId) },
    });
    return sendSuccess(res, section, 'Class teacher assigned');
  } catch (err) { next(err); }
}

module.exports = { getAll, create, update, remove, getSections, createSection, updateSection, deleteSection, assignClassTeacher };
