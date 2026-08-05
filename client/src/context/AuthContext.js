import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // sessionStorage checked first — it's unique per tab, so if THIS tab has its own
    // session there, that takes priority over whatever another tab wrote to localStorage
    const [token, setToken] = useState(
        sessionStorage.getItem('token') || localStorage.getItem('token')
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            const userData = JSON.parse(
                sessionStorage.getItem('user') || localStorage.getItem('user')
            );
            setUser(userData);
        }
        setLoading(false);
    }, [token]);

    // rememberMe = true  -> localStorage  (survives closing the browser)
    // rememberMe = false -> sessionStorage (cleared when the tab/browser closes)
    const login = (userData, userToken, rememberMe = true) => {
        const storage = rememberMe ? localStorage : sessionStorage;
        const otherStorage = rememberMe ? sessionStorage : localStorage;

        // Always clear the other storage first, so a stale token left over from
        // a previous "remembered" or "not remembered" session never conflicts
        otherStorage.removeItem('token');
        otherStorage.removeItem('user');

        storage.setItem('token', userToken);
        storage.setItem('user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
    };
    
    const updateUser = (updatedFields) => {
        setUser((prev) => {
            const updated = { ...prev, ...updatedFields };
            // Write back to whichever storage THIS tab's session actually lives in —
            // never assume localStorage, or it leaks into other tabs on their next refresh
            const storage = sessionStorage.getItem('token') ? sessionStorage : localStorage;
            storage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);