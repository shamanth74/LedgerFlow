const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.createRecord = async (data, user) => {
  const { amount, type, category, date, notes } = data;

  // 1. Validate input
  if (!amount || !type || !date) {
    throw new Error("Amount, type, and date are required");
  }

  // 2. Validate type
  if (!['income', 'expense'].includes(type)) {
    throw new Error("Invalid type");
  }

  // 3. Insert into DB
  const result = await pool.query(
    `INSERT INTO records (id, amount, type, category, date, notes, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      uuidv4(),
      amount,
      type,
      category,
      date,
      notes,
      user.userId
    ]
  );

  return result.rows[0];
};

exports.updateRecord = async (id, data) => {
  const { amount, type, category, date, notes } = data;

  // 1. Check if record exists
  const existing = await pool.query(
    'SELECT * FROM records WHERE id = $1',
    [id]
  );

  if (existing.rows.length === 0) {
    throw new Error("Record not found");
  }

  // 2. Validate type (if provided)
  if (type && !['income', 'expense'].includes(type)) {
    throw new Error("Invalid type");
  }

  // 3. Update query (partial update)
  const result = await pool.query(
    `UPDATE records
     SET amount = COALESCE($1, amount),
         type = COALESCE($2, type),
         category = COALESCE($3, category),
         date = COALESCE($4, date),
         notes = COALESCE($5, notes)
     WHERE id = $6
     RETURNING *`,
    [amount, type, category, date, notes, id]
  );

  return result.rows[0];
};

exports.deleteRecord = async (id) => {
  const result = await pool.query(
    'DELETE FROM records WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Record not found");
  }

  return;
};


exports.getRecords = async (query) => {
  let baseQuery = 'SELECT * FROM records WHERE 1=1';
  let values = [];
  let index = 1;

  const { type, category, startDate, endDate } = query;

  // Filter: type
  if (type) {
    baseQuery += ` AND type = $${index++}`;
    values.push(type.toLowerCase());
  }

  // Filter: category
  if (category) {
    baseQuery += ` AND category = $${index++}`;
    values.push(category);
  }

  // Filter: date range
  if (startDate) {
    baseQuery += ` AND date >= $${index++}`;
    values.push(startDate);
  }

  if (endDate) {
    baseQuery += ` AND date <= $${index++}`;
    values.push(endDate);
  }

  // Optional: sort latest first
  baseQuery += ' ORDER BY date DESC';

  const result = await pool.query(baseQuery, values);

  return result.rows;
};