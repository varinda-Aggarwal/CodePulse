import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Mail, MailCheck } from 'lucide-react';
import AuthLayout from './AuthLayout';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const inputClass = "w-full bg-surface-bg text-text p-3 rounded-lg border border-surface-border focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition";

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
        <AuthLayout>
            {sent ? (
                <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
                        <MailCheck size={28} className="text-success" />
                    </div>
                    <h2 className="text-2xl font-bold text-text mb-2">Check Your Inbox</h2>
                    <p className="text-text-muted text-sm mb-6">
                        If an account exists for <span className="text-text font-medium">{email}</span>, a reset link has been sent. Please check your inbox and spam folder — the link is valid for 15 minutes.
                    </p>
                    <Link to="/login" className="text-brand hover:underline font-semibold text-sm">← Back to Login</Link>
                </div>
            ) : (
                <>
                    <h2 className="text-2xl font-bold text-text mb-1">Forgot Password?</h2>
                    <p className="text-text-muted text-sm mb-6">No worries, we'll send you a reset link.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-text-muted text-sm mb-1.5">Registered Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`${inputClass} pl-10`}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                        <p className="text-text-muted text-center text-sm mt-5">
                            <Link to="/login" className="text-brand hover:underline font-semibold">← Back to Login</Link>
                        </p>
                    </form>
                </>
            )}
        </AuthLayout>
    );
};

export default ForgotPassword;