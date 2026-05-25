const { Router } = require('express');
const c = require('./system.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate);

router.get('/settings',          authorize('ADMIN', 'TEACHER', 'STUDENT'), c.getSettings);
router.put('/settings',          authorize('ADMIN'),                        c.updateSettings);
router.get('/logs',              authorize('ADMIN'),                        c.getLogs);
router.get('/academic-years',    authorize('ADMIN', 'TEACHER'),             c.getAcademicYears);
router.post('/academic-years',   authorize('ADMIN'),                        c.createAcademicYear);
router.patch('/academic-years/:id/set-current', authorize('ADMIN'),        c.setCurrentYear);

module.exports = router;
