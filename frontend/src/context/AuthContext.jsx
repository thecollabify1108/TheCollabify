import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

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
            // FIX #9: Check for token in URL *hash* first (OAuth redirect now uses #token=
            // instead of ?token= to prevent token from being logged by Cloudflare/Azure/Sentry).
            // Also support legacy ?token= query param for backward compatibility.
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const urlParams = new URLSearchParams(window.location.search);
            const urlToken = hashParams.get('token') || urlParams.get('token');

            if (urlToken) {
                // OAuth callback - save token and clean URL
                localStorage.setItem('token', urlToken);
                setToken(urlToken);
                // Remove token from URL for security (clear both hash and query)
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            const currentToken = urlToken || token;

            if (currentToken) {
                try {
                    // 25s timeout — Azure cold start can take 15-20s on free/basic tier
                    const response = await api.get('auth/me', { timeout: 25000 });
                    const freshUser = normalizeUser(response.data.data.user);
                    setUser(freshUser);
                    cacheUser(response.data.data.user);
                } catch (error) {
                    const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED' || error.message?.includes('timeout');
                    const isAuthError = error.response?.status === 401 || error.response?.status === 403;

                    if (isAuthError) {
                        // Token is invalid — clear it
                        localStorage.removeItem('token');
                        sessionStorage.removeItem('cachedUser');
                        setToken(null);
                        setUser(null);
                    } else if (!isTimeout) {
                        // Only log unexpected errors, not cold-start timeouts
                        console.warn('Auth check failed:', error.message || error);
                    }
                    // For timeouts: silently keep the cached user — backend is waking up
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

    // FIX #8: Removed dead register() function that called non-existent /api/auth/register.
    // Registration uses the 2-step OTP flow (send-otp → verify-otp) called directly in Register.jsx.
    // Keeping this stub to avoid breaking any stale imports, but it throws clearly instead of silently 404ing.
    const register = async () => {
        throw new Error('register() is deprecated. Use the OTP flow: auth/register/send-otp then auth/register/verify-otp');
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

    const resetPassword = async (email, otp, newPassword) => {
        const response = await api.post('auth/reset-password', { email, otp, newPassword });
        return response.data;
    };

    const changePassword = async (currentPassword, newPassword) => {
        const response = await api.post('auth/change-password', { currentPassword, newPassword });
        return response.data;
    };

    // FIX #3: googleLogin now accepts profileToken (signed JWT from backend) instead of
    // raw decoded fields. Backend verifies the signature — client can never forge a googleId.
    // Legacy path (raw fields) still supported for backward compat with old GoogleCallback versions.
    const googleLogin = async ({ profileToken, email, name, googleId, avatar, role }) => {
        const payload = profileToken
            ? { profileToken, role }  // new secure path
            : { email, name, googleId, avatar, role };  // legacy path
        const response = await api.post('oauth/google-login', payload, { timeout: 45000 });
        const { token: newToken, user: userData } = response.data.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(normalizeUser(userData));
        cacheUser(userData);
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
        googleLogin,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        changePassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
