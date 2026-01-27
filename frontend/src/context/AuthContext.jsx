import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Fetch user on mount if token exists
    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data.data.user);
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    // Clear invalid token (don't call logout() to avoid circular dependency)
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        localStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                    }
                    // For network errors, keep the token and try again later
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [token]);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token: newToken, user: userData } = response.data.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);

        return userData;
    };

    const register = async (name, email, password, role) => {
        const response = await api.post('/auth/register', { name, email, password, role });
        const { token: newToken, user: userData } = response.data.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);

        return userData;
    };

    const verifyOTP = async (tempUserId, otpCode) => {
        const response = await api.post('/auth/register/verify-otp', {
            tempUserId,
            otp: otpCode
        });

        const { token: newToken, user: userData } = response.data.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);

        return userData;
    };

    const logout = async () => {
        try {
            // Call backend to clear HTTPOnly cookie
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with local cleanup even if API call fails
        }

        // Clear localStorage (for backward compatibility)
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updateProfile = async (data) => {
        const response = await api.put('/auth/update', data);
        setUser(response.data.data.user);
        return response.data.data.user;
    };

    const forgotPassword = async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    };

    const resetPassword = async (token, password) => {
        const response = await api.post(`/auth/reset-password/${token}`, { password });
        if (response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
            setToken(response.data.data.token);
        }
        return response.data;
    };

    const changePassword = async (currentPassword, newPassword) => {
        const response = await api.post('/auth/change-password', { currentPassword, newPassword });
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

        const response = await api.post('/auth/google', finalData);
        const { token: newToken, user: userData } = response.data.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);

        return userData;
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
