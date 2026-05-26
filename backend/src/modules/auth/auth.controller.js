const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

// POST /api/v1/auth/admin/login
async function adminLogin(req, res, next) {
  try {
    // Debug logging — shows exact received body in Render logs
    console.log('[AUTH] Admin login attempt — body keys:', Object.keys(req.body || {}));
    console.log('[AUTH] username:', req.body.username, '| password provided:', !!req.body.password);

    const { username, password } = req.body;
    const result = await authService.adminLogin(username, password, req.ip);
    return sendSuccess(res, result, 'Admin login successful');
  } catch (err) {
    console.error('[AUTH] Admin login error:', err.message || err);
    next(err);
  }
}

// POST /api/v1/auth/teacher/login
async function teacherLogin(req, res, next) {
  try {
    console.log('[AUTH] Teacher login attempt — phone:', req.body.phone, '| password provided:', !!req.body.password);
    const { phone, password } = req.body;
    const result = await authService.teacherLogin(phone, password, req.ip);
    return sendSuccess(res, result, 'Teacher login successful');
  } catch (err) {
    console.error('[AUTH] Teacher login error:', err.message || err);
    next(err);
  }
}

// POST /api/v1/auth/student/login
async function studentLogin(req, res, next) {
  try {
    console.log('[AUTH] Student login attempt — rollNo:', req.body.rollNo, '| password provided:', !!req.body.password);
    const { rollNo, password } = req.body;
    const result = await authService.studentLogin(rollNo, password, req.ip);
    return sendSuccess(res, result, 'Student login successful');
  } catch (err) {
    console.error('[AUTH] Student login error:', err.message || err);
    next(err);
  }
}

// POST /api/v1/auth/refresh
async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    return sendSuccess(res, result, 'Token refreshed');
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/auth/logout
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/auth/change-password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    return sendSuccess(res, null, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/auth/me
async function getMe(req, res) {
  return sendSuccess(res, req.user, 'Authenticated user');
}

// GET /api/v1/auth/debug — checks DB connection and admin user existence (remove after fix)
async function debugCheck(req, res) {
  try {
    const { prisma } = require('../../config/database');
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true, username: true, isActive: true } });
    return res.json({
      success: true,
      dbConnected: true,
      adminCount,
      admin: admin || null,
      message: adminCount > 0 ? 'Admin exists — login should work' : 'NO ADMIN USER — run db:seed',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      dbConnected: false,
      error: err.message,
      message: 'Database connection failed — check DATABASE_URL and Neon SSL',
    });
  }
}

module.exports = {
  adminLogin,
  teacherLogin,
  studentLogin,
  refreshToken,
  logout,
  changePassword,
  getMe,
  debugCheck,
};
