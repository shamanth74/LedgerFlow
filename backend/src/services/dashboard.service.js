const pool = require('../config/db');

/**
 * Returns total income, total expense, and net balance.
 * Optionally scoped to a specific user.
 */
exports.getSummary = async (userId = null) => {
  let query = `
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
      COUNT(*) AS total_records
    FROM records
    WHERE deleted_at IS NULL
  `;
  const values = [];

  if (userId) {
    query += ` AND user_id = $1`;
    values.push(userId);
  }

  const result = await pool.query(query, values);
  const data = result.rows[0];

  const income = Number(data.total_income);
  const expense = Number(data.total_expense);

  return {
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense,
    totalRecords: parseInt(data.total_records),
  };
};

/**
 * Returns category-wise breakdown of expenses (and income).
 * Optionally scoped to a specific user.
 */
exports.getCategoryBreakdown = async (userId = null) => {
  let query = `
    SELECT
      category,
      type,
      SUM(amount) AS total,
      COUNT(*) AS count
    FROM records
    WHERE deleted_at IS NULL
  `;
  const values = [];
  let index = 1;

  if (userId) {
    query += ` AND user_id = $${index++}`;
    values.push(userId);
  }

  query += ` GROUP BY category, type ORDER BY total DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Returns monthly income/expense trends.
 * Optionally scoped to a specific user.
 */
exports.getMonthlyTrends = async (userId = null) => {
  let query = `
    SELECT
      TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS net
    FROM records
    WHERE deleted_at IS NULL
  `;
  const values = [];

  if (userId) {
    query += ` AND user_id = $1`;
    values.push(userId);
  }

  query += ` GROUP BY month ORDER BY month`;

  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Returns weekly income/expense trends for the last 12 weeks.
 * Optionally scoped to a specific user.
 */
exports.getWeeklyTrends = async (userId = null) => {
  let query = `
    SELECT
      TO_CHAR(DATE_TRUNC('week', date), 'YYYY-MM-DD') AS week_start,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS net
    FROM records
    WHERE deleted_at IS NULL
      AND date >= CURRENT_DATE - INTERVAL '12 weeks'
  `;
  const values = [];

  if (userId) {
    query += ` AND user_id = $1`;
    values.push(userId);
  }

  query += ` GROUP BY week_start ORDER BY week_start`;

  const result = await pool.query(query, values);
  return result.rows;
};