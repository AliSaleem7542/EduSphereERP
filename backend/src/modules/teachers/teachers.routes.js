const { Router } = require('express');
const controller = require('./teachers.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const { uploadPhoto } = require('../../config/multer');

const router = Router();

router.use(authenticate);

router.get('/',                    authorize('ADMIN'),                    controller.getAll);
router.post('/',                   authorize('ADMIN'),                    uploadPhoto.single('photo'), controller.create);
router.get('/:id',                 authorize('ADMIN', 'TEACHER'),         controller.getOne);
router.put('/:id',                 authorize('ADMIN'),                    uploadPhoto.single('photo'), controller.update);
router.delete('/:id',              authorize('ADMIN'),                    controller.remove);
router.get('/:id/subjects',        authorize('ADMIN', 'TEACHER'),         controller.getSubjects);
router.get('/:id/schedule',        authorize('ADMIN', 'TEACHER'),         controller.getSchedule);
router.get('/:id/students',        authorize('ADMIN', 'TEACHER'),         controller.getStudents);
router.post('/:id/assign-subjects', authorize('ADMIN'),                   controller.assignSubjects);

module.exports = router;
