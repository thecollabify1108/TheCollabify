import React from 'react';
import { motion } from 'framer-motion';
import {
    FaHandshake,
    FaCheckCircle,
    FaComments,
    FaFileContract,
    FaRocket,
    FaStar,
    FaTimesCircle
} from 'react-icons/fa';

/**
 * Collaboration Lifecycle States
 */
const STAGE_CONFIG = {
    REQUESTED: { icon: FaHandshake, label: 'Requested', color: 'primary' },
    ACCEPTED: { icon: FaCheckCircle, label: 'Accepted', color: 'blue' },
    IN_DISCUSSION: { icon: FaComments, label: 'Discussing', color: 'purple' },
    AGREED: { icon: FaFileContract, label: 'Agreed', color: 'indigo' },
    IN_PROGRESS: { icon: FaRocket, label: 'In Progress', color: 'cyan' },
    COMPLETED: { icon: FaStar, label: 'Completed', color: 'emerald' },
    CANCELLED: { icon: FaTimesCircle, label: 'Cancelled', color: 'red' }
};

const STAGE_ORDER = ['REQUESTED', 'ACCEPTED', 'IN_DISCUSSION', 'AGREED', 'IN_PROGRESS', 'COMPLETED'];

const CollaborationStepper = ({ currentStatus, className = "" }) => {
    const isCancelled = currentStatus === 'CANCELLED';
    const currentIndex = STAGE_ORDER.indexOf(currentStatus);

    // Steps to display
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

    const getColors = (status, color) => {
        switch (status) {
            case 'completed':
                return {
                    icon: `text-${color}-400`,
                    bg: `bg-${color}-500/20`,
                    border: `border-${color}-500/30`,
                    line: `bg-${color}-500/50`
                };
            case 'current':
                return {
                    icon: `text-white`,
                    bg: `bg-${color}-500 shadow-glow-${color}`,
                    border: `border-${color}-400`,
                    line: `bg-dark-700`
                };
            default: // future or dimmed
                return {
                    icon: `text-dark-500`,
                    bg: `bg-dark-800`,
                    border: `border-dark-700/50`,
                    line: `bg-dark-700`
                };
        }
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-y-s6 md:gap-y-0 relative">
                {steps.map((stepKey, index) => {
                    const step = STAGE_CONFIG[stepKey];
                    const status = getStepStatus(index, stepKey);
                    const colors = getColors(status, step.color);
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
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${colors.bg} ${colors.border}`}
                                    aria-label={`${step.label} - ${status}`}
                                >
                                    <step.icon className={`text-lg ${colors.icon}`} />
                                </motion.div>

                                {/* Connecting Line (Horizontal - Desktop) */}
                                {!isLast && (
                                    <div className="hidden md:block absolute left-10 top-5 w-[calc(100%-40px)] h-0.5 z-0">
                                        <div className={`h-full w-full transition-colors duration-500 ${colors.line}`} />
                                    </div>
                                )}

                                {/* Connecting Line (Vertical - Mobile) */}
                                {!isLast && (
                                    <div className="md:hidden absolute left-5 top-10 w-0.5 h-s8 z-0">
                                        <div className={`w-full h-full transition-colors duration-500 ${colors.line}`} />
                                    </div>
                                )}
                            </div>

                            {/* Label */}
                            <div className="ml-s4 md:ml-0 md:mt-s3 text-left md:text-center">
                                <p className={`text-xs-pure font-black uppercase tracking-widest transition-colors duration-300 ${status === 'current' ? 'text-dark-100' : 'text-dark-500'
                                    }`}>
                                    {step.label}
                                </p>
                                {status === 'current' && (
                                    <motion.div
                                        layoutId="active-dot"
                                        className={`h-1 w-1 rounded-full mx-auto mt-1 hidden md:block bg-${step.color}-500 shadow-glow`}
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
