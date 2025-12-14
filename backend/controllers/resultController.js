const Result = require('../models/Result');
const Student = require('../models/Student');
const PDFDocument = require('pdfkit');

/**
 * @desc    Add or update marks for a student
 * @route   POST /api/results/:studentId/marks
 * @access  Private (Admin/Staff)
 */
exports.addOrUpdateMarks = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { term, marks } = req.body; // term: 'term1' or 'term2', marks: array of subject marks

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Find or create result
    let result = await Result.findOne({ student: studentId });
    
    if (!result) {
      result = await Result.create({
        student: studentId,
        session: student.session,
        class: student.class,
        section: student.section,
        updatedBy: req.user._id
      });
    }

    // Update marks for the specified term
    result[term] = marks;
    result.updatedBy = req.user._id;

    // Save will trigger auto-calculation
    await result.save();

    res.status(200).json({
      success: true,
      message: `${term} marks updated successfully`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student result
 * @route   GET /api/results/:studentId
 * @access  Private (Admin/Staff/Student-own)
 */
exports.getStudentResult = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const result = await Result.findOne({ student: studentId })
      .populate('student')
      .populate('updatedBy', 'name email');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found for this student'
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update co-scholastic areas
 * @route   PUT /api/results/:studentId/co-scholastic
 * @access  Private (Admin/Staff)
 */
exports.updateCoScholastic = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const coScholasticData = req.body;

    const result = await Result.findOne({ student: studentId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found for this student'
      });
    }

    // Update co-scholastic fields
    result.coScholastic = {
      ...result.coScholastic,
      ...coScholasticData
    };
    result.updatedBy = req.user._id;

    await result.save();

    res.status(200).json({
      success: true,
      message: 'Co-scholastic areas updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get results for entire class
 * @route   GET /api/results/class/:className
 * @access  Private (Admin/Staff)
 */
exports.getClassResults = async (req, res, next) => {
  try {
    const { className } = req.params;
    const { section } = req.query;

    const query = { class: className };
    if (section) query.section = section.toUpperCase();

    const results = await Result.find(query)
      .populate('student', 'name admission roll')
      .sort({ percentage: -1 }); // Sort by percentage descending

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Recalculate result
 * @route   POST /api/results/:studentId/calculate
 * @access  Private (Admin/Staff)
 */
exports.calculateResult = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const result = await Result.findOne({ student: studentId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found for this student'
      });
    }

    // Recalculate (this is done automatically on save, but can be triggered manually)
    result.recalculate();
    await result.save();

    res.status(200).json({
      success: true,
      message: 'Result recalculated successfully',
      data: {
        term1Total: result.term1Total,
        term2Total: result.term2Total,
        grandTotal: result.grandTotal,
        percentage: result.percentage,
        grade: result.grade
      }
    });
  } catch (error) {
    next(error);
  }
};






// Helper function to calculate grade based on marks
const getGrade = (marks) => {
  if (marks >= 91) return 'A1';
  if (marks >= 81) return 'A2';
  if (marks >= 71) return 'B1';
  if (marks >= 61) return 'B2';
  if (marks >= 51) return 'C1';
  if (marks >= 41) return 'C2';
  if (marks >= 33) return 'D';
  return 'E'; // Needs Improvement
};

exports.generateMarksheet = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const result = await Result.findOne({ student: studentId })
      .populate('student');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found for this student'
      });
    }

    const student = result.student;
    
    // Format Date helper
    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
    };

    // Determine if Primary Class (1, 2, KG)
    const primaryClasses = ['1', '2', 'I', 'II', '1st', '2nd', 'KG', 'KG 1', 'KG 2', 'LKG', 'UKG', 'NURSERY'];
    // Normalize logic: check if class string contains any of the above or matches exactly
    const isPrimary = primaryClasses.some(c => 
      result.class.toString().toUpperCase() === c.toUpperCase() || 
      result.class.toString().toUpperCase().includes('KG')
    );

    // Create PDF document
    const doc = new PDFDocument({ 
      size: 'A4',
      margin: 40,
      bufferPages: true,
      autoFirstPage: true
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Marksheet_${student.admission}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // ================= HEADER SECTION =================
    // Draw Border
    doc.rect(20, 20, 555, 800).stroke();
    doc.rect(25, 25, 545, 790).stroke();

    // Logos
    const logoPath = require('path').join(__dirname, '../assets/cbse-logo.png');
    
    // Left Logo
    if (require('fs').existsSync(logoPath)) {
      doc.image(logoPath, 50, 50, { width: 60 });
    }

    // Right Logo
    if (require('fs').existsSync(logoPath)) {
      doc.image(logoPath, 485, 50, { width: 60 });
    }

    // School Info
    doc.font('Helvetica-Bold').fontSize(24).fillColor('#800000')
       .text('EXAMPLE PUBLIC SCHOOL', 0, 50, { align: 'center' });
    
    doc.font('Helvetica').fontSize(10).fillColor('black')
       .text('Affiliated to C.B.S.E, New Delhi', 0, 80, { align: 'center' });
    
    doc.font('Helvetica').fontSize(10)
       .text('123, Knowledge Park, Education City - 452001', 0, 95, { align: 'center' });
       
    doc.moveDown();
    doc.rect(40, 115, 515, 2).fill('#800000'); // Separator Line
    
    // Academic Session Title
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(14).fillColor('black')
       .text(`ACADEMIC REPORT CARD (${result.session})`, { align: 'center', underline: true });
    
    doc.moveDown();

    // ================= STUDENT DETAILS =================
    const startY = doc.y;
    const boxHeight = 90;
    
    // Explicitly set fill color to black before writing text
    doc.fillColor('black').fillOpacity(1); 
    
    // Draw Box (No fill, just border to avoid text visibility issues)
    doc.rect(40, startY, 515, boxHeight).strokeColor('black').stroke();

    doc.font('Helvetica-Bold').fontSize(10);
    
    // Left Column
    doc.text('Student Name', 50, startY + 15);
    doc.text(':', 130, startY + 15);
    doc.font('Helvetica').text(student.name, 140, startY + 15);

    doc.font('Helvetica-Bold').text("Father's Name", 50, startY + 35);
    doc.text(':', 130, startY + 35);
    doc.font('Helvetica').text(student.fatherName || '-', 140, startY + 35);

    doc.font('Helvetica-Bold').text("Mother's Name", 50, startY + 55);
    doc.text(':', 130, startY + 55);
    doc.font('Helvetica').text(student.motherName || '-', 140, startY + 55);

    // Right Column
    doc.font('Helvetica-Bold').text('Admission No', 350, startY + 15);
    doc.text(':', 430, startY + 15);
    doc.font('Helvetica').text(student.admission, 440, startY + 15);

    doc.font('Helvetica-Bold').text('Class/Section', 350, startY + 35);
    doc.text(':', 430, startY + 35);
    doc.font('Helvetica').text(`${result.class} - ${result.section}`, 440, startY + 35);

    doc.font('Helvetica-Bold').text('Roll No', 350, startY + 55);
    doc.text(':', 430, startY + 55);
    doc.font('Helvetica').text(student.roll, 440, startY + 55);

    doc.font('Helvetica-Bold').text('Date of Birth', 350, startY + 75);
    doc.text(':', 430, startY + 75);
    doc.font('Helvetica').text(formatDate(student.dob), 440, startY + 75);

    doc.moveDown(6);


    // ================= MARKS TABLE =================
    let currentY = doc.y + 10;
    
    if (isPrimary) {
      // --- CLASS 1, 2, KG LAYOUT (Exact Match to User Image - Manual Drawing) ---
      
      const startX = 40; // Balanced Left Margin
      const rowHeight = 20;
      let y = currentY;

      // Column Widths (OPTIMIZED for 40px margin on both sides)
      // Page Width: 595. Left: 40. Right: 41. Usable: 514.
      const wSub = 125; // Good space for text
      const wSm = 28;   // 8 columns * 28 = 224
      const wMd = 33;   // 5 columns * 33 = 165
      // Total: 125 + 224 + 165 = 514. Matches standard constraints.

      // Row 1: Top Headers
      // "Scholastic Areas" (Rowspan 3)
      doc.rect(startX, y, wSub, rowHeight * 3).stroke();
      doc.font('Helvetica-Bold').fontSize(9).text('Scholastic Areas', startX, y + 25, { width: wSub, align: 'center' });

      // "Term 1" (Colspan 6: 4xSm + 2xMd = 112 + 70 = 182)
      const wTerm1 = (wSm * 4) + (wMd * 2);
      doc.rect(startX + wSub, y, wTerm1, rowHeight).stroke();
      doc.text('Term 1', startX + wSub, y + 6, { width: wTerm1, align: 'center' });

      // "Term 2" (Colspan 7: 4xSm + 3xMd = 112 + 105 = 217)
      const wTerm2 = (wSm * 4) + (wMd * 3);
      doc.rect(startX + wSub + wTerm1, y, wTerm2, rowHeight).stroke();
      doc.text('Term 2', startX + wSub + wTerm1, y + 6, { width: wTerm2, align: 'center' });
      
      y += rowHeight;

      // Row 2: Cycle Headers & Spanned Columns
      // Term 1 Area
      let x = startX + wSub;
      
      // Cycle 1 & 2 (Span 2)
      doc.rect(x, y, wSm * 2, rowHeight).stroke();
      doc.text('Cycle 1 & 2', x, y + 6, { width: wSm * 2, align: 'center' });
      x += wSm * 2;

      // Cycle 3 & 4 (Span 2)
      doc.rect(x, y, wSm * 2, rowHeight).stroke();
      doc.text('Cycle 3 & 4', x, y + 6, { width: wSm * 2, align: 'center' });
      x += wSm * 2;

      // Marks Obtained (Rowspan 2)
      doc.rect(x, y, wMd, rowHeight * 2).stroke();
      doc.fontSize(8).text('Marks Obt\n(100)', x, y + 5, { width: wMd, align: 'center' });
      x += wMd;

      // Grade (Rowspan 2)
      doc.rect(x, y, wMd, rowHeight * 2).stroke();
      doc.text('Grade', x, y + 15, { width: wMd, align: 'center' });
      x += wMd;

      // Term 2 Area
      // Cycle 5 & 6 (Span 2)
      doc.rect(x, y, wSm * 2, rowHeight).stroke();
      doc.text('Cycle 5 & 6', x, y + 6, { width: wSm * 2, align: 'center' });
      x += wSm * 2;

      // Cycle 7 & 8 (Span 2)
      doc.rect(x, y, wSm * 2, rowHeight).stroke();
      doc.text('Cycle 7 & 8', x, y + 6, { width: wSm * 2, align: 'center' });
      x += wSm * 2;

      // Marks Obtained (Rowspan 2)
      doc.rect(x, y, wMd, rowHeight * 2).stroke();
      doc.text('Marks Obt\n(100)', x, y + 5, { width: wMd, align: 'center' });
      x += wMd;

      // Average (Rowspan 2)
      doc.rect(x, y, wMd, rowHeight * 2).stroke();
      doc.text('Average\n(T1 & T2)', x, y + 5, { width: wMd, align: 'center' });
      x += wMd;

      // Grade (Rowspan 2)
      doc.rect(x, y, wMd, rowHeight * 2).stroke();
      doc.text('Grade', x, y + 15, { width: wMd, align: 'center' });

      y += rowHeight;

      // Row 3: Written/Oral
      x = startX + wSub;
      const subHeaders = [
        'Written\n(40)', 'Oral\n(10)', 'Written\n(40)', 'Oral\n(10)', // T1 Cycles
        'Written\n(40)', 'Oral\n(10)', 'Written\n(40)', 'Oral\n(10)'  // T2 Cycles
      ];

      // T1 Subheaders
      for(let i=0; i<4; i++) {
        doc.rect(x, y, wSm, rowHeight).stroke();
        doc.fontSize(7).text(subHeaders[i], x, y + 5, { width: wSm, align: 'center' });
        x += wSm;
      }
      x += wMd * 2; // Skip Marks/Grade

      // T2 Subheaders
      for(let i=4; i<8; i++) {
        doc.rect(x, y, wSm, rowHeight).stroke();
        doc.fontSize(7).text(subHeaders[i], x, y + 5, { width: wSm, align: 'center' });
        x += wSm;
      }

      y += rowHeight;

      // -- DATA ROWS --
      doc.font('Helvetica').fontSize(9);
      
      let grandTotalAvg = 0;
      let count = 0;

      result.term1.forEach((t1Sub) => {
         const t2Sub = result.term2.find(s => s.subject === t1Sub.subject) || {};
         
         // Calculations
         const t1c1w = Number(t1Sub.c1Written)||0; const t1c1o = Number(t1Sub.c1Oral)||0;
         const t1c2w = Number(t1Sub.c2Written)||0; const t1c2o = Number(t1Sub.c2Oral)||0;
         const t1Total = t1c1w + t1c1o + t1c2w + t1c2o;
         const t1Grade = getGrade(t1Total);

         const t2c1w = Number(t2Sub.c1Written)||0; const t2c1o = Number(t2Sub.c1Oral)||0;
         const t2c2w = Number(t2Sub.c2Written)||0; const t2c2o = Number(t2Sub.c2Oral)||0;
         const t2Total = t2c1w + t2c1o + t2c2w + t2c2o;
         const avg = Math.round((t1Total + t2Total) / 2);
         const avgGrade = (t2Sub.subject) ? getGrade(avg) : '-';

         if(t2Sub.subject) { grandTotalAvg += avg; count++; }

         // Draw Row
         x = startX;
         
         // Subject
         doc.rect(x, y, wSub, rowHeight).stroke();
         doc.text(t1Sub.subject, x + 5, y + 6, { width: wSub - 5, align: 'left' });
         x += wSub;

         // T1 Data
         const t1Vals = [t1c1w||'-', t1c1o||'-', t1c2w||'-', t1c2o||'-'];
         t1Vals.forEach(v => {
           doc.rect(x, y, wSm, rowHeight).stroke();
           doc.text(v, x, y + 6, { width: wSm, align: 'center' });
           x += wSm;
         });
         
         doc.rect(x, y, wMd, rowHeight).stroke();
         doc.font('Helvetica-Bold').text(t1Total, x, y + 6, { width: wMd, align: 'center' });
         x += wMd;
         doc.font('Helvetica').rect(x, y, wMd, rowHeight).stroke();
         doc.text(t1Grade, x, y + 6, { width: wMd, align: 'center' });
         x += wMd;

         // T2 Data
         const t2Vals = [t2c1w||'-', t2c1o||'-', t2c2w||'-', t2c2o||'-'];
         t2Vals.forEach(v => {
           doc.rect(x, y, wSm, rowHeight).stroke();
           doc.text(v, x, y + 6, { width: wSm, align: 'center' });
           x += wSm;
         });
         
         doc.rect(x, y, wMd, rowHeight).stroke();
         doc.font('Helvetica-Bold').text(t2Total, x, y + 6, { width: wMd, align: 'center' });
         x += wMd;
         
         // Avg & Grade
         doc.rect(x, y, wMd, rowHeight).fillAndStroke('#f9f9f9', 'black');
         doc.fillColor('black').text(avg || '-', x, y + 6, { width: wMd, align: 'center' });
         x += wMd;
         
         doc.rect(x, y, wMd, rowHeight).stroke();
         doc.text(avgGrade, x, y + 6, { width: wMd, align: 'center' });

         y += rowHeight;
      });

      currentY = y + 10;
    } else {
      // --- CLASS 3+ LAYOUT (Split Tables) ---
      const drawRow = (y, cols, isHeader = false) => {
        const colWidths = [150, 60, 60, 60, 60, 60, 60]; // Added Grade column
        let currentX = 50; 
        
        if (isHeader) {
          doc.font('Helvetica-Bold').fontSize(9).fillColor('white');
          doc.rect(40, y, 515, 25).fill('#2c3e50'); 
        } else {
          doc.font('Helvetica').fontSize(9).fillColor('black');
          doc.rect(40, y, 515, 20).stroke(); 
        }

        cols.forEach((text, i) => {
          if(isHeader) doc.fillColor('white'); else doc.fillColor('black');
          if (i === 0) {
             doc.text(text, currentX + 5, y + 6, { width: colWidths[i], align: 'left' });
          } else {
             doc.text(text, currentX, y + 6, { width: colWidths[i], align: 'center' });
          }
          currentX += colWidths[i];
        });
        return y + (isHeader ? 25 : 20);
      };

      // Term 1
      doc.font('Helvetica-Bold').fontSize(12).fillColor('black').text('TERM-1 SCHOLASTIC AREAS', 40, currentY);
      currentY += 20;
      currentY = drawRow(currentY, ['SUBJECT', 'Per. Test (10)', 'NB (5)', 'SEA (5)', 'Half Yr (80)', 'Total (100)', 'Grade'], true);
      
      result.term1.forEach(sub => {
         const total = (sub.periodic||0) + (sub.notebook||0) + (sub.enrichment||0) + (sub.halfYearly||0);
         currentY = drawRow(currentY, [
           sub.subject,
           sub.periodic || '-', sub.notebook || '-', sub.enrichment || '-', sub.halfYearly || '-',
           total, getGrade(total)
         ]);
      });
      
      doc.font('Helvetica-Bold').text(`Term 1 Total: ${result.term1Total}`, 450, currentY + 5);
      currentY += 30;

      // Term 2
      doc.font('Helvetica-Bold').fontSize(12).text('TERM-2 SCHOLASTIC AREAS', 40, currentY);
      currentY += 20;
      currentY = drawRow(currentY, ['SUBJECT', 'Per. Test (10)', 'NB (5)', 'SEA (5)', 'Annual (80)', 'Total (100)', 'Grade'], true);
      
      result.term2.forEach(sub => {
         const total = (sub.periodic||0) + (sub.notebook||0) + (sub.enrichment||0) + (sub.halfYearly||0);
         currentY = drawRow(currentY, [
           sub.subject,
           sub.periodic || '-', sub.notebook || '-', sub.enrichment || '-', sub.halfYearly || '-',
           total, getGrade(total)
         ]);
      });
      doc.font('Helvetica-Bold').fillColor('black').text(`Total: ${result.term2Total}`, 450, currentY + 5);
      currentY += 30;
    }


    // ================= FINAL RESULT SUMMARY =================
    // Ensure we have enough space for summary (needs ~60) and co-scholastic (~100) + footer (~40)
    // Approx 200px needed. If currentY > 550, we might need to compress or page break.
    // Footer is at 760. 760 - 200 = 560.
    
    // Draw Result Box
    const summaryY = currentY + 10;
    doc.rect(40, summaryY, 515, 50).lineWidth(1).stroke('#27ae60');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#27ae60');
    
    // Centered layout for summary
    const third = 515 / 3;
    doc.text('GRAND TOTAL', 40, summaryY + 10, { width: third, align: 'center' });
    doc.font('Helvetica').fontSize(14).fillColor('black').text(`${result.grandTotal}`, 40, summaryY + 30, { width: third, align: 'center' });

    doc.font('Helvetica-Bold').fontSize(11).fillColor('#27ae60');
    doc.text('PERCENTAGE', 40 + third, summaryY + 10, { width: third, align: 'center' });
    doc.font('Helvetica').fontSize(14).fillColor('black').text(`${result.percentage}%`, 40 + third, summaryY + 30, { width: third, align: 'center' });

    doc.font('Helvetica-Bold').fontSize(11).fillColor('#27ae60');
    doc.text('FINAL GRADE', 40 + (2 * third), summaryY + 10, { width: third, align: 'center' });
    doc.font('Helvetica').fontSize(14).fillColor('black').text(`${result.grade}`, 40 + (2 * third), summaryY + 30, { width: third, align: 'center' });


    // ================= CO-SCHOLASTIC =================
    currentY = summaryY + 70; // Move down below summary
    
    // Ensure co-scholastic box doesn't hit footer
    // Footer line is at 760. Box height is 100. So max currentY should be 650.
    // If strict on space, reduce box height or font size.
    
    const boxH = 80; // slightly reduced height
    
    // Two columns: Left = Co-Scholastic, Right = Remarks
    const colWidth = 250;
    
    // Left Box (Co-Scholastic)
    doc.rect(40, currentY, colWidth, boxH).stroke();
    doc.rect(40, currentY, colWidth, 18).fill('#ecf0f1'); // Header bg
    doc.fillColor('black').font('Helvetica-Bold').fontSize(9).text('CO-SCHOLASTIC AREAS', 40, currentY + 5, { width: colWidth, align: 'center' });
    
    doc.font('Helvetica').fontSize(8);
    let rowY = currentY + 25;
    const itemH = 12;
    doc.text(`Work Education: ${result.coScholastic.workEdu}`, 50, rowY);
    doc.text(`Art Education: ${result.coScholastic.artEdu}`, 50, rowY += itemH);
    doc.text(`Health & Physical Ed: ${result.coScholastic.health}`, 50, rowY += itemH);
    doc.text(`Discipline: ${result.coScholastic.discipline}`, 50, rowY += itemH);

    // Right Box (Remarks)
    doc.rect(305, currentY, colWidth, boxH).stroke();
    doc.rect(305, currentY, colWidth, 18).fill('#ecf0f1');
    doc.fillColor('black').font('Helvetica-Bold').fontSize(9).text('REMARKS & ATTENDANCE', 305, currentY + 5, { width: colWidth, align: 'center' });
    
    doc.font('Helvetica').fontSize(8);
    rowY = currentY + 25;
    
    doc.text(`Class Teacher Remark:`, 315, rowY);
    doc.font('Helvetica-Oblique').text(`"${result.coScholastic.classRemark || 'Very Good'}"`, 315, rowY + 12, { width: 230 });
    
    rowY += 28;
    doc.font('Helvetica-Bold').text(`Attendance: ${result.coScholastic.attendance}`, 315, rowY);
    doc.font('Helvetica-Bold').text(`Evaluated Result: ${result.coScholastic.result}`, 315, rowY + 12);


    // ================= FOOTER / SIGNATURES =================
    const bottomY = 760; // Fixed footer position
    
    // Check if current content overlaps footer
    if (currentY + boxH > bottomY - 30) {
        doc.addPage(); // Safety page break if really needed (unlikely for Class 1-2)
    }

    doc.lineWidth(1).moveTo(80, bottomY).lineTo(180, bottomY).stroke();
    doc.fontSize(10).text('Class Teacher', 80, bottomY + 5, { width: 100, align: 'center' });

    doc.moveTo(250, bottomY).lineTo(350, bottomY).stroke();
    doc.text('Parent', 250, bottomY + 5, { width: 100, align: 'center' });

    doc.moveTo(420, bottomY).lineTo(520, bottomY).stroke();
    doc.text('Principal', 420, bottomY + 5, { width: 100, align: 'center' });

    // Date
    doc.fontSize(8).text(`Date: ${formatDate(new Date())}`, 40, 790);

    // Finalize PDF
    doc.end();
  } catch (error) {
    next(error);
  }
};
