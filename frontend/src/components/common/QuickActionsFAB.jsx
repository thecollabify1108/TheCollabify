import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';

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
            icon: <Icon name="search" size={20} />,
            label: 'Browse',
            action: onBrowse,
            bg: 'bg-primary-500'
        },
        {
            icon: <Icon name="plus" size={20} />,
            label: 'Quick Apply',
            action: onQuickApply,
            bg: 'bg-emerald-500'
        }
    ];

    const sellerActions = [
        {
            icon: <Icon name="search" size={20} />,
            label: 'Search',
            action: onBrowse,
            bg: 'bg-primary-500'
        },
        {
            icon: <Icon name="plus" size={20} />,
            label: 'New Campaign',
            action: onCreateCampaign,
            bg: 'bg-secondary-500'
        }
    ];

    const actions = userRole === 'creator' ? creatorActions : sellerActions;

    return (
        <div className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] md:bottom-8 right-6 z-50">
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
                    <Icon name="close" size={24} className="text-white" />
                ) : (
                    <Icon name="plus" size={24} className="text-white" />
                )}
            </motion.button>
        </div>
    );
};

export default QuickActionsFAB;
