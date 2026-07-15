const { prisma } = require('../../config/database');
const { hashPassword } = require('../../utils/bcrypt');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const VALID_ROLES = ['ADMIN', 'TEACHER', 'STUDENT', 'LIBRARIAN', 'CASHIER'];

async function getAll(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, users);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { username, password, role } = req.body;

    if (!username || !String(username).trim()) return sendError(res, 'username is required', 400);
    if (!password)                             return sendError(res, 'password is required', 400);
    if (!role || !VALID_ROLES.includes(role))  return sendError(res, `role must be one of: ${VALID_ROLES.join(', ')}`, 400);

    // LIBRARIAN and CASHIER are stored as ADMIN in DB (same access level)
    // but their actual role is tracked by the frontend session
    const dbRole = (role === 'LIBRARIAN' || role === 'CASHIER') ? 'ADMIN' : role;

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username: String(username).trim(), passwordHash, role: dbRole, createdById: req.user.id },
      select: { id: true, username: true, role: true, isActive: true, createdAt: true },
    });
    return sendSuccess(res, user, 'User created', 201);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const data = {};
    if (req.body.username)             data.username  = String(req.body.username).trim();
    if (req.body.role && VALID_ROLES.includes(req.body.role)) {
      data.role = (req.body.role === 'LIBRARIAN' || req.body.role === 'CASHIER') ? 'ADMIN' : req.body.role;
    }
    if (req.body.isActive !== undefined) data.isActive = Boolean(req.body.isActive);
    if (req.body.password) {
      data.passwordHash = await hashPassword(req.body.password);
    }
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data,
      select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
    return sendSuccess(res, user, 'User updated');
  } catch (err) { next(err); }
}

async function deactivate(req, res, next) {
  try {
    await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { isActive: false } });
    return sendSuccess(res, null, 'User deactivated');
  } catch (err) { next(err); }
}

function getRoles(req, res) {
  return sendSuccess(res, {
    roles: VALID_ROLES,
    permissions: {
      ADMIN:     ['all'],
      TEACHER:   ['mark_attendance', 'enter_results', 'view_students', 'view_schedule'],
      STUDENT:   ['view_own_data'],
      LIBRARIAN: ['library_module'],
      CASHIER:   ['fee_module'],
    },
  });
}

module.exports = { getAll, create, update, deactivate, getRoles };
