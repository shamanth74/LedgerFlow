const AppError = require('../utils/AppError');

/**
 * Validates record creation request body.
 */
const validateCreateRecord = (req, res, next) => {
  const { amount, type, category, date } = req.body;

  if (amount === undefined || amount === null || !type || !date) {
    throw new AppError('Amount, type, and date are required', 400);
  }

  if (typeof amount !== 'number' || amount <= 0) {
    throw new AppError('Amount must be a positive number', 400);
  }

  if (amount > 9999999999.99) {
    throw new AppError('Amount exceeds maximum allowed value', 400);
  }

  if (!['income', 'expense'].includes(type)) {
    throw new AppError('Type must be either "income" or "expense"', 400);
  }

  if (category && (typeof category !== 'string' || category.trim().length === 0 || category.trim().length > 50)) {
    throw new AppError('Category must be a non-empty string with max 50 characters', 400);
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new AppError('Date must be in YYYY-MM-DD format', 400);
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new AppError('Invalid date value', 400);
  }

  next();
};

/**
 * Validates record update request body (partial updates allowed).
 */
const validateUpdateRecord = (req, res, next) => {
  const { amount, type, category, date } = req.body;

  if (amount !== undefined) {
    if (typeof amount !== 'number' || amount <= 0) {
      throw new AppError('Amount must be a positive number', 400);
    }
    if (amount > 9999999999.99) {
      throw new AppError('Amount exceeds maximum allowed value', 400);
    }
  }

  if (type !== undefined && !['income', 'expense'].includes(type)) {
    throw new AppError('Type must be either "income" or "expense"', 400);
  }

  if (category !== undefined && (typeof category !== 'string' || category.trim().length === 0 || category.trim().length > 50)) {
    throw new AppError('Category must be a non-empty string with max 50 characters', 400);
  }

  if (date !== undefined) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new AppError('Date must be in YYYY-MM-DD format', 400);
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new AppError('Invalid date value', 400);
    }
  }

  next();
};

/**
 * Validates UUID parameter.
 */
const validateUUID = (req, res, next) => {
  const { id } = req.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    throw new AppError('Invalid record ID format', 400);
  }

  next();
};

module.exports = { validateCreateRecord, validateUpdateRecord, validateUUID };
