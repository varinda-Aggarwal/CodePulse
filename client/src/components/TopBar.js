import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell } from 'lucide-react';

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/topics': 'Topics',
    '/problems': 'Problems',
    '/goal': 'Daily Goal',
    '/study-plan': 'AI Study Plan',
    '/profile': 'Profile',
};

const TopBar = () => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);

    const currentTitle = pageTitles[location.pathname] || 'Overview';
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

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
        <div className="flex justify-between items-center bg-[#D8E3F3] px-8 py-4 border-b border-black/5">
            {/* Left: page title + date */}
            <div>
                <p className="text-text font-bold text-lg italic">{currentTitle}</p>
                <p className="text-text-muted text-xs">{today}</p>
            </div>

            {/* Right: notifications + theme toggle only */}
            <div className="flex items-center gap-3">
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setNotifOpen((prev) => !prev)}
                        className="relative flex items-center gap-1.5 px-3 py-2 rounded-full bg-white text-warning-text text-xs font-semibold shadow-sm hover:bg-[#8094B3]/20 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200"
                    >
                        <Bell size={14} />
                        0 alerts
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-surface-card border border-surface-border rounded-lg shadow-lg p-4 z-50">
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
            </div>
        </div>
    );
};

export default TopBar;