const ClassSubject = require('../models/ClassSubject');

/**
 * @desc    Add or Update subjects for a class
 * @route   POST /api/subjects
 * @access  Private (Admin)
 */
exports.addOrUpdateSubjects = async (req, res, next) => {
  try {
    const { className, subjects } = req.body;

    if (!className) {
      return res.status(400).json({ success: false, message: 'Class name is required' });
    }

    const normalizedClass = className.toString().toUpperCase();

    let classSubject = await ClassSubject.findOne({ className: normalizedClass });

    if (classSubject) {
      classSubject.subjects = subjects || [];
      classSubject.updatedBy = req.user._id;
      await classSubject.save();
    } else {
      classSubject = await ClassSubject.create({
        className: normalizedClass,
        subjects: subjects || [],
        updatedBy: req.user._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subjects updated successfully',
      data: classSubject
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get subjects for a class
 * @route   GET /api/subjects/:className
 * @access  Private (Admin/Staff)
 */
exports.getSubjectsByClass = async (req, res, next) => {
  try {
    const { className } = req.params;
    const normalizedClass = className.toString().toUpperCase();

    const classSubject = await ClassSubject.findOne({ className: normalizedClass });

    const defaultSubjects = ["English", "Hindi", "Mathematics", "Environmental Studies"];

    res.status(200).json({
      success: true,
      data: classSubject ? classSubject.subjects : defaultSubjects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all configured classes
 * @route   GET /api/subjects
 * @access  Private (Admin)
 */
exports.getAllConfigs = async (req, res, next) => {
  try {
    const configs = await ClassSubject.find().sort({ className: 1 });
    res.status(200).json({
      success: true,
      data: configs
    });
  } catch (error) {
    next(error);
  }
};
