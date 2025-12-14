const mongoose = require('mongoose');

/**
 * Student Schema
 * Stores basic student information
 * Linked to User model for student login (optional)
 */
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    admission: {
      type: String,
      required: [true, 'Admission number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    roll: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true
    },
    session: {
      type: String,
      required: [true, 'Session is required'],
      default: '2024-25'
    },
    class: {
      type: String,
      required: [true, 'Class is required'],
      trim: true
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      uppercase: true,
      maxlength: [1, 'Section should be a single character']
    },
    dob: {
      type: Date,
      default: null
    },
    dobWords: {
      type: String,
      trim: true,
      default: ''
    },
    motherName: {
      type: String,
      trim: true,
      default: ''
    },
    fatherName: {
      type: String,
      trim: true,
      default: ''
    },
    addedDate: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
studentSchema.index({ class: 1, section: 1 });
studentSchema.index({ admission: 1 });
studentSchema.index({ roll: 1, class: 1, section: 1 });

// Virtual for full name formatting
studentSchema.virtual('classSection').get(function () {
  return `${this.class} (${this.section})`;
});

// Ensure virtuals are included in JSON
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);
