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
                const problemsInTopic = await Problem.find({ user: userId, topic: topic._id }).select('difficulty status dateSolved needsRevision');
                const count = problemsInTopic.length;

                // Counted as solved if status is 'Solved' OR marked for revision (covers any older data)
                const solvedProblems = problemsInTopic.filter(p => p.status === 'Solved' || p.needsRevision);
                const solved = solvedProblems.length;
                const remaining = count - solved;

                const easy = problemsInTopic.filter(p => p.difficulty === 'Easy').length;
                const medium = problemsInTopic.filter(p => p.difficulty === 'Medium').length;
                const hard = problemsInTopic.filter(p => p.difficulty === 'Hard').length;

                const solvedDates = solvedProblems.filter(p => p.dateSolved).map(p => new Date(p.dateSolved));
                const lastSolvedDate = solvedDates.length ? new Date(Math.max(...solvedDates)) : null;

                // Mastery score now only counts actually-solved problems (unsolved shouldn't boost mastery)
                const masteryScore = solvedProblems.reduce(
                    (sum, p) => sum + (DIFFICULTY_WEIGHT[p.difficulty] || 0),
                    0
                );

                return { topic: topic.name, count, solved, remaining, easy, medium, hard, lastSolvedDate, masteryScore };
            })
        );

        // Weak topics: mastery score below threshold, but only for topics that actually have problems attempted — a topic with zero problems isn't "weak", it's just untouched
        const weakTopics = topicWiseProblems
            .filter(t => t.count > 0 && t.masteryScore < MASTERY_THRESHOLD)
            .map(t => ({ topic: t.topic, masteryScore: t.masteryScore }));

        // Derive total solved count from the same per-topic data (guaranteed consistent
        // with topicWiseProblems, instead of a separate count query that gave mismatched results)
        const solvedProblems = topicWiseProblems.reduce((sum, t) => sum + t.solved, 0);

        // User marked revision topics
        const revisionTopics = await Topic.find({ user: userId, needsRevision: true }).select('name status');

        // User marked revision problems
        const revisionProblems = await Problem.find({ user: userId, needsRevision: true }).select('name difficulty link').populate('topic', 'name');

        // "This week" counts (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const topicsThisWeek = await Topic.countDocuments({ user: userId, createdAt: { $gte: sevenDaysAgo } });
        const problemsThisWeek = await Problem.countDocuments({ user: userId, createdAt: { $gte: sevenDaysAgo } });

        res.status(200).json({
            topics: { totalTopics, completedTopics, inProgressTopics, pendingTopics },
            problems: { totalProblems, solvedProblems, easyProblems, mediumProblems, hardProblems },
            topicWiseProblems,
            weakTopics,
            revisionTopics,
            revisionProblems,
            topicsThisWeek,
            problemsThisWeek
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboard };