const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, deletePhoto } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { validateProfileUpdate } = require('../middleware/validate');
const { upload } = require('../config/cloudinary');

router.route('/').get(protect, getProfile).put(protect, upload.single('photo'), validateProfileUpdate, updateProfile);
router.delete('/photo', protect, deletePhoto);

module.exports = router;