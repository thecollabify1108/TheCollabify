import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { HiShieldCheck } from 'react-icons/hi';

const BADGE_CONFIG = {
    verified: {
        icon: HiShieldCheck,
        label: 'Verified Metrics',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        glow: 'shadow-emerald-500/10',
        tooltip: 'Follower data verified manually by the Collabify team. Data is reviewed monthly. Minor fluctuations may occur.'
    },
    mismatch_flagged: {
        icon: FaExclamationTriangle,
        label: 'Follower Mismatch Risk',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        glow: 'shadow-red-500/10',
        tooltip: 'Reported follower count differs significantly from verified data. Exercise caution — discrepancy may indicate inflated metrics.'
    },
    pending: {
        icon: FaClock,
        label: 'Pending Verification',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        glow: 'shadow-amber-500/10',
        tooltip: 'This creator\'s follower metrics have not yet been verified by the Collabify team. Verification is in progress.'
    }
};

const SIZE_MAP = {
    sm: { badge: 'px-1.5 py-0.5 text-[9px]', icon: 'w-2.5 h-2.5', tooltip: 'w-56' },
    md: { badge: 'px-2 py-1 text-[10px]', icon: 'w-3 h-3', tooltip: 'w-64' },
    lg: { badge: 'px-3 py-1.5 text-xs', icon: 'w-3.5 h-3.5', tooltip: 'w-72' }
};

const VerificationBadge = ({ verificationStatus = 'pending', followerRiskScore, followerMismatchPercentage, size = 'md' }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const badgeRef = useRef(null);
    const tooltipRef = useRef(null);

    const config = BADGE_CONFIG[verificationStatus] || BADGE_CONFIG.pending;
    const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
    const Icon = config.icon;

    // Close tooltip on outside click
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

    return (
        <div className="relative inline-flex">
            <button
                ref={badgeRef}
                onClick={() => setShowTooltip(!showTooltip)}
                className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wider border cursor-pointer transition-all hover:scale-105 ${sizeConfig.badge} ${config.bg} ${config.color} ${config.border} shadow-sm ${config.glow}`}
            >
                <Icon className={sizeConfig.icon} />
                <span>{config.label}</span>
            </button>

            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        ref={tooltipRef}
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 ${sizeConfig.tooltip} p-3 rounded-xl bg-dark-900 border border-dark-700 shadow-2xl`}
                    >
                        <div className="flex items-start gap-2">
                            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                            <div>
                                <p className="text-xs font-semibold text-dark-200 mb-1">{config.label}</p>
                                <p className="text-[11px] text-dark-400 leading-relaxed">{config.tooltip}</p>
                                {verificationStatus === 'mismatch_flagged' && followerMismatchPercentage != null && (
                                    <div className="mt-2 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                                            Mismatch: {followerMismatchPercentage.toFixed(1)}%
                                        </span>
                                        {followerRiskScore && (
                                            <span className={`ml-2 text-[10px] font-bold uppercase tracking-wider ${followerRiskScore === 'high' ? 'text-red-400' : 'text-amber-400'}`}>
                                                ({followerRiskScore} risk)
                                            </span>
                                        )}
                                    </div>
                                )}
                                {verificationStatus === 'verified' && followerRiskScore === 'medium' && followerMismatchPercentage != null && (
                                    <div className="mt-2 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                                            Minor variance: {followerMismatchPercentage.toFixed(1)}% (within tolerance)
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-dark-900 border-l border-t border-dark-700 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VerificationBadge;
