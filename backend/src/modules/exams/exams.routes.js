const { Router } = require('express');
const c = require('./exams.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate);

router.get('/upcoming',  authorize('ADMIN', 'TEACHER', 'STUDENT'), c.getUpcoming);
router.get('/',          authorize('ADMIN', 'TEACHER', 'STUDENT'), c.getAll);
router.post('/',         authorize('ADMIN'),                        c.create);
router.get('/:id',       authorize('ADMIN', 'TEACHER', 'STUDENT'), c.getOne);
router.put('/:id',       authorize('ADMIN'),                        c.update);
router.delete('/:id',    authorize('ADMIN'),                        c.remove);

module.exports = router;
