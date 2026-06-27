const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const { authenticate } = require('../../middleware/authenticate');
const {
  adminLoginSchema,
  teacherLoginSchema,
  studentLoginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} = require('./auth.schema');

const router = Router();

// Rate limiter specifically for refresh token endpoint
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // More lenient than login
  message: { success: false, message: 'Too many token refresh attempts, please try again later.' },
});

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post('/admin/login',   validate(adminLoginSchema),   controller.adminLogin);
router.post('/teacher/login', validate(teacherLoginSchema), controller.teacherLogin);
router.post('/student/login', validate(studentLoginSchema), controller.studentLogin);
router.post('/refresh',       refreshLimiter, validate(refreshTokenSchema), controller.refreshToken);
router.post('/logout',        controller.logout);

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get('/me',              authenticate, controller.getMe);
router.patch('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword);

module.exports = router;
