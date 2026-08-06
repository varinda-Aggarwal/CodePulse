const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    type: {
        type: String,
        enum: ['contact', 'bug', 'feature'],
        required: true
    },
    name: String,
    email: String,
    subject: String,
    message: String,
    category: {
        type: String,
        enum: ['UI', 'Backend', 'AI', 'Performance'],
        required: false
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);