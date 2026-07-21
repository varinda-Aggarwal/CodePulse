const express = require('express');
const router = express.Router();
const { getGoal, setGoal, getGoalHistory } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getGoal).post(protect, setGoal);
router.get('/history', protect, getGoalHistory);

module.exports = router;