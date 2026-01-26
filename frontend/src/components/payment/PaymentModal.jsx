import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShieldAlt, FaCheck } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const PaymentModal = ({ plan, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [processing, setProcessing] = useState(false);

    const handlePayment = async () => {
        try {
            setProcessing(true);

            // Create order
            const { data } = await axios.post('/api/payments/create-order', {
                amount: plan.price,
                planId: plan.id
            });

            // Razorpay options
            const options = {
                key: data.data.keyId,
                amount: data.data.amount,
                currency: data.data.currency,
                order_id: data.data.orderId,
                name: 'TheCollabify',
                description: `${plan.name} Subscription`,
                image: '/logo.png', // Add your logo path
                handler: async function (response) {
                    try {
                        // Verify payment
                        const verifyRes = await axios.post('/api/payments/verify-payment', {
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        });

                        if (verifyRes.data.success) {
                            toast.success('Payment successful!');
                            onSuccess?.(verifyRes.data.data);
                            onClose?.();
                        }
                    } catch (error) {
                        toast.error('Payment verification failed');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || ''
                },
                theme: {
                    color: '#8B5CF6'
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
            setProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-dark-800 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Choose Your Plan</h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-dark-400 hover:text-white transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Plan Details */}
                    <div className="p-8">
                        <div className="mb-6 text-center">
                            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-3 inline-block">
                                Selected Plan
                            </span>
                            <h4 className="text-3xl font-bold text-white mb-2">{plan.name}</h4>
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-2xl font-bold text-white">₹{plan.price}</span>
                                <span className="text-dark-400">/month</span>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 mb-8">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-dark-300">
                                    <div className="text-purple-500">
                                        <FaCheck className="text-sm" />
                                    </div>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Payment Button */}
                        <button
                            onClick={handlePayment}
                            disabled={processing}
                            className={`w-full py-4 rounded-2xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] ${processing
                                    ? 'bg-dark-700 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/20'
                                }`}
                        >
                            {processing ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </div>
                            ) : (
                                `Subscribe for ₹${plan.price}`
                            )}
                        </button>

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-dark-400">
                            <FaShieldAlt className="text-purple-500" />
                            Secure payment powered by Razorpay
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PaymentModal;
