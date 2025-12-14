# Result Management System - Backend API

Production-grade backend for a Result Management System built with Node.js, Express, and MongoDB. Features role-based authentication, student management, marks entry, automatic result calculation, and PDF marksheet generation.

## 🚀 Features

- **Role-Based Authentication** (Admin, Staff, Student)
- **Student Management** (CRUD operations with role-based access)
- **Marks Entry** (Term-1 and Term-2 with automatic validation)
- **Automatic Result Calculation** (Totals, Percentage, Grades)
- **PDF Marksheet Generation**
- **Security** (JWT, bcrypt, helmet, rate limiting)
- **Input Validation** (express-validator)
- **Error Handling** (Centralized error handler)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/result-management
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env
   ```

5. **Run the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

   Server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "staff"  // admin, staff, or student
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Student Endpoints

#### Create Student
```http
POST /api/students
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Riya Sharma",
  "admission": "R-0101",
  "roll": "101",
  "session": "2024-25",
  "class": "3",
  "section": "A",
  "dob": "2015-05-15",
  "motherName": "Priya Sharma",
  "fatherName": "Rajesh Sharma"
}
```

#### Get All Students
```http
GET /api/students?class=3&section=A&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Student by ID
```http
GET /api/students/:id
Authorization: Bearer <token>
```

#### Update Student (Admin only)
```http
PUT /api/students/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "roll": "102"
}
```

#### Delete Student (Admin only)
```http
DELETE /api/students/:id
Authorization: Bearer <token>
```

### Result Endpoints

#### Add/Update Marks
```http
POST /api/results/:studentId/marks
Authorization: Bearer <token>
Content-Type: application/json

{
  "term": "term1",  // or "term2"
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
    }
  ]
}
```

#### Get Student Result
```http
GET /api/results/:studentId
Authorization: Bearer <token>
```

#### Update Co-Scholastic Areas
```http
PUT /api/results/:studentId/co-scholastic
Authorization: Bearer <token>
Content-Type: application/json

{
  "workEdu": "A",
  "artEdu": "B",
  "health": "A",
  "discipline": "B",
  "classRemark": "EXCELLENT",
  "attendance": "186/214",
  "result": "PASS"
}
```

#### Get Class Results
```http
GET /api/results/class/:className?section=A
Authorization: Bearer <token>
```

#### Generate PDF Marksheet
```http
GET /api/results/:studentId/marksheet
Authorization: Bearer <token>

Response: PDF file download
```

## 🔐 Role-Based Access Control

### Admin
- Full access to all operations
- Can create, read, update, delete students
- Can add/update marks
- Can manage users

### Staff
- Can create students
- Can add/update marks
- **Cannot** edit or delete students
- **Cannot** manage users

### Student
- Can view their own marksheet only
- **Cannot** modify any data

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/staff/student),
  isActive: Boolean,
  studentId: ObjectId (ref: Student)
}
```

### Student Model
```javascript
{
  name: String,
  admission: String (unique),
  roll: String,
  session: String,
  class: String,
  section: String,
  dob: Date,
  dobWords: String,
  motherName: String,
  fatherName: String,
  createdBy: ObjectId (ref: User)
}
```

### Result Model
```javascript
{
  student: ObjectId (ref: Student),
  session: String,
  class: String,
  section: String,
  term1: [SubjectMarks],
  term2: [SubjectMarks],
  coScholastic: {
    workEdu, artEdu, health, discipline,
    classRemark, attendance, result
  },
  term1Total: Number,
  term2Total: Number,
  grandTotal: Number,
  percentage: Number,
  grade: String
}
```

## 🧮 Grading System

| Percentage | Grade |
|------------|-------|
| 91-100%    | A1    |
| 81-90%     | A2    |
| 71-80%     | B1    |
| 61-70%     | B2    |
| 51-60%     | C1    |
| 41-50%     | C2    |
| 33-40%     | D     |
| <33%       | E     |

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Helmet** - Security headers
- **Rate Limiting** - Prevent brute force attacks
- **CORS** - Configured for frontend origin
- **Input Validation** - express-validator
- **Error Handling** - Centralized error handler

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── studentController.js  # Student management
│   └── resultController.js   # Result & marksheet logic
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── roleCheck.js         # Role-based access control
│   ├── errorHandler.js      # Error handling
│   └── validation.js        # Input validation
├── models/
│   ├── User.js              # User schema
│   ├── Student.js           # Student schema
│   └── Result.js            # Result schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── studentRoutes.js     # Student endpoints
│   └── resultRoutes.js      # Result endpoints
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore              # Git ignore file
├── package.json            # Dependencies
├── server.js               # Main server file
└── README.md               # This file
```

## 🚀 Deployment

### Environment Variables for Production

Update `.env` for production:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/result-management
JWT_SECRET=<strong-random-secret>
FRONTEND_URL=https://your-frontend-domain.com
```

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=<your-mongodb-uri>
heroku config:set JWT_SECRET=<your-secret>

# Deploy
git push heroku main
```

## 📝 License

ISC

## 👨‍💻 Author

Result Management System Backend

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!
