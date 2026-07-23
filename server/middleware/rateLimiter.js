const rateLimit = require('express-rate-limit');

// Strict limiter for login attempts (brute-force protection)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Limiter for registration/OTP requests
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { message: 'Too many OTP requests. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Limiter for forgot-password requests
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    message: { message: 'Too many password reset requests. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { loginLimiter, otpLimiter, forgotPasswordLimiter };