const { Router } = require('express');
const controller = require('./students.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');
const { uploadPhoto, uploadImport } = require('../../config/multer');

const router = Router();

// All student routes require authentication
router.use(authenticate);

router.get('/',                authorize('ADMIN', 'TEACHER'), controller.getAll);
router.post('/',               authorize('ADMIN'),            uploadPhoto.single('photo'), controller.create);
router.get('/:id',             authorize('ADMIN', 'TEACHER', 'STUDENT'), controller.getOne);
router.put('/:id',             authorize('ADMIN'),            uploadPhoto.single('photo'), controller.update);
router.delete('/:id',          authorize('ADMIN'),            controller.remove);
router.get('/:id/attendance',  authorize('ADMIN', 'TEACHER', 'STUDENT'), controller.getAttendance);
router.get('/:id/results',     authorize('ADMIN', 'TEACHER', 'STUDENT'), controller.getResults);
router.get('/:id/fees',        authorize('ADMIN', 'STUDENT'), controller.getFees);
router.get('/:id/books',       authorize('ADMIN', 'STUDENT'), controller.getBooks);
router.post('/:id/promote',    authorize('ADMIN'),            controller.promote);
router.post('/bulk-import',    authorize('ADMIN'),            uploadImport.single('file'), controller.bulkImport);

module.exports = router;
