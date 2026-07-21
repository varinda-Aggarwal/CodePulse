const express = require('express');
const router = express.Router();
const { generateStudyPlan, getTodayPlan, getPlanHistory, getPlanByDate } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/study-plan', protect, generateStudyPlan);
router.get('/study-plan/today', protect, getTodayPlan);
router.get('/study-plan/history', protect, getPlanHistory);
router.get('/study-plan/date/:date', protect, getPlanByDate);

module.exports = router;