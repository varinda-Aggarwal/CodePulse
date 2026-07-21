const { GoogleGenerativeAI } = require('@google/generative-ai');
const StudyPlan = require('../models/StudyPlan');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

// Get today's plan if it exists (no AI call)
const getTodayPlan = async (req, res) => {
    try {
        const today = getTodayDateStr();
        const existing = await StudyPlan.findOne({ user: req.user._id, date: today });

        if (!existing) {
            return res.status(200).json({ exists: false });
        }

        res.status(200).json({
            exists: true,
            date: existing.date,
            weakTopics: existing.weakTopics,
            totalDays: existing.totalDays,
            generationCount: existing.generationCount,
            ...existing.planData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific past plan by date
const getPlanByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const plan = await StudyPlan.findOne({ user: req.user._id, date });

        if (!plan) {
            return res.status(404).json({ message: 'No plan found for this date' });
        }

        res.status(200).json({
            date: plan.date,
            weakTopics: plan.weakTopics,
            totalDays: plan.totalDays,
            ...plan.planData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get history of all past generated plans
const getPlanHistory = async (req, res) => {
    try {
        const plans = await StudyPlan.find({ user: req.user._id })
            .sort({ date: -1 })
            .select('date weakTopics totalDays createdAt');

        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateStudyPlan = async (req, res) => {
    try {
        const { weakTopics, totalDays = 7, regenerate = false } = req.body;

        if (!weakTopics || weakTopics.length === 0) {
            return res.status(400).json({ message: 'Please provide weak topics' });
        }

        const today = getTodayDateStr();
        const existing = await StudyPlan.findOne({ user: req.user._id, date: today });

        // If a plan already exists for today and user didn't ask to regenerate, return it (no AI call)
        if (!regenerate && existing) {
            return res.status(200).json({
                fromCache: true,
                date: existing.date,
                weakTopics: existing.weakTopics,
                totalDays: existing.totalDays,
                generationCount: existing.generationCount,
                ...existing.planData
            });
        }

        // Enforce max 2 generations per day (1 initial + 1 regenerate)
        if (regenerate && existing && existing.generationCount >= 2) {
            return res.status(429).json({ message: "You've reached today's limit of 2 plan generations. Try again tomorrow!" });
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-flash-latest',
            generationConfig: { temperature: regenerate ? 1.0 : 0.7 }
        });

        const variationHint = regenerate
            ? ' Provide a DIFFERENT set of problems and a different day-wise structure/order than a typical plan would use, while still being logical and effective — add variety in problem selection and sequencing.'
            : '';

        const prompt = `You are a DSA expert and coding interview coach. 
        Create a ${totalDays}-day study plan for a student who is weak in these DSA topics: ${weakTopics.join(', ')}.${variationHint}
        
        For each day provide:
        1. Topic to focus on
        2. 3-4 specific problems to solve (with difficulty level)
        3. Key concepts to revise
        
        Format the response as a structured JSON with this format:
        {
            "studyPlan": [
                {
                    "day": 1,
                    "topic": "topic name",
                    "concepts": ["concept1", "concept2"],
                    "problems": [
                        {"name": "problem name", "difficulty": "Easy/Medium/Hard", "platform": "LeetCode/GFG"}
                    ]
                }
            ],
            "tips": ["tip1", "tip2"]
        }
        
        Return only valid JSON, no extra text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const studyPlan = JSON.parse(cleanText);

      // Save/overwrite today's plan, incrementing generation count
        const newCount = existing ? existing.generationCount + 1 : 1;
        await StudyPlan.findOneAndUpdate(
            { user: req.user._id, date: today },
            { user: req.user._id, date: today, weakTopics, totalDays, planData: studyPlan, generationCount: newCount },
            { upsert: true, new: true }
        );

        res.status(200).json({ fromCache: false, date: today, weakTopics, totalDays, generationCount: newCount, ...studyPlan });

    } catch (error) {
        if (error.message && error.message.includes('quota')) {
            return res.status(429).json({ message: 'AI service rate limit reached. Please wait a minute and try again.' });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateStudyPlan, getTodayPlan, getPlanHistory, getPlanByDate };