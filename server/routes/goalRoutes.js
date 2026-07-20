const express = require('express');
const router = express.Router();
const { getGoal, setGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getGoal).post(protect, setGoal);

module.exports = router;