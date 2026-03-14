import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * OAuthCompleteRegistration
 *
 * Handles the backend redirect for NEW Google users:
 *   GET /oauth/complete-registration?role=<creator|seller|>
 *
 * Supports TWO backend modes:
 *   - Old backend (session-based): calls POST /api/oauth/complete-registration
 *   - New backend (JWT-based):     ?oauthProfile=<jwt> is present — calls googleLogin() directly
 */
const OAuthCompleteRegistration = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { googleLogin } = useAuth();

    const oauthProfile = searchParams.get('oauthProfile') || '';
    const preselectedRole = searchParams.get('role') || '';
    const [role, setRole] = useState(
        ['creator', 'seller'].includes(preselectedRole) ? preselectedRole : ''
    );
    const [loading, setLoading] = useState(false);
    // For old (session-based) backend, we verify a session exists
    const [sessionChecked, setSessionChecked] = useState(!!oauthProfile); // skip check if JWT mode
    const [hasSession, setHasSession] = useState(!!oauthProfile);          // JWT mode = always valid

    // Decode JWT profile for display (new backend mode)
    const jwtProfile = oauthProfile ? (() => {
        try {
            const [, payloadB64] = oauthProfile.split('.');
            return JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
        } catch { return null; }
    })() : null;

    const [profileInfo, setProfileInfo] = useState(jwtProfile);

    // For session-based (old) backend: verify session exists
    useEffect(() => {
        // Skip session check when using JWT-based flow
        if (oauthProfile) return;

        const checkSession = async () => {
            try {
                const res = await api.get('oauth/session-data');
                if (res.data?.success) {
                    setHasSession(true);
                    setProfileInfo(res.data.data);
                } else {
                    setHasSession(false);
                }
            } catch {
                setHasSession(false);
            } finally {
                setSessionChecked(true);
            }
        };
        checkSession();
    }, [oauthProfile]);

    // If no session found after check, redirect back to register
    useEffect(() => {
        if (sessionChecked && !hasSession) {
            toast.error('Session expired. Please sign in with Google again.');
            navigate('/register');
        }
    }, [sessionChecked, hasSession, navigate]);

    const handleSubmit = async () => {
        if (!role) {
            toast.error('Please select your role to continue');
            return;
        }
        setLoading(true);
        try {
            let token, user;

            if (oauthProfile) {
                // ── New backend (JWT-based) ────────────────────────────────────
                // Send the signed token to backend verification; do not trust decoded payload on client.
                user = await googleLogin({
                    profileToken: oauthProfile,
                    role
                });
                // googleLogin sets token internally via AuthContext
            } else {
                // ── Old backend (session-based) ───────────────────────────────
                const res = await api.post('oauth/complete-registration', { role });
                token = res.data.data.token;
                user = res.data.data.user;
                localStorage.setItem('token', token);
            }

            toast.success(`Welcome to TheCollabify, ${user.name}! 🎉`);

            setTimeout(() => {
                if (user.role?.toLowerCase() === 'creator') {
                    navigate('/creator/dashboard', { replace: true });
                } else {
                    navigate('/seller/dashboard', { replace: true });
                }
            }, 500);
        } catch (err) {
            const msg = err?.response?.data?.message;
            if (msg?.includes('already exists')) {
                toast.error('Account already exists. Please sign in instead.');
                navigate('/login');
            } else if (msg?.includes('No Google authentication')) {
                toast.error('Session expired. Please sign in with Google again.');
                navigate('/register');
            } else {
                toast.error(msg || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!sessionChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-950">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
                    <p className="text-dark-300 text-sm">Verifying your Google account...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    {profileInfo?.avatar && (
                        <img
                            src={profileInfo.avatar}
                            alt={profileInfo.name}
                            className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-primary-500"
                        />
                    )}
                    <h1 className="text-2xl font-bold text-white">
                        Welcome{profileInfo?.name ? `, ${profileInfo.name.split(' ')[0]}` : ''}! 👋
                    </h1>
                    <p className="text-dark-400 text-sm mt-1">
                        One last step — tell us how you'll use Collabify
                    </p>
                </div>

                {/* Role Selection */}
                <div className="space-y-4 mb-8">
                    <button
                        onClick={() => setRole('creator')}
                        className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                            role === 'creator'
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-dark-700 bg-dark-900 hover:border-dark-500'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🎨</span>
                            <div>
                                <p className="font-semibold text-white">I'm a Creator</p>
                                <p className="text-dark-400 text-sm">Instagram influencer, content creator, artist</p>
                            </div>
                            {role === 'creator' && (
                                <span className="ml-auto text-primary-500 text-xl">✓</span>
                            )}
                        </div>
                    </button>

                    <button
                        onClick={() => setRole('seller')}
                        className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                            role === 'seller'
                                ? 'border-secondary-500 bg-secondary-500/10'
                                : 'border-dark-700 bg-dark-900 hover:border-dark-500'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🏢</span>
                            <div>
                                <p className="font-semibold text-white">I'm a Brand</p>
                                <p className="text-dark-400 text-sm">Business owner, marketer, brand manager</p>
                            </div>
                            {role === 'seller' && (
                                <span className="ml-auto text-secondary-500 text-xl">✓</span>
                            )}
                        </div>
                    </button>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!role || loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Creating your account...
                        </span>
                    ) : (
                        role ? `Continue as ${role === 'creator' ? 'Creator' : 'Brand'} →` : 'Select a role to continue'
                    )}
                </button>

                <p className="text-center text-dark-500 text-xs mt-4">
                    By continuing, you agree to our{' '}
                    <a href="/terms" className="text-primary-400 hover:underline">Terms</a> and{' '}
                    <a href="/privacy" className="text-primary-400 hover:underline">Privacy Policy</a>.
                </p>
            </motion.div>
        </div>
    );
};

export default OAuthCompleteRegistration;
