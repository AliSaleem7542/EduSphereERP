const { Router } = require('express');
const c = require('./timetable.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate);

router.get('/',                                    authorize('ADMIN', 'TEACHER', 'STUDENT'), c.getAll);
router.post('/',                                   authorize('ADMIN'),                        c.create);
router.put('/:id',                                 authorize('ADMIN'),                        c.update);
router.delete('/:id',                              authorize('ADMIN'),                        c.remove);
router.get('/teacher/:teacherId',                  authorize('ADMIN', 'TEACHER'),             c.getTeacherSchedule);
router.get('/class/:classId/section/:sectionId',   authorize('ADMIN', 'TEACHER', 'STUDENT'), c.getClassTimetable);

module.exports = router;
