const { Router } = require('express');
const c = require('./users.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/',        c.getAll);
router.post('/',       c.create);
router.put('/:id',     c.update);
router.delete('/:id',  c.deactivate);
router.get('/roles',   c.getRoles);

module.exports = router;
