const AppError = require('../utils/AppError');

/**
 * Role-Based Access Control (RBAC) Middleware.
 * Restricts access to routes based on the user's role.
 *
 * @param {string[]} allowedRoles - Array of roles permitted to access the route.
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      throw new AppError('Access denied. No role information found.', 403);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
        403
      );
    }

    next();
  };
};

module.exports = authorize;