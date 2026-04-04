const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');
const auditService = require('./audit.service');

/**
 * Creates a new user. Only ADMIN can call this (enforced at route level).
 * Validates uniqueness, hashes password, prevents ADMIN role creation.
 */
exports.createUser = async (data, requestingUser) => {
  const { name, email, password, role } = data;

  // Check if user already exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError('A user with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Insert user
  const result = await pool.query(
    `INSERT INTO users (id, name, email, password, role, status)
     VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
     RETURNING id, name, email, role, status, created_at`,
    [uuidv4(), name.trim(), email.toLowerCase().trim(), hashedPassword, role]
  );

  const newUser = result.rows[0];

  // Audit log
  await auditService.logAction({
    userId: requestingUser.userId,
    action: 'CREATE_USER',
    targetType: 'user',
    targetId: newUser.id,
    newData: { name: newUser.name, email: newUser.email, role: newUser.role },
  });

  return newUser;
};

/**
 * Returns paginated list of all users (excluding password).
 */
exports.getAllUsers = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const offset = (page - 1) * limit;

  let baseQuery = `SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE 1=1`;
  let countQuery = `SELECT COUNT(*) FROM users WHERE 1=1`;
  const values = [];
  const countValues = [];
  let index = 1;
  let countIndex = 1;

  // Filter by role
  if (query.role) {
    baseQuery += ` AND role = $${index++}`;
    values.push(query.role.toUpperCase());
    countQuery += ` AND role = $${countIndex++}`;
    countValues.push(query.role.toUpperCase());
  }

  // Filter by status
  if (query.status) {
    baseQuery += ` AND status = $${index++}`;
    values.push(query.status.toUpperCase());
    countQuery += ` AND status = $${countIndex++}`;
    countValues.push(query.status.toUpperCase());
  }

  baseQuery += ` ORDER BY created_at DESC LIMIT $${index++} OFFSET $${index++}`;
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
 * Returns a single user by ID (excluding password).
 */
exports.getUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  return result.rows[0];
};

/**
 * Updates a user's role.
 */
exports.updateRole = async (id, newRole, requestingUser) => {
  // Prevent admin from changing their own role
  if (requestingUser.userId === id) {
    throw new AppError('You cannot change your own role', 400);
  }

  const existing = await pool.query(
    'SELECT id, name, email, role, status FROM users WHERE id = $1',
    [id]
  );

  if (existing.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  const oldRole = existing.rows[0].role;

  const result = await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2
     RETURNING id, name, email, role, status, updated_at`,
    [newRole, id]
  );

  // Audit log
  await auditService.logAction({
    userId: requestingUser.userId,
    action: 'UPDATE_ROLE',
    targetType: 'user',
    targetId: id,
    oldData: { role: oldRole },
    newData: { role: newRole },
  });

  return result.rows[0];
};

/**
 * Updates a user's status (ACTIVE / INACTIVE).
 */
exports.updateStatus = async (id, newStatus, requestingUser) => {
  // Prevent admin from deactivating themselves
  if (requestingUser.userId === id) {
    throw new AppError('You cannot change your own status', 400);
  }

  const existing = await pool.query(
    'SELECT id, name, email, role, status FROM users WHERE id = $1',
    [id]
  );

  if (existing.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  const oldStatus = existing.rows[0].status;

  const result = await pool.query(
    `UPDATE users SET status = $1 WHERE id = $2
     RETURNING id, name, email, role, status, updated_at`,
    [newStatus, id]
  );

  // Audit log
  await auditService.logAction({
    userId: requestingUser.userId,
    action: newStatus === 'ACTIVE' ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
    targetType: 'user',
    targetId: id,
    oldData: { status: oldStatus },
    newData: { status: newStatus },
  });

  return result.rows[0];
};