const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema 
} = require('../validations/schemas');

const { register, login, refreshToken, getMe, logout } = require('../controllers/authController');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);

const {
  protect
} = require('../middlewares/auth');

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;