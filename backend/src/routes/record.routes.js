const express = require('express');
const router = express.Router();

const recordController = require('../controllers/record.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const ROLES = require('../utils/roles');

// Only ADMIN can create records
router.post(
  '/',
  authenticate,
  authorize([ROLES.ADMIN]),
  recordController.createRecord
);

// update record
router.patch(
  '/:id',
  authenticate,
  authorize([ROLES.ADMIN]),
  recordController.updateRecord
);

// delete record
router.delete(
  '/:id',
  authenticate,
  authorize([ROLES.ADMIN]),
  recordController.deleteRecord
);

router.get(
  '/',
  authenticate,
  authorize([ROLES.ADMIN, ROLES.ANALYST]),
  recordController.getRecords
);

module.exports = router;