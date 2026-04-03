const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async ({ email, password }) => {
  // 1. Find user
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error('User not found');
  }

  // 2. Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // 3. Generate token
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 4. Return response
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};