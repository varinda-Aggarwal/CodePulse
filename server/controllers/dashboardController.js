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

        /// Topic wise problem count (for bar chart) + mastery score (for weak topic detection)
        const topics = await Topic.find({ user: userId });
        const DIFFICULTY_WEIGHT = { Easy: 1, Medium: 2, Hard: 3 };
        const MASTERY_THRESHOLD = 7;

        const topicWiseProblems = await Promise.all(
            topics.map(async (topic) => {
                const problemsInTopic = await Problem.find({ user: userId, topic: topic._id }).select('difficulty');
                const count = problemsInTopic.length;
                const masteryScore = problemsInTopic.reduce(
                    (sum, p) => sum + (DIFFICULTY_WEIGHT[p.difficulty] || 0),
                    0
                );
                return { topic: topic.name, count, masteryScore };
            })
        );

        // Weak topics: mastery score below threshold (difficulty-weighted, not just raw count)
        const weakTopics = topicWiseProblems
            .filter(t => t.masteryScore < MASTERY_THRESHOLD)
            .map(t => ({ topic: t.topic, masteryScore: t.masteryScore }));

        // User marked revision topics
        const revisionTopics = await Topic.find({ user: userId, needsRevision: true }).select('name status');

        // User marked revision problems
        const revisionProblems = await Problem.find({ user: userId, needsRevision: true }).select('name difficulty link').populate('topic', 'name');

        res.status(200).json({
            topics: { totalTopics, completedTopics, inProgressTopics, pendingTopics },
            problems: { totalProblems, easyProblems, mediumProblems, hardProblems },
            topicWiseProblems,
            weakTopics,
            revisionTopics,
            revisionProblems
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboard };