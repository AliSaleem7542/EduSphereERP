const { Router } = require('express');
const c = require('./subjects.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate);

router.get('/',     authorize('ADMIN', 'TEACHER'), c.getAll);
router.post('/',    authorize('ADMIN'),             c.create);
router.put('/:id',  authorize('ADMIN'),             c.update);
router.delete('/:id', authorize('ADMIN'),           c.remove);

module.exports = router;
