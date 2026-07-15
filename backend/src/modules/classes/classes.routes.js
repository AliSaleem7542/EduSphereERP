const { Router } = require('express');
const c = require('./classes.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate);

// General routes (no params)
router.get('/',                          authorize('ADMIN', 'TEACHER'),  c.getAll);
router.post('/',                         authorize('ADMIN'),              c.create);

// Specific section routes (should be before /:id routes to avoid conflicts)
router.put('/sections/:sectionId',       authorize('ADMIN'),              c.updateSection);
router.delete('/sections/:sectionId',    authorize('ADMIN'),              c.deleteSection);
router.post('/sections/:sectionId/assign-teacher', authorize('ADMIN'),   c.assignClassTeacher);

// Class-specific routes (/:id routes - should be last)
router.put('/:id',                       authorize('ADMIN'),              c.update);
router.delete('/:id',                    authorize('ADMIN'),              c.remove);
router.get('/:id/sections',              authorize('ADMIN', 'TEACHER'),  c.getSections);
router.post('/:id/sections',             authorize('ADMIN'),              c.createSection);

module.exports = router;
