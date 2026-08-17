import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Bell, LogOut, Menu } from 'lucide-react';

const TopBar = ({ onMenuClick }) => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex justify-between items-center bg-[#D8E3F3] px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-black/5">
            {/* Left: hamburger (mobile/tablet only) + greeting */}
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden flex-shrink-0 p-2 rounded-lg bg-white text-text-muted hover:text-text shadow-sm transition"
                    aria-label="Open menu"
                >
                    <Menu size={20} />
                </button>
                <div className="min-w-0">
                    <p className="text-text font-bold text-base sm:text-lg truncate">
                        👋 {getGreeting()}, {user?.firstName || user?.username}
                    </p>
                    <p className="hidden sm:block text-text-muted text-xs">Keep solving! Let's make today count.</p>
                </div>
            </div>

            {/* Right: notifications + theme toggle only */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setNotifOpen((prev) => !prev)}
                        className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full bg-white text-warning-text text-xs font-semibold shadow-sm hover:bg-[#8094B3]/20 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200"
                    >
                        <Bell size={14} />
                        <span className="hidden sm:inline">0 alerts</span>
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-surface-card border border-surface-border rounded-lg shadow-lg p-4 z-50">
                            <p className="text-text text-sm font-semibold mb-1">Notifications</p>
                            <p className="text-text-muted text-xs">You're all caught up — no new alerts.</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-full bg-white text-text-muted hover:text-text hover:bg-[#8094B3]/20 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:scale-110 active:translate-y-0 active:scale-100 transition-all duration-200"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-full bg-white text-danger hover:bg-danger/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:scale-110 active:translate-y-0 active:scale-100 transition-all duration-200"
                    aria-label="Logout"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </div>
    );
};

export default TopBar;