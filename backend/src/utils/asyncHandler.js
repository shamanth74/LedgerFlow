/**
 * Wraps async route handlers to catch errors and forward them
 * to Express global error handler — eliminates try/catch boilerplate.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
