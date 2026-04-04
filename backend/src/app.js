require('dotenv').config();
require('./config/db');
const express = require('express');
const helmet = require('helmet');
const app = express();

// Middleware imports
const requestId = require('./middlewares/requestId');
const errorHandler = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const recordRoutes = require('./routes/record.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const auditRoutes = require('./routes/audit.routes');

// =============================================
// Global Middleware
// =============================================
app.use(helmet());                          // Security headers
app.use(express.json({ limit: '10kb' }));   // Body parser with size limit
app.use(requestId);                         // Request ID tracing
app.use(generalLimiter);                    // Rate limiting

// =============================================
// Health Check
// =============================================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// =============================================
// API Routes
// =============================================
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/records', recordRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/audit', auditRoutes);

// =============================================
// 404 Handler
// =============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// =============================================
// Global Error Handler (must be last)
// =============================================
app.use(errorHandler);

module.exports = app;