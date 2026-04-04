const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const ROLES = require('../utils/roles');

// All dashboard endpoints accessible to all authenticated roles

// GET /dashboard/summary — Total income, expense, balance
router.get(
  '/summary',
  authenticate,
  authorize([ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER]),
  dashboardController.getSummary
);

// GET /dashboard/categories — Category-wise breakdown
router.get(
  '/categories',
  authenticate,
  authorize([ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER]),
  dashboardController.getCategoryBreakdown
);

// GET /dashboard/trends/monthly — Monthly income/expense trends
router.get(
  '/trends/monthly',
  authenticate,
  authorize([ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER]),
  dashboardController.getMonthlyTrends
);

// GET /dashboard/trends/weekly — Weekly income/expense trends (last 12 weeks)
router.get(
  '/trends/weekly',
  authenticate,
  authorize([ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER]),
  dashboardController.getWeeklyTrends
);

module.exports = router;