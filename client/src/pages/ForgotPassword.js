import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await API.post('/auth/forgot-password', { email });
            toast.success(data.message);
            setSent(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white text-center mb-6">Forgot Password</h2>

                {sent ? (
                    <div className="text-center">
                        <p className="text-gray-300 mb-4">
                            If an account exists for <span className="text-white">{email}</span>, a reset link has been sent. Please check your inbox (and spam folder).
                        </p>
                        <Link to="/login" className="text-blue-400 hover:underline">← Back to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-gray-400 mb-2">Enter your registered email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                        <p className="text-gray-400 text-center mt-4">
                            <Link to="/login" className="text-blue-400 hover:underline">← Back to Login</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;