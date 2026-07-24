import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';

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
            toast.error('Failed to load today\'s goal');
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

    if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

    const buildCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startWeekday = firstDay.getDay();

        const historyMap = {};
        history.forEach((g) => { historyMap[g.date] = g; });

        const days = [];
        for (let i = 0; i < startWeekday; i++) {
            days.push(null);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({ day: d, dateStr, entry: historyMap[dateStr] || null });
        }
        return days;
    };

    const calendarDays = buildCalendarDays();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i);
    const todayStr = new Date().toISOString().slice(0, 10);

    const handleMonthChange = (e) => {
        setViewDate(new Date(viewDate.getFullYear(), Number(e.target.value), 1));
    };
    const handleYearChange = (e) => {
        setViewDate(new Date(Number(e.target.value), viewDate.getMonth(), 1));
    };

    const target = goal?.target || 0;
    const achieved = goal?.achieved || 0;
    const percentage = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 0;
    const isGoalMet = target > 0 && achieved >= target;

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-white mb-6">Daily Goal</h1>

                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h2 className="text-white font-semibold mb-3">
                        {target > 0 ? "Today's Target" : 'Set a Target for Today'}
                    </h2>
                    <form onSubmit={handleSetGoal} className="flex gap-3">
                        <input
                            type="number"
                            min="1"
                            value={targetInput}
                            onChange={(e) => setTargetInput(e.target.value)}
                            placeholder="e.g. 5 problems"
                            className="flex-1 bg-gray-700 text-white p-3 rounded-lg"
                        />
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                        >
                            {saving ? 'Saving...' : target > 0 ? 'Update Target' : 'Set Target'}
                        </button>
                    </form>
                </div>

                {target > 0 && (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-white font-semibold">Today's Progress</h2>
                            <span className={`text-sm font-bold ${isGoalMet ? 'text-green-400' : 'text-gray-400'}`}>
                                {achieved} / {target} solved
                            </span>
                        </div>

                        <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
                            <div
                                className={`h-4 rounded-full transition-all duration-300 ${isGoalMet ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>

                        {isGoalMet ? (
                            <p className="text-green-400 text-center font-semibold">
                                🎉 Goal achieved for today! Great work!
                            </p>
                        ) : (
                            <p className="text-gray-400 text-center text-sm">
                                {target - achieved} more problem{target - achieved !== 1 ? 's' : ''} to go — solve them on the Problems page and this will update automatically!
                            </p>
                        )}
                    </div>
                )}

                <div className="bg-gray-800 rounded-lg p-6 mt-6">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-white font-semibold">Goal Calendar</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                                className="text-gray-400 hover:text-white px-2 py-1"
                            >
                                &lt;
                            </button>
                            <select
                                value={viewDate.getMonth()}
                                onChange={handleMonthChange}
                                className="bg-gray-700 text-white text-sm px-2 py-1.5 rounded-lg focus:outline-none"
                            >
                                {monthNames.map((m, i) => (
                                    <option key={m} value={i}>{m}</option>
                                ))}
                            </select>
                            <select
                                value={viewDate.getFullYear()}
                                onChange={handleYearChange}
                                className="bg-gray-700 text-white text-sm px-2 py-1.5 rounded-lg focus:outline-none"
                            >
                                {yearOptions.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                                className="text-gray-400 hover:text-white px-2 py-1"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>

                    {loadingHistory ? (
                        <p className="text-gray-400 text-center py-8">Loading calendar...</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-7 border-t border-l border-gray-700">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                    <div key={d} className="text-gray-500 text-xs text-center py-2 font-medium border-r border-b border-gray-700 bg-gray-800/50">
                                        {d}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 border-l border-gray-700">
                                {calendarDays.map((dayObj, idx) => {
                                    if (!dayObj) {
                                        return <div key={idx} className="h-20 border-r border-b border-gray-700 bg-gray-800/30" />;
                                    }

                                    const isToday = dayObj.dateStr === todayStr;
                                    const entry = dayObj.entry;
                                    const isAchieved = entry && entry.achieved >= entry.target;

                                    return (
                                        <div
                                            key={idx}
                                            className={`h-20 border-r border-b border-gray-700 p-2 flex flex-col justify-between
                                                ${isToday ? 'bg-blue-500/10' : ''}`}
                                        >
                                            <span className={`text-sm ${isToday ? 'text-blue-400 font-bold' : 'text-gray-300'}`}>
                                                {dayObj.day}
                                            </span>
                                            {entry && (
                                                <span className={`text-xs px-1.5 py-0.5 rounded self-start
                                                    ${isAchieved ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}`}>
                                                    {entry.achieved}/{entry.target}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex gap-4 mt-4 text-xs text-gray-400 justify-center">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-green-600 rounded-sm inline-block"></span> Achieved</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-yellow-600 rounded-sm inline-block"></span> Missed</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500/20 rounded-sm inline-block border border-blue-400"></span> Today</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyGoal;