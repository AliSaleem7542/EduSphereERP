const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

// POST /api/v1/auth/admin/login
async function adminLogin(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await authService.adminLogin(username, password, req.ip);
    return sendSuccess(res, result, 'Admin login successful');
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/auth/teacher/login
async function teacherLogin(req, res, next) {
  try {
    const { phone, password } = req.body;
    const result = await authService.teacherLogin(phone, password, req.ip);
    return sendSuccess(res, result, 'Teacher login successful');
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/auth/student/login
async function studentLogin(req, res, next) {
  try {
    const { rollNo, password } = req.body;
    const result = await authService.studentLogin(rollNo, password, req.ip);
    return sendSuccess(res, result, 'Student login successful');
  } catch (err) {
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

module.exports = {
  adminLogin,
  teacherLogin,
  studentLogin,
  refreshToken,
  logout,
  changePassword,
  getMe,
};
