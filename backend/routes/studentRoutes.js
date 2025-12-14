const express = require('express');
const router = express.Router();
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentsByClass,
  getNextAdmissionNumber
} = require('../controllers/studentController');
const auth = require('../middleware/auth');
const { isAdmin, isAdminOrStaff } = require('../middleware/roleCheck');
const { studentValidation } = require('../middleware/validation');

/**
 * @route   POST /api/students
 * @desc    Create new student
 * @access  Private (Admin/Staff)
 */
router.post('/', auth, isAdminOrStaff, studentValidation, createStudent);

/**
 * @route   GET /api/students
 * @desc    Get all students with filters
 * @access  Private (Admin/Staff)
 */
router.get('/', auth, isAdminOrStaff, getAllStudents);

/**
 * @route   GET /api/students/class/:className
 * @desc    Get students by class
 * @access  Private (Admin/Staff)
 */
router.get('/class/:className', auth, isAdminOrStaff, getStudentsByClass);

/**
 * @route   GET /api/students/next-admission
 * @desc    Get next admission number in sequence
 * @access  Private (Admin/Staff)
 */
router.get('/next-admission', auth, isAdminOrStaff, getNextAdmissionNumber);

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID
 * @access  Private (Admin/Staff)
 */
router.get('/:id', auth, isAdminOrStaff, getStudentById);

/**
 * @route   PUT /api/students/:id
 * @desc    Update student
 * @access  Private (Admin/Staff)
 */
router.put('/:id', auth, isAdminOrStaff, studentValidation, updateStudent);

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete student
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, isAdmin, deleteStudent);

module.exports = router;
