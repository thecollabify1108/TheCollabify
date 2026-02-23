import React from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';

/**
 * Collaboration Lifecycle States
 * M9 Fix: Replaced react-icons with custom Icon.jsx system
 * m10 Fix: All Tailwind classes are fully hardcoded (no dynamic string interpolation)
 *          to prevent Tailwind JIT purge from stripping them in production builds.
 */
const STAGE_CONFIG = {
    REQUESTED: {
        icon: 'handshake',
        label: 'Requested',
        completedClasses: { icon: 'text-violet-400', bg: 'bg-violet-500/20', border: 'border-violet-500/30', line: 'bg-violet-500/50' },
        currentClasses: { icon: 'text-white', bg: 'bg-violet-500 shadow-lg shadow-violet-500/30', border: 'border-violet-400', line: 'bg-dark-700' }
    },
    ACCEPTED: {
        icon: 'check-circle',
        label: 'Accepted',
        completedClasses: { icon: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', line: 'bg-blue-500/50' },
        currentClasses: { icon: 'text-white', bg: 'bg-blue-500 shadow-lg shadow-blue-500/30', border: 'border-blue-400', line: 'bg-dark-700' }
    },
    IN_DISCUSSION: {
        icon: 'comments',
        label: 'Discussing',
        completedClasses: { icon: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', line: 'bg-purple-500/50' },
        currentClasses: { icon: 'text-white', bg: 'bg-purple-500 shadow-lg shadow-purple-500/30', border: 'border-purple-400', line: 'bg-dark-700' }
    },
    AGREED: {
        icon: 'file-contract',
        label: 'Agreed',
        completedClasses: { icon: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', line: 'bg-indigo-500/50' },
        currentClasses: { icon: 'text-white', bg: 'bg-indigo-500 shadow-lg shadow-indigo-500/30', border: 'border-indigo-400', line: 'bg-dark-700' }
    },
    IN_PROGRESS: {
        icon: 'rocket',
        label: 'In Progress',
        completedClasses: { icon: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', line: 'bg-cyan-500/50' },
        currentClasses: { icon: 'text-white', bg: 'bg-cyan-500 shadow-lg shadow-cyan-500/30', border: 'border-cyan-400', line: 'bg-dark-700' }
    },
    COMPLETED: {
        icon: 'star',
        label: 'Completed',
        completedClasses: { icon: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', line: 'bg-emerald-500/50' },
        currentClasses: { icon: 'text-white', bg: 'bg-emerald-500 shadow-lg shadow-emerald-500/30', border: 'border-emerald-400', line: 'bg-dark-700' }
    },
    CANCELLED: {
        icon: 'times-circle',
        label: 'Cancelled',
        completedClasses: { icon: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', line: 'bg-red-500/50' },
        currentClasses: { icon: 'text-white', bg: 'bg-red-500 shadow-lg shadow-red-500/30', border: 'border-red-400', line: 'bg-dark-700' }
    }
};

const FUTURE_CLASSES = { icon: 'text-dark-500', bg: 'bg-dark-800', border: 'border-dark-700/50', line: 'bg-dark-700' };

const STAGE_ORDER = ['REQUESTED', 'ACCEPTED', 'IN_DISCUSSION', 'AGREED', 'IN_PROGRESS', 'COMPLETED'];

const CollaborationStepper = ({ currentStatus, className = "" }) => {
    const isCancelled = currentStatus === 'CANCELLED';
    const currentIndex = STAGE_ORDER.indexOf(currentStatus);

    const steps = isCancelled
        ? [...STAGE_ORDER.slice(0, Math.max(0, currentIndex)), 'CANCELLED']
        : STAGE_ORDER;

    const getStepStatus = (index, stepKey) => {
        if (isCancelled && stepKey === 'CANCELLED') return 'current';
        if (isCancelled) return 'dimmed';
        if (index < currentIndex) return 'completed';
        if (index === currentIndex) return 'current';
        return 'future';
    };

    const getClasses = (status, stepKey) => {
        const cfg = STAGE_CONFIG[stepKey];
        if (status === 'completed') return cfg.completedClasses;
        if (status === 'current') return cfg.currentClasses;
        return FUTURE_CLASSES; // future or dimmed
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-y-6 md:gap-y-0 relative">
                {steps.map((stepKey, index) => {
                    const step = STAGE_CONFIG[stepKey];
                    const status = getStepStatus(index, stepKey);
                    const classes = getClasses(status, stepKey);
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={stepKey} className="flex flex-row md:flex-col items-center flex-1 w-full md:w-auto group">
                            {/* Step Indicator */}
                            <div className="relative flex items-center md:flex-col">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: status === 'current' ? 1.1 : 1,
                                        opacity: status === 'dimmed' ? 0.5 : 1
                                    }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${classes.bg} ${classes.border}`}
                                    aria-label={`${step.label} - ${status}`}
                                >
                                    <Icon name={step.icon} size={18} className={classes.icon} />
                                </motion.div>

                                {/* Connecting Line (Horizontal - Desktop) */}
                                {!isLast && (
                                    <div className="hidden md:block absolute left-10 top-5 w-[calc(100%-40px)] h-0.5 z-0">
                                        <div className={`h-full w-full transition-colors duration-500 ${classes.line}`} />
                                    </div>
                                )}

                                {/* Connecting Line (Vertical - Mobile) */}
                                {!isLast && (
                                    <div className="md:hidden absolute left-5 top-10 w-0.5 h-8 z-0">
                                        <div className={`w-full h-full transition-colors duration-500 ${classes.line}`} />
                                    </div>
                                )}
                            </div>

                            {/* Label */}
                            <div className="ml-4 md:ml-0 md:mt-3 text-left md:text-center">
                                <p className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${status === 'current' ? 'text-dark-100' : 'text-dark-500'
                                    }`}>
                                    {step.label}
                                </p>
                                {status === 'current' && (
                                    <motion.div
                                        layoutId="active-dot"
                                        className="h-1 w-1 rounded-full mx-auto mt-1 hidden md:block bg-primary-500"
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CollaborationStepper;
