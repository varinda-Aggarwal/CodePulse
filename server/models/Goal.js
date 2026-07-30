const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    target: {
        type: Number,
        required: true
    },
    achieved: {
        type: Number,
        default: 0
    },
   date: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

goalSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Goal', goalSchema);