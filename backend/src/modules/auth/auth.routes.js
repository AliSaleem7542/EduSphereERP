const { Router } = require('express');
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

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post('/admin/login',   validate(adminLoginSchema),   controller.adminLogin);
router.post('/teacher/login', validate(teacherLoginSchema), controller.teacherLogin);
router.post('/student/login', validate(studentLoginSchema), controller.studentLogin);
router.post('/refresh',       validate(refreshTokenSchema), controller.refreshToken);
router.post('/logout',        controller.logout);
router.get('/debug',          controller.debugCheck);  // DB + admin check — remove after fix

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get('/me',              authenticate, controller.getMe);
router.patch('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword);

module.exports = router;
