import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
    Target, TrendingUp, Calendar, ChevronLeft, ChevronRight,
    CheckCircle2, XCircle, Circle, BarChart3
} from 'lucide-react';

const DailyGoal = () => {
    const [goal, setGoal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [targetInput, setTargetInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        fetchGoal();
    }, []);

    useEffect(() => {
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewDate]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const month = String(viewDate.getMonth() + 1).padStart(2, '0');
            const year = viewDate.getFullYear();
            const { data } = await API.get('/goals/history', { params: { month, year } });
            setHistory(data);
        } catch (error) {
            toast.error('Failed to load goal history');
        }
        setLoadingHistory(false);
    };

    const fetchGoal = async () => {
        try {
            const { data } = await API.get('/goals');
            setGoal(data);
            setTargetInput(data.target || '');
        } catch (error) {
            toast.error("Failed to load today's goal");
        }
        setLoading(false);
    };

    const handleSetGoal = async (e) => {
        e.preventDefault();
        const target = Number(targetInput);
        if (!target || target < 1) {
            toast.error('Please enter a valid target (at least 1)');
            return;
        }
        setSaving(true);
        try {
            const { data } = await API.post('/goals', { target });
            setGoal(data);
            toast.success('Goal set for today!');
            fetchHistory();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to set goal');
        }
        setSaving(false);
    };

    const buildCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startWeekday = firstDay.getDay();

        const historyMap = {};
        history.forEach((g) => { historyMap[g.date] = g; });

        const days = [];
        for (let i = 0; i < startWeekday; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({ day: d, dateStr, entry: historyMap[dateStr] || null });
        }
        return days;
    };

    const calendarDays = buildCalendarDays();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const todayStr = new Date().toISOString().slice(0, 10);

    const target = goal?.target || 0;
    const achieved = goal?.achieved || 0;
    const percentage = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 0;
    const isGoalMet = target > 0 && achieved >= target;

    // Monthly summary — derived from the history array already fetched
    const entriesWithGoal = history.filter(h => h.target > 0);
    const goalsAchieved = entriesWithGoal.filter(h => h.achieved >= h.target).length;
    const goalsMissed = entriesWithGoal.length - goalsAchieved;
    const problemsSolvedThisMonth = history.reduce((sum, h) => sum + (h.achieved || 0), 0);
    const goalCompletionRate = entriesWithGoal.length > 0 ? Math.round((goalsAchieved / entriesWithGoal.length) * 100) : 0;
    const avgPerDay = entriesWithGoal.length > 0 ? (problemsSolvedThisMonth / entriesWithGoal.length).toFixed(1) : '0.0';

    const cardClass = "bg-surface-card border border-surface-border rounded-2xl shadow-md hover:shadow-lg hover:border-[#AECDEA] hover:-translate-y-1 transition-all duration-300";

    if (loading) return <div className="text-text text-center mt-10">Loading...</div>;

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-text">Daily Goal</h1>
                <p className="text-text-muted mt-1">Stay consistent. Track your daily DSA progress.</p>
            </div>

            {/* Today's Goal + Today's Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className={`${cardClass} p-5`}>
                    <h2 className="text-text font-bold mb-4 flex items-center gap-2">
                        <Target size={18} className="text-brand" />
                        Today's Goal
                    </h2>
                    <form onSubmit={handleSetGoal} className="flex gap-3">
                        <input
                            type="number"
                            min="1"
                            value={targetInput}
                            onChange={(e) => setTargetInput(e.target.value)}
                            placeholder="e.g. 5 problems"
                            className="flex-1 bg-surface-bg text-text p-3 rounded-lg border border-surface-border focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                        />
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : target > 0 ? 'Update' : 'Save'}
                        </button>
                    </form>
                    {target > 0 && (
                        <p className="text-text-muted text-sm mt-3">Current target: <span className="text-text font-semibold">{target} problems</span></p>
                    )}
                </div>

                <div className={`${cardClass} p-5`}>
                    <h2 className="text-text font-bold mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-brand" />
                        Today's Progress
                    </h2>
                    {target > 0 ? (
                        <>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-text-muted text-sm">Solved : {achieved} / {target}</span>
                                <span className={`text-sm font-bold ${isGoalMet ? 'text-success' : 'text-brand'}`}>{percentage}%</span>
                            </div>
                            <div className="w-full bg-surface-bg rounded-full h-3 overflow-hidden mb-3">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${isGoalMet ? 'bg-success' : 'bg-brand'}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            {isGoalMet ? (
                                <p className="text-success text-sm font-semibold">🎉 Goal achieved for today!</p>
                            ) : (
                                <p className="text-text-muted text-sm">{target - achieved} more to reach goal 🚀</p>
                            )}
                        </>
                    ) : (
                        <p className="text-text-muted text-sm">Set a target to start tracking today's progress.</p>
                    )}
                </div>
            </div>

            {/* Goal Calendar */}
            <div className={`${cardClass} p-5 mb-6`}>
                <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                    <h2 className="text-text font-bold flex items-center gap-2">
                        <Calendar size={18} className="text-brand" />
                        Goal Calendar
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-bg transition"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-text font-semibold text-sm w-40 text-center">
                            {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </span>
                        <button
                            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-bg transition"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {loadingHistory ? (
                    <p className="text-text-muted text-center py-8">Loading calendar...</p>
                ) : (
                    <>
                        <div className="grid grid-cols-7 gap-2 mb-2.5 w-[90%] mx-auto">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                                <div key={d} className="text-text-muted text-xs text-center font-semibold">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2 w-[88%] mx-auto">
                            {calendarDays.map((dayObj, idx) => {
                                if (!dayObj) return <div key={idx} className="aspect-square" />;

                                const isToday = dayObj.dateStr === todayStr;
                                const isFuture = dayObj.dateStr > todayStr;
                                const entry = dayObj.entry;
                                const hasTarget = entry && entry.target > 0;
                                const isAchieved = hasTarget && entry.achieved >= entry.target;
                                const isMissed = hasTarget && entry.achieved < entry.target;

                                let bgColor = '#EEF2F7';
                                let hoverColor = '#E3E9F1';
                                if (isToday) { bgColor = '#DBEAFE'; hoverColor = '#b3cbeb'; }
                                else if (isAchieved) { bgColor = '#DCFCE7'; hoverColor = '#CFF7DA'; }
                                else if (isMissed) { bgColor = '#FEF9C3'; hoverColor = '#FDF4B0'; }
                                else if (isFuture) { bgColor = '#EEF2F7'; hoverColor = '#E3E9F1'; }

                                return (
                                    <div
                                        key={idx}
                                        style={{ backgroundColor: bgColor }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverColor)}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = bgColor)}
                                        className="aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 transition-colors"
                                    >
                                        <span className={`text-2xl font-bold ${isToday ? 'text-brand' : 'text-text'}`}>
                                            {dayObj.day}
                                        </span>
                                        <span className={`text-[10px] font-medium ${hasTarget ? 'text-text-muted' : 'text-text-muted/50'}`}>
                                            {hasTarget ? `${entry.achieved}/${entry.target}` : 'No Goal'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-surface-border text-xs text-text-muted">
                            <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded inline-block" style={{ backgroundColor: '#DCFCE7' }} /> Goal Achieved</span>
                            <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded inline-block" style={{ backgroundColor: '#FEF9C3' }} /> Goal Missed</span>
                            <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded inline-block" style={{ backgroundColor: '#DBEAFE' }} /> Today</span>
                            <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded inline-block border border-surface-border" style={{ backgroundColor: '#FFFFFF' }} /> No Goal Set</span>
                        </div>
                    </>
                )}
            </div>

            {/* Monthly Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className={`${cardClass} p-5 flex flex-col items-center text-center`}>
                    <span className="flex items-center gap-1.5 text-brand font-semibold text-sm">
                        <BarChart3 size={16} /> Problems Solved
                    </span>
                    <span className="text-brand font-bold text-2xl mt-2">{problemsSolvedThisMonth}</span>
                </div>
                <div className={`${cardClass} p-5 flex flex-col items-center text-center`}>
                    <span className="flex items-center gap-1.5 text-success font-semibold text-sm">
                        <CheckCircle2 size={16} /> Goals Achieved
                    </span>
                    <span className="text-success font-bold text-2xl mt-2">{goalsAchieved}</span>
                </div>
                <div className={`${cardClass} p-5 flex flex-col items-center text-center`}>
                    <span className="flex items-center gap-1.5 text-warning font-semibold text-sm">
                        <XCircle size={16} /> Goals Missed
                    </span>
                    <span className="text-warning font-bold text-2xl mt-2">{goalsMissed}</span>
                </div>
                <div className={`${cardClass} p-5 flex flex-col items-center text-center`}>
                    <span className="flex items-center gap-1.5 text-brand font-semibold text-sm">
                        <Target size={16} /> Goal Completion
                    </span>
                    <span className="text-brand font-bold text-2xl mt-2">{goalCompletionRate}%</span>
                </div>
                <div className={`${cardClass} p-5 flex flex-col items-center text-center`}>
                    <span className="flex items-center gap-1.5 text-text-muted font-semibold text-sm">
                        <TrendingUp size={16} /> Average / Day
                    </span>
                    <span className="text-text font-bold text-2xl mt-2">{avgPerDay}</span>
                </div>
            </div>
        </div>
    );
};

export default DailyGoal;