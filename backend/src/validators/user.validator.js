const AppError = require('../utils/AppError');
const ROLES = require('../utils/roles');

/**
 * Validates user creation request body.
 */
const validateCreateUser = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    throw new AppError('Name, email, password, and role are required', 400);
  }

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    throw new AppError('Name must be between 2 and 100 characters', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Invalid email format', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  if (!/[A-Z]/.test(password)) {
    throw new AppError('Password must contain at least one uppercase letter', 400);
  }

  if (!/[0-9]/.test(password)) {
    throw new AppError('Password must contain at least one number', 400);
  }

  if (!Object.values(ROLES).includes(role)) {
    throw new AppError(`Invalid role. Allowed roles: ${Object.values(ROLES).join(', ')}`, 400);
  }

  if (role === ROLES.ADMIN) {
    throw new AppError('Cannot create user with ADMIN role via API', 403);
  }

  next();
};

/**
 * Validates role update request body.
 */
const validateUpdateRole = (req, res, next) => {
  const { role } = req.body;

  if (!role) {
    throw new AppError('Role is required', 400);
  }

  if (!Object.values(ROLES).includes(role)) {
    throw new AppError(`Invalid role. Allowed roles: ${Object.values(ROLES).join(', ')}`, 400);
  }

  next();
};

/**
 * Validates status update request body.
 */
const validateUpdateStatus = (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    throw new AppError('Status is required', 400);
  }

  if (!['ACTIVE', 'INACTIVE'].includes(status)) {
    throw new AppError('Invalid status. Allowed values: ACTIVE, INACTIVE', 400);
  }

  next();
};

module.exports = { validateCreateUser, validateUpdateRole, validateUpdateStatus };
