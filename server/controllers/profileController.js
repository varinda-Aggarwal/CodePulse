const User = require('../models/User');
const Problem = require('../models/Problem');
const Topic = require('../models/Topic');
const { cloudinary } = require('../config/cloudinary');

// Get profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        const totalProblems = await Problem.countDocuments({ user: req.user._id });
        const totalTopics = await Topic.countDocuments({ user: req.user._id });
        const completedTopics = await Topic.countDocuments({ user: req.user._id, status: 'Done' });

        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || null,
            dob: user.dob || null,
            country: user.country || '',
            photo: user.photo || null,
            joinedDate: user.createdAt,
            totalProblems,
            totalTopics,
            completedTopics,
            hasPassword: !!(user.password && !user.googleId)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (req.body.firstName !== undefined) user.firstName = req.body.firstName;
        if (req.body.lastName !== undefined) user.lastName = req.body.lastName;
        if (req.body.phone !== undefined) user.phone = req.body.phone;
        if (req.body.dob !== undefined) user.dob = req.body.dob || null;
        if (req.body.country !== undefined) user.country = req.body.country;
        if (req.file) user.photo = req.file.path;
        await user.save();

        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            dob: user.dob,
            country: user.country,
            photo: user.photo,
            hasPassword: !!user.password && !user.googleId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete photo
const deletePhoto = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user.photo) {
            const publicId = user.photo.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId);
            user.photo = null;
            await user.save();
        }

        res.status(200).json({ message: 'Photo deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProfile, updateProfile, deletePhoto };