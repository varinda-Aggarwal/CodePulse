const SupportTicket = require('../models/SupportTicket');
const sendSupportEmail = require('../utils/sendSupportEmail');

const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const ticket = await SupportTicket.create({
            user: req.user?._id,
            type: 'contact',
            name, email, subject, message
        });
        await sendSupportEmail({ type: 'contact', name, email, subject, message });
        res.status(201).json({ message: "Your message has been sent! We'll get back to you within 24 hours.", ticket });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const submitBugReport = async (req, res) => {
    try {
        const { subject, message, category, priority } = req.body;
        const ticket = await SupportTicket.create({
            user: req.user?._id,
            type: 'bug',
            name: req.user?.username,
            email: req.user?.email,
            subject, message, category, priority
        });
        await sendSupportEmail({
            type: 'bug', name: req.user?.username, email: req.user?.email,
            subject, message, category, priority
        });
        res.status(201).json({ message: 'Bug report submitted. Thanks for helping us improve!', ticket });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const submitFeatureRequest = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const ticket = await SupportTicket.create({
            user: req.user?._id,
            type: 'feature',
            name: req.user?.username,
            email: req.user?.email,
            subject, message
        });
        await sendSupportEmail({
            type: 'feature', name: req.user?.username, email: req.user?.email,
            subject, message
        });
        res.status(201).json({ message: 'Suggestion submitted. We appreciate your feedback!', ticket });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { submitContact, submitBugReport, submitFeatureRequest };