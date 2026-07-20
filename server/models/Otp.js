const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    username: String,
    phone: String,
    password: String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // 5 minutes ke baad MongoDB khud delete kar dega
    }
});

module.exports = mongoose.model('Otp', otpSchema);