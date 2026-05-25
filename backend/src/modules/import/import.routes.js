const { Router } = require('express');
const controller = require('./import.controller');
const { authenticate } = require('../../middleware/authenticate');
const { authorize } = require('../../middleware/authorize');

const router = Router();

router.use(authenticate);

// GET  /api/v1/import/status   — database record counts
router.get('/status', authorize('ADMIN'), controller.getImportStatus);

// POST /api/v1/import/school-data — import JSON payload into PostgreSQL
router.post('/school-data', authorize('ADMIN'), controller.importSchoolData);

// POST /api/v1/import/reset   — clear all ERP data (keep admin)
router.post('/reset', authorize('ADMIN'), controller.resetData);

module.exports = router;
