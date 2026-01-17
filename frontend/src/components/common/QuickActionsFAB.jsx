import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * QuickActionsFAB - Floating Action Button for quick access to key features
 * @param {string} userRole - 'creator' or 'seller'
 * @param {Function} onBrowse - Handler for browse action
 * @param {Function} onQuickApply - Handler for quick apply (creators only)
 * @param {Function} onCreateCampaign - Handler for create campaign (sellers only)
 */
const QuickActionsFAB = ({ userRole, onBrowse, onQuickApply, onCreateCampaign }) => {
    const [isOpen, setIsOpen] = useState(false);

    const creatorActions = [
        {
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
            label: 'Browse',
            action: onBrowse,
            bg: 'bg-primary-500'
        },
        {
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
            label: 'Quick Apply',
            action: onQuickApply,
            bg: 'bg-emerald-500'
        }
    ];

    const sellerActions = [
        {
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
            label: 'Search',
            action: onBrowse,
            bg: 'bg-primary-500'
        },
        {
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
            label: 'New Campaign',
            action: onCreateCampaign,
            bg: 'bg-secondary-500'
        }
    ];

    const actions = userRole === 'creator' ? creatorActions : sellerActions;

    return (
        <div className="fixed bottom-6 right-6 z-40">
            {/* Action Buttons */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    className="flex flex-col gap-3 mb-3"
                >
                    {actions.map((action, index) => (
                        <motion.button
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => {
                                action.action();
                                setIsOpen(false);
                            }}
                            className={`flex items-center gap-3 px-4 py-3 ${action.bg} rounded-full shadow-lg text-white font-medium hover:shadow-xl transition-all hover:scale-105 group`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="w-8 h-8 flex items-center justify-center">
                                {action.icon}
                            </span>
                            <span className="pr-2">{action.label}</span>
                        </motion.button>
                    ))}
                </motion.div>
            )}

            {/* Main FAB Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${isOpen ? 'bg-red-500 rotate-45' : 'bg-primary-500'
                    }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{ rotate: isOpen ? 45 : 0 }}
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                )}
            </motion.button>
        </div>
    );
};

export default QuickActionsFAB;
