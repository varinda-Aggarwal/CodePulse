const express = require('express');
const router = express.Router();
const { getGoal, setGoal, updateAchieved } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getGoal).post(protect, setGoal);
router.route('/achieved').put(protect, updateAchieved);

module.exports = router;