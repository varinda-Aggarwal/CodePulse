import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
    Brain, Sparkles, Calendar, CheckCircle2, Circle,
    BookOpen, Target, ChevronRight
} from 'lucide-react';

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
    const [checkedTasks, setCheckedTasks] = useState({});

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
                const map = {};
                (data.completedTasks || []).forEach((id) => { map[id] = true; });
                setCheckedTasks(map);
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
            setCheckedTasks({});
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
            const map = {};
            (data.completedTasks || []).forEach((id) => { map[id] = true; });
            setCheckedTasks(map);
            if (date === todayStr) setGenerationCount(data.generationCount || 1);
        } catch (error) {
            toast.error('Failed to load that plan');
        }
    };

    const todayStr = new Date().toISOString().slice(0, 10);
    const isViewingToday = viewingDate === todayStr;
    const cardClass = "bg-surface-card border border-surface-border rounded-2xl shadow-md hover:shadow-lg hover:border-[#AECDEA] hover:-translate-y-1 transition-all duration-300";

    // Which day number is "today" — used only to badge/highlight that day, sab days ab ek saath dikhte hain
    const getCurrentDayNum = () => {
        if (!plan?.studyPlan?.length || !isViewingToday) return null;
        const startDate = new Date(plan.date);
        const now = new Date(todayStr);
        const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1;
        return Math.min(Math.max(diffDays, 1), plan.studyPlan.length);
    };

    const currentDayNum = getCurrentDayNum();

    // Ek din ke liye checklist banata hai — Solve = har problem individually (naam + difficulty), Revise = concepts
    // id mein day number prefix hai taaki alag-alag din ke checkbox mix na ho
    const buildTasks = (dayPlan) => {
        if (!dayPlan) return [];
        const tasks = [];
        (dayPlan.problems || []).forEach((p, i) => {
            tasks.push({ id: `d${dayPlan.day}-solve-${i}`, type: 'Solve', label: p.name, platform: p.platform, difficulty: p.difficulty });
        });
        (dayPlan.concepts || []).forEach((c, i) => {
            tasks.push({ id: `d${dayPlan.day}-revise-${i}`, type: 'Revise', label: c });
        });
        return tasks;
    };

    // Poore plan (sab days combined) ka overall progress
    const allTasks = (plan?.studyPlan || []).flatMap(buildTasks);
    const checkedCount = allTasks.filter(t => checkedTasks[t.id]).length;
    const progressPct = allTasks.length > 0 ? Math.round((checkedCount / allTasks.length) * 100) : 0;

    const toggleTask = async (id) => {
        const updated = { ...checkedTasks, [id]: !checkedTasks[id] };
        setCheckedTasks(updated);

        const idsToSave = Object.keys(updated).filter((key) => updated[key]);
        try {
            await API.patch('/ai/study-plan/progress', { date: viewingDate, completedTasks: idsToSave });
        } catch (error) {
            toast.error('Failed to save progress');
        }
    };

    if (loadingWeak) return <div className="text-text text-center mt-10">Loading...</div>;

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-text">AI Study Plan</h1>
                <p className="text-text-muted mt-1">Let AI create a personalized study plan based on your weak topics and progress.</p>
            </div>

            {/* Card 1 — Generate Study Plan (premium feel) */}
            <div className={`${cardClass} p-4 mb-5 bg-gradient-to-br from-surface-card to-[#F0F6FC]`}>
                <h2 className="text-text font-bold mb-3 flex items-center gap-2 text-base">
                    <Brain size={18} className="text-brand" />
                    Generate Study Plan
                </h2>

                <p className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-1.5">Weak Topics</p>
                {weakTopics.length === 0 ? (
                    <p className="text-text-muted text-sm mb-3">
                        No weak topics detected yet. Add topics and problems, and this will identify areas that need more practice.
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {weakTopics.map((t, i) => (
                            <span
                                key={i}
                                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                                style={{ backgroundColor: '#FFF0F0', color: '#C13E3E' }}
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                <p className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-1.5">Duration</p>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {[3, 7, 14].map((d) => (
                        <button
                            key={d}
                            type="button"
                            onClick={() => setTotalDays(d)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors
                                ${totalDays === d ? 'border-brand bg-brand/5' : 'border-surface-border bg-transparent'}`}
                        >
                            <span
                                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center
                                    ${totalDays === d ? 'border-brand' : 'border-text-muted/40'}`}
                            >
                                {totalDays === d && <span className="w-1.5 h-1.5 rounded-full bg-brand" />}
                            </span>
                            <span className={`text-sm font-medium ${totalDays === d ? 'text-brand' : 'text-text-muted'}`}>
                                {d} Days
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex justify-end">
                    {plan && isViewingToday ? (
                        <div className="flex items-center gap-3 flex-wrap justify-end">
                            <span className="text-text-muted text-xs">{generationCount}/2 generations used today</span>
                            <button
                                onClick={() => handleGenerate(true)}
                                disabled={generating || weakTopics.length === 0 || generationCount >= 2}
                                className="bg-surface-bg hover:bg-surface-border disabled:opacity-50 disabled:cursor-not-allowed text-text px-4 py-1.5 rounded-lg font-semibold text-sm transition"
                            >
                                {generating ? 'Regenerating...' : generationCount >= 2 ? 'Limit Reached' : 'Regenerate Plan'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleGenerate(false)}
                            disabled={generating || weakTopics.length === 0}
                            className="bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-1.5 rounded-lg font-semibold text-sm transition flex items-center gap-2"
                        >
                            <Sparkles size={16} />
                            {generating ? 'Generating...' : 'Generate AI Plan'}
                        </button>
                    )}
                </div>
            </div>

            {/* Card 2 (Today's Plan) + Card 3 (Previous Plans) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Today's Plan — main attraction */}
                <div className={`${cardClass} p-6 md:col-span-2`}>
                    {generating ? (
                        <div className="text-center text-text-muted py-16">
                            Generating your personalized study plan, please wait...
                        </div>
                    ) : !plan ? (
                        <div className="flex flex-col items-center justify-center text-center py-16">
                            <Brain size={40} className="text-brand/40 mb-4" />
                            <h3 className="text-text font-bold text-lg mb-1">No study plan for today</h3>
                            <p className="text-text-muted text-sm mb-5">Generate one using your weak topics.</p>
                            <button
                                onClick={() => handleGenerate(false)}
                                disabled={weakTopics.length === 0}
                                className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition"
                            >
                                Generate Plan
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-text font-bold text-lg flex items-center gap-2">
                                    <Target size={18} className="text-brand" />
                                    {plan.studyPlan.length}-Day Study Plan
                                </h2>
                                {!isViewingToday && (
                                    <span className="text-text-muted text-xs">
                                        {new Date(viewingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                )}
                            </div>
                            <p className="text-text-muted text-sm mb-4">{plan.weakTopics?.join(', ')}</p>

                            {plan.studyPlan.map((dayPlan, dIdx) => {
                                const dayTasks = buildTasks(dayPlan);
                                const isToday = dayPlan.day === currentDayNum;
                                return (
                                    <div key={dayPlan.day} className={dIdx > 0 ? 'mt-6 pt-6 border-t border-surface-border' : ''}>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-text font-bold text-base flex items-center gap-2">
                                                Day {dayPlan.day}
                                                {isToday && (
                                                    <span className="text-brand text-xs font-semibold bg-brand/10 px-2 py-0.5 rounded-full">
                                                        Today
                                                    </span>
                                                )}
                                            </h3>
                                            {dayPlan.topic && (
                                                <span className="text-text-muted text-xs">{dayPlan.topic}</span>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            {dayTasks.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => toggleTask(t.id)}
                                                    className="w-full flex items-center justify-between gap-3 py-1.5 px-2.5 rounded-lg border border-surface-border hover:bg-surface-bg transition text-left"
                                                >
                                                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                        {checkedTasks[t.id]
                                                            ? <CheckCircle2 size={16} className="text-success shrink-0" />
                                                            : <Circle size={16} className="text-text-muted/40 shrink-0" />}
                                                        <span className="flex items-baseline gap-2 min-w-0">
                                                            <span className="text-text-muted text-[10px] font-semibold uppercase tracking-wide shrink-0">{t.type}</span>
                                                            <span className={`text-sm font-medium truncate ${checkedTasks[t.id] ? 'text-text-muted line-through' : 'text-text'}`}>
                                                                {t.label}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    {t.difficulty && (
                                                        <span className="flex items-center gap-2 shrink-0">
                                                            <span className="text-text-muted text-xs hidden sm:inline">{t.platform}</span>
                                                            <span
                                                                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white"
                                                                style={{
                                                                    backgroundColor: t.difficulty === 'Easy' ? '#16A34A' : t.difficulty === 'Medium' ? '#D97706' : '#DC2626'
                                                                }}
                                                            >
                                                                {t.difficulty}
                                                            </span>
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {plan.tips?.length > 0 && (
                                <div className="bg-surface-bg rounded-lg p-4 my-5">
                                    <h3 className="text-text font-bold text-sm mb-2 flex items-center gap-1.5">
                                        <BookOpen size={14} className="text-brand" /> Tips
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {plan.tips.map((tip, i) => (
                                            <li key={i} className="text-text-muted text-sm">{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mt-5">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-text-muted text-xs font-semibold">Overall Progress</span>
                                    <span className="text-brand text-xs font-bold">{progressPct}%</span>
                                </div>
                                <div className="w-full bg-surface-bg rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-brand transition-all duration-500"
                                        style={{ width: `${progressPct}%` }}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Previous Plans — compact list */}
                <div className={`${cardClass} p-5 md:col-span-1`}>
                    <h2 className="text-text font-bold mb-4 flex items-center gap-2">
                        <Calendar size={16} className="text-brand" />
                        Past Plans
                    </h2>
                    {loadingHistory ? (
                        <p className="text-text-muted text-sm text-center">Loading history...</p>
                    ) : history.length === 0 ? (
                        <p className="text-text-muted text-sm text-center">No past plans yet.</p>
                    ) : (
                        <div className="space-y-2.5">
                            {history.map((h) => (
                                <div
                                    key={h.date}
                                    className={`flex items-center justify-between p-3 rounded-lg border h-[90px]
                                        ${viewingDate === h.date ? 'border-brand bg-brand/5' : 'border-surface-border'}`}
                                >
                                    <div>
                                        <p className="text-text font-semibold text-sm">
                                            {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </p>
                                        <p className="text-text-muted text-xs mt-1">{h.totalDays}-Day Plan</p>
                                        <p className="text-text-muted text-xs">{h.weakTopics?.length || 0} Topics</p>
                                    </div>
                                    <button
                                        onClick={() => handleViewPastPlan(h.date)}
                                        className="flex items-center gap-1 text-brand text-xs font-semibold hover:underline shrink-0"
                                    >
                                        View <ChevronRight size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIStudyPlan;