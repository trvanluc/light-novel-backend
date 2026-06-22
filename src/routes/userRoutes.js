const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const { 
  updateProfileSchema, 
  changePasswordSchema 
} = require('../validations/schemas');

const { 
  getProfile, 
  updateProfile, 
  changePassword 
} = require('../controllers/userController');

const { protect } = require('../middlewares/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);

module.exports = router;