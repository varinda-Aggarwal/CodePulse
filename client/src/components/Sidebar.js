import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Code2,
    Target,
    Sparkles,
    User,
    Home,
    HelpCircle,
    ChevronsLeft,
    ChevronsRight,
    UserCircle,
} from 'lucide-react';
import logoIcon from '../assets/branding/logo-icon.png';

const navGroups = [
    {
        title: 'Overview',
        items: [
            { to: '/', label: 'Home', icon: Home },
            { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ],
    },
    {
        title: 'Practice',
        items: [
            { to: '/topics', label: 'Topics', icon: BookOpen },
            { to: '/problems', label: 'Problems', icon: Code2 },
            { to: '/goal', label: 'Daily Goal', icon: Target },
            { to: '/study-plan', label: 'AI Study Plan', icon: Sparkles },
        ],
    },
    {
        title: 'Account',
        items: [
            { to: '/profile', label: 'Profile', icon: User },
        ],
    },
];

const Sidebar = ({ mobileOpen, onClose }) => {
    const location = useLocation();
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [imgError, setImgError] = useState(false);

    return (
        <>
            {/* Mobile/tablet backdrop — click to close */}
            {mobileOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                />
            )}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 ${collapsed ? 'lg:w-20' : 'lg:w-64'} bg-surface-sidebar h-screen flex flex-col transition-all duration-200 flex-shrink-0 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:sticky lg:top-0`}
            >
            {/* Top: Logo + Collapse toggle (fixed, no scroll) */}
            <div className="relative flex items-center justify-center py-5 flex-shrink-0 px-4">
                <Link to="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
                    <img src={logoIcon} alt="CodePulse" className="h-9 w-9 flex-shrink-0" />
                    {!collapsed && (
                        <span className="text-white text-lg font-bold tracking-tight">CodePulse</span>
                    )}
                </Link>
                {/* Desktop collapse toggle */}
                {!collapsed && (
                    <button
                        onClick={() => setCollapsed(true)}
                        className="hidden lg:block absolute right-4 text-slate-400 hover:text-white hover:bg-[#8094B3]/30 rounded-lg transition p-1"
                    >
                        <ChevronsLeft size={18} />
                    </button>
                )}
                {/* Mobile/tablet close button */}
                <button
                    onClick={onClose}
                    className="lg:hidden absolute right-4 text-slate-400 hover:text-white hover:bg-[#8094B3]/30 rounded-lg transition p-1"
                >
                    <ChevronsLeft size={18} />
                </button>
            </div>
            {collapsed && (
                <button
                    onClick={() => setCollapsed(false)}
                    className="hidden lg:flex justify-center text-slate-400 hover:text-white transition py-1"
                >
                    <ChevronsRight size={18} />
                </button>
            )}

            {/* Profile section - vertical, centered (fixed, no scroll) */}
            <div className="flex flex-col items-center gap-2 pb-5 mb-2 border-b border-white/10 flex-shrink-0 px-3">
                {user?.photo && !imgError ? (
                    <img
                        src={user.photo}
                        alt="Profile"
                        onError={() => setImgError(true)}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-white/20"
                    />
                ) : (
                    <UserCircle size={64} className="text-slate-400" />
                )}
                {!collapsed && (
                    <div className="text-center">
                        <p className="text-white text-sm font-semibold truncate max-w-[180px]">
                            {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username}
                        </p>
                        <p className="text-slate-400 text-xs truncate max-w-[180px] opacity-60">{user?.email}</p>
                    </div>
                )}
            </div>

            {/* Nav links - scrollable middle section */}
            <nav className="flex flex-col gap-1 px-3 flex-1 overflow-y-auto min-h-0">
                {navGroups.map((group, groupIndex) => (
                    <div
                        key={group.title}
                        className={`flex flex-col gap-1 py-3 ${groupIndex !== 0 ? 'border-t border-white/10' : 'pt-0'}`}
                    >
                        {!collapsed && (
                            <p className="text-slate-300 text-xs font-extrabold uppercase tracking-wide text-center mb-2">
                                {group.title}
                            </p>
                        )}
                        {group.items.map(({ to, label, icon: Icon }, i) => {
                            const isActive = label !== 'Home' && location.pathname.startsWith(to);
                            return (
                                <Link
                            key={label}
                            to={to}
                            onClick={onClose}
                            title={collapsed ? label : ''}
                            className={`flex items-center gap-3 py-2.5 rounded-xl transition text-sm font-medium border-l-4
                                ${collapsed ? 'justify-center px-3' : 'px-3'}
                                ${isActive
                                    ? 'bg-brand/35 text-white border-brand font-semibold'
                                    : 'border-transparent text-slate-300 hover:bg-[#8094B3]/30 hover:text-white hover:translate-x-1'
                                }`}
                        >
                            <Icon size={18} className="flex-shrink-0" />
                            {!collapsed && label}
                        </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Bottom: Help (fixed, no scroll) */}
            <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
                <Link
                    to="/help"
                    onClick={onClose}
                    title={collapsed ? 'Help & Support' : ''}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-[#8094B3]/30 hover:text-white transition ${collapsed ? 'justify-center' : ''}`}
                >
                    <HelpCircle size={18} className="flex-shrink-0" />
                    {!collapsed && 'Help & Support'}
                </Link>
            </div>
            </aside>
        </>
    );
};

export default Sidebar;