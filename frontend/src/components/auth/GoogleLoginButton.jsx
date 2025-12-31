import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { FaGoogle } from 'react-icons/fa';

/**
 * Google Sign-In Button Component
 * Uses the official @react-oauth/google library
 */
const GoogleLoginButton = ({ onSuccess, onError, text = "Continue with Google" }) => {
    const handleSuccess = (credentialResponse) => {
        if (onSuccess) {
            onSuccess(credentialResponse);
        }
    };

    const handleError = () => {
        console.error('Google login failed');
        if (onError) {
            onError();
        }
    };

    return (
        <div className="w-full">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap
                theme="filled_black"
                shape="pill"
                size="large"
                width="100%"
                text="continue_with"
                context="signin"
            />
        </div>
    );
};

/**
 * Custom styled Google button (alternative)
 */
export const CustomGoogleButton = ({ onClick, loading, text = "Continue with Google" }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-800 font-medium border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
            ) : (
                <>
                    <FaGoogle className="text-lg" style={{ color: '#4285F4' }} />
                    <span>{text}</span>
                </>
            )}
        </motion.button>
    );
};

export default GoogleLoginButton;
