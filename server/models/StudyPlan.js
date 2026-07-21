const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String,
        required: true
    },
    weakTopics: [String],
    totalDays: Number,
    planData: {
        type: Object,
        required: true
    },
    generationCount: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);