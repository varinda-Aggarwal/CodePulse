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

// Limiter for forgot-password requests — keyed by email (not just IP), so one user's attempts don't block a different user testing from the same network/machine
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    message: { message: 'Too many password reset requests. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `${req.ip}-${(req.body?.email || '').toLowerCase()}`
});

module.exports = { loginLimiter, otpLimiter, forgotPasswordLimiter };