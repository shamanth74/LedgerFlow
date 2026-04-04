const express = require('express');
const router = express.Router();

const recordController = require('../controllers/record.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const ROLES = require('../utils/roles');
const { validateCreateRecord, validateUpdateRecord, validateUUID } = require('../validators/record.validator');

// GET /records — List records (paginated, filterable)
// Accessible to ADMIN and ANALYST
router.get(
  '/',
  authenticate,
  authorize([ROLES.ADMIN, ROLES.ANALYST]),
  recordController.getRecords
);

// GET /records/trash — List soft-deleted records
// ADMIN only
router.get(
  '/trash',
  authenticate,
  authorize([ROLES.ADMIN]),
  recordController.getDeletedRecords
);

// GET /records/export — Export records as CSV
// Accessible to ADMIN and ANALYST
router.get(
  '/export',
  authenticate,
  authorize([ROLES.ADMIN, ROLES.ANALYST]),
  recordController.exportRecords
);

// POST /records — Create new record
// ADMIN only
router.post(
  '/',
  authenticate,
  authorize([ROLES.ADMIN]),
  validateCreateRecord,
  recordController.createRecord
);

// PATCH /records/:id — Update record
// ADMIN only
router.patch(
  '/:id',
  authenticate,
  authorize([ROLES.ADMIN]),
  validateUUID,
  validateUpdateRecord,
  recordController.updateRecord
);

// DELETE /records/:id — Soft-delete record
// ADMIN only
router.delete(
  '/:id',
  authenticate,
  authorize([ROLES.ADMIN]),
  validateUUID,
  recordController.deleteRecord
);

// POST /records/:id/restore — Restore soft-deleted record
// ADMIN only
router.post(
  '/:id/restore',
  authenticate,
  authorize([ROLES.ADMIN]),
  validateUUID,
  recordController.restoreRecord
);

module.exports = router;