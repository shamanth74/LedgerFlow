const auditService = require('../services/audit.service');
const asyncHandler = require('../utils/asyncHandler');

exports.getAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogs(req.query);
  res.json({ success: true, ...result });
});
