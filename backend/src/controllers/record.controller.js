const recordService = require('../services/record.service');
const asyncHandler = require('../utils/asyncHandler');

exports.createRecord = asyncHandler(async (req, res) => {
  const record = await recordService.createRecord(req.body, req.user);
  res.status(201).json({ success: true, data: record });
});

exports.updateRecord = asyncHandler(async (req, res) => {
  const record = await recordService.updateRecord(req.params.id, req.body, req.user);
  res.json({ success: true, data: record });
});

exports.deleteRecord = asyncHandler(async (req, res) => {
  await recordService.deleteRecord(req.params.id, req.user);
  res.json({ success: true, message: 'Record deleted successfully (moved to trash)' });
});

exports.restoreRecord = asyncHandler(async (req, res) => {
  const record = await recordService.restoreRecord(req.params.id, req.user);
  res.json({ success: true, data: record, message: 'Record restored successfully' });
});

exports.getRecords = asyncHandler(async (req, res) => {
  const result = await recordService.getRecords(req.query);
  res.json({ success: true, ...result });
});

exports.getDeletedRecords = asyncHandler(async (req, res) => {
  const result = await recordService.getDeletedRecords(req.query);
  res.json({ success: true, ...result });
});

exports.exportRecords = asyncHandler(async (req, res) => {
  const csv = await recordService.exportRecords(req.query);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=records_export_${Date.now()}.csv`);
  res.send(csv);
});