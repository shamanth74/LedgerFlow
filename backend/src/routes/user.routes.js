const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const ROLES = require('../utils/roles');
const { validateCreateUser, validateUpdateRole, validateUpdateStatus } = require('../validators/user.validator');
const { validateUUID } = require('../validators/record.validator');

// All user management endpoints require ADMIN role

// GET /users — List all users (paginated, filterable by role/status)
router.get(
  '/',
  authenticate,
  authorize([ROLES.ADMIN]),
  userController.getAllUsers
);

// GET /users/:id — Get single user
router.get(
  '/:id',
  authenticate,
  authorize([ROLES.ADMIN]),
  validateUUID,
  userController.getUserById
);

// POST /users — Create new user
router.post(
  '/',
  authenticate,
  authorize([ROLES.ADMIN]),
  validateCreateUser,
  userController.createUser
);

// PATCH /users/:id/role — Update user role
router.patch(
  '/:id/role',
  authenticate,
  authorize([ROLES.ADMIN]),
  validateUpdateRole,
  userController.updateRole
);

// PATCH /users/:id/status — Activate/deactivate user
router.patch(
  '/:id/status',
  authenticate,
  authorize([ROLES.ADMIN]),
  validateUpdateStatus,
  userController.updateStatus
);

module.exports = router;