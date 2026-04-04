const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { validateLogin } = require('../validators/auth.validator');
const { authLimiter } = require('../middlewares/rateLimiter');

// POST /auth/login — rate limited + validated
router.post('/login', authLimiter, validateLogin, authController.login);

module.exports = router;