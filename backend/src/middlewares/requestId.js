const { v4: uuidv4 } = require('uuid');

/**
 * Assigns a unique X-Request-Id to every incoming request.
 * Reuses client-provided ID if present, otherwise generates a new one.
 * Enables end-to-end request tracing in logs.
 */
const requestId = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-Id', req.requestId);
  next();
};

module.exports = requestId;
