const express = require('express');
const router = express.Router();
const { getTopics, addTopic, updateTopic, deleteTopic } = require('../controllers/topicController');
const { protect } = require('../middleware/authMiddleware');
const { validateTopic } = require('../middleware/validate');

router.route('/').get(protect, getTopics).post(protect, validateTopic, addTopic);
router.route('/:id').put(protect, validateTopic, updateTopic).delete(protect, deleteTopic);

module.exports = router;