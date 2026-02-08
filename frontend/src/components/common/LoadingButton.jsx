import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCheck, HiX } from 'react-icons/hi';

/**
 * LoadingButton - Reusable button with built-in loading state and premium micro-interactions.
 * Supports:
 * - Scale feedback on hover/press
 * - Async status transitions (idle -> loading -> success/error)
 * - Accessibility best practices
 */

const LoadingButton = ({
    children,
    loading = false,
    status = 'idle', // 'idle' | 'loading' | 'success' | 'error'
    disabled = false,
    onClick,
    type = 'button',
    variant = 'primary',
    className = '',
    fullWidth = false,
    icon: Icon = null,
    loadingText = null,
    successText = 'Saved!',
    errorText = 'Error',
    ...props
}) => {
    // Map legacy 'loading' prop to status if status is strictly 'idle' but loading is true
    const currentStatus = loading && status === 'idle' ? 'loading' : status;

    const baseClasses = 'btn relative overflow-hidden transition-all duration-200 flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500';

    const variantClasses = {
        primary: 'btn-primary shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30',
        secondary: 'btn-secondary',
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20',
        outline: 'border-2 border-primary text-primary hover:bg-primary/10',
        ghost: 'bg-transparent hover:bg-dark-800 text-dark-200 hover:text-white',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = (disabled || currentStatus === 'loading') ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.98] hover:scale-[1.02]';

    // Handle success/error state reset automatically if needed, or rely on parent

    const getStatusContent = () => {
        switch (currentStatus) {
            case 'loading':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                    >
                        <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <span>{loadingText || 'Loading...'}</span>
                    </motion.div>
                );
            case 'success':
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-white"
                    >
                        <HiCheck className="w-5 h-5" />
                        <span>{successText}</span>
                    </motion.div>
                );
            case 'error':
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-white"
                    >
                        <HiX className="w-5 h-5" />
                        <span>{errorText}</span>
                    </motion.div>
                );
            default:
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2"
                    >
                        {Icon && <Icon className="h-5 w-5" />}
                        <span>{children}</span>
                    </motion.div>
                );
        }
    };

    // Dynamic background for success/error states
    let finalVariantClass = variantClasses[variant] || variantClasses.primary;
    if (currentStatus === 'success') finalVariantClass = 'bg-emerald-600 border-transparent text-white shadow-lg shadow-emerald-500/20';
    if (currentStatus === 'error') finalVariantClass = 'bg-red-600 border-transparent text-white shadow-lg shadow-red-500/20';

    return (
        <button
            type={type}
            onClick={currentStatus === 'loading' ? undefined : onClick}
            disabled={disabled || currentStatus === 'loading'}
            className={`${baseClasses} ${finalVariantClass} ${widthClass} ${disabledClass} ${className}`}
            aria-busy={currentStatus === 'loading'}
            {...props}
        >
            <AnimatePresence mode="wait" initial={false}>
                {getStatusContent()}
            </AnimatePresence>
        </button>
    );
};

export default LoadingButton;
