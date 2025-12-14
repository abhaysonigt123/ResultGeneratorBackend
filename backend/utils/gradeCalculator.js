/**
 * Grade Calculator Utility
 * Handles all result calculation logic
 */

/**
 * Calculate total marks for a subject
 */
const calculateSubjectTotal = (subjectMarks) => {
  const periodic = Number(subjectMarks.periodic) || 0;
  const notebook = Number(subjectMarks.notebook) || 0;
  const enrichment = Number(subjectMarks.enrichment) || 0;
  const halfYearly = Number(subjectMarks.halfYearly) || 0;
  
  return periodic + notebook + enrichment + halfYearly;
};

/**
 * Calculate total marks for a term
 */
const calculateTermTotal = (termMarks) => {
  return termMarks.reduce((total, subject) => {
    return total + calculateSubjectTotal(subject);
  }, 0);
};

/**
 * Calculate grade from percentage
 */
const calculateGrade = (percentage) => {
  if (percentage >= 91) return 'A1';
  if (percentage >= 81) return 'A2';
  if (percentage >= 71) return 'B1';
  if (percentage >= 61) return 'B2';
  if (percentage >= 51) return 'C1';
  if (percentage >= 41) return 'C2';
  if (percentage >= 33) return 'D';
  return 'E';
};

/**
 * Calculate percentage
 */
const calculatePercentage = (obtainedMarks, totalMarks) => {
  if (totalMarks === 0) return 0;
  return Number(((obtainedMarks / totalMarks) * 100).toFixed(2));
};

/**
 * Validate marks are within allowed range
 */
const validateMarks = (marks) => {
  const errors = [];

  marks.forEach((subject, index) => {
    if (subject.periodic < 0 || subject.periodic > 10) {
      errors.push(`Subject ${index + 1}: Periodic test marks must be between 0 and 10`);
    }
    if (subject.notebook < 0 || subject.notebook > 5) {
      errors.push(`Subject ${index + 1}: Notebook marks must be between 0 and 5`);
    }
    if (subject.enrichment < 0 || subject.enrichment > 5) {
      errors.push(`Subject ${index + 1}: Subject enrichment marks must be between 0 and 5`);
    }
    if (subject.halfYearly < 0 || subject.halfYearly > 80) {
      errors.push(`Subject ${index + 1}: Half yearly/Annual exam marks must be between 0 and 80`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculate complete result
 */
const calculateCompleteResult = (term1Marks, term2Marks) => {
  const term1Total = calculateTermTotal(term1Marks);
  const term2Total = calculateTermTotal(term2Marks);
  const grandTotal = term1Total + term2Total;
  
  // Calculate max marks
  const subjectsCount = Math.max(term1Marks.length, term2Marks.length);
  const maxMarks = subjectsCount * 100 * 2; // 100 per subject per term, 2 terms
  
  const percentage = calculatePercentage(grandTotal, maxMarks);
  const grade = calculateGrade(percentage);
  
  return {
    term1Total,
    term2Total,
    grandTotal,
    percentage,
    grade,
    maxMarks
  };
};

/**
 * Get subject-wise breakdown
 */
const getSubjectWiseBreakdown = (term1Marks, term2Marks) => {
  const breakdown = [];
  
  // Assuming both terms have same subjects
  const subjects = term1Marks.length > 0 ? term1Marks : term2Marks;
  
  subjects.forEach((subject, index) => {
    const term1Subject = term1Marks[index] || { periodic: 0, notebook: 0, enrichment: 0, halfYearly: 0 };
    const term2Subject = term2Marks[index] || { periodic: 0, notebook: 0, enrichment: 0, halfYearly: 0 };
    
    const term1Total = calculateSubjectTotal(term1Subject);
    const term2Total = calculateSubjectTotal(term2Subject);
    const average = (term1Total + term2Total) / 2;
    const subjectPercentage = calculatePercentage(average, 100);
    
    breakdown.push({
      subject: subject.subject,
      term1: term1Total,
      term2: term2Total,
      average,
      percentage: subjectPercentage,
      grade: calculateGrade(subjectPercentage)
    });
  });
  
  return breakdown;
};

module.exports = {
  calculateSubjectTotal,
  calculateTermTotal,
  calculateGrade,
  calculatePercentage,
  validateMarks,
  calculateCompleteResult,
  getSubjectWiseBreakdown
};
