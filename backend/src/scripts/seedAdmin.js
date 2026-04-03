const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

(async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await pool.query(
    `INSERT INTO users (id, name, email, password, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO NOTHING`,
    [uuidv4(), 'Admin', 'admin@ledgerflow.com', hashedPassword, 'ADMIN']
  );

  console.log('✅ Admin seeded');
  process.exit();
})();