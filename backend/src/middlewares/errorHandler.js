/**
 * Global error handling middleware.
 * Catches all errors forwarded via next(err) and returns structured JSON responses.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  // Structured error logging
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    requestId: req.requestId || 'N/A',
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  }));

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
