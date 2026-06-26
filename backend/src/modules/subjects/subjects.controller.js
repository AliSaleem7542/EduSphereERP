const { prisma } = require('../../config/database');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

async function getAll(req, res, next) {
  try {
    const where = req.query.classId ? { classId: parseInt(req.query.classId) } : {};
    const subjects = await prisma.subject.findMany({ where, include: { class: true }, orderBy: { name: 'asc' } });
    return sendSuccess(res, subjects);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { name, code, classId } = req.body;
    if (!name) return sendError(res, 'Subject name is required', 400);

    // classId is required by schema — if not provided, use first available class
    let cid = classId ? parseInt(classId) : null;
    if (!cid) {
      const firstClass = await prisma.class.findFirst({ orderBy: { id: 'asc' } });
      if (!firstClass) return sendError(res, 'No classes found. Create a class first.', 400);
      cid = firstClass.id;
    }

    const subject = await prisma.subject.create({ data: { name, code: code || null, classId: cid } });
    return sendSuccess(res, subject, 'Subject created', 201);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    
    // Mass Assignment Prevention: Whitelist only allowed fields
    const allowedFields = ['name', 'code', 'classId'];
    const data = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        data[field] = req.body[field];
      }
    });
    
    // Coerce classId to integer
    if (data.classId) data.classId = parseInt(data.classId);
    
    if (Object.keys(data).length === 0) {
      return sendError(res, 'No valid fields to update', 400);
    }
    
    const subject = await prisma.subject.update({ where: { id }, data });
    return sendSuccess(res, subject, 'Subject updated');
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await prisma.subject.delete({ where: { id: parseInt(req.params.id) } });
    return sendSuccess(res, null, 'Subject deleted');
  } catch (err) { next(err); }
}

module.exports = { getAll, create, update, remove };
