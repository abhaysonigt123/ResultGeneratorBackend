const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware to check for validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'staff', 'student']).withMessage('Invalid role'),
  validate
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

/**
 * Validation rules for student creation
 */
const studentValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Student name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('admission')
    .trim()
    .notEmpty().withMessage('Admission number is required')
    .toUpperCase(),
  body('roll')
    .trim()
    .notEmpty().withMessage('Roll number is required'),
  body('session')
    .optional()
    .trim(),
  body('class')
    .trim()
    .notEmpty().withMessage('Class is required'),
  body('section')
    .trim()
    .notEmpty().withMessage('Section is required')
    .isLength({ max: 1 }).withMessage('Section should be a single character')
    .toUpperCase(),
  body('dob')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  body('motherName')
    .optional()
    .trim(),
  body('fatherName')
    .optional()
    .trim(),
  validate
];

/**
 * Validation rules for marks entry
 */
const marksValidation = [
  body('term')
    .notEmpty().withMessage('Term is required')
    .isIn(['term1', 'term2']).withMessage('Term must be either term1 or term2'),
  body('marks')
    .isArray({ min: 1 }).withMessage('Marks array is required and must not be empty'),
  body('marks.*.subject')
    .trim()
    .notEmpty().withMessage('Subject name is required'),
  body('marks.*.periodic')
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage('Periodic test marks must be between 0 and 10'),
  body('marks.*.notebook')
    .optional()
    .isFloat({ min: 0, max: 5 }).withMessage('Notebook marks must be between 0 and 5'),
  body('marks.*.enrichment')
    .optional()
    .isFloat({ min: 0, max: 5 }).withMessage('Subject enrichment marks must be between 0 and 5'),
  body('marks.*.halfYearly')
    .optional()
    .isFloat({ min: 0, max: 80 }).withMessage('Half yearly/Annual exam marks must be between 0 and 80'),
  validate
];

/**
 * Validation rules for co-scholastic update
 */
const coScholasticValidation = [
  body('workEdu')
    .optional()
    .isIn(['A', 'B', 'C']).withMessage('Work Education grade must be A, B, or C'),
  body('artEdu')
    .optional()
    .isIn(['A', 'B', 'C']).withMessage('Art Education grade must be A, B, or C'),
  body('health')
    .optional()
    .isIn(['A', 'B', 'C']).withMessage('Health & Physical Education grade must be A, B, or C'),
  body('discipline')
    .optional()
    .isIn(['A', 'B', 'C']).withMessage('Discipline grade must be A, B, or C'),
  body('classRemark')
    .optional()
    .trim(),
  body('attendance')
    .optional()
    .trim(),
  body('result')
    .optional()
    .isIn(['PASS', 'FAIL', 'PROMOTED', 'DETAINED']).withMessage('Invalid result value'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  studentValidation,
  marksValidation,
  coScholasticValidation,
  validate
};
