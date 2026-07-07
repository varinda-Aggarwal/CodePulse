const Topic = require('../models/Topic');

// Get all topics
const getTopics = async (req, res) => {
    try {
        const topics = await Topic.find({ user: req.user._id });
        res.status(200).json(topics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add topic
const addTopic = async (req, res) => {
    try {
        const { name, status } = req.body;

        const topic = await Topic.create({
            user: req.user._id,
            name,
            status
        });

        res.status(201).json(topic);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update topic
const updateTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        if (topic.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedTopic = await Topic.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedTopic);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete topic
const deleteTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        if (topic.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Topic.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Topic removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTopics, addTopic, updateTopic, deleteTopic };