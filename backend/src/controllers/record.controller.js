const recordService = require('../services/record.service');

exports.createRecord = async (req, res) => {
  try {
    const record = await recordService.createRecord(req.body, req.user);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const record = await recordService.updateRecord(
      req.params.id,
      req.body
    );
    res.status(200).json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
  
    await recordService.deleteRecord(req.params.id);
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getRecords = async (req, res) => {
  try {
    const records = await recordService.getRecords(req.query);
    res.status(200).json(records);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};