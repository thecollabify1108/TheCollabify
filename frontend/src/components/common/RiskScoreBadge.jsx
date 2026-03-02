import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiShieldCheck, HiShieldExclamation } from 'react-icons/hi';
import { FaShieldAlt } from 'react-icons/fa';

/**
 * RiskScoreBadge Component
 * Displays a composite risk score (0–100) with breakdown tooltip.
 * Uses neutral, non-accusatory language throughout.
 */

const RISK_CONFIG = {
    low: {
        label: 'Low Risk',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        icon: HiShieldCheck,
        barColor: 'bg-emerald-500',
        description: 'Metrics appear consistent across all evaluated dimensions.'
    },
    medium: {
        label: 'Medium Risk',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        icon: FaShieldAlt,
        barColor: 'bg-amber-500',
        description: 'Some metrics show variance that may warrant review. Minor fluctuations are common.'
    },
    high: {
        label: 'High Risk',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        icon: HiShieldExclamation,
        barColor: 'bg-red-500',
        description: 'Significant inconsistencies detected across one or more dimensions. Consider reviewing before proceeding.'
    }
};

const COMPONENT_LABELS = {
    riskFollowerMismatch: { label: 'Follower Consistency', weight: '40%' },
    riskEngagementAnomaly: { label: 'Engagement Patterns', weight: '25%' },
    riskGrowthInstability: { label: 'Growth Stability', weight: '20%' },
    riskContentInactivity: { label: 'Content Activity', weight: '15%' }
};

const sizeMap = {
    sm: { badge: 'px-1.5 py-0.5 text-[9px] gap-1', icon: 'w-2.5 h-2.5', tooltip: 'w-64' },
    md: { badge: 'px-2 py-1 text-[10px] gap-1', icon: 'w-3 h-3', tooltip: 'w-72' },
    lg: { badge: 'px-3 py-1.5 text-xs gap-1.5', icon: 'w-3.5 h-3.5', tooltip: 'w-80' }
};

const RiskScoreBadge = ({
    compositeRiskScore = 0,
    riskLevel = 'low',
    riskFollowerMismatch,
    riskEngagementAnomaly,
    riskGrowthInstability,
    riskContentInactivity,
    size = 'md',
    showScore = false
}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const badgeRef = useRef(null);
    const tooltipRef = useRef(null);

    const config = RISK_CONFIG[riskLevel] || RISK_CONFIG.low;
    const sz = sizeMap[size] || sizeMap.md;
    const Icon = config.icon;

    const hasBreakdown = riskFollowerMismatch != null || riskEngagementAnomaly != null;

    useEffect(() => {
        if (!showTooltip) return;
        const handleClick = (e) => {
            if (badgeRef.current && !badgeRef.current.contains(e.target) &&
                tooltipRef.current && !tooltipRef.current.contains(e.target)) {
                setShowTooltip(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showTooltip]);

    const getBarColor = (value) => {
        if (value <= 30) return 'bg-emerald-500';
        if (value <= 60) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="relative inline-flex">
            <button
                ref={badgeRef}
                onClick={() => setShowTooltip(!showTooltip)}
                className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border cursor-pointer transition-all hover:scale-105 ${sz.badge} ${config.bg} ${config.color} ${config.border} shadow-sm`}
            >
                <Icon className={sz.icon} />
                <span>{config.label}</span>
                {showScore && (
                    <span className="opacity-70 ml-0.5">({compositeRiskScore})</span>
                )}
            </button>

            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        ref={tooltipRef}
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 ${sz.tooltip} p-3 rounded-xl bg-dark-900 border border-dark-700 shadow-2xl`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <Icon className={`w-4 h-4 ${config.color}`} />
                                <span className="text-xs font-bold text-dark-200">{config.label}</span>
                            </div>
                            <span className={`text-lg font-black ${config.color}`}>{compositeRiskScore}</span>
                        </div>

                        {/* Description */}
                        <p className="text-[10px] text-dark-400 leading-relaxed mb-3">{config.description}</p>

                        {/* Breakdown Bars */}
                        {hasBreakdown && (
                            <div className="space-y-2">
                                <div className="text-[9px] font-bold text-dark-500 uppercase tracking-widest mb-1">Score Breakdown</div>
                                {Object.entries(COMPONENT_LABELS).map(([key, meta]) => {
                                    const value = { riskFollowerMismatch, riskEngagementAnomaly, riskGrowthInstability, riskContentInactivity }[key];
                                    if (value == null) return null;
                                    return (
                                        <div key={key}>
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-[10px] text-dark-300">{meta.label}</span>
                                                <span className="text-[9px] text-dark-500">{Math.round(value)} <span className="opacity-60">({meta.weight})</span></span>
                                            </div>
                                            <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${getBarColor(value)}`}
                                                    style={{ width: `${Math.min(100, value)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Arrow */}
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-dark-900 border-l border-t border-dark-700 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RiskScoreBadge;
