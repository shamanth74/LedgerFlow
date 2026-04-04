require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

(async () => {
  try {
    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [uuidv4(), 'Admin', 'admin@ledgerflow.com', hashedPassword, 'ADMIN', 'ACTIVE']
    );

    console.log('✅ Admin user seeded successfully');
    console.log('   Email: admin@ledgerflow.com');
    console.log('   Password: Admin@123');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    process.exit();
  }
})();