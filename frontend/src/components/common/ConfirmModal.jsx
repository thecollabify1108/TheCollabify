import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import Icon from './Icon';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Are you sure?", 
    message = "This action cannot be undone.", 
    confirmText = "Confirm", 
    cancelText = "Cancel",
    variant = "danger" // 'danger', 'info', 'warning'
}) => {
    if (!isOpen) return null;

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: { scale: 0.9, opacity: 0, y: 20 },
        visible: { 
            scale: 1, 
            opacity: 1, 
            y: 0,
            transition: { type: "spring", damping: 25, stiffness: 300 }
        },
        exit: { 
            scale: 0.95, 
            opacity: 0, 
            y: 10,
            transition: { duration: 0.2 }
        }
    };

    const getVariantColors = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: 'text-red-400',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    button: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-500/20'
                };
            case 'warning':
                return {
                    icon: 'text-amber-400',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    button: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/20'
                };
            default: // info
                return {
                    icon: 'text-primary-400',
                    bg: 'bg-primary-500/10',
                    border: 'border-primary-500/20',
                    button: 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-primary-500/20'
                };
        }
    };

    const colors = getVariantColors();

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={overlayVariants}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={modalVariants}
                    className="relative w-full max-w-md glass-card rounded-premium-2xl overflow-hidden shadow-premium border border-dark-700/50"
                >
                    {/* Header with Icon */}
                    <div className="p-s6 flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-full ${colors.bg} ${colors.border} border flex items-center justify-center mb-s4 shadow-glow`}>
                            <Icon 
                                name={variant === 'danger' ? 'trash' : variant === 'warning' ? 'alert-triangle' : 'info'} 
                                className={colors.icon} 
                                size={32} 
                            />
                        </div>
                        
                        <h3 className="text-h3 font-black text-dark-100 mb-s2 uppercase tracking-tight">
                            {title}
                        </h3>
                        <p className="text-body text-dark-400 max-w-[280px]">
                            {message}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="p-s6 bg-dark-800/50 flex flex-col sm:flex-row gap-s3 border-t border-dark-700/50">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-200 font-bold transition-all border border-dark-600"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-3 px-4 rounded-xl text-white font-bold transition-all shadow-lg ${colors.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default ConfirmModal;
