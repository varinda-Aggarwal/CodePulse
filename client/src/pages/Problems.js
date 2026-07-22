import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';

const Problems = () => {
    const [problems, setProblems] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editProblem, setEditProblem] = useState(null);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notesTarget, setNotesTarget] = useState(null);
    const [notesText, setNotesText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProblems, setTotalProblems] = useState(0);
    const [formData, setFormData] = useState({
        name: '', link: '', difficulty: 'Easy', topic: '', notes: '',
        timeComplexity: '', spaceComplexity: '', approach: ''
    });

    useEffect(() => {
        fetchProblems();
        fetchTopics();
    }, []);

    const fetchProblems = async (params = {}) => {
        try {
            const { data } = await API.get('/problems', { params: { limit: 50, page: 1, ...params } });
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
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = () => {
        fetchProblems({ search, difficulty: filterDifficulty, page: 1 });
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
                setFormData({ name: '', link: '', difficulty: 'Easy', topic: '', notes: '', timeComplexity: '', spaceComplexity: '', approach: '' });
                return;
            } else {
                const { data } = await API.post('/problems', formData);
                setProblems([data, ...problems]);
                toast.success('Problem added!');
            }
            setFormData({ name: '', link: '', difficulty: 'Easy', topic: '', notes: '', timeComplexity: '', spaceComplexity: '', approach: '' });
            setShowForm(false);
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
                topic: problem.topic?._id || '',
                notes: problem.notes || '',
                timeComplexity: problem.timeComplexity || '',
                spaceComplexity: problem.spaceComplexity || '',
                approach: problem.approach || ''
            });
            setIsEditing(true);
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

   const handleCancel = () => {
        setShowForm(false);
        setIsEditing(false);
        setEditProblem(null);
        setFormData({ name: '', link: '', difficulty: 'Easy', topic: '', notes: '', timeComplexity: '', spaceComplexity: '', approach: '' });
    };

    const goToPage = (pageNum) => {
        if (pageNum < 1 || pageNum > totalPages) return;
        fetchProblems({ search, difficulty: filterDifficulty, page: pageNum });
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

    if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <div className="max-w-5xl mx-auto p-6">

                {/* Problem Detail View */}
               {selectedProblem ? (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <button onClick={() => { setSelectedProblem(null); setIsEditing(false); }} className="text-gray-400 hover:text-white mb-4">← Back</button>

                        {isEditing ? (
                            <form onSubmit={handleAdd} className="space-y-3">
                                <h3 className="text-white font-bold mb-2">Edit Problem</h3>
                                <input type="text" placeholder="Problem name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-700 text-white p-3 rounded-lg" required />
                                <input type="url" placeholder="Problem link (LeetCode/GFG) *" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} className="w-full bg-gray-700 text-white p-3 rounded-lg" required />
                                <div className="flex gap-3">
                                    <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="bg-gray-700 text-white p-3 rounded-lg flex-1">
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                    <select value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} className="bg-gray-700 text-white p-3 rounded-lg flex-1" required>
                                        <option value="">Select Topic *</option>
                                        {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <input type="text" placeholder="Approach used" value={formData.approach} onChange={(e) => setFormData({ ...formData, approach: e.target.value })} className="w-full bg-gray-700 text-white p-3 rounded-lg" />
                                <div className="flex gap-3">
                                    <input type="text" placeholder="Time Complexity (e.g. O(n))" value={formData.timeComplexity} onChange={(e) => setFormData({ ...formData, timeComplexity: e.target.value })} className="bg-gray-700 text-white p-3 rounded-lg flex-1" />
                                    <input type="text" placeholder="Space Complexity (e.g. O(1))" value={formData.spaceComplexity} onChange={(e) => setFormData({ ...formData, spaceComplexity: e.target.value })} className="bg-gray-700 text-white p-3 rounded-lg flex-1" />
                                </div>
                                <textarea placeholder="Additional notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-gray-700 text-white p-3 rounded-lg" rows={3} />
                                <div className="flex gap-3">
                                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">Update Problem</button>
                                    <button type="button" onClick={handleCancel} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedProblem.name}</h2>
                                        <div className="flex gap-2 mt-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${selectedProblem.difficulty === 'Easy' ? 'bg-green-600' : selectedProblem.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'} text-white`}>
                                                {selectedProblem.difficulty}
                                            </span>
                                            {selectedProblem.topic && <span className="text-gray-400 text-sm">{selectedProblem.topic.name}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex gap-2">
                                            <button onClick={() => openNotesModal(selectedProblem)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm">📝 Notes</button>
                                            <button onClick={() => handleEdit(selectedProblem)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Edit</button>
                                            <button onClick={() => handleRevision(selectedProblem._id, selectedProblem.needsRevision)} className={`px-4 py-2 rounded-lg text-sm ${selectedProblem.needsRevision ? 'bg-yellow-600' : 'bg-gray-600'} text-white`}>
                                                {selectedProblem.needsRevision ? 'Revising' : 'Revise'}
                                            </button>
                                            <button onClick={() => handleDelete(selectedProblem._id)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Delete</button>
                                        </div>
                                    </div>
                                </div>
                                {selectedProblem.link && (
                                    <a href={selectedProblem.link} target="_blank" rel="noreferrer" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm mb-4 hover:bg-blue-700">
                                        Open Problem Link
                                    </a>
                                )}
                                {selectedProblem.approach && (
                                    <div className="mb-4">
                                        <h3 className="text-white font-semibold mb-1">Approach</h3>
                                        <p className="text-gray-300 bg-gray-700 p-3 rounded-lg">{selectedProblem.approach}</p>
                                    </div>
                                )}
                               <div className="mb-4">
                                    <h3 className="text-white font-semibold mb-1">Notes</h3>
                                    <div className="flex items-start justify-between gap-3 bg-gray-700 p-3 rounded-lg">
                                        {selectedProblem.notes ? (
                                            <p className="text-gray-300 whitespace-pre-wrap flex-1">{selectedProblem.notes}</p>
                                        ) : (
                                            <p className="text-gray-500 italic flex-1">No notes yet — click ✏️ to add.</p>
                                        )}
                                        <button onClick={() => openNotesModal(selectedProblem)} className="text-purple-400 hover:text-purple-300 shrink-0">
                                            ✏️
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    {selectedProblem.timeComplexity && (
                                        <div className="bg-gray-700 p-3 rounded-lg flex-1">
                                            <p className="text-gray-400 text-xs">Time Complexity</p>
                                            <p className="text-white font-semibold">{selectedProblem.timeComplexity}</p>
                                        </div>
                                    )}
                                    {selectedProblem.spaceComplexity && (
                                        <div className="bg-gray-700 p-3 rounded-lg flex-1">
                                            <p className="text-gray-400 text-xs">Space Complexity</p>
                                            <p className="text-white font-semibold">{selectedProblem.spaceComplexity}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-white">Problem Log</h1>
                            <button onClick={() => { setShowForm(!showForm); setEditProblem(null); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                                + Add Problem
                            </button>
                        </div>

                        {showForm && (
                            <form onSubmit={handleAdd} className="bg-gray-800 p-4 rounded-lg mb-6 space-y-3">
                                <h3 className="text-white font-bold">{editProblem ? 'Edit Problem' : 'Add New Problem'}</h3>
                                <input type="text" placeholder="Problem name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-700 text-white p-3 rounded-lg" required />
                                <input type="url" placeholder="Problem link (LeetCode/GFG) *" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} className="w-full bg-gray-700 text-white p-3 rounded-lg" required />
                                <div className="flex gap-3">
                                    <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="bg-gray-700 text-white p-3 rounded-lg flex-1">
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                    <select value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} className="bg-gray-700 text-white p-3 rounded-lg flex-1" required>
                                        <option value="">Select Topic *</option>
                                        {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <input type="text" placeholder="Approach used" value={formData.approach} onChange={(e) => setFormData({ ...formData, approach: e.target.value })} className="w-full bg-gray-700 text-white p-3 rounded-lg" />
                                <div className="flex gap-3">
                                    <input type="text" placeholder="Time Complexity (e.g. O(n))" value={formData.timeComplexity} onChange={(e) => setFormData({ ...formData, timeComplexity: e.target.value })} className="bg-gray-700 text-white p-3 rounded-lg flex-1" />
                                    <input type="text" placeholder="Space Complexity (e.g. O(1))" value={formData.spaceComplexity} onChange={(e) => setFormData({ ...formData, spaceComplexity: e.target.value })} className="bg-gray-700 text-white p-3 rounded-lg flex-1" />
                                </div>
                                <textarea placeholder="Additional notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-gray-700 text-white p-3 rounded-lg" rows={3} />
                                <div className="flex gap-3">
                                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
                                        {editProblem ? 'Update Problem' : 'Add Problem'}
                                    </button>
                                    <button type="button" onClick={handleCancel} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="flex gap-3 mb-4">
                            <input type="text" placeholder="Search problems..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-gray-700 text-white p-3 rounded-lg" />
                            <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="bg-gray-700 text-white p-3 rounded-lg">
                                <option value="">All Difficulty</option>
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                            <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-3 rounded-lg">Search</button>
                        </div>

                        <div className="space-y-3">
                            {problems.length === 0 && <p className="text-gray-400 text-center">No problems yet!</p>}
                            {problems.map(problem => (
                                <div key={problem._id} className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-750" onClick={() => setSelectedProblem(problem)}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-semibold">{problem.name}</p>
                                            <div className="flex gap-2 mt-1 items-center">
                                                <span className={`text-xs px-2 py-1 rounded-full ${problem.difficulty === 'Easy' ? 'bg-green-600' : problem.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'} text-white`}>
                                                    {problem.difficulty}
                                                </span>
                                                {problem.topic && <span className="text-gray-400 text-sm">{problem.topic?.name}</span>}
                                                {problem.link && (
                                                    <a href={problem.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-400 hover:underline text-sm bg-gray-700 px-2 py-1 rounded">
                                                        Open Link
                                                    </a>
                                                )}
                                                <button onClick={(e) => { e.stopPropagation(); openNotesModal(problem); }} className="text-purple-300 hover:underline text-sm bg-gray-700 px-2 py-1 rounded">
                                                    📝 Notes
                                                </button>
                                            </div>
                                            {problem.needsRevision && <span className="text-yellow-400 text-xs">Needs Revision</span>}
                                        </div>
                                        <p className="text-gray-500 text-xs">Click to view details</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalProblems > 0 && (
                            <div className="flex items-center justify-between mt-4 text-gray-400 text-sm">
                                <p>
                                    Showing page {currentPage} of {totalPages} ({totalProblems} total problems)
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage <= 1}
                                        className="bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg"
                                    >
                                        &lt;
                                    </button>
                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage >= totalPages}
                                        className="bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showNotesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                        <h3 className="text-white font-bold text-lg mb-3">
                            Notes — {notesTarget?.name}
                        </h3>
                        <textarea
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            placeholder="Apni detailed notes, approach, edge cases yaha likho..."
                            className="w-full bg-gray-700 text-white p-3 rounded-lg"
                            rows={10}
                            autoFocus
                        />
                        <div className="flex gap-3 mt-3">
                            <button onClick={handleSaveNotes} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg">
                                Save Notes
                            </button>
                            <button onClick={() => { setShowNotesModal(false); setNotesTarget(null); }} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Problems;