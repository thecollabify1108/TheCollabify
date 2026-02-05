import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { paymentAPI } from '../services/api';
import toast from 'react-hot-toast';

const PaymentVerification = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (sessionId) {
            verifyPayment();
        } else {
            setStatus('error');
        }
    }, [sessionId]);

    const verifyPayment = async () => {
        try {
            const res = await paymentAPI.verifySession(sessionId);
            if (res.data.success) {
                setStatus('success');
                toast.success('Payment successful and escrowed!');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Verification failed:', error);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full glass-card p-8 text-center"
            >
                {status === 'verifying' && (
                    <div className="space-y-4">
                        <FaSpinner className="w-12 h-12 text-primary-500 animate-spin mx-auto" />
                        <h2 className="text-2xl font-bold text-dark-100">Verifying Payment</h2>
                        <p className="text-dark-400">Please wait while we confirm your transaction with Stripe...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <FaCheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-dark-100">Payment Secured!</h2>
                        <p className="text-dark-400">Your payment has been successfully placed in escrow. The creator has been notified to start the campaign.</p>
                        <button
                            onClick={() => navigate('/seller/dashboard')}
                            className="w-full btn-3d bg-emerald-600 hover:bg-emerald-700 py-3 mt-6"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <FaTimesCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-dark-100">Verification Failed</h2>
                        <p className="text-dark-400">We couldn't verify your payment. If you believe this is an error, please contact support.</p>
                        <button
                            onClick={() => navigate('/seller/dashboard')}
                            className="w-full btn-outline border-dark-600 text-dark-100 py-3 mt-6"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default PaymentVerification;
