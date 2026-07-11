const Goal = require('../models/Goal');

// Get today's goal
const getGoal = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const goal = await Goal.findOne({ user: req.user._id, date: today });

        if (!goal) {
            return res.status(200).json({ target: 0, achieved: 0, date: today });
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

        let goal = await Goal.findOne({ user: req.user._id, date: today });

        if (goal) {
            goal.target = target;
            await goal.save();
        } else {
            goal = await Goal.create({
                user: req.user._id,
                target,
                date: today
            });
        }

        res.status(200).json(goal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update achieved count
const updateAchieved = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const goal = await Goal.findOne({ user: req.user._id, date: today });

        if (!goal) {
            return res.status(404).json({ message: 'No goal set for today' });
        }

        goal.achieved = req.body.achieved;
        await goal.save();

        res.status(200).json(goal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getGoal, setGoal, updateAchieved };