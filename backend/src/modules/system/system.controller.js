const { prisma } = require('../../config/database');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

async function getSettings(req, res, next) {
  try {
    const settings = await prisma.systemSettings.findMany();
    const map = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    return sendSuccess(res, map);
  } catch (err) { next(err); }
}

async function updateSettings(req, res, next) {
  try {
    const updates = req.body; // { key: value, ... }
    const upserts = Object.entries(updates).map(([key, value]) =>
      prisma.systemSettings.upsert({
        where: { key },
        update: { value: String(value), updatedById: req.user.id },
        create: { key, value: String(value), updatedById: req.user.id },
      })
    );
    await prisma.$transaction(upserts);
    return sendSuccess(res, null, 'Settings updated');
  } catch (err) { next(err); }
}

async function getLogs(req, res, next) {
  try {
    const { page = 1, limit = 50, userId, action } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (userId) where.userId = parseInt(userId);
    if (action) where.action = { contains: action, mode: 'insensitive' };
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({ where, skip, take: parseInt(limit), include: { user: { select: { username: true, role: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.activityLog.count({ where }),
    ]);
    return sendSuccess(res, { logs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
}

async function getAcademicYears(req, res, next) {
  try {
    const years = await prisma.academicYear.findMany({ orderBy: { startDate: 'desc' } });
    return sendSuccess(res, years);
  } catch (err) { next(err); }
}

async function createAcademicYear(req, res, next) {
  try {
    const { label, startDate, endDate, isCurrent } = req.body;
    if (isCurrent) {
      await prisma.academicYear.updateMany({ data: { isCurrent: false } });
    }
    const year = await prisma.academicYear.create({ data: { label, startDate: new Date(startDate), endDate: new Date(endDate), isCurrent: isCurrent || false } });
    return sendSuccess(res, year, 'Academic year created', 201);
  } catch (err) { next(err); }
}

async function setCurrentYear(req, res, next) {
  try {
    await prisma.academicYear.updateMany({ data: { isCurrent: false } });
    const year = await prisma.academicYear.update({ where: { id: parseInt(req.params.id) }, data: { isCurrent: true } });
    return sendSuccess(res, year, 'Current academic year updated');
  } catch (err) { next(err); }
}

module.exports = { getSettings, updateSettings, getLogs, getAcademicYears, createAcademicYear, setCurrentYear };
