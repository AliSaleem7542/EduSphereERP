const { Router } = require('express');
const c = require('./reports.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard',   c.getDashboard);
router.get('/attendance',  c.getAttendanceReport);
router.get('/fees',        c.getFeesReport);
router.get('/results',     c.getResultsReport);
router.get('/library',     c.getLibraryReport);

module.exports = router;
