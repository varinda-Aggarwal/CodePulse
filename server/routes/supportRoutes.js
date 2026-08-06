const express = require('express');
const router = express.Router();
const { submitContact, submitBugReport, submitFeatureRequest } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/contact', protect, submitContact);
router.post('/bug', protect, submitBugReport);
router.post('/feature', protect, submitFeatureRequest);

module.exports = router;