import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Search, BookOpen, BrainCircuit, Bug, MessageCircle,
    ChevronRight, ChevronDown, Mail, Clock, Lightbulb, X, Send, Paperclip
} from 'lucide-react';

const ARTICLES = [
    { q: 'How is Weak Topic calculated?', a: 'Each topic gets a "mastery score" from its solved problems — Easy problems add 1 point, Medium adds 2, and Hard adds 3. If a topic\'s total score is below 7, it\'s marked "weak" and becomes a focus area for your AI Study Plan.' },
    { q: 'How does AI Study Plan work?', a: 'It looks at your weak topics and generates a day-by-day plan (3/7/14 days) with concepts to revise and problems to solve, powered by Gemini. Up to 2 generations per day.' },
    { q: 'How to add a problem?', a: 'Go to Problems, click the "+" button to open the add-problem modal, fill in name/difficulty/topic/platform, and save.' },
    { q: 'Can I edit solved problems?', a: 'Yes — open the problem card and click the edit icon to update its details, difficulty, or solved status.' },
    { q: 'Forgot password?', a: 'Click "Forgot Password?" on the login page and follow the emailed reset link. It expires in 15 minutes.' },
    { q: 'Can I export my data?', a: 'Not yet — data export isn\'t available. If you need it urgently, reach out via Contact Support.' },
    { q: 'How is the revision list generated?', a: 'Mark any topic with the revision toggle on the Topics page — it\'ll appear in your Revision List and count on your Profile.' },
    { q: 'Is my data private?', a: 'Yes — your problems, goals, and study plans are tied to your account only and are never shared with other users.' },
];

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div
            className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between p-5 border-b border-surface-border sticky top-0 bg-surface-card">
                <h3 className="text-text font-bold text-lg">{title}</h3>
                <button onClick={onClose} className="text-text-muted hover:text-text p-1">
                    <X size={20} />
                </button>
            </div>
            <div className="p-7">{children}</div>
        </div>
    </div>
);

