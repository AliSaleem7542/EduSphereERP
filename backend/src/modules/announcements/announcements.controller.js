const { prisma } = require('../../config/database');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

async function getAll(req, res, next) {
  try {
    const { audience, category, active, search } = req.query;
    const where = {};
    if (audience) where.audience = audience;
    if (category) where.category = category;
    if (active === 'true') where.OR = [{ expiryDate: null }, { expiryDate: { gte: new Date() } }];
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { message: { contains: search, mode: 'insensitive' } }];

    // Filter by role audience
    if (req.user.role === 'STUDENT') where.audience = { in: ['ALL', 'STUDENTS'] };
    if (req.user.role === 'TEACHER') where.audience = { in: ['ALL', 'TEACHERS'] };

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
    return sendSuccess(res, announcements);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const ann = await prisma.announcement.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!ann) return sendError(res, 'Announcement not found', 404);
    return sendSuccess(res, ann);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { title, message, category, audience, date, expiryDate, isPinned } = req.body;
    const ann = await prisma.announcement.create({
      data: { title, message, category: category || 'GENERAL', audience: audience || 'ALL', date: date ? new Date(date) : new Date(), expiryDate: expiryDate ? new Date(expiryDate) : null, isPinned: isPinned || false, createdById: req.user.id },
    });
    return sendSuccess(res, ann, 'Announcement created', 201);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const body = req.body;
    const VALID_CATS = ['GENERAL', 'EXAM', 'FEE', 'HOLIDAY', 'EVENT', 'URGENT'];
    const VALID_AUD  = ['ALL', 'STUDENTS', 'TEACHERS', 'PARENTS', 'STAFF'];
    const data = {};
    if (body.title   !== undefined) data.title   = String(body.title   || '').trim();
    if (body.message !== undefined) data.message = String(body.message || '').trim();
    if (body.category && VALID_CATS.includes(body.category)) data.category = body.category;
    if (body.audience && VALID_AUD.includes(body.audience))  data.audience = body.audience;
    if (body.date)       data.date       = new Date(body.date);
    if (body.expiryDate) data.expiryDate = new Date(body.expiryDate);
    else if (body.expiryDate === null || body.expiryDate === '') data.expiryDate = null;
    if (body.isPinned !== undefined) data.isPinned = Boolean(body.isPinned);
    const ann = await prisma.announcement.update({ where: { id: parseInt(req.params.id) }, data });
    return sendSuccess(res, ann, 'Announcement updated');
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await prisma.announcement.delete({ where: { id: parseInt(req.params.id) } });
    return sendSuccess(res, null, 'Announcement deleted');
  } catch (err) { next(err); }
}

async function togglePin(req, res, next) {
  try {
    const ann = await prisma.announcement.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!ann) return sendError(res, 'Announcement not found', 404);
    const updated = await prisma.announcement.update({ where: { id: ann.id }, data: { isPinned: !ann.isPinned } });
    return sendSuccess(res, updated, `Announcement ${updated.isPinned ? 'pinned' : 'unpinned'}`);
  } catch (err) { next(err); }
}

module.exports = { getAll, getOne, create, update, remove, togglePin };
