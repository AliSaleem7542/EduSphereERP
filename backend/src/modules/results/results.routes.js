const { Router } = require('express');
const c = require('./results.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate);

router.get('/',                authorize('ADMIN', 'TEACHER'),         c.getAll);
router.post('/bulk',           authorize('ADMIN', 'TEACHER'),         c.saveBulk);
router.put('/:id',             authorize('ADMIN', 'TEACHER'),         c.update);
router.delete('/:id',          authorize('ADMIN'),                    c.remove);
router.get('/student/:id',     authorize('ADMIN', 'TEACHER', 'STUDENT'), c.getByStudent);
router.get('/exam/:examId',    authorize('ADMIN', 'TEACHER'),         c.getByExam);

module.exports = router;
