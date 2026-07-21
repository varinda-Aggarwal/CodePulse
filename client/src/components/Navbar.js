import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out!');
        navigate('/login');
    };

    return (
        <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center">
            <Link to="/dashboard" className="text-white text-xl font-bold">
                Code<span className="text-blue-400">Pulse</span>
            </Link>
            <div className="flex items-center gap-6">
                <Link to="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
                <Link to="/topics" className="text-gray-300 hover:text-white">Topics</Link>
                <Link to="/problems" className="text-gray-300 hover:text-white">Problems</Link>
                <Link to="/goal" className="text-gray-300 hover:text-white">Daily Goal</Link>
                <Link to="/study-plan" className="text-gray-300 hover:text-white">AI Study Plan</Link>
                <Link to="/profile" className="text-gray-300 hover:text-white">Profile</Link>
                <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;