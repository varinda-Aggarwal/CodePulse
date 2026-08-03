import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
    Search, Plus, ExternalLink, StickyNote, Pencil, Trash2,
    RotateCcw, CheckCircle2, ArrowLeft, ArrowRight, FileText, X
} from 'lucide-react';

const emptyForm = {
    name: '', link: '', difficulty: 'Easy', topic: '', notes: '',
    timeComplexity: '', spaceComplexity: '', approach: '', status: 'Solved'
};

const Problems = () => {
    const [problems, setProblems] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [showModal, setShowModal] = useState(false);
    const [editProblem, setEditProblem] = useState(null);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [isEditingDetail, setIsEditingDetail] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notesTarget, setNotesTarget] = useState(null);
    const [notesText, setNotesText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProblems, setTotalProblems] = useState(0);
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        fetchProblems();
        fetchTopics();
    }, []);

    const fetchProblems = async (params = {}) => {
        try {
            const { data } = await API.get('/problems', { params: { limit: 20, page: 1, sort: sortBy, ...params } });
            setProblems(data.problems || []);
            setCurrentPage(data.currentPage || 1);
            setTotalPages(data.totalPages || 1);
            setTotalProblems(data.totalProblems || 0);
        } catch (error) {
            toast.error('Failed to load problems');
        }
        setLoading(false);
    };

    const fetchTopics = async () => {
        try {
            const { data } = await API.get('/topics');
            setTopics(data);
        } catch (error) {}
    };

    const handleSearch = () => {
        fetchProblems({ search, difficulty: filterDifficulty, sort: sortBy, page: 1 });
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        fetchProblems({ search, difficulty: filterDifficulty, sort: value, page: 1 });
    };

    const openAddModal = () => {
        setEditProblem(null);
        setFormData(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (problem) => {
        setEditProblem(problem);
        setFormData({
            name: problem.name,
            link: problem.link || '',
            difficulty: problem.difficulty,
            topic: problem.topic?._id || '',
            notes: problem.notes || '',
            timeComplexity: problem.timeComplexity || '',
            spaceComplexity: problem.spaceComplexity || '',
            approach: problem.approach || '',
            status: problem.status || 'Solved'
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditProblem(null);
        setFormData(emptyForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editProblem) {
                const { data } = await API.put(`/problems/${editProblem._id}`, formData);
                if (selectedProblem?._id === editProblem._id) setSelectedProblem(data);
                toast.success('Problem updated!');
                closeModal();
                fetchProblems({ search, difficulty: filterDifficulty, sort: sortBy, page: currentPage });
            } else {
                await API.post('/problems', formData);
                toast.success('Problem added!');
                closeModal();
                fetchProblems({ search, difficulty: filterDifficulty, sort: sortBy, page: 1 });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/problems/${id}`);
            setProblems(problems.filter(p => p._id !== id));
            toast.success('Problem deleted!');
            setSelectedProblem(null);
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleRevision = async (id, current) => {
        try {
            const { data } = await API.put(`/problems/${id}`, { needsRevision: !current });
            setProblems(problems.map(p => p._id === id ? { ...p, needsRevision: data.needsRevision } : p));
            if (selectedProblem?._id === id) setSelectedProblem({ ...selectedProblem, needsRevision: data.needsRevision });
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const goToPage = (pageNum) => {
        if (pageNum < 1 || pageNum > totalPages) return;
        fetchProblems({ search, difficulty: filterDifficulty, sort: sortBy, page: pageNum });
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
        if (!dateStr) return null;
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

    const difficultyBadge = (difficulty) => {
        if (difficulty === 'Easy') return 'bg-success-light text-success-text';
        if (difficulty === 'Medium') return 'bg-warning-light text-warning-text';
        return 'bg-danger-light text-danger-text';
    };

    const cardClass = "bg-surface-card border border-surface-border rounded-2xl shadow-md hover:shadow-lg hover:border-[#AECDEA] hover:-translate-y-1 transition-all duration-300";

    if (loading) return <div className="text-text text-center mt-10">Loading...</div>;

    // Detail View
    if (selectedProblem) {
        return (
            <div>
                <button onClick={() => { setSelectedProblem(null); setIsEditingDetail(false); }} className="flex items-center gap-1.5 text-text-muted hover:text-text mb-4 text-sm">
                    <ArrowLeft size={16} /> Back to Problems
                </button>
                <div className={`${cardClass} p-6`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-text">{selectedProblem.name}</h2>
                            <div className="flex gap-2 mt-2 items-center">
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${difficultyBadge(selectedProblem.difficulty)}`}>
                                    {selectedProblem.difficulty}
                                </span>
                                {selectedProblem.topic && <span className="text-text-muted text-sm">{selectedProblem.topic.name}</span>}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => openNotesModal(selectedProblem)} className="p-2 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition"><StickyNote size={18} /></button>
                            <button onClick={() => openEditModal(selectedProblem)} className="p-2 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition"><Pencil size={18} /></button>
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
                </div>
                {showNotesModal && (
                    <NotesModal notesTarget={notesTarget} notesText={notesText} setNotesText={setNotesText} handleSaveNotes={handleSaveNotes} onClose={() => { setShowNotesModal(false); setNotesTarget(null); }} />
                )}
                {showModal && (
                    <ProblemFormModal
                        formData={formData} setFormData={setFormData} topics={topics}
                        isEdit={!!editProblem} onSubmit={handleSubmit} onClose={closeModal}
                    />
                )}
            </div>
        );
    }

    // Main List View
    return (
        <div>
            <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-text">Problem Log</h1>
                    <p className="text-text-muted mt-1">Track, organize and review your DSA problems.</p>
                </div>
                {totalProblems > 0 && (
                    <div className="flex items-center gap-3 text-text-muted text-sm">
                        <p>Page {currentPage} of {totalPages} </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="bg-surface-card border border-surface-border hover:bg-brand hover:text-white hover:border-brand disabled:opacity-30 disabled:hover:bg-surface-card disabled:hover:text-text-muted disabled:cursor-not-allowed text-text font-bold text-lg px-4 py-1.5 rounded-lg transition"
                            >
                                &lt;
                            </button>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="bg-surface-card border border-surface-border hover:bg-brand hover:text-white hover:border-brand disabled:opacity-30 disabled:hover:bg-surface-card disabled:hover:text-text-muted disabled:cursor-not-allowed text-text font-bold text-lg px-4 py-1.5 rounded-lg transition"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Search + Filter + Sort + Add */}
            <div className="bg-surface-card border border-surface-border rounded-2xl p-3 mb-6 flex flex-col md:flex-row gap-2 items-stretch">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full bg-[#EAECF1] text-text pl-9 pr-3 py-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                    />
                </div>
                <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="bg-surface-bg text-text px-2 py-2 rounded-lg border border-surface-border text-sm w-32 flex-shrink-0"
                >
                    <option value="">All Difficulty</option>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="bg-surface-bg text-text px-2 py-2 rounded-lg border border-surface-border text-sm w-32 flex-shrink-0"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
                <button
                    onClick={handleSearch}
                    className="bg-[#E0E3EB] hover:bg-[#CDD1DE] text-text px-5 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap"
                >
                    Search
                </button>
                <button
                    onClick={openAddModal}
                    className="flex items-center justify-center gap-1.5 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap"
                >
                    <Plus size={16} /> Add Problem
                </button>
            </div>

            {/* Problems List */}
            {problems.length === 0 ? (
                <div className={`${cardClass} p-12 flex flex-col items-center justify-center text-center`}>
                    <FileText size={40} className="text-text-muted mb-3" />
                    <p className="text-text font-bold text-lg mb-1">No Problems Yet</p>
                    <p className="text-text-muted text-sm">Add your first problem to get started.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {problems.map((problem) => (
                        <div
                            key={problem._id}
                            onClick={() => setSelectedProblem(problem)}
                            className={`${cardClass} p-3 cursor-pointer`}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {problem.needsRevision ? (
                                        <CheckCircle2 size={28} className="text-warning flex-shrink-0" />
                                    ) : problem.status === 'Solved' ? (
                                        <CheckCircle2 size={28} className="text-success flex-shrink-0" />
                                    ) : (
                                        <CheckCircle2 size={28} className="text-text-muted/60 flex-shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-text font-semibold truncate">{problem.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-text-muted text-sm">
                                                {problem.difficulty} {problem.topic && `• ${problem.topic.name}`}
                                            </p>
                                            {problem.needsRevision && (
                                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-warning-light text-warning-text">
                                                    Needs Revision
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {problem.link && (
                                        
                                          <a href={problem.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1 text-brand hover:underline text-xs font-bold bg-surface-bg px-2 py-1.5 rounded-lg"
                                        >
                                            <ExternalLink size={12} /> Open Link
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
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <ProblemFormModal
                    formData={formData} setFormData={setFormData} topics={topics}
                    isEdit={!!editProblem} onSubmit={handleSubmit} onClose={closeModal}
                />
            )}
            {showNotesModal && (
                <NotesModal notesTarget={notesTarget} notesText={notesText} setNotesText={setNotesText} handleSaveNotes={handleSaveNotes} onClose={() => { setShowNotesModal(false); setNotesTarget(null); }} />
            )}
        </div>
    );
};

const ProblemFormModal = ({ formData, setFormData, topics, isEdit, onSubmit, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-surface-card border border-surface-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-text font-bold text-lg">{isEdit ? 'Edit Problem' : 'Add New Problem'}</h3>
                <button onClick={onClose} className="text-text-muted hover:text-text"><X size={20} /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-3">
                <input type="text" placeholder="Problem name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-surface-bg text-text p-3 rounded-lg border border-surface-border" required />
                <input type="url" placeholder="Problem link *" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} className="w-full bg-surface-bg text-text p-3 rounded-lg border border-surface-border" required />
                <div className="flex gap-3">
                    <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="bg-surface-bg text-text p-3 rounded-lg border border-surface-border flex-1">
                        <option>Easy</option><option>Medium</option><option>Hard</option>
                    </select>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="bg-surface-bg text-text p-3 rounded-lg border border-surface-border flex-1">
                        <option>Solved</option><option>In Progress</option><option>To Do</option>
                    </select>
                </div>
                <select value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} className="w-full bg-surface-bg text-text p-3 rounded-lg border border-surface-border" required>
                    <option value="">Select Topic *</option>
                    {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <input type="text" placeholder="Approach used" value={formData.approach} onChange={(e) => setFormData({ ...formData, approach: e.target.value })} className="w-full bg-surface-bg text-text p-3 rounded-lg border border-surface-border" />
                <div className="flex gap-3">
                    <input type="text" placeholder="Time Complexity" value={formData.timeComplexity} onChange={(e) => setFormData({ ...formData, timeComplexity: e.target.value })} className="bg-surface-bg text-text p-3 rounded-lg border border-surface-border flex-1" />
                    <input type="text" placeholder="Space Complexity" value={formData.spaceComplexity} onChange={(e) => setFormData({ ...formData, spaceComplexity: e.target.value })} className="bg-surface-bg text-text p-3 rounded-lg border border-surface-border flex-1" />
                </div>
                <textarea placeholder="Additional notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-surface-bg text-text p-3 rounded-lg border border-surface-border" rows={3} />
                <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-brand hover:bg-brand-hover text-white py-3 rounded-lg font-semibold">
                        {isEdit ? 'Update Problem' : 'Add Problem'}
                    </button>
                    <button type="button" onClick={onClose} className="flex-1 bg-surface-bg hover:bg-surface-border text-text py-3 rounded-lg font-semibold">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
);

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

export default Problems;