const express = require('express');
const { syncStudents, getStudents, getStudentStats } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use((req, res, next) => {
    console.log('Middleware triggered, checking authentication...');
    protect(req, res, next);
});

router.get('/sync', syncStudents);
router.get('/', getStudents);
router.get('/stats', getStudentStats);

module.exports = router;
