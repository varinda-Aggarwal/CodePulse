const Topic = require('../models/Topic');
const Problem = require('../models/Problem');

const getDashboard = async (req, res) => {
    try {
        const userId = req.user._id;

        // Topic stats
        const totalTopics = await Topic.countDocuments({ user: userId });
        const completedTopics = await Topic.countDocuments({ user: userId, status: 'Done' });
        const inProgressTopics = await Topic.countDocuments({ user: userId, status: 'In Progress' });
        const pendingTopics = await Topic.countDocuments({ user: userId, status: 'Not Started' });

        // Problem stats
        const totalProblems = await Problem.countDocuments({ user: userId });
        const easyProblems = await Problem.countDocuments({ user: userId, difficulty: 'Easy' });
        const mediumProblems = await Problem.countDocuments({ user: userId, difficulty: 'Medium' });
        const hardProblems = await Problem.countDocuments({ user: userId, difficulty: 'Hard' });

        // Topic wise problem count (for bar chart)
        const topics = await Topic.find({ user: userId });
        const topicWiseProblems = await Promise.all(
            topics.map(async (topic) => {
                const count = await Problem.countDocuments({ user: userId, topic: topic._id });
                return { topic: topic.name, count };
            })
        );

        // Weak topics (less than 3 problems)
        const weakTopics = topicWiseProblems.filter(t => t.count < 3);

        res.status(200).json({
            topics: { totalTopics, completedTopics, inProgressTopics, pendingTopics },
            problems: { totalProblems, easyProblems, mediumProblems, hardProblems },
            topicWiseProblems,
            weakTopics
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboard };