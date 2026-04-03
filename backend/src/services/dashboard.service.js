const pool = require('../config/db');

exports.getSummary = async () => {
  const result = await pool.query(`
    SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
    FROM records
  `);

  const data = result.rows[0];

  const income = Number(data.total_income) || 0;
  const expense = Number(data.total_expense) || 0;

  return {
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense
  };
};

exports.getCategoryBreakdown = async () => {
  const result = await pool.query(`
    SELECT category, SUM(amount) as total
    FROM records
    WHERE type = 'expense'
    GROUP BY category
    ORDER BY total DESC
  `);

  return result.rows;
};

exports.getTrends = async () => {
  const result = await pool.query(`
    SELECT 
      DATE_TRUNC('month', date) AS month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
    FROM records
    GROUP BY month
    ORDER BY month
  `);

  return result.rows;
};