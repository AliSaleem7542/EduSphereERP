const { Router } = require('express');
const c = require('./attendance.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate);

router.get('/students',         authorize('ADMIN', 'TEACHER'),  c.getStudentAttendance);
router.post('/students',        authorize('ADMIN', 'TEACHER'),  c.markStudentAttendance);
router.get('/students/report',  authorize('ADMIN'),             c.getAttendanceReport);
router.get('/teachers',         authorize('ADMIN'),             c.getTeacherAttendance);
router.post('/teachers',        authorize('ADMIN'),             c.markTeacherAttendance);
router.get('/today',            authorize('ADMIN'),             c.getTodaySummary);

module.exports = router;
