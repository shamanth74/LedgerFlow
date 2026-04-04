const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

/**
 * Authenticates a user and returns a JWT token.
 * Validates credentials, checks account status, and generates token.
 */
exports.login = async ({ email, password }) => {
  // 1. Find user by email
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // 2. Check if account is active
  if (user.status !== 'ACTIVE') {
    throw new AppError('Account is deactivated. Contact your administrator.', 403);
  }

  // 3. Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // 4. Generate JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 5. Return token and sanitized user info
  return {
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};