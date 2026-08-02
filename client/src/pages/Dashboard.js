import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    AlertTriangle, Sparkles, ArrowRight, Brain,
    PieChart as PieChartIcon, TrendingUp, Target, BookOpen, FileText,
    CheckCircle2, Code2, RotateCcw
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [goalData, setGoalData] = useState(null);
    const [recentProblems, setRecentProblems] = useState([]);
    const [aiPlan, setAiPlan] = useState(null);
    const [goalHistory, setGoalHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
        fetchGoal();
        fetchRecentProblems();
        fetchAiPlan();
        fetchGoalHistory();
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
            const { data } = await API.get('/goals');
            setGoalData(data);
        } catch (error) {}
    };

    const fetchGoalHistory = async () => {
        try {
            const today = new Date();
            const last7Dates = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                last7Dates.push(d);
            }

            // Last 7 days could span two different months — fetch whichever months are needed
            const monthsNeeded = new Set(
                last7Dates.map(d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
            );

            let allGoals = [];
            for (const monthKey of monthsNeeded) {
                const [year, month] = monthKey.split('-');
                const { data } = await API.get(`/goals/history?month=${month}&year=${year}`);
                allGoals = [...allGoals, ...data];
            }

            const goalsByDate = {};
            allGoals.forEach((g) => { goalsByDate[g.date] = g; });

            const chartData = last7Dates.map((d) => {
                const dateStr = d.toISOString().split('T')[0];
                const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
                const goal = goalsByDate[dateStr];
                const target = goal?.target || 0;
                const achieved = goal?.achieved || 0;

                let achievedColor = '#C7D4E0'; // no goal set that day — neutral grey
                if (target > 0) {
                    achievedColor = achieved >= target ? '#448853' : '#BBB144'; // green if complete, yellow if pending
                }

                return { day: dayLabel, target, achieved, achievedColor };
            });
            setGoalHistory(chartData);
        } catch (error) {}
    };

    const fetchRecentProblems = async () => {
        try {
            const { data } = await API.get('/problems?limit=100');
            const sorted = [...(data.problems || [])].sort((a, b) => {
                const dateA = new Date(a.dateSolved || a.createdAt);
                const dateB = new Date(b.dateSolved || b.createdAt);
                return dateB - dateA;
            });
            setRecentProblems(sorted.slice(0, 7));
        } catch (error) {}
    };

    const fetchAiPlan = async () => {
        try {
            const { data } = await API.get('/ai/study-plan/today');
            if (data.exists !== false) {
                setAiPlan(data);
            }
        } catch (error) {}
    };

    const difficultyData = [
        { name: 'Easy', value: stats?.problems?.easyProblems || 0, color: '#448853' },
        { name: 'Medium', value: stats?.problems?.mediumProblems || 0, color: '#BBB144' },
        { name: 'Hard', value: stats?.problems?.hardProblems || 0, color: '#B31919' }
    ];


    const getRelativeDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();

        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const diffDays = Math.round((todayOnly - dateOnly) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    if (loading) return <div className="text-text text-center mt-10">Loading...</div>;

    const statCards = [
        { label: 'Topics', value: stats?.topics?.totalTopics || 0, color: 'text-[#3F435A]', icon: BookOpen, iconColor: 'text-[#3F435A]', subtitle: `+${stats?.topicsThisWeek || 0} this week` },
        { label: 'Solved', value: stats?.problems?.totalProblems || 0, color: 'text-[#90AA55]', icon: CheckCircle2, iconColor: 'text-[#90AA55]', subtitle: goalData?.target > 0 ? `${Math.round((goalData.achieved / goalData.target) * 100)}% today's goal` : 'No goal set' },
        { label: 'Problems', value: stats?.problems?.totalProblems || 0, color: 'text-[#5986D9]', icon: Code2, iconColor: 'text-[#5986D9]', subtitle: `+${stats?.problemsThisWeek || 0} this week` },
        { label: 'Weak', value: stats?.weakTopics?.length || 0, color: 'text-[#C65A5A]', icon: AlertTriangle, iconColor: 'text-[#C65A5A]', subtitle: stats?.weakTopics?.length > 0 ? 'Needs revision' : 'None right now' },
        { label: 'Revision', value: stats?.revisionTopics?.length || 0, color: 'text-[#A49CC9]', icon: RotateCcw, iconColor: 'text-[#A49CC9]', subtitle: stats?.revisionTopics?.length === 0 ? 'Great job 🎉' : 'To revise' },
    ];

    return (
        <div>
            {/* Page Heading */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-text"> Dashboard </h1>
                <p className="text-text-muted mt-1"> Monitor your DSA progress and stay consistent every day. </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {statCards.map((card) => (
                    <div key={card.label} className="bg-surface-card border border-surface-border p-5 rounded-2xl shadow-md  hover:shadow-lg  hover:border-[#AECDEA]  hover:shadow-lg  hover:-translate-y-1  transition-all duration-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 min-h-[120px]">
                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                        <card.icon
                            size={18}
                            className={card.iconColor}
                        />
                    <span className={card.iconColor}>
                        {card.label}
                    </span>
                    </div>
                        <p className={`${card.color} text-[42px]  tracking-tight font-bold`}>{card.value}</p>
                        <p className="text-xs text-text-muted mt-1">{card.subtitle}</p>
                    </div>
                ))}
            </div>

            {/* AI Study Recommendation */}
            {aiPlan && aiPlan.studyPlan?.length > 0 ? (
                <div className="bg-surface-card border border-surface-border p-5 rounded-2xl shadow-md  hover:shadow-lg  hover:border-[#AECDEA]  hover:shadow-lg  hover:-translate-y-1  transition-all duration-300 hover:-translate-y-0.5 transition-all duration-200 mb-6 flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-brand/15 flex items-center justify-center flex-shrink-0">
                        <Brain size={24} className="text-brand" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-text font-bold mb-1">AI Study Plan</h2>
                        <p className="text-text text-sm font-medium mb-1">
                            Today's focus: {aiPlan.studyPlan[0].topic}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {aiPlan.studyPlan[0].problems?.slice(0, 3).map((p, i) => (
                                <span key={i} className="text-xs bg-surface-bg text-text-muted px-2 py-1 rounded-full">
                                    {p.name} · {p.difficulty}
                                </span>
                            ))}
                        </div>
                        
                        <a href="/study-plan"
                            className="inline-flex items-center gap-1 text-brand text-sm font-semibold hover:underline"
                       >
                            View Full Plan <ArrowRight size={14} />
                        </a>
                    </div>
                </div>
            ) : (
                <div className="bg-surface-card border border-surface-border p-5 rounded-2xl shadow-md  hover:shadow-lg  hover:border-[#AECDEA]  hover:shadow-lg  hover:-translate-y-1  transition-all duration-300 hover:-translate-y-0.5 transition-all duration-200 mb-6 flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-lg bg-brand/15 flex items-center justify-center flex-shrink-0">
                        <Brain size={20} className="text-brand" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-text font-bold mb-0.5">AI Study Plan</h2>
                        <p className="text-text-muted text-sm">No plan generated today.</p>
                    </div>
                    
                       <a href="/study-plan"
                        className="inline-flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-hover transition flex-shrink-0"
                       >
                        Generate Now <ArrowRight size={14} />
                    </a>
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-card border border-surface-border p-5 rounded-2xl shadow-md  hover:shadow-lg  hover:border-[#AECDEA]  hover:shadow-lg  hover:-translate-y-1  transition-all duration-300 hover:-translate-y-0.5 transition-all duration-200">
                    <h2 className="text-text font-bold mb-4 flex items-center justify-center gap-2">
                        <PieChartIcon size={18} className="text-brand" />
                        Problems by Difficulty
                    </h2>
                    {stats?.problems?.totalProblems > 0 ? (
                        <ResponsiveContainer width="100%" height={330}>
                            <PieChart>
                                <Pie data={difficultyData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} label>
                                    {difficultyData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#08273E', border: 'none', borderRadius: '8px', color: '#EDF2F4' }} />
                                <Legend align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-text-muted text-center py-16">No problems added yet</p>
                    )}
                </div>

                <div className="bg-surface-card border border-surface-border p-5 rounded-2xl shadow-md  hover:shadow-lg  hover:border-[#AECDEA]  hover:shadow-lg  hover:-translate-y-1  transition-all duration-300 hover:-translate-y-0.5 transition-all duration-200">
                    <h2 className="text-text font-bold mb-4 flex items-center justify-center gap-2">
                        <TrendingUp size={18} className="text-brand" />
                        Progress by Topic
                    </h2>
                    {stats?.topicWiseProblems?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={330}>
                            <BarChart data={stats.topicWiseProblems}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#8A8580" opacity={0.3} />
                                <XAxis dataKey="topic" stroke="#8A8580" />
                                <YAxis allowDecimals={false} stroke="#8A8580" />
                                <Tooltip
                                    cursor={{ fill: '#F5F8FC' }}
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload || !payload.length) return null;
                                        return (
                                            <div style={{
                                                backgroundColor: '#08273E',
                                                borderRadius: '8px',
                                                padding: '10px 14px',
                                            }}>
                                                <p style={{ color: '#FFFFFF', fontWeight: 600, fontSize: 14, margin: 0 }}>
                                                    {label}
                                                </p>
                                                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '6px 0' }} />
                                                <p style={{ color: '#9FB3C8', fontSize: 13, margin: 0 }}>
                                                    Solved Problems: {payload[0].value}
                                                </p>
                                            </div>
                                        );
                                    }}
                                />
                                <Bar dataKey="count" fill="#204E79" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-text-muted text-center py-16">No topics added yet</p>
                    )}
                </div>
            </div>

            {/* Weak Topics + Daily Goal Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-card border border-surface-border p-5 rounded-2xl shadow-md  hover:shadow-lg  hover:border-[#AECDEA]  hover:shadow-lg  hover:-translate-y-1  transition-all duration-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                    <h2 className="text-text font-bold mb-4 flex items-center justify-center gap-2">
                        <AlertTriangle size={18} className="text-danger" />
                        Weak Topics
                    </h2>
                   {stats?.weakTopics?.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {stats.weakTopics.map((t, i) => (
                                <span
                                    key={i}
                                    className="flex items-center gap-1.5 bg-danger-light text-danger-text text-sm font-medium px-3 py-2 rounded-lg w-full"
                                >
                                    <AlertTriangle size={14} />
                                    {t.topic}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-muted text-xs">No weak topics right now — nice work!</p>
                    )}
                </div>
                <div className="bg-surface-card border border-surface-border p-5 rounded-2xl shadow-md overflow-hidden hover:shadow-lg  hover:border-[#AECDEA]  hover:shadow-lg  hover:-translate-y-1  transition-all duration-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                
                    <h2 className="text-text font-bold mb-4 flex items-center justify-center gap-2">
                        <Target size={18} className="text-brand" />
                        Daily Goal
                    </h2>
                    {goalData && goalData.target > 0 ? (
                        <>
                        <div className="w-full bg-surface-bg rounded-full h-3 overflow-hidden mb-3">
                            <div className="bg-brand h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100,((goalData.achieved || 0) /(goalData.target || 1)) * 100)}%`,
                        }}
                    />
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-text-muted">
                        {goalData.achieved || 0} / {goalData.target || 0} solved today
                    </span>
                    <span className="font-semibold text-brand">
                        {Math.round(((goalData.achieved || 0) /(goalData.target || 1)) * 100)}%
                    </span>
                </div>
                    </>
                   ) : (
                <div className="flex items-center h-full">
                    <p className="text-text-muted text-sm"> No goal set for today </p>
                </div>
            )}

                    {/* Last 7 Days trend */}
                    <div className="mt-5 pt-4 border-t border-surface-border overflow-hidden" style={{ minHeight: 220 }}>
                        <p className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-2">Last 7 Days</p>
                        <div style={{ width: '100%', height: 160 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={goalHistory} barGap={2}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#8A8580" opacity={0.2} vertical={false} />
                                <XAxis dataKey="day" stroke="#8A8580" fontSize={12} />
                                <YAxis allowDecimals={false} stroke="#8A8580" fontSize={12} />
                                <Tooltip
                                    cursor={{ fill: '#F5F8FC' }}
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload || !payload.length) return null;
                                        const achieved = payload.find(p => p.dataKey === 'achieved')?.value ?? 0;
                                        const target = payload.find(p => p.dataKey === 'target')?.value ?? 0;
                                        return (
                                            <div style={{
                                                backgroundColor: '#08273E',
                                                borderRadius: '8px',
                                                padding: '10px 14px',
                                            }}>
                                                <p style={{ color: '#FFFFFF', fontWeight: 600, fontSize: 14, margin: 0 }}>
                                                    {label}
                                                </p>
                                                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '6px 0' }} />
                                                <p style={{ color: '#F5F8FC', fontSize: 13, margin: 0 }}>
                                                    Achieved : {achieved}
                                                </p>
                                                <p style={{ color: '#9FB3C8', fontSize: 13, margin: 0 }}>
                                                    Target : {target}
                                                </p>
                                            </div>
                                        );
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="target" name="Target" fill="#367096" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="achieved" name="Achieved" radius={[4, 4, 0, 0]}>
                                    {goalHistory.map((entry, index) => (
                                        <Cell key={index} fill={entry.achievedColor} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Problems Table */}
            <div className="bg-surface-card border border-surface-border p-5 rounded-2xl shadow-md  hover:shadow-lg  hover:border-[#AECDEA]  hover:shadow-lg  hover:-translate-y-1  transition-all duration-300 hover:-translate-y-0.5 transition-all duration-200">
               <h2 className="text-text font-bold mb-4 flex items-center justify-center gap-2">
                    <BookOpen size={18} className="text-brand" />
                    Recent Problems
                </h2>
                {recentProblems.length > 0 ? (
                    <div className="flex flex-col divide-y divide-surface-border">
                    {recentProblems.map((p) => (
                        <div key={p._id} className="grid grid-cols-3 items-center py-3 text-sm"
                    >
                    <span className="font-medium text-text"> {p.name} </span>
                    <span className={`justify-self-center px-3 py-1 rounded-full text-xs font-semibold 
                    ${p.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : p.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}
            >
                    {p.difficulty}
                </span>
                <span className="justify-self-end text-xs text-text-muted">
                    {p.dateSolved
                        ? getRelativeDate(p.dateSolved)
                        : p.status === 'In Progress' ? 'In Progress' : `${getRelativeDate(p.createdAt)}`}
                </span>
                    </div>
                ))}
            </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <FileText size={42} className="text-text-muted mb-3" />
                        <p className="text-text-muted text-sm mb-1">No recent activity yet.</p>
                        <a href="/problems" className="text-brand text-sm font-semibold hover:underline">
                            Solve your first problem →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;