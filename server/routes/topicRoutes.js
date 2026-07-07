const express = require('express');
const router = express.Router();
const { getTopics, addTopic, updateTopic, deleteTopic } = require('../controllers/topicController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTopics).post(protect, addTopic);
router.route('/:id').put(protect, updateTopic).delete(protect, deleteTopic);

module.exports = router;