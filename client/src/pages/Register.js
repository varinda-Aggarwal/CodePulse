import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';

const Register = () => {
    const [step, setStep] = useState('form'); // 'form' | 'otp'
    const [formData, setFormData] = useState({
        username: '', email: '', phone: '', password: '', confirmPassword: ''
    });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await API.post('/auth/send-otp', {
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });
            toast.success('OTP sent to your email!');
            setStep('otp');
        } catch (error) {
            const errMsg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Failed to send OTP';
            toast.error(errMsg);
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await API.post('/auth/verify-otp', {
                email: formData.email,
                otp
            });
            login(data, data.token);
            toast.success('Account created!');
            navigate('/dashboard');
        } catch (error) {
            const errMsg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Invalid OTP';
            toast.error(errMsg);
        }
        setLoading(false);
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            await API.post('/auth/send-otp', {
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });
            toast.success('OTP resent!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white text-center mb-6">Create Account</h2>

                {step === 'form' ? (
                    <form onSubmit={handleSendOtp}>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special (@$!%*?&#)"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-400 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Re-enter your password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200"
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <p className="text-gray-400 text-center mb-4">
                            We've sent a 6-digit OTP to <span className="text-white">{formData.email}</span>
                        </p>
                        <div className="mb-6">
                            <label className="block text-gray-400 mb-2">Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                className="w-full bg-gray-700 text-white p-3 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="------"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200 mb-3"
                        >
                            {loading ? 'Verifying...' : 'Verify & Create Account'}
                        </button>
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={loading}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition duration-200 mb-3"
                        >
                            Resend OTP
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('form')}
                            className="w-full text-gray-400 hover:text-white text-sm"
                        >
                            ← Back to edit details
                        </button>
                    </form>
                )}

                {step === 'form' && (
                    <p className="text-gray-400 text-center mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Register;