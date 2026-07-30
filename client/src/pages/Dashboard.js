import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [goalData, setGoalData] = useState(null);
    const [recentProblems, setRecentProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
        fetchGoal();
        fetchRecentProblems();
    }, []);

    const fetchDashboard = async () => {
        try {
            const { data } = await API.get('/dashboard');
            setStats(data);
        } catch (error) {
            toast.error('Failed to load dashboard');
        }
        setLoading(false);
    };

    const fetchGoal = async () => {
        try {
            const { data } = await API.get('/goal');
            setGoalData(data);
        } catch (error) {
            // Goal data optional — dashboard should still render without it
        }
    };

    const fetchRecentProblems = async () => {
        try {
            const { data } = await API.get('/problems');
            const sorted = [...data].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setRecentProblems(sorted.slice(0, 3));
        } catch (error) {
            // Recent problems optional
        }
    };

    const difficultyData = [
        { name: 'Easy', value: stats?.problems?.easyProblems || 0, color: '#6B9B6E' },
        { name: 'Medium', value: stats?.problems?.mediumProblems || 0, color: '#D4A24C' },
        { name: 'Hard', value: stats?.problems?.hardProblems || 0, color: '#C1594F' }
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getRelativeDate = (dateStr) => {
        const diffDays = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    if (loading) return <div className="text-text text-center mt-10">Loading...</div>;

    const statCards = [
        { label: 'Topics', value: stats?.topics?.totalTopics || 0, color: 'text-text' },
        { label: 'Solved', value: stats?.problems?.totalProblems || 0, color: 'text-success' },
        { label: 'Problems', value: stats?.problems?.totalProblems || 0, color: 'text-brand' },
        { label: 'Weak', value: stats?.weakTopics?.length || 0, color: 'text-danger' },
        { label: 'Revision', value: stats?.revisionTopics?.length || 0, color: 'text-warning' },
    ];

    return (
        <div>
            {/* Greeting Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text">
                    👋 {getGreeting()}, {user?.firstName || user?.username}
                </h1>
                <p className="text-text-muted text-sm mt-1">
                    Keep solving! You're on a {stats?.streak ?? 0}-day streak.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {statCards.map((card) => (
                    <div key={card.label} className="bg-surface-card border border-surface-border p-4 rounded-xl">
                        <p className="text-text-muted text-sm">{card.label}</p>
                        <p className={`${card.color} text-2xl font-bold`}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-card border border-surface-border p-4 rounded-xl">
                    <h2 className="text-text font-bold mb-4">Problems by Difficulty</h2>
                    {stats?.problems?.totalProblems > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={difficultyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                                    {difficultyData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#08273E', border: 'none', borderRadius: '8px', color: '#EDF2F4' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-text-muted text-center py-16">No problems added yet</p>
                    )}
                </div>

                <div className="bg-surface-card border border-surface-border p-4 rounded-xl">
                    <h2 className="text-text font-bold mb-4">Progress by Topic</h2>
                    {stats?.topicWiseProblems?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={stats.topicWiseProblems}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#8A8580" opacity={0.3} />
                                <XAxis dataKey="topic" stroke="#8A8580" />
                                <YAxis allowDecimals={false} stroke="#8A8580" />
                                <Tooltip contentStyle={{ backgroundColor: '#08273E', border: 'none', borderRadius: '8px', color: '#EDF2F4' }} />
                                <Bar dataKey="count" fill="#014F86" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-text-muted text-center py-16">No topics added yet</p>
                    )}
                </div>
            </div>

            {/* Weak Topics + Daily Goal Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-card border border-surface-border p-4 rounded-xl">
                    <h2 className="text-text font-bold mb-4">Weak Topics</h2>
                    {stats?.weakTopics?.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {stats.weakTopics.map((t, i) => (
                                <div key={i} className="flex items-center gap-2 text-text text-sm">
                                    <AlertTriangle size={14} className="text-danger" />
                                    {t.topic}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-muted text-sm">No weak topics right now — nice work!</p>
                    )}
                </div>

                <div className="bg-surface-card border border-surface-border p-4 rounded-xl">
                    <h2 className="text-text font-bold mb-4">Daily Goal</h2>
                    {goalData ? (
                        <>
                            <div className="w-full bg-surface-bg rounded-full h-3 mb-2 overflow-hidden">
                                <div
                                    className="bg-brand h-3 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, ((goalData.solvedToday || 0) / (goalData.target || 1)) * 100)}%` }}
                                />
                            </div>
                            <p className="text-text-muted text-sm">
                                {goalData.solvedToday || 0} / {goalData.target || 0} solved today
                            </p>
                        </>
                    ) : (
                        <p className="text-text-muted text-sm">No goal set for today</p>
                    )}
                </div>
            </div>

            {/* Recent Problems Table */}
            <div className="bg-surface-card border border-surface-border p-4 rounded-xl">
                <h2 className="text-text font-bold mb-4">Recent Problems</h2>
                {recentProblems.length > 0 ? (
                    <div className="flex flex-col divide-y divide-surface-border">
                        {recentProblems.map((p) => (
                            <div key={p._id} className="flex items-center justify-between py-3 text-sm">
                                <span className="text-text font-medium">{p.name}</span>
                                <span className={`text-xs px-2 py-1 rounded-full text-white ${
                                    p.difficulty === 'Easy' ? 'bg-success' : p.difficulty === 'Medium' ? 'bg-warning' : 'bg-danger'
                                }`}>
                                    {p.difficulty}
                                </span>
                                <span className="text-text-muted">{getRelativeDate(p.createdAt)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-muted text-center py-4">No problems solved yet</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;;