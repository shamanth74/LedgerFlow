const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const ROLES = require('../utils/roles');

// Summary
router.get(
  '/summary',
  authenticate,
  authorize([ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER]),
  dashboardController.getSummary
);

// Category breakdown
router.get(
  '/categories',
  authenticate,
  authorize([ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER]),
  dashboardController.getCategoryBreakdown
);

// Trends
router.get(
  '/trends',
  authenticate,
  authorize([ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER]),
  dashboardController.getTrends
);

module.exports = router;