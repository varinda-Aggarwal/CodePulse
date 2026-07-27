import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            login({}, token);
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    }, []);

    return <div className="text-white text-center mt-10">Logging in...</div>;
};

export default AuthSuccess;