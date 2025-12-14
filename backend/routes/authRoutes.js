const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { registerValidation, loginValidation } = require('../middleware/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public (admin creation requires admin token)
 */
router.post('/register', registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', auth, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', auth, updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.put('/change-password', auth, changePassword);

module.exports = router;
