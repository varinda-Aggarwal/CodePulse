const Problem = require('../models/Problem');
const Topic = require('../models/Topic');

// Get all problems
const getProblems = async (req, res) => {
    try {
        const { search, difficulty, topic, sort } = req.query;

        let query = { user: req.user._id };

        // Search by name
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Filter by difficulty
        if (difficulty) {
            query.difficulty = difficulty;
        }

        // Filter by topic
        if (topic) {
            query.topic = topic;
        }

        let problems = Problem.find(query).populate('topic', 'name');

        // Sort
        if (sort === 'oldest') {
            problems = problems.sort({ dateSolved: 1 });
        } else {
            problems = problems.sort({ dateSolved: -1 });
        }

        const result = await problems;
        res.status(200).json(result);

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