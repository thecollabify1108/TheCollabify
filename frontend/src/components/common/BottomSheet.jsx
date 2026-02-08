import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const BottomSheet = ({
    isOpen,
    onClose,
    title,
    children,
    className = '',
    bodyClassName = 'p-6 pt-2 md:pt-0 pb-10 md:pb-6'
}) => {
    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-sm transition-opacity"
                    />

                    {/* Sheet / Modal */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) {
                                onClose();
                            }
                        }}
                        className={`fixed bottom-0 left-0 right-0 z-50 bg-dark-900 
                            rounded-t-3xl border-t border-dark-700 shadow-2xl 
                            max-h-[90vh] overflow-y-auto overflow-x-hidden
                            md:inset-0 md:m-auto md:max-w-4xl md:max-h-[85vh] md:rounded-2xl md:border
                            ${className}`}
                    >
                        {/* Drag Handle (Mobile only) */}
                        <div className="w-full flex justify-center pt-4 pb-2 md:hidden">
                            <div className="w-12 h-1.5 bg-dark-700 rounded-full" />
                        </div>

                        {/* Content Header */}
                        <div className="px-6 pb-4 md:pt-6 flex items-center justify-between sticky top-0 bg-dark-900/95 backdrop-blur z-10 md:bg-dark-900 border-b border-dark-800 md:border-none">
                            {title && (
                                <h3 className="text-lg font-bold text-dark-100">{title}</h3>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-dark-800 text-dark-400 transition-colors md:absolute md:top-4 md:right-4"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className={bodyClassName}>
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BottomSheet;
