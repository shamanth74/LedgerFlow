const express = require('express');
const router = express.Router();

const auditController = require('../controllers/audit.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const ROLES = require('../utils/roles');

// Only ADMIN can view audit logs
router.get(
  '/',
  authenticate,
  authorize([ROLES.ADMIN]),
  auditController.getAuditLogs
);

module.exports = router;
