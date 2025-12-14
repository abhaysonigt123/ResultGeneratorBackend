/**
 * Role-Based Access Control Middleware
 * Checks if user has required role to access resource
 */

/**
 * Check if user is Admin
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

/**
 * Check if user is Admin or Staff
 */
const isAdminOrStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Staff privileges required.'
    });
  }
};

/**
 * Check if user is Student
 */
const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Student access only.'
    });
  }
};

/**
 * Check if user can access student data
 * Admin/Staff can access all, Student can only access their own
 */
const canAccessStudent = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'staff') {
    // Admin and staff can access all students
    next();
  } else if (req.user.role === 'student') {
    // Students can only access their own data
    const studentId = req.params.studentId || req.params.id;
    if (req.user.studentId && req.user.studentId.toString() === studentId) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own data.'
      });
    }
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied.'
    });
  }
};

module.exports = {
  isAdmin,
  isAdminOrStaff,
  isStudent,
  canAccessStudent
};
