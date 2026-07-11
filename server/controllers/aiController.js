const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateStudyPlan = async (req, res) => {
    try {
        const { weakTopics, totalDays = 7 } = req.body;

        if (!weakTopics || weakTopics.length === 0) {
            return res.status(400).json({ message: 'Please provide weak topics' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a DSA expert and coding interview coach. 
        Create a ${totalDays}-day study plan for a student who is weak in these DSA topics: ${weakTopics.join(', ')}.
        
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

        res.status(200).json(studyPlan);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateStudyPlan };