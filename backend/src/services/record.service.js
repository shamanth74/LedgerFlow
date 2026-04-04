const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');
const auditService = require('./audit.service');

/**
 * Creates a new financial record.
 */
exports.createRecord = async (data, user) => {
  const { amount, type, category, date, notes } = data;

  const result = await pool.query(
    `INSERT INTO records (id, amount, type, category, date, notes, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [uuidv4(), amount, type, category || 'Uncategorized', date, notes || null, user.userId]
  );

  const record = result.rows[0];

  // Audit log
  await auditService.logAction({
    userId: user.userId,
    action: 'CREATE_RECORD',
    targetType: 'record',
    targetId: record.id,
    newData: { amount, type, category, date, notes },
  });

  return record;
};

/**
 * Updates an existing record (partial update via COALESCE).
 */
exports.updateRecord = async (id, data, user) => {
  const { amount, type, category, date, notes } = data;

  // Check if record exists and is not soft-deleted
  const existing = await pool.query(
    'SELECT * FROM records WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );

  if (existing.rows.length === 0) {
    throw new AppError('Record not found', 404);
  }

  const oldRecord = existing.rows[0];

  const result = await pool.query(
    `UPDATE records
     SET amount = COALESCE($1, amount),
         type = COALESCE($2, type),
         category = COALESCE($3, category),
         date = COALESCE($4, date),
         notes = COALESCE($5, notes)
     WHERE id = $6 AND deleted_at IS NULL
     RETURNING *`,
    [amount, type, category, date, notes, id]
  );

  const updatedRecord = result.rows[0];

  // Audit log with before/after state
  await auditService.logAction({
    userId: user.userId,
    action: 'UPDATE_RECORD',
    targetType: 'record',
    targetId: id,
    oldData: {
      amount: oldRecord.amount,
      type: oldRecord.type,
      category: oldRecord.category,
      date: oldRecord.date,
      notes: oldRecord.notes,
    },
    newData: {
      amount: updatedRecord.amount,
      type: updatedRecord.type,
      category: updatedRecord.category,
      date: updatedRecord.date,
      notes: updatedRecord.notes,
    },
  });

  return updatedRecord;
};

/**
 * Soft-deletes a record (sets deleted_at instead of removing row).
 * Financial data should never be hard-deleted for compliance.
 */
exports.deleteRecord = async (id, user) => {
  const existing = await pool.query(
    'SELECT * FROM records WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );

  if (existing.rows.length === 0) {
    throw new AppError('Record not found', 404);
  }

  const oldRecord = existing.rows[0];

  await pool.query(
    'UPDATE records SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
    [id]
  );

  // Audit log
  await auditService.logAction({
    userId: user.userId,
    action: 'DELETE_RECORD',
    targetType: 'record',
    targetId: id,
    oldData: {
      amount: oldRecord.amount,
      type: oldRecord.type,
      category: oldRecord.category,
      date: oldRecord.date,
    },
  });

  return;
};

/**
 * Restores a soft-deleted record.
 */
exports.restoreRecord = async (id, user) => {
  const existing = await pool.query(
    'SELECT * FROM records WHERE id = $1 AND deleted_at IS NOT NULL',
    [id]
  );

  if (existing.rows.length === 0) {
    throw new AppError('Deleted record not found', 404);
  }

  const result = await pool.query(
    'UPDATE records SET deleted_at = NULL WHERE id = $1 RETURNING *',
    [id]
  );

  // Audit log
  await auditService.logAction({
    userId: user.userId,
    action: 'RESTORE_RECORD',
    targetType: 'record',
    targetId: id,
    newData: { restored: true },
  });

  return result.rows[0];
};

/**
 * Returns paginated, filtered list of active (non-deleted) records.
 */
exports.getRecords = async (query) => {
  let baseQuery = 'SELECT * FROM records WHERE deleted_at IS NULL';
  let countQuery = 'SELECT COUNT(*) FROM records WHERE deleted_at IS NULL';
  const values = [];
  const countValues = [];
  let index = 1;
  let countIndex = 1;

  const { type, category, startDate, endDate } = query;

  // Filter: type
  if (type) {
    const filter = ` AND type = $${index++}`;
    baseQuery += filter;
    values.push(type.toLowerCase());

    countQuery += ` AND type = $${countIndex++}`;
    countValues.push(type.toLowerCase());
  }

  // Filter: category
  if (category) {
    const filter = ` AND LOWER(category) = LOWER($${index++})`;
    baseQuery += filter;
    values.push(category);

    countQuery += ` AND LOWER(category) = LOWER($${countIndex++})`;
    countValues.push(category);
  }

  // Filter: date range
  if (startDate) {
    const filter = ` AND date >= $${index++}`;
    baseQuery += filter;
    values.push(startDate);

    countQuery += ` AND date >= $${countIndex++}`;
    countValues.push(startDate);
  }

  if (endDate) {
    const filter = ` AND date <= $${index++}`;
    baseQuery += filter;
    values.push(endDate);

    countQuery += ` AND date <= $${countIndex++}`;
    countValues.push(endDate);
  }

  // Pagination
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const offset = (page - 1) * limit;

  baseQuery += ` ORDER BY date DESC LIMIT $${index++} OFFSET $${index++}`;
  values.push(limit, offset);

  const [dataResult, countResult] = await Promise.all([
    pool.query(baseQuery, values),
    pool.query(countQuery, countValues),
  ]);

  const total = parseInt(countResult.rows[0].count);

  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Returns soft-deleted records (trash).
 */
exports.getDeletedRecords = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT * FROM records WHERE deleted_at IS NOT NULL
       ORDER BY deleted_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
    pool.query('SELECT COUNT(*) FROM records WHERE deleted_at IS NOT NULL'),
  ]);

  const total = parseInt(countResult.rows[0].count);

  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Exports records as CSV format string.
 */
exports.exportRecords = async (query) => {
  let baseQuery = 'SELECT id, amount, type, category, date, notes, created_at FROM records WHERE deleted_at IS NULL';
  const values = [];
  let index = 1;

  const { type, category, startDate, endDate } = query;

  if (type) {
    baseQuery += ` AND type = $${index++}`;
    values.push(type.toLowerCase());
  }

  if (category) {
    baseQuery += ` AND LOWER(category) = LOWER($${index++})`;
    values.push(category);
  }

  if (startDate) {
    baseQuery += ` AND date >= $${index++}`;
    values.push(startDate);
  }

  if (endDate) {
    baseQuery += ` AND date <= $${index++}`;
    values.push(endDate);
  }

  baseQuery += ' ORDER BY date DESC';

  const result = await pool.query(baseQuery, values);
  const rows = result.rows;

  if (rows.length === 0) {
    throw new AppError('No records found for the given filters', 404);
  }

  // Generate CSV
  const headers = ['ID', 'Amount', 'Type', 'Category', 'Date', 'Notes', 'Created At'];
  const csvRows = [headers.join(',')];

  for (const row of rows) {
    const csvRow = [
      row.id,
      row.amount,
      row.type,
      `"${(row.category || '').replace(/"/g, '""')}"`,
      row.date,
      `"${(row.notes || '').replace(/"/g, '""')}"`,
      row.created_at,
    ].join(',');
    csvRows.push(csvRow);
  }

  return csvRows.join('\n');
};