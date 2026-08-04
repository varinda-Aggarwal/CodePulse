import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import AuthLayout from './AuthLayout';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const inputClass = "w-full bg-surface-bg text-text p-3 rounded-lg border border-surface-border focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition";

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
        <AuthLayout illustration="login">
            <h2 className="text-2xl font-bold text-text mb-1">Welcome Back 👋</h2>
            <p className="text-text-muted text-sm mb-6">Continue your placement preparation.</p>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-text-muted text-sm mb-1.5">Email</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`${inputClass} pl-10`}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="block text-text-muted text-sm mb-1.5">Password</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`${inputClass} pl-10 pr-11`}
                            placeholder="Enter your password"
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
                </div>

                <div className="flex items-center justify-between mb-6">
                    <label className="flex items-center gap-2 text-text-muted text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="accent-brand"
                        />
                        Remember Me
                    </label>
                    <Link to="/forgot-password" className="text-brand hover:underline text-sm font-medium">
                        Forgot Password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
                >
                    {loading ? 'Logging in...' : 'Sign In'}
                </button>
            </form>

            <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-surface-border" />
                <span className="text-text-muted text-xs font-medium">OR</span>
                <div className="flex-1 h-px bg-surface-border" />
            </div>

            
               <a href="http://localhost:5000/api/auth/google"
                className="w-full flex items-center justify-center gap-2 bg-surface-bg hover:bg-surface-border border border-surface-border text-text font-semibold py-3 rounded-lg transition"
            >
                <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.8 2.73v2.27h2.92c1.71-1.57 2.68-3.88 2.68-6.64z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.34C2.44 15.98 5.48 18 9 18z" />
                    <path fill="#FBBC05" d="M3.97 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.96H.96C.35 6.18 0 7.55 0 9s.35 2.82.96 4.04l3.01-2.34z" />
                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
                </svg>
                Continue with Google
            </a>

            <p className="text-text-muted text-center text-sm mt-5">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand hover:underline font-semibold">Create Account</Link>
            </p>
        </AuthLayout>
    );
};

export default Login;