const { Router } = require('express');
const c = require('./accounts.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');

const router = Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/entries',        c.getEntries);
router.post('/entries',       c.createEntry);
router.put('/entries/:id',    c.updateEntry);
router.delete('/entries/:id', c.deleteEntry);
router.get('/ledger',         c.getLedger);
router.get('/balance-sheet',  c.getBalanceSheet);

module.exports = router;
