import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
    BookOpen, CheckCircle2, Clock, RotateCcw, FolderOpen,
    Plus, Pencil, Trash2, Search, X, Check
} from 'lucide-react';

const Topics = () => {
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [problemCounts, setProblemCounts] = useState({});
    const [name, setName] = useState('');
    const [status, setStatus] = useState('Not Started');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('latest');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        fetchTopics();
        fetchProblemCounts();
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

    const fetchProblemCounts = async () => {
        try {
            const { data } = await API.get('/dashboard');
            const counts = {};
            (data.topicWiseProblems || []).forEach((t) => {
                counts[t.topic] = t.count;
            });
            setProblemCounts(counts);
        } catch (error) {}
    };

    const handleSearch = () => {
        fetchTopics({ search, sort: sortBy });
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        fetchTopics({ search, sort: value });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/topics', { name, status });
            setTopics([...topics, data]);
            setName('');
            setStatus('Not Started');
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

    const startEdit = (topic) => {
        setEditingId(topic._id);
        setEditName(topic.name);
    };

    const saveEdit = async (id) => {
        try {
            const { data } = await API.put(`/topics/${id}`, { name: editName });
            setTopics(topics.map(t => t._id === id ? data : t));
            setEditingId(null);
            toast.success('Topic renamed!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to rename topic');
        }
    };

    const getRelativeDate = (dateStr) => {
        const diffDays = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    };

    if (loading) return <div className="text-text text-center mt-10">Loading...</div>;

    const displayedTopics = statusFilter === 'all'
        ? topics
        : statusFilter === 'Revision'
            ? topics.filter(t => t.needsRevision)
            : topics.filter(t => t.status === statusFilter);

    const cardClass = "bg-surface-card border border-surface-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-200";

    return (
        <div>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-text flex items-center gap-2">
                    <BookOpen size={26} className="text-brand" />
                    Topics
                </h1>
                <p className="text-text-muted mt-1">Track your DSA roadmap and organize your learning journey.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className={`${cardClass} p-5 flex flex-col items-center justify-center text-center gap-2 min-h-[110px]`}>
                    <div className="flex items-center gap-1.5 text-text-muted text-sm font-semibold">
                        <BookOpen size={16} /> Total Topics
                    </div>
                    <p className="text-text text-3xl font-bold">{topics.length}</p>
                </div>
                <div className={`${cardClass} p-5 flex flex-col items-center justify-center text-center gap-2 min-h-[110px]`}>
                    <div className="flex items-center gap-1.5 text-success text-sm font-semibold">
                        <CheckCircle2 size={16} /> Completed
                    </div>
                    <p className="text-success text-3xl font-bold">{topics.filter(t => t.status === 'Done').length}</p>
                </div>
                <div className={`${cardClass} p-5 flex flex-col items-center justify-center text-center gap-2 min-h-[110px]`}>
                    <div className="flex items-center gap-1.5 text-warning text-sm font-semibold">
                        <Clock size={16} /> In Progress
                    </div>
                    <p className="text-warning text-3xl font-bold">{topics.filter(t => t.status === 'In Progress').length}</p>
                </div>
                <div className={`${cardClass} p-5 flex flex-col items-center justify-center text-center gap-2 min-h-[110px]`}>
                    <div className="flex items-center gap-1.5 text-danger text-sm font-semibold">
                        <RotateCcw size={16} /> Revision
                    </div>
                    <p className="text-danger text-3xl font-bold">{topics.filter(t => t.needsRevision).length}</p>
                </div>
            </div>

            {/* Search + Filter */}
            <div className={`${cardClass} p-4 mb-4 flex flex-col md:flex-row gap-3`}>
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search topic..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface-bg text-text pl-9 pr-3 py-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-brand"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-surface-bg text-text px-3 py-2.5 rounded-lg border border-surface-border"
                >
                    <option value="all">All Status</option>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                    <option value="Revision">Needs Revision</option>
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="bg-surface-bg text-text px-3 py-2.5 rounded-lg border border-surface-border"
                >
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="revision">Revision Marked First</option>
                </select>
                <button
                    onClick={handleSearch}
                    className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
                >
                    Search
                </button>
            </div>

            {/* Add Topic */}
            <div className={`${cardClass} p-4 mb-6`}>
                <h2 className="text-text font-bold mb-3 flex items-center gap-2">
                    <Plus size={18} className="text-brand" />
                    Add New Topic
                </h2>
                <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Topic name (e.g. Arrays)"
                        className="flex-1 bg-surface-bg text-text px-3 py-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-brand"
                        required
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-surface-bg text-text px-3 py-2.5 rounded-lg border border-surface-border"
                    >
                        <option>Not Started</option>
                        <option>In Progress</option>
                        <option>Done</option>
                    </select>
                    <button
                        type="submit"
                        className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition"
                    >
                        Add Topic
                    </button>
                </form>
            </div>

            {/* Topics List */}
            {displayedTopics.length === 0 ? (
                <div className={`${cardClass} p-12 flex flex-col items-center justify-center text-center`}>
                    <BookOpen size={40} className="text-text-muted mb-3" />
                    <p className="text-text font-bold text-lg mb-1">No Topics Yet</p>
                    <p className="text-text-muted text-sm mb-4">Start building your roadmap.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {displayedTopics.map((topic) => (
                        <div key={topic._id} className={`${cardClass} p-5`}>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="h-10 w-10 rounded-lg bg-brand/15 flex items-center justify-center flex-shrink-0">
                                        <FolderOpen size={20} className="text-brand" />
                                    </div>
                                    <div className="flex-1">
                                        {editingId === topic._id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="bg-surface-bg text-text px-2 py-1 rounded-lg border border-surface-border focus:outline-none focus:border-brand text-sm"
                                                    autoFocus
                                                />
                                                <button onClick={() => saveEdit(topic._id)} className="text-success hover:opacity-70">
                                                    <Check size={18} />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="text-text-muted hover:opacity-70">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <p
                                                className="text-text font-semibold cursor-pointer hover:underline"
                                                onClick={() => navigate(`/topics/${topic._id}`)}
                                            >
                                                {topic.name}
                                            </p>
                                        )}
                                        <p className="text-text-muted text-xs mt-0.5">
                                            Created {getRelativeDate(topic.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                    <div className="flex flex-col items-center">
                                        <span className="text-text-muted text-xs">Problems</span>
                                        <span className="text-text font-semibold">{problemCounts[topic.name] || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-text-muted text-xs">Revision</span>
                                        <span className={`font-semibold ${topic.needsRevision ? 'text-danger' : 'text-text-muted'}`}>
                                            {topic.needsRevision ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <select
                                        value={topic.status}
                                        onChange={(e) => handleStatusChange(topic._id, e.target.value)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border-none
                                            ${topic.status === 'Done' ? 'bg-success-light text-success-text' :
                                              topic.status === 'In Progress' ? 'bg-warning-light text-warning-text' :
                                              'bg-surface-bg text-text-muted'}`}
                                    >
                                        <option>Not Started</option>
                                        <option>In Progress</option>
                                        <option>Done</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => startEdit(topic)}
                                        title="Edit name"
                                        className="p-2 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleRevision(topic._id, topic.needsRevision)}
                                        title="Toggle revision"
                                        className={`p-2 rounded-lg transition ${topic.needsRevision ? 'text-warning bg-warning-light' : 'text-text-muted hover:bg-surface-bg'}`}
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(topic._id)}
                                        title="Delete"
                                        className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger-light transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Topics;