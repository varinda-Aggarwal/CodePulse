const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Done'],
        default: 'Not Started'
    },
    completedAt: {
        type: Date,
        default: null
    },
    needsRevision: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

topicSchema.index({ user: 1, createdAt: -1 });
topicSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model('Topic', topicSchema);