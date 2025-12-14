const express = require('express');
const router = express.Router();
const { addOrUpdateSubjects, getSubjectsByClass, getAllConfigs } = require('../controllers/subjectController');
const auth = require('../middleware/auth');
const { isAdmin, isAdminOrStaff } = require('../middleware/roleCheck');

// Protect all routes
router.use(auth);

router.route('/')
  .post(isAdmin, addOrUpdateSubjects)
  .get(isAdmin, getAllConfigs);

router.route('/:className')
  .get(isAdminOrStaff, getSubjectsByClass);

module.exports = router;
