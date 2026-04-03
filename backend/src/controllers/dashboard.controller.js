const dashboardService = require('../services/dashboard.service');

exports.getSummary = async (req, res) => {
  try {
    const data = await dashboardService.getSummary();
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getCategoryBreakdown = async (req, res) => {
  try {
    const data = await dashboardService.getCategoryBreakdown();
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getTrends = async (req, res) => {
  try {
    const data = await dashboardService.getTrends();
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};