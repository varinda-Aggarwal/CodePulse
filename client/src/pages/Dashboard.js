import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
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
    const difficultyData = [
        { name: 'Easy', value: stats?.problems?.easyProblems || 0, color: '#22c55e' },
        { name: 'Medium', value: stats?.problems?.mediumProblems || 0, color: '#eab308' },
        { name: 'Hard', value: stats?.problems?.hardProblems || 0, color: '#ef4444' }
    ];

    if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

    return (
    <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Total Topics</p>
                    <p className="text-white text-2xl font-bold">{stats?.topics?.totalTopics || 0}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Completed</p>
                    <p className="text-green-400 text-2xl font-bold">{stats?.topics?.completedTopics || 0}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Total Problems</p>
                    <p className="text-blue-400 text-2xl font-bold">{stats?.problems?.totalProblems || 0}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Weak Topics</p>
                    <p className="text-red-400 text-2xl font-bold">{stats?.weakTopics?.length || 0}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Needs Revision</p>
                    <p className="text-yellow-400 text-2xl font-bold">{stats?.revisionTopics?.length || 0}</p>
                </div>
            </div>

           {/* Difficulty Breakdown Chart */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <h2 className="text-white font-bold mb-4">Problems by Difficulty</h2>
                {stats?.problems?.totalProblems > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={difficultyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {difficultyData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-400 text-center">No problems added yet — solve some to see the chart!</p>
                )}
            </div>

            {/* Topic-wise Problems Chart */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <h2 className="text-white font-bold mb-4">Problems per Topic</h2>
                {stats?.topicWiseProblems?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.topicWiseProblems}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="topic" stroke="#9ca3af" />
                            <YAxis allowDecimals={false} stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-400 text-center">No topics added yet — add some to see the chart!</p>
                )}
            </div>

            {/* Topics Needing Revision */}
            {stats?.revisionTopics?.length > 0 && (
                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                    <h2 className="text-white font-bold mb-2">Topics Needing Revision</h2>
                    {stats.revisionTopics.map((t, i) => (
                        <span key={i} className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm mr-2">{t.name}</span>
                    ))}
                </div>
            )}

            {/* Problems Needing Revision */}
            {stats?.revisionProblems?.length > 0 && (
                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                    <h2 className="text-white font-bold mb-2">Problems Needing Revision</h2>
                    {stats.revisionProblems.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                            <span className="text-white">{p.name}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${p.difficulty === 'Easy' ? 'bg-green-600' : p.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'} text-white`}>{p.difficulty}</span>
                            {p.topic && <span className="text-gray-400 text-sm">{p.topic.name}</span>}
                        </div>
                    ))}
                </div>
            )}

            {/* Weak Topics */}
            {stats?.weakTopics?.length > 0 && (
                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                    <h2 className="text-white font-bold mb-2">Weak Topics</h2>
                    {stats.weakTopics.map((t, i) => (
                        <span key={i} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm mr-2">{t.topic}</span>
                    ))}
                </div>
            )}
        </div>
    </div>
);
};

export default Dashboard;