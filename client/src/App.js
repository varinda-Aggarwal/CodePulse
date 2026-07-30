import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AuthSuccess from './pages/AuthSuccess';
import Topics from './pages/Topics';
import Problems from './pages/Problems';
import TopicProblems from './pages/TopicProblems';
import Profile from './pages/Profile';
import DailyGoal from './pages/DailyGoal';
import AIStudyPlan from './pages/AIStudyPlan';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const PrivateRoute = ({ children }) => {
    const { token, loading } = useAuth();
    if (loading) return <div className="text-white text-center mt-10">Loading...</div>;
    if (!token) return <Navigate to="/login" />;
    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <ThemeProvider>
        <AuthProvider>
            <Router>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/auth/success" element={<AuthSuccess />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/topics" element={<PrivateRoute><Topics /></PrivateRoute>} />
                    <Route path="/topics/:id" element={<PrivateRoute><TopicProblems /></PrivateRoute>} />
                    <Route path="/problems" element={<PrivateRoute><Problems /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/goal" element={<PrivateRoute><DailyGoal /></PrivateRoute>} />
                    <Route path="/study-plan" element={<PrivateRoute><AIStudyPlan /></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthProvider>
        </ThemeProvider>
    );
}
export default App;