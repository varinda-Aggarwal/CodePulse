const Problem = require('../models/Problem');
const Topic = require('../models/Topic');

// Get all problems
const getProblems = async (req, res) => {
    try {
        const { search, difficulty, topic, sort, page = 1, limit = 10 } = req.query;
        let query = { user: req.user._id };
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (difficulty) {
            query.difficulty = difficulty;
        }
        if (topic) {
            query.topic = topic;
        }
        const skip = (page - 1) * limit;
        let problemsQuery = Problem.find(query)
            .populate('topic', 'name')
            .skip(skip)
            .limit(parseInt(limit));
        if (sort === 'oldest') {
            problemsQuery = problemsQuery.sort({ dateSolved: 1 });
        } else {
            problemsQuery = problemsQuery.sort({ dateSolved: -1 });
        }
        const problems = await problemsQuery;
        const total = await Problem.countDocuments(query);

        res.status(200).json({
            problems,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalProblems: total
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add problem
const addProblem = async (req, res) => {
    try {
        const { name, link, difficulty, topic, notes } = req.body;
        const problem = await Problem.create({
            user: req.user._id,
            name,
            link,
            difficulty,
            topic,
            notes
        });

        res.status(201).json(problem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update problem
const updateProblem = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        if (problem.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const updatedProblem = await Problem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedProblem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete problem
const deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        if (problem.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        await Problem.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Problem removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProblems, addProblem, updateProblem, deleteProblem };