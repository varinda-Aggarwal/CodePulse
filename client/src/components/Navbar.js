import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import logoIcon from '../assets/branding/logo-icon.png';
import logoText from '../assets/branding/logo-text.png';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, UserCircle } from 'lucide-react';

const Navbar = () => {
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
        <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-10 py-4 flex justify-between items-center shadow-md transition-colors">
        <Link
            to="/dashboard"
            className="flex items-center gap-2 hover:opacity-90 transition"
        >
        <img
            src={logoIcon}
            alt="CodePulse Icon"
            className="h-10 w-10"
        />

        <img
            src={logoText}
            alt="CodePulse"
            className="h-6 w-auto"
        />
        </Link>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    >
                        {user?.profilePic ? (
                            <img
                                src={user.profilePic}
                                alt="Profile"
                                className="h-8 w-8 rounded-full object-cover"
                            />
                        ) : (
                            <UserCircle size={28} className="text-gray-400 dark:text-gray-300" />
                        )}
                        <ChevronDown
                            size={16}
                            className={`text-gray-400 dark:text-gray-300 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50">
                            <Link
                                to="/profile"
                                onClick={() => setDropdownOpen(false)}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                                View Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;