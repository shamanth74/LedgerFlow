const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Test connection immediately
pool.connect()
  .then(client => {
    console.log('✅ PostgreSQL connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection error:', err.message);
  });

module.exports = pool;