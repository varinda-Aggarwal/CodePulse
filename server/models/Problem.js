const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    notes: {
        type: String,
        trim: true
    },
    dateSolved: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Problem', problemSchema);