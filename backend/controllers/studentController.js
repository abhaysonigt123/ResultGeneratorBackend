const Student = require('../models/Student');
const Result = require('../models/Result');

/**
 * @desc    Create new student
 * @route   POST /api/students
 * @access  Private (Admin/Staff)
 */
exports.createStudent = async (req, res, next) => {
  try {
    const { name, admission, roll, session, class: className, section, dob, dobWords, motherName, fatherName } = req.body;

    // Check if admission number already exists
    const existingStudent = await Student.findOne({ admission });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this admission number already exists'
      });
    }

    // Create student
    const student = await Student.create({
      name,
      admission,
      roll,
      session: session || '2024-25',
      class: className,
      section,
      dob,
      dobWords,
      motherName,
      fatherName,
      createdBy: req.user._id
    });

    // Create empty result record for the student
    await Result.create({
      student: student._id,
      session: student.session,
      class: student.class,
      section: student.section,
      updatedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all students with filters
 * @route   GET /api/students
 * @access  Private (Admin/Staff)
 */
exports.getAllStudents = async (req, res, next) => {
  try {
    const { class: className, section, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (className) query.class = className;
    if (section) query.section = section.toUpperCase();
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { admission: { $regex: search, $options: 'i' } },
        { roll: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const students = await Student.find(query)
      .sort({ class: 1, section: 1, roll: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student by ID
 * @route   GET /api/students/:id
 * @access  Private (Admin/Staff)
 */
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Private (Admin only)
 */
exports.updateStudent = async (req, res, next) => {
  try {
    const { name, roll, session, class: className, section, dob, dobWords, motherName, fatherName } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update fields
    if (name) student.name = name;
    if (roll) student.roll = roll;
    if (session) student.session = session;
    if (className) student.class = className;
    if (section) student.section = section;
    if (dob) student.dob = dob;
    if (dobWords) student.dobWords = dobWords;
    if (motherName) student.motherName = motherName;
    if (fatherName) student.fatherName = fatherName;

    await student.save();

    // Update corresponding result record
    await Result.findOneAndUpdate(
      { student: student._id },
      { 
        class: student.class, 
        section: student.section,
        session: student.session
      }
    );

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 * @access  Private (Admin only)
 */
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Hard delete to free up admission number
    await Student.findByIdAndDelete(req.params.id);

    // Also delete result
    await Result.findOneAndDelete({ student: student._id });

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get students by class
 * @route   GET /api/students/class/:className
 * @access  Private (Admin/Staff)
 */
// ... existing code ...
exports.getStudentsByClass = async (req, res, next) => {
  try {
    const { className } = req.params;
    const { section } = req.query;

    const query = { class: className, isActive: true };
    if (section) query.section = section.toUpperCase();

    const students = await Student.find(query)
      .sort({ section: 1, roll: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get next admission number in sequence for a class
 * @route   GET /api/students/next-admission
 * @access  Private (Admin/Staff)
 */
exports.getNextAdmissionNumber = async (req, res, next) => {
  try {
    const { class: className } = req.query;
    const currentYear = new Date().getFullYear();
    
    // Format: ADM{YYYY}{CLASS}{SEQ}
    // Example: ADM20241001, ADM2024KG1001
    // We remove spaces/special chars from class name to keep it clean
    const cleanClass = (className || 'GEN').toString().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const prefix = `ADM${currentYear}${cleanClass}`;
    
    // Find last student with this prefix
    const lastStudent = await Student.findOne({ 
      admission: { $regex: `^${prefix}` } 
    }).sort({ admission: -1 });

    let nextSeq = 1;
    if (lastStudent && lastStudent.admission) {
      // Extract sequence part (last 3 digits usually)
      const lastSeqStr = lastStudent.admission.replace(prefix, '');
      const lastSeq = parseInt(lastSeqStr);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }

    // Pad with leading zeros (001, 002... 010... 100)
    const nextSeqStr = nextSeq.toString().padStart(3, '0');
    const nextAdmission = `${prefix}${nextSeqStr}`;

    res.status(200).json({
      success: true,
      data: nextAdmission
    });
  } catch (error) {
    next(error);
  }
};
