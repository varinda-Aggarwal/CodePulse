import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import AuthLayout from './AuthLayout';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [loading, setLoading] = useState(false);

    const inputClass = "w-full bg-surface-bg text-text p-3 rounded-lg border border-surface-border focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition";

    // Matches backend's validateResetPassword rule exactly:
    // min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char (@$!%*?&#)
    const passwordChecks = {
        length: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecial: /[@$!%*?&#]/.test(password)
    };
    const isPasswordValid = Object.values(passwordChecks).every(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isPasswordValid) {
            toast.error('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&#)');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const { data } = await API.post(`/auth/reset-password/${token}`, { password, confirmPassword });
            toast.success(data.message);
            navigate('/login');
        } catch (error) {
            const errMsg = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Failed to reset password';
            toast.error(errMsg);
        }
        setLoading(false);
    };

    return (
        <AuthLayout>
            <h2 className="text-2xl font-bold text-text mb-1">Set New Password</h2>
            <p className="text-text-muted text-sm mb-6">Choose a strong password for your account.</p>

            <form onSubmit={handleSubmit}>
                <div className="mb-4 relative">
                    <label className="block text-text-muted text-sm mb-1.5">New Password</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            className={`${inputClass} pl-10 pr-11`}
                            placeholder="Enter new password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {passwordFocused && !isPasswordValid && (
                        <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-surface-card border border-surface-border rounded-lg shadow-lg p-3">
                            <p className="text-text-muted text-[11px] font-semibold uppercase tracking-wide mb-1.5">Password must have</p>
                            <div className="space-y-1">
                                <div className={`flex items-center gap-1.5 text-sm ${passwordChecks.length ? 'text-success' : 'text-text-muted'}`}>
                                    {passwordChecks.length ? <Check size={13} /> : <X size={13} />}
                                    At least 8 characters
                                </div>
                                <div className={`flex items-center gap-1.5 text-sm ${passwordChecks.hasUpper ? 'text-success' : 'text-text-muted'}`}>
                                    {passwordChecks.hasUpper ? <Check size={13} /> : <X size={13} />}
                                    One uppercase letter
                                </div>
                                <div className={`flex items-center gap-1.5 text-sm ${passwordChecks.hasLower ? 'text-success' : 'text-text-muted'}`}>
                                    {passwordChecks.hasLower ? <Check size={13} /> : <X size={13} />}
                                    One lowercase letter
                                </div>
                                <div className={`flex items-center gap-1.5 text-sm ${passwordChecks.hasNumber ? 'text-success' : 'text-text-muted'}`}>
                                    {passwordChecks.hasNumber ? <Check size={13} /> : <X size={13} />}
                                    One number
                                </div>
                                <div className={`flex items-center gap-1.5 text-sm ${passwordChecks.hasSpecial ? 'text-success' : 'text-text-muted'}`}>
                                    {passwordChecks.hasSpecial ? <Check size={13} /> : <X size={13} />}
                                    One special character (@$!%*?&#)
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block text-text-muted text-sm mb-1.5">Confirm New Password</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`${inputClass} pl-10 pr-11`}
                            placeholder="Re-enter new password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                <p className="text-text-muted text-center text-sm mt-5">
                    <Link to="/login" className="text-brand hover:underline font-semibold">← Back to Login</Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default ResetPassword;