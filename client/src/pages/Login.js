import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await API.post('/auth/login', formData);
            login(data, data.token);
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white text-center mb-6">Login to CodePulse</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email" required />
                    </div>
                    <div className="mb-2">
                        <label className="block text-gray-400 mb-2">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your password" required />
                    </div>
                    <div className="mb-6 text-right">
                        <Link to="/forgot-password" className="text-blue-400 hover:underline text-sm">Forgot Password?</Link>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <a href="http://localhost:5000/api/auth/google" className="w-full block bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition duration-200 text-center mt-2">Continue with Google</a>
                </div>
                <p className="text-gray-400 text-center mt-4">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-400 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;