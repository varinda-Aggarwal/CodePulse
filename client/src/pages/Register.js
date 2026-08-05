import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import AuthLayout from './AuthLayout';

const Register = () => {
    const [step, setStep] = useState('form'); // 'form' | 'otp'
    const [formData, setFormData] = useState({
        username: '', email: '', phone: '', password: '', confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const inputClass = "w-full bg-surface-bg text-text p-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition text-base";

    // Matches backend's validateSendOtp rule exactly:
    // min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char (@$!%*?&#)
    const passwordChecks = {
        length: formData.password.length >= 8,
        hasUpper: /[A-Z]/.test(formData.password),
        hasLower: /[a-z]/.test(formData.password),
        hasNumber: /\d/.test(formData.password),
        hasSpecial: /[@$!%*?&#]/.test(formData.password)
    };
    const isPasswordValid = Object.values(passwordChecks).every(Boolean);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!isPasswordValid) {
            toast.error('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&#)');
            return;
        }
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
            const { data } = await API.post('/auth/verify-otp', { email: formData.email, otp });
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
        <AuthLayout>
            <h2 className="text-3xl font-bold text-text mb-0.5">Create Your Account</h2>
            <p className="text-text-muted text-sm mb-6">Start tracking your DSA journey today.</p>

            {step === 'form' ? (
                <form onSubmit={handleSendOtp}>
                    <div className="mb-3">
                        <label className="block text-text-muted text-sm mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-text-muted text-sm mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block text-text-muted text-sm mb-1">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="10-digit mobile number"
                            required
                        />
                    </div>

                    <div className="mb-3 relative">
                        <label className="block text-text-muted text-sm mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                className={`${inputClass} pr-10`}
                                placeholder="Create a password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Live password requirement tooltip — hides itself the moment every rule is satisfied,
                            doesn't wait for blur/click-elsewhere */}
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

                    <div className="mb-4">
                        <label className="block text-text-muted text-sm mb-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`${inputClass} pr-10`}
                                placeholder="Re-enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition text-sm"
                    >
                        {loading ? 'Sending OTP...' : 'Create Account'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp}>
                    <p className="text-text-muted text-center text-sm mb-3">
                        We've sent a 6-digit OTP to <span className="text-text font-medium">{formData.email}</span>
                    </p>
                    <div className="mb-4">
                        <label className="block text-text-muted text-sm mb-1">Enter OTP</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            className={`${inputClass} text-center text-xl tracking-widest`}
                            placeholder="------"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition text-sm mb-2"
                    >
                        {loading ? 'Verifying...' : 'Verify & Create Account'}
                    </button>
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="w-full bg-surface-bg hover:bg-surface-border border border-surface-border text-text py-2.5 rounded-lg transition text-sm mb-2"
                    >
                        Resend OTP
                    </button>
                    <button
                        type="button"
                        onClick={() => setStep('form')}
                        className="w-full text-text-muted hover:text-text text-sm"
                    >
                        ← Back to edit details
                    </button>
                </form>
            )}

            {step === 'form' && (
                <p className="text-text-muted text-center text-sm mt-3">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand hover:underline font-semibold">Sign In</Link>
                </p>
            )}
        </AuthLayout>
    );
};

export default Register;