const HelpSupport = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const cardClass = "bg-surface-card border border-surface-border rounded-xl shadow-sm hover:shadow-md hover:border-[#AECDEA] hover:-translate-y-0.5 transition-all duration-200";
    const inputClass = "w-full bg-surface-bg text-text p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition text-sm";

    const [search, setSearch] = useState('');
    const [openArticle, setOpenArticle] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // 'getting-started' | 'ai-plan' | 'bug' | 'contact' | 'feature' | null

    const filteredArticles = useMemo(() => {
        if (!search.trim()) return ARTICLES;
        const q = search.toLowerCase();
        return ARTICLES.filter((a) => a.q.toLowerCase().includes(q) || a.a.toLowerCase().includes(q));
    }, [search]);

    const [contactForm, setContactForm] = useState({
        name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.username || ''),
        email: user?.email || '',
        subject: '', message: ''
    });
    const [bugForm, setBugForm] = useState({ subject: '', category: 'UI', priority: 'Medium', message: '' });
    const [featureForm, setFeatureForm] = useState({ name: '', why: '', how: '' });
    const [sending, setSending] = useState(false);

    const closeModal = () => setActiveModal(null);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const { data } = await API.post('/support/contact', contactForm);
            toast.success(data.message);
            setContactForm((p) => ({ ...p, subject: '', message: '' }));
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        }
        setSending(false);
    };

    const handleBugSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const { data } = await API.post('/support/bug', bugForm);
            toast.success(data.message);
            setBugForm({ subject: '', category: 'UI', priority: 'Medium', message: '' });
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit bug report');
        }
        setSending(false);
    };

    const handleFeatureSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const message = `Why:\n${featureForm.why}\n\nHow it should work:\n${featureForm.how}`;
            const { data } = await API.post('/support/feature', { subject: featureForm.name, message });
            toast.success(data.message);
            setFeatureForm({ name: '', why: '', how: '' });
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit suggestion');
        }
        setSending(false);
    };

    const QUICK_CARDS = [
        { icon: BookOpen, title: 'Getting Started', desc: 'Learn how to use CodePulse in 2 minutes.', cta: 'Read Guide', color: '#2563EB', bg: 'rgba(37,99,235,0.1)', action: () => setActiveModal('getting-started') },
        { icon: BrainCircuit, title: 'AI Study Plan', desc: 'Understand how AI creates your daily roadmap.', cta: 'Learn More', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', action: () => setActiveModal('ai-plan') },
        { icon: Bug, title: 'Report Bug', desc: 'Found something broken? Let us know.', cta: 'Report Now', color: '#C1594F', bg: 'rgba(193,89,79,0.1)', action: () => setActiveModal('bug') },
        { icon: MessageCircle, title: 'Contact Support', desc: 'Reach out for anything else on your mind.', cta: 'Get in Touch', color: '#D4A24C', bg: 'rgba(212,162,76,0.12)', action: () => setActiveModal('contact') },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-5">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-text-muted hover:text-text text-sm font-medium mb-2"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <h1 className="text-2xl font-bold text-text">Help Center</h1>
                <p className="text-text-muted text-sm mt-0.5">Find answers, report issues, or reach out to us.</p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search help articles..."
                    className={`${inputClass} pl-10 py-3 shadow-sm`}
                    style={{ border: '2px solid #94A3B8' }}
                />
            </div>

            {/* Quick action cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3 max-w-5xl mx-auto">
                {QUICK_CARDS.map((c) => (
                    <button key={c.title} onClick={c.action} className={`${cardClass} p-5 flex flex-col items-center text-center gap-1.5`}>
                        <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: c.bg }}>
                            <c.icon size={22} style={{ color: c.color }} />
                        </div>
                        <p className="text-text font-semibold text-base">{c.title}</p>
                        <p className="text-text-muted text-xs leading-snug">{c.desc}</p>
                        <span className="text-brand text-xs font-semibold flex items-center gap-0.5 mt-1.5">
                            {c.cta} <ChevronRight size={12} />
                        </span>
                    </button>
                ))}
            </div>

            <p className="text-center text-sm text-text mb-6">
                Have an idea instead?{' '}
                <button onClick={() => setActiveModal('feature')} className="text-brand font-bold hover:underline">
                    Suggest a Feature
                </button>
            </p>

            {/* Popular Articles */}
            <div className={`${cardClass} p-4 mb-5`}>
                <h2 className="text-text font-bold text-sm mb-3">Popular Articles</h2>
                <div className="space-y-1.5">
                    {filteredArticles.length === 0 ? (
                        <p className="text-text-muted text-sm text-center py-6">No articles match "{search}"</p>
                    ) : (
                        filteredArticles.map((a, i) => (
                            <div key={a.q} className="border border-surface-border rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setOpenArticle(openArticle === i ? null : i)}
                                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-bg transition"
                                >
                                    <span className="text-text text-sm font-medium">{a.q}</span>
                                    <ChevronDown size={14} className={`text-text-muted shrink-0 transition-transform ${openArticle === i ? 'rotate-180' : ''}`} />
                                </button>
                                {openArticle === i && (
                                    <div className="px-3 pb-3">
                                        <p className="text-text-muted text-sm">{a.a}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Still Need Help */}
            <div className={`${cardClass} p-5 text-center`}>
                <p className="text-text font-semibold text-sm mb-2">Still need help?</p>
                <p className="text-brand text-sm font-medium flex items-center justify-center gap-1.5">
                    <Mail size={14} /> support.codepulse@gmail.com
                </p>
                <p className="text-text-muted text-xs mt-1.5 mb-4 flex items-center justify-center gap-1.5">
                    <Clock size={12} /> Average response: within 24 hrs
                </p>
                <button
                    onClick={() => setActiveModal('contact')}
                    className="bg-brand hover:bg-brand-hover text-white px-5 py-2 rounded-lg text-sm font-semibold transition inline-flex items-center gap-1.5"
                >
                    Contact Support <ChevronRight size={14} />
                </button>
            </div>

            {/* ===== Modals ===== */}

            {activeModal === 'getting-started' && (
                <Modal title="📖 Getting Started" onClose={closeModal}>
                    <div className="space-y-3 text-text-muted text-sm">
                        <p><strong className="text-text">1. Add your Topics</strong> — Go to Topics and log the DSA subjects you're studying.</p>
                        <p><strong className="text-text">2. Log Problems</strong> — On the Problems page, record each problem you solve with its difficulty and topic.</p>
                        <p><strong className="text-text">3. Set a Daily Goal</strong> — Track a daily problem-solving target from the Daily Goal page.</p>
                        <p><strong className="text-text">4. Generate an AI Study Plan</strong> — Once you have a few topics logged, get a personalized plan based on your weak areas.</p>
                        <p><strong className="text-text">5. Check your Dashboard</strong> — See your progress, streaks, and weak topics at a glance.</p>
                    </div>
                </Modal>
            )}

            {activeModal === 'ai-plan' && (
                <Modal title="🤖 How AI Study Plan Works" onClose={closeModal}>
                    <div className="space-y-3 text-text-muted text-sm">
                        <p>CodePulse gives each topic a <strong className="text-text">mastery score</strong> based on its solved problems — Easy problems are worth 1 point, Medium 2 points, and Hard 3 points. Any topic scoring <strong className="text-text">below 7</strong> is flagged as a "weak topic."</p>
                        <p>When you generate a plan, those weak topics are sent to an AI model (Gemini) which builds a day-by-day roadmap — each day gets a topic focus, key concepts to revise, and 3-4 specific problems with difficulty levels.</p>
                        <p>You can choose a 3, 7, or 14-day plan, and regenerate it up to <strong className="text-text">2 times per day</strong> if you want a different set of problems.</p>
                    </div>
                </Modal>
            )}

            {activeModal === 'bug' && (
                <Modal title="🐞 Report a Bug" onClose={closeModal}>
                    <form onSubmit={handleBugSubmit} className="space-y-4">
                        <div>
                            <label className="block text-text-muted text-sm mb-1.5">Title</label>
                            <input
                                type="text"
                                value={bugForm.subject}
                                onChange={(e) => setBugForm({ ...bugForm, subject: e.target.value })}
                                className={inputClass}
                                placeholder="Short summary of the bug"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-text-muted text-sm mb-2">Category</label>
                            <div className="flex flex-wrap gap-4">
                                {['UI', 'Backend', 'AI', 'Performance'].map((c) => (
                                    <label key={c} className="flex items-center gap-2 text-text text-sm cursor-pointer">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={bugForm.category === c}
                                            onChange={() => setBugForm({ ...bugForm, category: c })}
                                            className="accent-brand"
                                        />
                                        {c}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-text-muted text-sm mb-2">Priority</label>
                            <div className="flex gap-4">
                                {['Low', 'Medium', 'High'].map((p) => (
                                    <label key={p} className="flex items-center gap-2 text-text text-sm cursor-pointer">
                                        <input
                                            type="radio"
                                            name="priority"
                                            checked={bugForm.priority === p}
                                            onChange={() => setBugForm({ ...bugForm, priority: p })}
                                            className="accent-brand"
                                        />
                                        {p}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-text-muted text-sm mb-1.5">Description</label>
                            <textarea
                                value={bugForm.message}
                                onChange={(e) => setBugForm({ ...bugForm, message: e.target.value })}
                                className={inputClass}
                                rows={4}
                                placeholder="What happened, and what did you expect instead?"
                                required
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-text-muted text-sm cursor-pointer border border-dashed border-surface-border rounded-lg px-3 py-2.5 hover:bg-surface-bg transition w-fit">
                                <Paperclip size={14} /> Attach screenshot (optional)
                                <input type="file" accept="image/*" className="hidden" />
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-danger hover:bg-danger/90 disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold text-sm transition"
                        >
                            {sending ? 'Submitting...' : 'Submit'}
                        </button>
                    </form>
                </Modal>
            )}

            {activeModal === 'contact' && (
                <Modal title="📩 Contact Support" onClose={closeModal}>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-text-muted text-sm mb-1.5">Name</label>
                                <input
                                    type="text"
                                    value={contactForm.name}
                                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                    className={inputClass}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-text-muted text-sm mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                    className={inputClass}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-text-muted text-sm mb-1.5">Subject</label>
                            <input
                                type="text"
                                value={contactForm.subject}
                                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                className={inputClass}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-text-muted text-sm mb-1.5">Message</label>
                            <textarea
                                value={contactForm.message}
                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                className={inputClass}
                                rows={4}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-brand hover:bg-brand-hover disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
                        >
                            <Send size={14} /> {sending ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </Modal>
            )}

            {activeModal === 'feature' && (
                <Modal title="💡 Suggest a Feature" onClose={closeModal}>
                    <form onSubmit={handleFeatureSubmit} className="space-y-4">
                        <div>
                            <label className="block text-text-muted text-sm mb-1.5">Feature Name</label>
                            <input
                                type="text"
                                value={featureForm.name}
                                onChange={(e) => setFeatureForm({ ...featureForm, name: e.target.value })}
                                className={inputClass}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-text-muted text-sm mb-1.5">Why do you want it?</label>
                            <textarea
                                value={featureForm.why}
                                onChange={(e) => setFeatureForm({ ...featureForm, why: e.target.value })}
                                className={inputClass}
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-text-muted text-sm mb-1.5">How should it work?</label>
                            <textarea
                                value={featureForm.how}
                                onChange={(e) => setFeatureForm({ ...featureForm, how: e.target.value })}
                                className={inputClass}
                                rows={3}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-warning hover:opacity-90 disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold text-sm transition"
                        >
                            {sending ? 'Submitting...' : 'Submit Suggestion'}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default HelpSupport;