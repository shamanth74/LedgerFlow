const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

/**
 * JWT Authentication Middleware.
 * Extracts and verifies the Bearer token from the Authorization header.
 * Attaches decoded user payload (userId, role, email) to req.user.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Please provide a valid Bearer token.', 401);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('Authentication required. Token is missing.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Attach IP address for audit logging
    req.clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Token has expired. Please login again.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token. Please login again.', 401);
    }
    throw new AppError('Authentication failed.', 401);
  }
};

module.exports = authenticate;