const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const ROLES = require('../utils/roles');

exports.createUser = async ({ name, email, password, role }) => {
  // 1. Validate input
  if (!name || !email || !password || !role) {
    throw new Error("All fields are required");
  }

  // 2. Validate role
  if (!Object.values(ROLES).includes(role)) {
    throw new Error("Invalid role");
  }
  if(role == ROLES.ADMIN){
    throw new Error("Can't create user with role admin");
  }
  // 3. Check if user exists
  const existingUser = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("User already exists");
  }

  // 4. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 5. Insert user
  const result = await pool.query(
    `INSERT INTO users (id, name, email, password, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role`,
    [uuidv4(), name, email, hashedPassword, role]
  );

  return result.rows[0];
};