import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import axios from 'axios';

const AuthContext = createContext(null);

// Normalize user object: ensure `role` exists as lowercase from `activeRole`
const normalizeUser = (userData) => {
    if (!userData) return null;
    return {
        ...userData,
        role: userData.role || (userData.activeRole ? userData.activeRole.toLowerCase() : null)
    };
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // Instant restore: use cached user while fresh data loads
    const cachedUser = (() => {
        try {
            const raw = sessionStorage.getItem('cachedUser');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    })();

    const [user, setUser] = useState(cachedUser ? normalizeUser(cachedUser) : null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    // If we have a cached user, skip the blocking loading state
    const [loading, setLoading] = useState(cachedUser ? false : true);

    // Helper: persist user to sessionStorage for instant next load
    const cacheUser = (userData) => {
        try {
            if (userData) sessionStorage.setItem('cachedUser', JSON.stringify(userData));
            else sessionStorage.removeItem('cachedUser');
        } catch { /* quota exceeded — ignore */ }
    };

    // Fetch user on mount if token exists
    useEffect(() => {
        // Proactive warm-up: fire a no-cors ping to wake up the Azure backend
        // before the auth/me call. This reduces perceived cold-start delay.
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            const pingUrl = (import.meta.env.VITE_API_URL || 'https://thecollabify-api-hhc2huheexeqaqff.centralindia-01.azurewebsites.net/api').replace(/\/+$/, '') + '/ping';
            fetch(pingUrl, { method: 'GET', mode: 'no-cors', cache: 'no-store' }).catch(() => { });
        }

        const initAuth = async () => {
            // Check for token in URL (OAuth redirect flow)
            const urlParams = new URLSearchParams(window.location.search);
            const urlToken = urlParams.get('token');

            if (urlToken) {
                // OAuth callback - save token and clean URL
                localStorage.setItem('token', urlToken);
                setToken(urlToken);
                // Remove token from URL for security
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            const currentToken = urlToken || token;

            if (currentToken) {
                try {
                    // Use a short 10s timeout for auth/me — if backend is cold-starting
                    // we already have a cached user so we don't need to block the UI.
                    const response = await api.get('auth/me', { timeout: 10000 });
                    const freshUser = normalizeUser(response.data.data.user);
                    setUser(freshUser);
                    cacheUser(response.data.data.user);
                } catch (error) {
                    // Only log real errors, not expected 401s from expired tokens
                    if (error.response?.status !== 401 && error.response?.status !== 403) {
                        console.warn('Auth check failed:', error.message || error);
                    }
                    // Clear invalid token (don't call logout() to avoid circular dependency)
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        localStorage.removeItem('token');
                        sessionStorage.removeItem('cachedUser');
                        setToken(null);
                        setUser(null);
                    }
                    // For network errors (e.g. cold start timeout), keep the cached user and token
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [token]);

    const login = async (email, password) => {
        const response = await api.post('auth/login', { email, password });
        const { token: newToken, user: userData } = response.data.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(normalizeUser(userData));
        cacheUser(userData);

        return normalizeUser(userData);
    };

    const register = async (name, email, password, role) => {
        const response = await api.post('auth/register', { name, email, password, role });
        const { token: newToken, user: userData } = response.data.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(normalizeUser(userData));
        cacheUser(userData);

        return normalizeUser(userData);
    };

    const verifyOTP = async (tempUserId, otpCode) => {
        const response = await api.post('auth/register/verify-otp', {
            tempUserId,
            otp: otpCode
        });

        const { token: newToken, user: userData } = response.data.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(normalizeUser(userData));
        cacheUser(userData);

        return normalizeUser(userData);
    };

    const logout = async () => {
        try {
            // Call backend to clear HTTPOnly cookie
            await api.post('auth/logout');
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with local cleanup even if API call fails
        }

        // Clear localStorage (for backward compatibility)
        localStorage.removeItem('token');
        sessionStorage.removeItem('cachedUser');
        setToken(null);
        setUser(null);
    };

    const updateProfile = async (data) => {
        const response = await api.put('auth/update', data);
        const updated = normalizeUser(response.data.data.user);
        setUser(updated);
        cacheUser(response.data.data.user);
        return updated;
    };

    const forgotPassword = async (email) => {
        const response = await api.post('auth/forgot-password', { email });
        return response.data;
    };

    const resetPassword = async (token, password) => {
        const response = await api.post(`auth/reset-password/${token}`, { password });
        if (response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
            setToken(response.data.data.token);
        }
        return response.data;
    };

    const changePassword = async (currentPassword, newPassword) => {
        const response = await api.post('auth/change-password', { currentPassword, newPassword });
        return response.data;
    };

    // Google OAuth Login
    const googleLogin = async (googleData) => {
        let finalData = { ...googleData };

        // If we only have accessToken, fetch profile info from Google
        if (googleData.accessToken && !googleData.googleId) {
            try {
                // Fetch profile using the access token
                const googleRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleData.accessToken}`);
                finalData = {
                    email: googleRes.data.email,
                    name: googleRes.data.name,
                    googleId: googleRes.data.sub,
                    avatar: googleRes.data.picture,
                    role: googleData.role
                };
            } catch (error) {
                console.error('Failed to fetch Google profile:', error);
                throw new Error('Failed to retrieve your Google profile information. Please try again.');
            }
        }

        const response = await api.post('auth/google', finalData);
        const { token: newToken, user: userData } = response.data.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(normalizeUser(userData));

        return normalizeUser(userData);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        verifyOTP,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        changePassword,
        googleLogin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
