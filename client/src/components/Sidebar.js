import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Code2,
    Target,
    Sparkles,
    User,
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/topics', label: 'Topics', icon: BookOpen },
    { to: '/problems', label: 'Problems', icon: Code2 },
    { to: '/goal', label: 'Daily Goal', icon: Target },
    { to: '/study-plan', label: 'AI Study Plan', icon: Sparkles },
    { to: '/profile', label: 'Profile', icon: User },
];

const Sidebar = () => {
    const location = useLocation();

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 h-screen sticky top-0 flex flex-col py-6 px-4 transition-colors">
            <nav className="flex flex-col gap-1">
                {navItems.map(({ to, label, icon: Icon }) => {
                    const isActive = location.pathname.startsWith(to);
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm font-medium
                                ${isActive
                                    ? 'bg-brand text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;