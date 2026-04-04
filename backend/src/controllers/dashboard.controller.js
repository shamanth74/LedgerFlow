const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');

exports.getSummary = asyncHandler(async (req, res) => {
  const userId = req.query.userId || null;
  const data = await dashboardService.getSummary(userId);
  res.json({ success: true, data });
});

exports.getCategoryBreakdown = asyncHandler(async (req, res) => {
  const userId = req.query.userId || null;
  const data = await dashboardService.getCategoryBreakdown(userId);
  res.json({ success: true, data });
});

exports.getMonthlyTrends = asyncHandler(async (req, res) => {
  const userId = req.query.userId || null;
  const data = await dashboardService.getMonthlyTrends(userId);
  res.json({ success: true, data });
});

exports.getWeeklyTrends = asyncHandler(async (req, res) => {
  const userId = req.query.userId || null;
  const data = await dashboardService.getWeeklyTrends(userId);
  res.json({ success: true, data });
});