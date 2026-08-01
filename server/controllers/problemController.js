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

        // Check for duplicate name or duplicate link for this user (case-insensitive)
        const orConditions = [
            { name: { $regex: `^${name.trim()}$`, $options: 'i' } }
        ];
        if (link && link.trim()) {
            orConditions.push({ link: { $regex: `^${link.trim()}$`, $options: 'i' } });
        }

        const existing = await Problem.findOne({
            user: req.user._id,
            $or: orConditions
        });

        if (existing) {
            if (existing.name.toLowerCase() === name.trim().toLowerCase()) {
                return res.status(400).json({ message: `A problem named "${name}" already exists` });
            }
            return res.status(400).json({ message: 'A problem with this link already exists' });
        }

        const { status } = req.body;
        const problem = await Problem.create({
            user: req.user._id,
            name,
            link,
            difficulty,
            topic,
            notes,
            status: status || 'Solved',
            dateSolved: (status || 'Solved') === 'Solved' ? new Date() : null
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

        // If name or link is being changed, check it doesn't clash with another problem
        if (req.body.name || req.body.link) {
            const nameToCheck = req.body.name !== undefined ? req.body.name : problem.name;
            const linkToCheck = req.body.link !== undefined ? req.body.link : problem.link;

            const orConditions = [
                { name: { $regex: `^${nameToCheck.trim()}$`, $options: 'i' } }
            ];
            if (linkToCheck && linkToCheck.trim()) {
                orConditions.push({ link: { $regex: `^${linkToCheck.trim()}$`, $options: 'i' } });
            }

            const existing = await Problem.findOne({
                _id: { $ne: req.params.id },
                user: req.user._id,
                $or: orConditions
            });

            if (existing) {
                if (existing.name.toLowerCase() === nameToCheck.trim().toLowerCase()) {
                    return res.status(400).json({ message: `A problem named "${nameToCheck}" already exists` });
                }
                return res.status(400).json({ message: 'A problem with this link already exists' });
            }
        }

        // Auto-manage dateSolved when status changes
        if (req.body.status === 'Solved' && problem.status !== 'Solved') {
            req.body.dateSolved = new Date();
        } else if (req.body.status && req.body.status !== 'Solved') {
            req.body.dateSolved = null;
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