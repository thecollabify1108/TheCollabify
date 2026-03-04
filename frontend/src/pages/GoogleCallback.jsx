import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * GoogleCallback — handles the return from Google OAuth redirect
 * 
 * Google redirects back here with:
 *   #access_token=...&token_type=Bearer&...&state=role:creator|seller
 * 
 * We read the access_token from the URL hash, fetch the user profile,
 * then call the backend googleLogin and redirect to the dashboard.
 * 
 * This approach is completely COOP-free since there is no popup.
 */
const GoogleCallback = () => {
    const navigate = useNavigate();
    const { googleLogin } = useAuth();
    const [status, setStatus] = useState('Processing your sign-in...');

    useEffect(() => {
        const processCallback = async () => {
            try {
                // Parse the URL fragment (hash after #)
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);

                const accessToken = params.get('access_token');
                const error = params.get('error');
                const state = params.get('state'); // e.g. "role:creator" or "role:seller"

                if (error) {
                    toast.error(`Google sign-in was cancelled or failed: ${error}`);
                    navigate('/register');
                    return;
                }

                if (!accessToken) {
                    // Could also be an auth-code response — check query params
                    const searchParams = new URLSearchParams(window.location.search);
                    const code = searchParams.get('code');
                    if (!code) {
                        toast.error('Google sign-in failed — no token received');
                        navigate('/register');
                        return;
                    }
                }

                setStatus('Fetching your Google profile...');

                // Fetch user profile using the access token
                const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                if (!resp.ok) {
                    throw new Error('Failed to fetch Google profile');
                }

                const profile = await resp.json();

                // Extract role from state param (e.g. "role:creator")
                let role = undefined;
                if (state && state.startsWith('role:')) {
                    role = state.replace('role:', '');
                    if (!['creator', 'seller'].includes(role)) role = undefined;
                }

                setStatus('Creating your account...');

                const user = await googleLogin({
                    email: profile.email,
                    name: profile.name,
                    googleId: profile.sub,
                    avatar: profile.picture,
                    role
                });

                toast.success('Welcome to TheCollabify!');

                if (user.role === 'creator') navigate('/creator/dashboard', { replace: true });
                else if (user.role === 'seller') navigate('/seller/dashboard', { replace: true });
                else if (user.role === 'admin') navigate('/admin', { replace: true });
                else navigate('/register', { replace: true });

            } catch (err) {
                console.error('Google callback error:', err);
                toast.error(err?.response?.data?.message || 'Google sign-in failed. Please try again.');
                navigate('/register');
            }
        };

        processCallback();
    }, [navigate, googleLogin]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950">
            <div className="text-center space-y-4">
                {/* Spinner */}
                <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
                <p className="text-dark-300 text-sm font-medium">{status}</p>
                <p className="text-dark-500 text-xs">Please wait, do not close this tab</p>
            </div>
        </div>
    );
};

export default GoogleCallback;
