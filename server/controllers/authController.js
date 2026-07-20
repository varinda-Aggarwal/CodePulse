const User = require('../models/User');
const Otp = require('../models/Otp');
const PasswordReset = require('../models/PasswordReset');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendOtpEmail = require('../utils/sendOtpEmail');
const sendResetEmail = require('../utils/sendResetEmail');

// Send OTP for registration
const sendOtp = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password (store hashed, not plain text, even temporarily)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Remove any previous OTP for this email
        await Otp.deleteMany({ email });

        // Save new OTP with temporary signup data
        await Otp.create({
            email,
            otp,
            username,
            phone,
            password: hashedPassword
        });

        // Send OTP email
        await sendOtpEmail(email, otp);

        res.status(200).json({ message: 'OTP sent to your email' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify OTP and create actual account
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Create actual user now
        const user = await User.create({
            username: otpRecord.username,
            email: otpRecord.email,
            phone: otpRecord.phone,
            password: otpRecord.password
        });

        // Delete OTP record after successful verification
        await Otp.deleteOne({ _id: otpRecord._id });

        // Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Register
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Request password reset (works for both: user with password, or Google-only user)
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Same message shown either way, so no one can guess which emails are registered
            return res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
        }

        // Remove any previous reset token for this email
        await PasswordReset.deleteMany({ email });

        const token = crypto.randomBytes(32).toString('hex');
        await PasswordReset.create({ email, token });

        const resetLink = `http://localhost:3000/reset-password/${token}`;
        await sendResetEmail(email, resetLink);

        res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reset password using token from email link
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const resetRecord = await PasswordReset.findOne({ token });
        if (!resetRecord) {
            return res.status(400).json({ message: 'Invalid or expired reset link' });
        }

        const user = await User.findOne({ email: resetRecord.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        await PasswordReset.deleteOne({ _id: resetRecord._id });

        res.status(200).json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, sendOtp, verifyOtp, forgotPassword, resetPassword };