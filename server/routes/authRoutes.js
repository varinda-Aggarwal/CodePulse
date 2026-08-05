const express = require('express');
const router = express.Router();
const { registerUser, loginUser, sendOtp, verifyOtp, forgotPassword, resetPassword } = require('../controllers/authController');
const { validateRegister, validateLogin, validateSendOtp, validateVerifyOtp, validateForgotPassword, validateResetPassword } = require('../middleware/validate');
const { loginLimiter, otpLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

router.post('/register', validateRegister, registerUser);
router.post('/login', loginLimiter, validateLogin, loginUser);
router.post('/send-otp', otpLimiter, validateSendOtp, sendOtp);
router.post('/verify-otp', otpLimiter, validateVerifyOtp, verifyOtp);
router.post('/forgot-password', forgotPasswordLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', forgotPasswordLimiter, validateResetPassword, resetPassword);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        res.redirect(`http://localhost:3000/auth/success?token=${token}`);
    }
);

module.exports = router;