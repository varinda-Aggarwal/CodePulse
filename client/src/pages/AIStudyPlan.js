import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';

const AIStudyPlan = () => {
    const [weakTopics, setWeakTopics] = useState([]);
    const [loadingWeak, setLoadingWeak] = useState(true);
    const [totalDays, setTotalDays] = useState(7);
    const [generating, setGenerating] = useState(false);
    const [plan, setPlan] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [viewingDate, setViewingDate] = useState(null);
    const [generationCount, setGenerationCount] = useState(0);

    useEffect(() => {
        fetchWeakTopics();
        fetchTodayPlan();
        fetchHistory();
    }, []);

    const fetchWeakTopics = async () => {
        try {
            const { data } = await API.get('/dashboard');
            const topics = (data.weakTopics || []).map((t) => t.topic);
            setWeakTopics(topics);
        } catch (error) {
            toast.error('Failed to load weak topics');
        }
        setLoadingWeak(false);
    };

    const fetchTodayPlan = async () => {
        try {
            const { data } = await API.get('/ai/study-plan/today');
            if (data.exists) {
                setPlan(data);
                setViewingDate(data.date);
                setGenerationCount(data.generationCount || 1);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const { data } = await API.get('/ai/study-plan/history');
            setHistory(data);
        } catch (error) {
            console.error(error);
        }
        setLoadingHistory(false);
    };

    const handleGenerate = async (regenerate = false) => {
        if (weakTopics.length === 0) {
            toast.error('No weak topics found — add topics/problems first!');
            return;
        }

        setGenerating(true);
        try {
            const { data } = await API.post('/ai/study-plan', {
                weakTopics,
                totalDays,
                regenerate
            });
            setPlan(data);
            setViewingDate(data.date);
            setGenerationCount(data.generationCount || 1);
            toast.success(data.fromCache ? "Loaded today's existing plan" : 'Study plan generated!');
            if (!data.fromCache) fetchHistory();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate study plan');
        }
        setGenerating(false);
    };

    const handleViewPastPlan = async (date) => {
        try {
            const { data } = await API.get(`/ai/study-plan/date/${date}`);
            setPlan(data);
            setViewingDate(date);
            if (date === todayStr) setGenerationCount(data.generationCount || 1);
        } catch (error) {
            toast.error('Failed to load that plan');
        }
    };

    const todayStr = new Date().toISOString().slice(0, 10);
    const isViewingToday = viewingDate === todayStr;

    if (loadingWeak) return <div className="text-white text-center mt-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main content */}
                <div className="md:col-span-2">
                    <h1 className="text-3xl font-bold text-white mb-6">AI Study Plan</h1>

                    <div className="bg-gray-800 rounded-lg p-6 mb-6">
                        <h2 className="text-white font-semibold mb-3">Your Weak Topics</h2>
                        {weakTopics.length === 0 ? (
                            <p className="text-gray-400">
                                No weak topics detected yet. Add topics and problems, and this will identify areas that need more practice (topics with fewer than 3 problems solved).
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {weakTopics.map((t, i) => (
                                    <span key={i} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">{t}</span>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-3 mt-4 flex-wrap">
                            <label className="text-gray-400 text-sm">Plan duration:</label>
                            <select
                                value={totalDays}
                                onChange={(e) => setTotalDays(Number(e.target.value))}
                                className="bg-gray-700 text-white p-2 rounded-lg text-sm"
                            >
                                <option value={3}>3 days</option>
                                <option value={5}>5 days</option>
                                <option value={7}>7 days</option>
                                <option value={14}>14 days</option>
                            </select>

                            {plan && isViewingToday ? (
                                <div className="flex items-center gap-3 ml-auto">
                                    <span className="text-gray-500 text-xs">
                                        {generationCount}/2 generations used today
                                    </span>
                                    <button
                                        onClick={() => handleGenerate(true)}
                                        disabled={generating || weakTopics.length === 0 || generationCount >= 2}
                                        className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg whitespace-nowrap"
                                    >
                                        {generating ? 'Regenerating...' : generationCount >= 2 ? 'Limit Reached' : "Regenerate Today's Plan"}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleGenerate(false)}
                                    disabled={generating || weakTopics.length === 0}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg ml-auto"
                                >
                                    {generating ? 'Generating...' : "Generate Today's Plan"}
                                </button>
                            )}
                        </div>
                    </div>

                    {generating && (
                        <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                            Generating your personalized study plan, please wait...
                        </div>
                    )}

                    {!generating && !plan && (
                        <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                            No plan generated for today yet. Click "Generate Today's Plan" above to create one.
                        </div>
                    )}

                    {plan && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-400 text-sm">
                                    Showing plan for: <span className="text-white font-medium">
                                        {new Date(viewingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    {isViewingToday && <span className="text-green-400 ml-2">(Today)</span>}
                                </p>
                            </div>

                            {plan.studyPlan?.map((dayPlan) => (
                                <div key={dayPlan.day} className="bg-gray-800 rounded-lg p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-white font-bold text-lg">Day {dayPlan.day}</h3>
                                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">{dayPlan.topic}</span>
                                    </div>

                                    {dayPlan.concepts?.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-gray-400 text-sm mb-1">Key Concepts:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {dayPlan.concepts.map((c, i) => (
                                                    <span key={i} className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs">{c}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {dayPlan.problems?.length > 0 && (
                                        <div>
                                            <p className="text-gray-400 text-sm mb-2">Problems to Solve:</p>
                                            <div className="space-y-2">
                                                {dayPlan.problems.map((p, i) => (
                                                    <div key={i} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                                                        <span className="text-white text-sm">{p.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-400 text-xs">{p.platform}</span>
                                                            <span className={`text-xs px-2 py-1 rounded-full text-white
                                                                ${p.difficulty === 'Easy' ? 'bg-green-600' : p.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'}`}>
                                                                {p.difficulty}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {plan.tips?.length > 0 && (
                                <div className="bg-gray-800 rounded-lg p-5">
                                    <h3 className="text-white font-bold mb-2">💡 Tips</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {plan.tips.map((tip, i) => (
                                            <li key={i} className="text-gray-300 text-sm">{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* History sidebar */}
                <div className="md:col-span-1">
                    <h2 className="text-white font-semibold mb-3">Past Plans</h2>
                    <div className="bg-gray-800 rounded-lg p-4">
                        {loadingHistory ? (
                            <p className="text-gray-400 text-sm text-center">Loading history...</p>
                        ) : history.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center">No past plans yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {history.map((h) => (
                                    <button
                                        key={h.date}
                                        onClick={() => handleViewPastPlan(h.date)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors
                                            ${viewingDate === h.date ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                                    >
                                        <p className="text-white text-sm font-medium">
                                            {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-gray-300 text-xs mt-1">
                                            {h.totalDays}-day plan · {h.weakTopics?.join(', ')}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIStudyPlan;