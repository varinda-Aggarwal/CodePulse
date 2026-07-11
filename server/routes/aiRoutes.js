const express = require('express');
const router = express.Router();
const { generateStudyPlan } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/study-plan', protect, generateStudyPlan);

module.exports = router;