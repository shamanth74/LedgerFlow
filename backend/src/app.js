require('dotenv').config();
require('./config/db');
const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

// Middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('LedgerFlow API running');
});

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
module.exports = app;