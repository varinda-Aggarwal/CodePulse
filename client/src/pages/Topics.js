import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';

const Topics = () => {
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [name, setName] = useState('');
    const [status, setStatus] = useState('Not Started');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('latest');


    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async (params = {}) => {
        try {
            const { data } = await API.get('/topics', { params });
            setTopics(data);
        } catch (error) {
            toast.error('Failed to load topics');
        }
        setLoading(false);
    };

    const handleSearch = () => {
        fetchTopics({ search, sort: sortBy });
    };

   const handleSortChange = (value) => {
        setSortBy(value);
        if (value === 'all') {
            setSearch('');
            fetchTopics({});
        } else {
            fetchTopics({ search, sort: value });
        }
    };


    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/topics', { name, status });
            setTopics([...topics, data]);
            setName('');
            toast.success('Topic added!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add topic');
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/topics/${id}`);
            setTopics(topics.filter(t => t._id !== id));
            toast.success('Topic deleted!');
        } catch (error) {
            toast.error('Failed to delete topic');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const { data } = await API.put(`/topics/${id}`, { 
                status: newStatus,
                completedAt: newStatus === 'Done' ? new Date() : null
            });
            setTopics(prev => prev.map(t => t._id === id ? { ...t, status: data.status, completedAt: data.completedAt } : t));
            toast.success('Status updated!');
        } catch (error) {
            toast.error('Failed to update status');
            console.error(error.response?.data);
        }
    };

    const handleRevision = async (id, current) => {
        try {
            const { data } = await API.put(`/topics/${id}`, { needsRevision: !current });
            setTopics(topics.map(t => t._id === id ? data : t));
            toast.success('Revision updated!');
        } catch (error) {
            toast.error('Failed to update revision');
        }
    };

    if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <div className="max-w-4xl mx-auto p-6">
               <h1 className="text-3xl font-bold text-white mb-6">Topic Tracker</h1>

                <div className="flex gap-3 mb-4">
                    <input
                        type="text"
                        placeholder="Search topic by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-gray-700 text-white p-3 rounded-lg"
                    />
                    <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="bg-gray-700 text-white p-3 rounded-lg"
                    >
                        <option value="all">All Topics</option>
                        <option value="latest">Latest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">Name (A-Z)</option>
                        <option value="revision">Revision Marked First</option>
                    </select>
                    <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-3 rounded-lg">
                        Search
                    </button>
                </div>

                <form onSubmit={handleAdd} className="bg-gray-800 p-4 rounded-lg mb-6 flex gap-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Topic name (e.g. Arrays)"
                        className="flex-1 bg-gray-700 text-white p-3 rounded-lg focus:outline-none"
                        required
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-gray-700 text-white p-3 rounded-lg focus:outline-none"
                    >
                        <option>Not Started</option>
                        <option>In Progress</option>
                        <option>Done</option>
                    </select>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
                        Add
                    </button>
                </form>
                <div className="space-y-3">
                    {topics.length === 0 && <p className="text-gray-400 text-center">No topics yet — add one!</p>}
                   {topics.map(topic => (
                        <div key={topic._id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                            <div className="cursor-pointer" onClick={() => navigate(`/topics/${topic._id}`)}>
                                <p className="text-white font-semibold hover:underline">📁 {topic.name}</p>
                                {topic.needsRevision && <span className="text-yellow-400 text-xs">Needs Revision</span>}
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={topic.status}
                                    onChange={(e) => handleStatusChange(topic._id, e.target.value)}
                                    className="bg-gray-700 text-white p-2 rounded-lg text-sm"
                                >
                                    <option>Not Started</option>
                                    <option>In Progress</option>
                                    <option>Done</option>
                                </select>
                                <button
                                    onClick={() => handleRevision(topic._id, topic.needsRevision)}
                                    className={`px-3 py-2 rounded-lg text-sm ${topic.needsRevision ? 'bg-yellow-600' : 'bg-gray-600'} text-white`}
                                >
                                    {topic.needsRevision ? 'Revising' : 'Revise'}
                                </button>
                                <button
                                    onClick={() => handleDelete(topic._id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
             </div>
            </div>

           </div>
    );
};

export default Topics;