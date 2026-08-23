import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Search, ArrowUpDown, ExternalLink, StickyNote,
    Pencil, Trash2, RotateCcw, CheckCircle2, FolderOpen
} from 'lucide-react';

const emptyForm = {
    name: '', link: '', difficulty: 'Easy', topic: '', notes: '',
    timeComplexity: '', spaceComplexity: '', approach: '', status: 'Solved'
};

const TopicProblems = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [topic, setTopic] = useState(null);
    const [problems, setProblems] = useState([]);
    const [allTopics, setAllTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editProblem, setEditProblem] = useState(null);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notesTarget, setNotesTarget] = useState(null);
    const [notesText, setNotesText] = useState('');
    const [formData, setFormData] = useState({ ...emptyForm, topic: id });

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchData = async (searchTerm = '', sort = sortBy) => {
        setLoading(true);
        try {
            const [topicsRes, problemsRes] = await Promise.all([
                API.get('/topics'),
                API.get('/problems', { params: { topic: id, limit: 100, search: searchTerm, sort } })
            ]);
            setAllTopics(topicsRes.data);
            const currentTopic = topicsRes.data.find(t => t._id === id);
            setTopic(currentTopic);
            setProblems(problemsRes.data.problems || []);
        } catch (error) {
            toast.error('Failed to load topic problems');
        }
        setLoading(false);
    };

    const handleSearch = () => fetchData(search, sortBy);

    const handleSortChange = (value) => {
        setSortBy(value);
        fetchData(search, value);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            if (editProblem) {
                const { data } = await API.put(`/problems/${editProblem._id}`, formData);
                setProblems(problems.map(p => p._id === editProblem._id ? data : p));
                setSelectedProblem(data);
                toast.success('Problem updated!');
                setEditProblem(null);
                setIsEditing(false);
            } else {
                const { data } = await API.post('/problems', formData);
                setProblems([data, ...problems]);
                toast.success('Problem added!');
            }
            setFormData({ ...emptyForm, topic: id });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        }
    };

    const handleEdit = (problem) => {
        setEditProblem(problem);
        setFormData({
            name: problem.name,
            link: problem.link || '',
            difficulty: problem.difficulty,
            topic: problem.topic?._id || id,
            notes: problem.notes || '',
            timeComplexity: problem.timeComplexity || '',
            spaceComplexity: problem.spaceComplexity || '',
            approach: problem.approach || '',
            status: problem.status || 'Solved'
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditProblem(null);
        setFormData({ ...emptyForm, topic: id });
    };

    const handleDelete = async (pid) => {
        try {
            await API.delete(`/problems/${pid}`);
            setProblems(problems.filter(p => p._id !== pid));
            toast.success('Problem deleted!');
            setSelectedProblem(null);
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleRevision = async (pid, current) => {
        try {
            const { data } = await API.put(`/problems/${pid}`, { needsRevision: !current });
            setProblems(problems.map(p => p._id === pid ? { ...p, needsRevision: data.needsRevision } : p));
            if (selectedProblem?._id === pid) setSelectedProblem({ ...selectedProblem, needsRevision: data.needsRevision });
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const openNotesModal = (problem) => {
        setNotesTarget(problem);
        setNotesText(problem.notes || '');
        setShowNotesModal(true);
    };

    const handleSaveNotes = async () => {
        try {
            const { data } = await API.put(`/problems/${notesTarget._id}`, { notes: notesText });
            setProblems(problems.map(p => p._id === notesTarget._id ? data : p));
            if (selectedProblem?._id === notesTarget._id) setSelectedProblem(data);
            toast.success('Notes saved!');
            setShowNotesModal(false);
            setNotesTarget(null);
        } catch (error) {
            toast.error('Failed to save notes');
        }
    };

    const getRelativeDate = (dateStr) => {
        if (!dateStr) return 'Not solved yet';
        const date = new Date(dateStr);
        const today = new Date();
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diffDays = Math.round((todayOnly - dateOnly) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    };

    if (loading) return <div className="text-text text-center mt-10">Loading...</div>;

    const cardClass = "bg-surface-card border border-surface-border rounded-2xl shadow-md hover:shadow-lg hover:border-[#AECDEA] hover:-translate-y-1 transition-all duration-300";

    const solvedCount = problems.filter(p => p.status === 'Solved').length;
    const lastActivityDate = problems.reduce((latest, p) => {
        const candidateDates = [p.createdAt, p.dateSolved].filter(Boolean).map(d => new Date(d));
        const maxCandidate = candidateDates.length ? new Date(Math.max(...candidateDates)) : null;
        if (!maxCandidate) return latest;
        if (!latest || maxCandidate > latest) return maxCandidate;
        return latest;
    }, null);
    const lastUpdated = lastActivityDate ? getRelativeDate(lastActivityDate) : null;

    const difficultyBadge = (difficulty) => {
        if (difficulty === 'Easy') return 'bg-success-light text-success-text';
        if (difficulty === 'Medium') return 'bg-warning-light text-warning-text';
        return 'bg-danger-light text-danger-text';
    };

    // Problem Detail View
    if (selectedProblem) {
        return (
            <div>
                <button onClick={() => { setSelectedProblem(null); setIsEditing(false); }} className="flex items-center gap-1.5 text-text-muted hover:text-text mb-4 text-sm">
                    <ArrowLeft size={16} /> Back to Problems
                </button>

                <div className={`${cardClass} p-6`}>
                    {isEditing ? (
                        <form onSubmit={handleAdd} className="space-y-3">
                            <h3 className="text-text font-bold mb-2">Edit Problem</h3>
                            <input type="text" placeholder="Problem name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-surface-bg text-text p-3 rounded-lg border border-surface-border" required />
                            <input type="url" placeholder="Problem link *" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} className="w-full bg-surface-bg text-text p-3 rounded-lg border border-surface-border" required />
                            <div className="flex flex-col sm:flex-row gap-3">
                                <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="bg-surface-bg text-text p-3 rounded-lg border border-surface-border flex-1">
                                    <option>Easy</option><option>Medium</option><option>Hard</option>
                                </select>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="bg-surface-bg text-text p-3 rounded-lg border border-surface-border flex-1">
                                    <option>Solved</option><option>In Progress</option><option>To Do</option>
                                </select>
                                <select value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} className="bg-surface-bg text-text p-3 rounded-lg border border-surface-border flex-1" required>
                                    <option value="">Select Topic *</option>
                                    {allTopics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>
                            <input type="text" placeholder="Approach used" value={formData.approach} onChange={(e) => setFormData({ ...formData, approach: e.target.value })} className="w-full bg-surface-bg text-text p-3 rounded-lg border border-surface-border" />
                            <div className="flex gap-3">
                                <input type="text" placeholder="Time Complexity" value={formData.timeComplexity} onChange={(e) => setFormData({ ...formData, timeComplexity: e.target.value })} className="bg-surface-bg text-text p-3 rounded-lg border border-surface-border flex-1" />
                                <input type="text" placeholder="Space Complexity" value={formData.spaceComplexity} onChange={(e) => setFormData({ ...formData, spaceComplexity: e.target.value })} className="bg-surface-bg text-text p-3 rounded-lg border border-surface-border flex-1" />
                            </div>
                            <textarea placeholder="Additional notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-surface-bg text-text p-3 rounded-lg border border-surface-border" rows={3} />
                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 bg-brand hover:bg-brand-hover text-white py-3 rounded-lg font-semibold">Update Problem</button>
                                <button type="button" onClick={handleCancel} className="flex-1 bg-surface-bg hover:bg-surface-border text-text py-3 rounded-lg font-semibold">Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-text">{selectedProblem.name}</h2>
                                    <div className="flex gap-2 mt-2 items-center">
                                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${difficultyBadge(selectedProblem.difficulty)}`}>
                                            {selectedProblem.difficulty}
                                        </span>
                                        <span className="text-text-muted text-sm">{selectedProblem.status}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openNotesModal(selectedProblem)} className="p-2 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition"><StickyNote size={18} /></button>
                                    <button onClick={() => handleEdit(selectedProblem)} className="p-2 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition"><Pencil size={18} /></button>
                                    <button onClick={() => handleRevision(selectedProblem._id, selectedProblem.needsRevision)} className={`p-2 rounded-lg transition ${selectedProblem.needsRevision ? 'text-warning bg-warning-light' : 'text-text-muted hover:bg-surface-bg'}`}><RotateCcw size={18} /></button>
                                    <button onClick={() => handleDelete(selectedProblem._id)} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger-light transition"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            {selectedProblem.link && (
                                <a href={selectedProblem.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-lg text-sm mb-4 hover:bg-brand-hover">
                                    <ExternalLink size={14} /> Open Problem Link
                                </a>
                            )}
                            {selectedProblem.approach && (
                                <div className="mb-4">
                                    <h3 className="text-text font-semibold mb-1">Approach</h3>
                                    <p className="text-text-muted bg-surface-bg p-3 rounded-lg">{selectedProblem.approach}</p>
                                </div>
                            )}
                            <div className="mb-4">
                                <h3 className="text-text font-semibold mb-1">Notes</h3>
                                <div className="flex items-start justify-between gap-3 bg-surface-bg p-3 rounded-lg">
                                    {selectedProblem.notes ? (
                                        <p className="text-text-muted whitespace-pre-wrap flex-1">{selectedProblem.notes}</p>
                                    ) : (
                                        <p className="text-text-muted italic flex-1">No notes yet.</p>
                                    )}
                                    <button onClick={() => openNotesModal(selectedProblem)} className="text-brand hover:opacity-70 shrink-0"><Pencil size={16} /></button>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                {selectedProblem.timeComplexity && (
                                    <div className="bg-surface-bg p-3 rounded-lg flex-1">
                                        <p className="text-text-muted text-xs">Time Complexity</p>
                                        <p className="text-text font-semibold">{selectedProblem.timeComplexity}</p>
                                    </div>
                                )}
                                {selectedProblem.spaceComplexity && (
                                    <div className="bg-surface-bg p-3 rounded-lg flex-1">
                                        <p className="text-text-muted text-xs">Space Complexity</p>
                                        <p className="text-text font-semibold">{selectedProblem.spaceComplexity}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {showNotesModal && (
                    <NotesModal notesTarget={notesTarget} notesText={notesText} setNotesText={setNotesText} handleSaveNotes={handleSaveNotes} onClose={() => { setShowNotesModal(false); setNotesTarget(null); }} />
                )}
            </div>
        );
    }

    // Main List View
    return (
        <div>
            <button onClick={() => navigate('/topics')} className="flex items-center gap-1.5 text-text-muted hover:text-text mb-4 text-sm">
                <ArrowLeft size={16} /> Topics
            </button>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-text flex items-center gap-2">
                    <FolderOpen size={26} className="text-brand" />
                    {topic?.name || 'Topic'}
                </h1>
                <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-text-muted mt-2">
                    <span>{problems.length} Problems</span>
                    <span className="text-text-muted/50">•</span>
                    <span>{solvedCount} Solved</span>
                    {lastUpdated && (
                        <>
                            <span className="text-text-muted/50">•</span>
                            <span>Last updated {lastUpdated}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Search + Sort */}
            <div className="bg-surface-card border border-surface-border rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search problem..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full bg-[#EAECF1] text-text pl-9 pr-3 py-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="bg-[#E0E3EB] hover:bg-[#CDD1DE] text-text px-5 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap"
                >
                    Search
                </button>
                <div className="relative">
                    <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="bg-surface-bg text-text pl-8 pr-3 py-2.5 rounded-lg border border-surface-border text-sm"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Problems List */}
            {problems.length === 0 ? (
                <div className={`${cardClass} p-12 flex flex-col items-center justify-center text-center`}>
                    <FolderOpen size={40} className="text-text-muted mb-3" />
                    <p className="text-text font-bold text-lg mb-1">No Problems Yet</p>
                    <p className="text-text-muted text-sm">Add your first problem under this topic.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {problems.map((problem) => (
                        <div
                            key={problem._id}
                            onClick={() => setSelectedProblem(problem)}
                            className={`${cardClass} p-3 cursor-pointer flex items-center justify-between gap-4`}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                               {problem.needsRevision ? (
                                    <CheckCircle2 size={26} className="text-warning flex-shrink-0" />
                                ) : problem.status === 'Solved' ? (
                                    <CheckCircle2 size={26} className="text-success flex-shrink-0" />
                                ) : (
                                    <CheckCircle2 size={26} className="text-text-muted/60 flex-shrink-0" />
                                )}
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-text font-semibold truncate" style={{ boxShadow: '0 2px 4px -1px rgba(37,99,235,0.35)' }}>{problem.name}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${difficultyBadge(problem.difficulty)}`}>
                                            {problem.difficulty}
                                        </span>
                                        {problem.needsRevision && (
                                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-warning-light text-warning-text flex-shrink-0">
                                                Revision
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-text-muted text-xs mt-0.5">
                                        {problem.status === 'Solved'
                                            ? `Last Solved: ${getRelativeDate(problem.dateSolved)}`
                                            : problem.status === 'In Progress' ? 'In Progress' : 'Not Solved Yet'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                                {problem.link && (
                                    
                                       <a href={problem.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-1 text-brand hover:underline text-xs font-bold bg-surface-bg px-2 py-1.5 rounded-lg"
                                    >
                                        <ExternalLink size={12} /> Link
                                    </a>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); openNotesModal(problem); }}
                                    className="flex items-center gap-1 text-text-muted hover:text-brand text-xs font-bold bg-surface-bg px-2 py-1.5 rounded-lg"
                                >
                                    <StickyNote size={12} /> Notes
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showNotesModal && (
                <NotesModal notesTarget={notesTarget} notesText={notesText} setNotesText={setNotesText} handleSaveNotes={handleSaveNotes} onClose={() => { setShowNotesModal(false); setNotesTarget(null); }} />
            )}
        </div>
    );
};

const NotesModal = ({ notesTarget, notesText, setNotesText, handleSaveNotes, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-surface-card border border-surface-border rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-text font-bold text-lg mb-3">Notes — {notesTarget?.name}</h3>
            <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Apni detailed notes, approach, edge cases yaha likho..."
                className="w-full bg-surface-bg text-text p-3 rounded-lg border border-surface-border"
                rows={10}
                autoFocus
            />
            <div className="flex gap-3 mt-3">
                <button onClick={handleSaveNotes} className="flex-1 bg-brand hover:bg-brand-hover text-white py-3 rounded-lg font-semibold">Save Notes</button>
                <button onClick={onClose} className="flex-1 bg-surface-bg hover:bg-surface-border text-text py-3 rounded-lg font-semibold">Close</button>
            </div>
        </div>
    </div>
);

export default TopicProblems;