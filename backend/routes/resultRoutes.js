const express = require('express');
const router = express.Router();
const {
  addOrUpdateMarks,
  getStudentResult,
  updateCoScholastic,
  getClassResults,
  calculateResult,
  generateMarksheet
} = require('../controllers/resultController');
const auth = require('../middleware/auth');
const { isAdminOrStaff, canAccessStudent } = require('../middleware/roleCheck');
const { marksValidation, coScholasticValidation } = require('../middleware/validation');

/**
 * @route   POST /api/results/:studentId/marks
 * @desc    Add or update marks for a student
 * @access  Private (Admin/Staff)
 */
router.post('/:studentId/marks', auth, isAdminOrStaff, marksValidation, addOrUpdateMarks);

/**
 * @route   GET /api/results/:studentId
 * @desc    Get student result
 * @access  Private (Admin/Staff/Student-own)
 */
router.get('/:studentId', auth, canAccessStudent, getStudentResult);

/**
 * @route   PUT /api/results/:studentId/co-scholastic
 * @desc    Update co-scholastic areas
 * @access  Private (Admin/Staff)
 */
router.put('/:studentId/co-scholastic', auth, isAdminOrStaff, coScholasticValidation, updateCoScholastic);

/**
 * @route   GET /api/results/class/:className
 * @desc    Get results for entire class
 * @access  Private (Admin/Staff)
 */
router.get('/class/:className', auth, isAdminOrStaff, getClassResults);

/**
 * @route   POST /api/results/:studentId/calculate
 * @desc    Recalculate result
 * @access  Private (Admin/Staff)
 */
router.post('/:studentId/calculate', auth, isAdminOrStaff, calculateResult);

/**
 * @route   GET /api/results/:studentId/marksheet
 * @desc    Generate PDF marksheet
 * @access  Private (All authenticated users)
 */
router.get('/:studentId/marksheet', auth, canAccessStudent, generateMarksheet);

module.exports = router;
