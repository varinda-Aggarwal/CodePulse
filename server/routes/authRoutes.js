const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validate');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

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