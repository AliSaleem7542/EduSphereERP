const { Router } = require('express');
const c = require('./fees.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate);

router.get('/',          authorize('ADMIN'),             c.getAll);
router.post('/',         authorize('ADMIN'),             c.collect);
router.get('/pending',   authorize('ADMIN'),             c.getPending);
router.get('/summary',   authorize('ADMIN'),             c.getSummary);
router.get('/refunds',   authorize('ADMIN'),             c.getRefunds);
router.post('/refunds',  authorize('ADMIN'),             c.processRefund);
router.get('/:id',       authorize('ADMIN', 'STUDENT'),  c.getOne);
router.delete('/:id',    authorize('ADMIN'),             c.voidRecord);

module.exports = router;
