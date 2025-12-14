# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js installed (v14+): `node --version`
- ✅ MongoDB installed or MongoDB Atlas account
- ✅ npm or yarn installed

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# or
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create free cluster at https://www.mongodb.com/cloud/atlas
- Get connection string
- Update `MONGODB_URI` in `.env`

### 3. Configure Environment

The `.env` file is already created. Update if needed:
```env
MONGODB_URI=mongodb://localhost:27017/result-management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
```

### 4. Start the Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
📊 Database: result-management
🚀 Server running in development mode on port 5000
📍 API available at http://localhost:5000
🏥 Health check: http://localhost:5000/health
```

### 5. Test the API

**Option 1: Browser**
Visit: http://localhost:5000/health

**Option 2: Command Line**
```bash
curl http://localhost:5000/health
```

**Option 3: Postman/Thunder Client**
See `API_TESTING.md` for complete test suite

## First API Call - Register Admin

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@school.com",
    "password": "admin123",
    "role": "admin"
  }'
```

## Common Issues & Solutions

### Issue: MongoDB Connection Error
**Solution:** 
- Check if MongoDB is running: `mongod --version`
- Verify connection string in `.env`
- For Atlas, check network access and credentials

### Issue: Port 5000 already in use
**Solution:**
- Change PORT in `.env` to 5001 or another port
- Or kill process using port 5000

### Issue: npm install fails
**Solution:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version: `node --version` (should be 14+)

## Next Steps

1. ✅ Register admin user
2. ✅ Login and get token
3. ✅ Create students
4. ✅ Add marks
5. ✅ Generate marksheet

See `README.md` for complete API documentation.
See `API_TESTING.md` for detailed testing guide.

## Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Check MongoDB connection
mongosh  # or mongo
```

## Project Structure

```
backend/
├── config/          # Database configuration
├── controllers/     # Business logic
├── middleware/      # Auth, validation, errors
├── models/          # Database schemas
├── routes/          # API endpoints
├── utils/           # Helper functions
├── .env             # Environment variables
├── server.js        # Main entry point
└── package.json     # Dependencies
```

## Support

If you encounter issues:
1. Check MongoDB is running
2. Verify `.env` configuration
3. Check server logs for errors
4. Ensure all dependencies are installed

Happy coding! 🚀
