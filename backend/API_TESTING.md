/**
 * API Testing Guide
 * Use this file with REST clients like Postman, Thunder Client, or Insomnia
 */

// ============================================
// 1. AUTHENTICATION TESTS
// ============================================

/**
 * Test 1: Register Admin User (First User)
 * POST http://localhost:5000/api/auth/register
 * Headers: Content-Type: application/json
 */
{
  "name": "Admin User",
  "email": "admin@school.com",
  "password": "admin123",
  "role": "admin"
}

/**
 * Test 2: Login Admin
 * POST http://localhost:5000/api/auth/login
 * Headers: Content-Type: application/json
 */
{
  "email": "admin@school.com",
  "password": "admin123"
}
// Save the token from response for subsequent requests

/**
 * Test 3: Register Staff User (requires admin token)
 * POST http://localhost:5000/api/auth/register
 * Headers: 
 *   Content-Type: application/json
 *   Authorization: Bearer <admin_token>
 */
{
  "name": "Staff Member",
  "email": "staff@school.com",
  "password": "staff123",
  "role": "staff"
}

/**
 * Test 4: Get Profile
 * GET http://localhost:5000/api/auth/profile
 * Headers: Authorization: Bearer <token>
 */

// ============================================
// 2. STUDENT MANAGEMENT TESTS
// ============================================

/**
 * Test 5: Create Student (Admin/Staff)
 * POST http://localhost:5000/api/students
 * Headers: 
 *   Content-Type: application/json
 *   Authorization: Bearer <token>
 */
{
  "name": "Riya Sharma",
  "admission": "R-0101",
  "roll": "101",
  "session": "2024-25",
  "class": "3",
  "section": "A",
  "dob": "2015-05-15",
  "dobWords": "Fifteenth May Two Thousand Fifteen",
  "motherName": "Priya Sharma",
  "fatherName": "Rajesh Sharma"
}

/**
 * Test 6: Create Another Student
 * POST http://localhost:5000/api/students
 */
{
  "name": "Aarav Mehta",
  "admission": "R-0102",
  "roll": "102",
  "session": "2024-25",
  "class": "3",
  "section": "A",
  "dob": "2015-08-20",
  "motherName": "Anjali Mehta",
  "fatherName": "Vikram Mehta"
}

/**
 * Test 7: Get All Students
 * GET http://localhost:5000/api/students
 * Headers: Authorization: Bearer <token>
 */

/**
 * Test 8: Get Students by Class
 * GET http://localhost:5000/api/students?class=3&section=A
 * Headers: Authorization: Bearer <token>
 */

/**
 * Test 9: Get Student by ID
 * GET http://localhost:5000/api/students/<student_id>
 * Headers: Authorization: Bearer <token>
 */

/**
 * Test 10: Update Student (Admin only)
 * PUT http://localhost:5000/api/students/<student_id>
 * Headers: 
 *   Content-Type: application/json
 *   Authorization: Bearer <admin_token>
 */
{
  "name": "Riya Sharma Updated",
  "roll": "101"
}

/**
 * Test 11: Try to Update as Staff (Should Fail)
 * PUT http://localhost:5000/api/students/<student_id>
 * Headers: 
 *   Content-Type: application/json
 *   Authorization: Bearer <staff_token>
 * Expected: 403 Forbidden
 */

/**
 * Test 12: Delete Student (Admin only)
 * DELETE http://localhost:5000/api/students/<student_id>
 * Headers: Authorization: Bearer <admin_token>
 */

// ============================================
// 3. MARKS & RESULTS TESTS
// ============================================

/**
 * Test 13: Add Term-1 Marks
 * POST http://localhost:5000/api/results/<student_id>/marks
 * Headers: 
 *   Content-Type: application/json
 *   Authorization: Bearer <token>
 */
{
  "term": "term1",
  "marks": [
    {
      "subject": "English",
      "periodic": 8,
      "notebook": 4,
      "enrichment": 5,
      "halfYearly": 70
    },
    {
      "subject": "Hindi",
      "periodic": 9,
      "notebook": 5,
      "enrichment": 4,
      "halfYearly": 75
    },
    {
      "subject": "Mathematics",
      "periodic": 7,
      "notebook": 4,
      "enrichment": 5,
      "halfYearly": 68
    },
    {
      "subject": "Environmental Studies",
      "periodic": 8,
      "notebook": 5,
      "enrichment": 5,
      "halfYearly": 72
    }
  ]
}

