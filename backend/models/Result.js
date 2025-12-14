const mongoose = require('mongoose');

/**
 * Subject Marks Schema
 * Used for both Term-1 and Term-2
 */
const subjectMarksSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  periodic: {
    type: Number,
    default: 0,
    min: [0, 'Periodic test marks cannot be negative'],
    max: [10, 'Periodic test marks cannot exceed 10']
  },
  notebook: {
    type: Number,
    default: 0,
    min: [0, 'Notebook marks cannot be negative'],
    max: [5, 'Notebook marks cannot exceed 5']
  },
  enrichment: {
    type: Number,
    default: 0,
    min: [0, 'Subject enrichment marks cannot be negative'],
    max: [5, 'Subject enrichment marks cannot exceed 5']
  },
  halfYearly: {
    type: Number,
    default: 0,
    min: [0, 'Half yearly/Annual exam marks cannot be negative'],
    max: [80, 'Half yearly/Annual exam marks cannot exceed 80']
  },
  // Primary Class Specific Fields (Cycle 1 & 2)
  c1Written: { type: Number, default: 0, max: 40 },
  c1Oral: { type: Number, default: 0, max: 10 },
  c2Written: { type: Number, default: 0, max: 40 },
  c2Oral: { type: Number, default: 0, max: 10 }
}, { _id: false });

/**
 * Co-Scholastic Areas Schema
 */
const coScholasticSchema = new mongoose.Schema({
  workEdu: {
    type: String,
    enum: ['A', 'B', 'C'],
    default: 'B'
  },
  artEdu: {
    type: String,
    enum: ['A', 'B', 'C'],
    default: 'B'
  },
  health: {
    type: String,
    enum: ['A', 'B', 'C'],
    default: 'B'
  },
  discipline: {
    type: String,
    enum: ['A', 'B', 'C'],
    default: 'B'
  },
  classRemark: {
    type: String,
    default: 'VERY GOOD',
    trim: true
  },
  attendance: {
    type: String,
    default: '0/0',
    trim: true
  },
  result: {
    type: String,
    enum: ['PASS', 'FAIL', 'PROMOTED', 'DETAINED'],
    default: 'PASS'
  }
}, { _id: false });

/**
 * Result Schema
 * Stores marks for both terms and calculated results
 */
const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true // One result per student
    },
    session: {
      type: String,
      required: true,
      default: '2024-25'
    },
    class: {
      type: String,
      required: true
    },
    section: {
      type: String,
      required: true,
      uppercase: true
    },
    // Term 1 Marks
    term1: {
      type: [subjectMarksSchema],
      default: []
    },
    // Term 2 Marks
    term2: {
      type: [subjectMarksSchema],
      default: []
    },
    // Co-Scholastic Areas
    coScholastic: {
      type: coScholasticSchema,
      default: () => ({})
    },
    // Calculated fields
    term1Total: {
      type: Number,
      default: 0
    },
    term2Total: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    grade: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D', 'E', ''],
      default: ''
    },
    // Tracking
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastCalculated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
resultSchema.index({ student: 1 });
resultSchema.index({ class: 1, section: 1 });
resultSchema.index({ session: 1 });

// Method to calculate total marks for a term
resultSchema.methods.calculateTermTotal = function (term) {
  const termData = this[term] || [];
  
  // Determine if Primary Class (1, 2, KG)
  const primaryClasses = ['1', '2', 'I', 'II', '1ST', '2ND', 'KG', 'LKG', 'UKG', 'NURSERY'];
  const isPrimary = primaryClasses.some(c => 
    this.class.toString().toUpperCase() === c || 
    this.class.toString().toUpperCase().includes('KG')
  );

  return termData.reduce((total, subject) => {
    if (isPrimary) {
      return total + (subject.c1Written || 0) + (subject.c1Oral || 0) +
             (subject.c2Written || 0) + (subject.c2Oral || 0);
    } else {
      return total + (subject.periodic || 0) + (subject.notebook || 0) + 
             (subject.enrichment || 0) + (subject.halfYearly || 0);
    }
  }, 0);
};

// Method to calculate grade from percentage
resultSchema.methods.calculateGrade = function (percentage) {
  if (percentage >= 91) return 'A1';
  if (percentage >= 81) return 'A2';
  if (percentage >= 71) return 'B1';
  if (percentage >= 61) return 'B2';
  if (percentage >= 51) return 'C1';
  if (percentage >= 41) return 'C2';
  if (percentage >= 33) return 'D';
  return 'E';
};

// Method to recalculate all totals and grade
resultSchema.methods.recalculate = function () {
  this.term1Total = this.calculateTermTotal('term1');
  this.term2Total = this.calculateTermTotal('term2');
  this.grandTotal = this.term1Total + this.term2Total;
  
  // Calculate max possible marks
  const subjectsCount = Math.max(this.term1.length, this.term2.length);
  const maxMarks = subjectsCount * 100 * 2; // 100 per subject per term, 2 terms
  
  this.percentage = maxMarks > 0 ? Number(((this.grandTotal / maxMarks) * 100).toFixed(2)) : 0;
  this.grade = this.calculateGrade(this.percentage);
  
  // Auto-set Result Status
  if (this.percentage < 33 || this.grade === 'E') {
     this.coScholastic.result = 'FAIL';
  } else {
     this.coScholastic.result = 'PASS';
  }
  
  this.lastCalculated = new Date();
};

// Pre-save hook to auto-calculate
resultSchema.pre('save', function (next) {
  this.recalculate();
  next();
});

module.exports = mongoose.model('Result', resultSchema);
