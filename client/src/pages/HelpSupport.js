import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Search, BookOpen, BrainCircuit, Bug, MessageCircle,
    ChevronRight, ChevronDown, Mail, Clock, Lightbulb, X, Send, Paperclip
} from 'lucide-react';
import logoIcon from '../assets/branding/logo-icon.png';

const GithubIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.34.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.73 0c2.18-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
    </svg>
);

const LinkedinIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.15 1.45-2.15 2.94v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
);

const InstagramIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const TwitterIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

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
    const { user, token } = useAuth();
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

    // Bug/Contact/Feature forms require login — Getting Started & AI Study Plan info modals stay public
    const openModalOrRequireLogin = (modalName) => {
        if (!token) {
            toast.error('Please log in to do this');
            navigate('/login');
            return;
        }
        setActiveModal(modalName);
    };

    const QUICK_CARDS = [
        { icon: BookOpen, title: 'Getting Started', desc: 'Learn how to use CodePulse in 2 minutes.', cta: 'Read Guide', color: '#2563EB', bg: 'rgba(37,99,235,0.1)', action: () => setActiveModal('getting-started') },
        { icon: BrainCircuit, title: 'AI Study Plan', desc: 'Understand how AI creates your daily roadmap.', cta: 'Learn More', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', action: () => setActiveModal('ai-plan') },
        { icon: Bug, title: 'Report Bug', desc: 'Found something broken? Let us know.', cta: 'Report Now', color: '#C1594F', bg: 'rgba(193,89,79,0.1)', action: () => openModalOrRequireLogin('bug') },
        { icon: MessageCircle, title: 'Contact Support', desc: 'Reach out for anything else on your mind.', cta: 'Get in Touch', color: '#D4A24C', bg: 'rgba(212,162,76,0.12)', action: () => openModalOrRequireLogin('contact') },
    ];

    const pageContent = (
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
                <button onClick={() => openModalOrRequireLogin('feature')} className="text-brand font-bold hover:underline">
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
                    onClick={() => openModalOrRequireLogin('contact')}
                    className="bg-brand hover:bg-brand-hover text-white px-5 py-2 rounded-lg text-sm font-semibold transition inline-flex items-center gap-1.5"
                >
                    Contact Support <ChevronRight size={14} />
                </button>
            </div>

            {/* Footer — matches Landing page's "Get in Touch" footer, light-themed to match this page's topbar */}
            <footer className="mt-8">
                <div className="rounded-2xl p-6 md:p-10" style={{ backgroundColor: '#D8E3F3' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pb-8 border-b border-black/10">
                        <div>
                            <h2 className="text-2xl font-bold text-text mb-3">Get in Touch</h2>
                            <p className="text-text-muted text-sm leading-relaxed max-w-sm mb-5">
                                Have questions, feedback, or just want to say hi? We'd love to hear from you.
                                Reach out through any of the channels below.
                            </p>
                            <div className="flex gap-3">
                                <a href="https://github.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white border border-surface-border flex items-center justify-center text-text-muted hover:text-brand hover:border-brand/40 transition"><GithubIcon size={16} /></a>
                                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white border border-surface-border flex items-center justify-center text-text-muted hover:text-brand hover:border-brand/40 transition"><LinkedinIcon size={16} /></a>
                                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white border border-surface-border flex items-center justify-center text-text-muted hover:text-brand hover:border-brand/40 transition"><TwitterIcon size={16} /></a>
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white border border-surface-border flex items-center justify-center text-text-muted hover:text-brand hover:border-brand/40 transition"><InstagramIcon size={16} /></a>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={() => openModalOrRequireLogin('contact')} className="bg-white border border-surface-border rounded-xl p-5 text-left hover:-translate-y-0.5 hover:shadow-md transition">
                                <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center mb-3 text-brand"><Mail size={17} /></div>
                                <p className="text-text-muted text-[10px] font-bold uppercase tracking-wide mb-1">Email</p>
                                <p className="text-text text-sm font-semibold">support.codepulse@gmail.com</p>
                            </button>
                        </div>
                    </div>
                </div>
            </footer>

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

    // Logged-out visitors don't get the Sidebar/TopBar layout — render a lightweight
    // public shell instead (own navbar + padded container) so content isn't edge-to-edge
    if (!token) {
        return (
            <div className="min-h-screen bg-surface-bg">
                <nav className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 bg-[#D8E3F3] border-b border-black/5">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2">
                        <img src={logoIcon} alt="" className="w-8 h-8 rounded-lg object-contain" />
                        <span className="text-text font-bold text-lg">CodePulse</span>
                    </button>

                    <div className="hidden md:flex items-center gap-8">
                        <button onClick={() => navigate('/#features')} className="text-text-muted hover:text-text text-sm font-medium transition">Features</button>
                        <button onClick={() => navigate('/#how-it-works')} className="text-text-muted hover:text-text text-sm font-medium transition">How It Works</button>
                        <button onClick={() => navigate('/#why-codepulse')} className="text-text-muted hover:text-text text-sm font-medium transition">Why CodePulse</button>
                        <button onClick={() => navigate('/#contact')} className="text-text-muted hover:text-text text-sm font-medium transition">Contact</button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 rounded-lg border border-surface-border text-text text-sm font-semibold hover:bg-white/40 transition"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-semibold transition"
                        >
                            Get Started
                        </button>
                    </div>
                </nav>
                <div className="max-w-5xl mx-auto px-6 sm:px-10 py-8">
                    {pageContent}
                </div>
            </div>
        );
    }

    return pageContent;
};

export default HelpSupport;