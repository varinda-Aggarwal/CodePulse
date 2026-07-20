const Goal = require('../models/Goal');
const Problem = require('../models/Problem');

// Helper: count problems solved today
const getTodayAchievedCount = async (userId) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return await Problem.countDocuments({
        user: userId,
        dateSolved: { $gte: startOfDay, $lte: endOfDay }
    });
};

// Get today's goal
const getGoal = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const achieved = await getTodayAchievedCount(req.user._id);

        let goal = await Goal.findOne({ user: req.user._id, date: today });

        if (!goal) {
            return res.status(200).json({ target: 0, achieved, date: today });
        }

        // Keep stored achieved in sync with actual problems solved today
        if (goal.achieved !== achieved) {
            goal.achieved = achieved;
            await goal.save();
        }

        res.status(200).json(goal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Set today's goal
const setGoal = async (req, res) => {
    try {
        const { target } = req.body;
        const today = new Date().toISOString().split('T')[0];
        const achieved = await getTodayAchievedCount(req.user._id);

        let goal = await Goal.findOne({ user: req.user._id, date: today });

        if (goal) {
            goal.target = target;
            goal.achieved = achieved;
            await goal.save();
        } else {
            goal = await Goal.create({
                user: req.user._id,
                target,
                achieved,
                date: today
            });
        }

        res.status(200).json(goal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getGoal, setGoal };