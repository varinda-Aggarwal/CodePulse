import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Sun, Moon, ChevronDown, UserCircle } from 'lucide-react';

const TopBar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        toast.success('Logged out!');
        navigate('/login');
    };

    return (
        <div className="flex justify-end items-center gap-3 mb-6">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-surface-card border border-surface-border text-text-muted hover:text-text transition"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-card border border-surface-border hover:bg-surface-bg transition"
                >
                    {user?.profilePic ? (
                        <img src={user.profilePic} alt="Profile" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                        <UserCircle size={24} className="text-text-muted" />
                    )}
                    <ChevronDown size={14} className={`text-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-surface-card border border-surface-border rounded-lg shadow-lg py-1 z-50">
                        <Link
                            to="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-text hover:bg-surface-bg"
                        >
                            View Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-surface-bg"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopBar;