const mongoose = require('mongoose');

const classSubjectSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
    unique: true, // One config per class
    trim: true,
    uppercase: true // Normalize class names e.g., "1", "KG1"
  },
  subjects: [{
    type: String,
    trim: true
  }],
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('ClassSubject', classSubjectSchema);
