const { GoogleGenerativeAI } = require('@google/generative-ai');
const StudyPlan = require('../models/StudyPlan');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Gemini's Flash-tier models intermittently return 503 "high demand" errors.
// Retry with exponential backoff (1s, 2s, 4s) before giving up — only for 503s,
// so a genuine config/auth error still fails fast instead of wasting ~7s retrying.
const generateWithRetry = async (model, prompt, maxRetries = 3) => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await model.generateContent(prompt);
        } catch (error) {
            const is503 = error.message && error.message.includes('503');
            if (!is503 || attempt === maxRetries) {
                throw error;
            }
            await sleep(1000 * Math.pow(2, attempt));
        }
    }
};

// Validate the AI-generated study plan structure before trusting/storing it
const isValidStudyPlan = (data) => {
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.studyPlan) || data.studyPlan.length === 0) return false;

    const validDifficulties = ['Easy', 'Medium', 'Hard'];

    for (const day of data.studyPlan) {
        if (typeof day.day !== 'number') return false;
        if (typeof day.topic !== 'string' || !day.topic.trim()) return false;
        if (!Array.isArray(day.concepts)) return false;
        if (!Array.isArray(day.problems)) return false;

        for (const p of day.problems) {
            if (typeof p.name !== 'string' || !p.name.trim()) return false;
            if (!validDifficulties.includes(p.difficulty)) return false;
        }
    }

    if (data.tips && !Array.isArray(data.tips)) return false;

    return true;
};

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
            completedTasks: existing.completedTasks || [],
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
            completedTasks: plan.completedTasks || [],
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
                completedTasks: existing.completedTasks || [],
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

        const result = await generateWithRetry(model, prompt);
        const response = await result.response;
        const text = response.text();

        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let studyPlan;
        try {
            studyPlan = JSON.parse(cleanText);
        } catch (parseError) {
            return res.status(502).json({ message: 'AI returned an invalid response. Please try generating again.' });
        }

        if (!isValidStudyPlan(studyPlan)) {
            return res.status(502).json({ message: 'AI response did not match the expected format. Please try generating again.' });
        }

        
        // Regenerate/first-time = naya plan structure hai, isliye completedTasks reset ho jayega
        const newCount = existing ? existing.generationCount + 1 : 1;
        await StudyPlan.findOneAndUpdate(
            { user: req.user._id, date: today },
            { user: req.user._id, date: today, weakTopics, totalDays, planData: studyPlan, generationCount: newCount, completedTasks: [] },
            { upsert: true, new: true }
        );

        res.status(200).json({ fromCache: false, date: today, weakTopics, totalDays, generationCount: newCount, completedTasks: [], ...studyPlan });

    } catch (error) {
        if (error.message && error.message.includes('quota')) {
            return res.status(429).json({ message: 'AI service rate limit reached. Please wait a minute and try again.' });
        }
        if (error.message && error.message.includes('503')) {
            return res.status(503).json({ message: 'AI service is temporarily overloaded (Google Gemini outage). We retried automatically — please try again in a few minutes.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Save which checklist items are ticked, for a given date's plan
const updateProgress = async (req, res) => {
    try {
        const { date, completedTasks } = req.body;

        if (!date || !Array.isArray(completedTasks)) {
            return res.status(400).json({ message: 'date and completedTasks (array) are required' });
        }

        const updated = await StudyPlan.findOneAndUpdate(
            { user: req.user._id, date },
            { completedTasks },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'No plan found for this date' });
        }

        res.status(200).json({ completedTasks: updated.completedTasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateStudyPlan, getTodayPlan, getPlanHistory, getPlanByDate, updateProgress };