/**
 * Test 14: Add Term-2 Marks
 * POST http://localhost:5000/api/results/<student_id>/marks
 * Headers: 
 *   Content-Type: application/json
 *   Authorization: Bearer <token>
 */
{
  "term": "term2",
  "marks": [
    {
      "subject": "English",
      "periodic": 9,
      "notebook": 5,
      "enrichment": 5,
      "halfYearly": 75
    },
    {
      "subject": "Hindi",
      "periodic": 8,
      "notebook": 4,
      "enrichment": 5,
      "halfYearly": 73
    },
    {
      "subject": "Mathematics",
      "periodic": 8,
      "notebook": 5,
      "enrichment": 4,
      "halfYearly": 70
    },
    {
      "subject": "Environmental Studies",
      "periodic": 9,
      "notebook": 5,
      "enrichment": 5,
      "halfYearly": 76
    }
  ]
}

/**
 * Test 15: Get Student Result
 * GET http://localhost:5000/api/results/<student_id>
 * Headers: Authorization: Bearer <token>
 */

/**
 * Test 16: Update Co-Scholastic Areas
 * PUT http://localhost:5000/api/results/<student_id>/co-scholastic
 * Headers: 
 *   Content-Type: application/json
 *   Authorization: Bearer <token>
 */
{
  "workEdu": "A",
  "artEdu": "B",
  "health": "A",
  "discipline": "B",
  "classRemark": "EXCELLENT PERFORMANCE",
  "attendance": "186/214",
  "result": "PASS"
}

/**
 * Test 17: Get Class Results
 * GET http://localhost:5000/api/results/class/3?section=A
 * Headers: Authorization: Bearer <token>
 */

/**
 * Test 18: Recalculate Result
 * POST http://localhost:5000/api/results/<student_id>/calculate
 * Headers: Authorization: Bearer <token>
 */

/**
 * Test 19: Generate PDF Marksheet
 * GET http://localhost:5000/api/results/<student_id>/marksheet
 * Headers: Authorization: Bearer <token>
 * Expected: PDF file download
 */

// ============================================
// 4. VALIDATION TESTS (Should Fail)
// ============================================

/**
 * Test 20: Invalid Marks (Periodic > 10)
 * POST http://localhost:5000/api/results/<student_id>/marks
 * Expected: 400 Bad Request
 */
{
  "term": "term1",
  "marks": [
    {
      "subject": "English",
      "periodic": 15,  // Invalid: > 10
      "notebook": 4,
      "enrichment": 5,
      "halfYearly": 70
    }
  ]
}

/**
 * Test 21: Missing Required Fields
 * POST http://localhost:5000/api/students
 * Expected: 400 Bad Request
 */
{
  "name": "Test Student"
  // Missing admission, roll, class, section
}

/**
 * Test 22: Duplicate Admission Number
 * POST http://localhost:5000/api/students
 * Expected: 400 Bad Request
 */
{
  "name": "Another Student",
  "admission": "R-0101",  // Already exists
  "roll": "103",
  "class": "3",
  "section": "A"
}

// ============================================
// 5. ROLE-BASED ACCESS TESTS
// ============================================

/**
 * Test 23: Staff tries to delete student (Should Fail)
 * DELETE http://localhost:5000/api/students/<student_id>
 * Headers: Authorization: Bearer <staff_token>
 * Expected: 403 Forbidden
 */

/**
 * Test 24: Unauthenticated request (Should Fail)
 * GET http://localhost:5000/api/students
 * No Authorization header
 * Expected: 401 Unauthorized
 */

/**
 * Test 25: Invalid token (Should Fail)
 * GET http://localhost:5000/api/students
 * Headers: Authorization: Bearer invalid_token
 * Expected: 401 Unauthorized
 */

// ============================================
// TESTING WORKFLOW
// ============================================

/*
1. Start MongoDB:
   mongod

2. Start Backend Server:
   cd backend
   npm run dev

3. Test in order:
   - Register admin user (Test 1)
   - Login admin (Test 2) - Save token
   - Register staff user (Test 3)
   - Create students (Tests 5-6)
   - Add marks (Tests 13-14)
   - Update co-scholastic (Test 16)
   - Get results (Test 15)
   - Generate marksheet (Test 19)
   - Test role-based access (Tests 23-25)

4. Verify:
   - All calculations are correct
   - PDF marksheet generates properly
   - Role-based access works
   - Validation catches errors
*/
