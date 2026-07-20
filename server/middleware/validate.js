const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateRegister = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors
];

const validateSendOtp = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Please enter a valid phone number'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain at least one number'),
    handleValidationErrors
];

const validateForgotPassword = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email'),
    handleValidationErrors
];

const validateResetPassword = [
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain at least one number'),
    body('confirmPassword')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match'),
    handleValidationErrors
];

const validateProfileUpdate = [
    body('firstName')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 1 }).withMessage('First name cannot be empty'),
    body('lastName')
        .optional({ checkFalsy: true })
        .trim(),
    body('phone')
        .optional({ checkFalsy: true })
        .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian phone number'),
    body('dob')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('Please enter a valid date'),
    body('country')
        .optional({ checkFalsy: true })
        .trim(),
    handleValidationErrors
];

const validateVerifyOtp = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email'),
    body('otp')
        .trim()
        .notEmpty().withMessage('OTP is required')
        .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    handleValidationErrors
];

const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

const validateTopic = [
    body('name')
        .trim()
        .notEmpty().withMessage('Topic name is required'),
    body('status')
        .optional()
        .isIn(['Not Started', 'In Progress', 'Done'])
        .withMessage('Status must be Not Started, In Progress or Done'),
    handleValidationErrors
];

const validateProblem = [
    body('name')
        .trim()
        .notEmpty().withMessage('Problem name is required'),
    body('difficulty')
        .notEmpty().withMessage('Difficulty is required')
        .isIn(['Easy', 'Medium', 'Hard'])
        .withMessage('Difficulty must be Easy, Medium or Hard'),
    body('topic')
        .notEmpty().withMessage('Topic is required'),
    handleValidationErrors
];

module.exports = { validateRegister, validateLogin, validateTopic, validateProblem, validateSendOtp, validateVerifyOtp, validateProfileUpdate, validateForgotPassword, validateResetPassword };