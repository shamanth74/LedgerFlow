const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const ROLES = require('../utils/roles');

// Only ADMIN can create users
router.post(
  '/',
  authenticate,
  authorize([ROLES.ADMIN]),
  userController.createUser
);

module.exports = router;