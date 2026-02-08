import React from 'react';
import { motion } from 'framer-motion';

/**
 * Skeleton - Reusable loading placeholder component
 * Shows animated placeholder while content loads using Framer Motion
 */

// Shimmer Animation Variant
const shimmer = {
    hidden: { x: "-100%" },
    visible: {
        x: "100%",
        transition: {
            repeat: Infinity,
            duration: 1.5,
            ease: "linear"
        }
    }
};

// Internal Shimmer Overlay
const ShimmerOverlay = () => (
    <motion.div
        className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
        variants={shimmer}
        initial="hidden"
        animate="visible"
        style={{ pointerEvents: 'none' }}
    />
);

// Base Skeleton
export const Skeleton = ({ className = '', width, height, variant = 'text' }) => {
    // Determine base styles based on variant
    let baseStyles = "bg-dark-800/50 relative overflow-hidden";
    if (variant === 'circular') baseStyles += " rounded-full";
    else if (variant === 'rectangular') baseStyles += " rounded-none";
    else baseStyles += " rounded-md"; // text and default

    // Helper for dimension classes vs styles
    const style = {};
    if (width && typeof width !== 'string') style.width = width;
    if (height && typeof height !== 'string') style.height = height;

    const dimClasses = `${typeof width === 'string' ? width : ''} ${typeof height === 'string' ? height : ''}`;

    return (
        <div className={`${baseStyles} ${dimClasses} ${className}`} style={style}>
            <ShimmerOverlay />
        </div>
    );
};

// Card Skeleton
export const SkeletonCard = () => {
    return (
        <div className="glass-card p-6 space-y-4 relative overflow-hidden">
            <ShimmerOverlay />
            <div className="flex items-center gap-4 relative z-0">
                <Skeleton width="w-12" height="h-12" variant="circular" className="bg-dark-700/50" />
                <div className="flex-1 space-y-2">
                    <Skeleton width="w-3/4" height="h-4" className="bg-dark-700/50" />
                    <Skeleton width="w-1/2" height="h-3" className="bg-dark-700/50" />
                </div>
            </div>
            <Skeleton width="w-full" height="h-20" className="bg-dark-700/50" />
            <div className="flex gap-2 relative z-0">
                <Skeleton width="w-20" height="h-8" className="rounded-lg bg-dark-700/50" />
                <Skeleton width="w-20" height="h-8" className="rounded-lg bg-dark-700/50" />
            </div>
        </div>
    );
};

// Mobile Card Skeleton (New)
export const SkeletonMobileCard = () => {
    return (
        <div className="min-w-[85vw] md:w-full rounded-2xl bg-dark-800/50 relative overflow-hidden border border-dark-700/50 glass-card">
            <ShimmerOverlay />
            <div className="p-6 space-y-4 relative z-0">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 w-full">
                        <Skeleton width="w-3/4" height="h-6" className="bg-dark-700/50" />
                        <div className="flex gap-2">
                            <Skeleton width="w-16" height="h-5" className="rounded-full bg-dark-700/50" />
                            <Skeleton width="w-16" height="h-5" className="rounded-full bg-dark-700/50" />
                        </div>
                    </div>
                </div>
                <Skeleton width="w-full" height="h-16" className="bg-dark-700/50" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton width="w-24" height="h-6" className="bg-dark-700/50" />
                    <Skeleton width="w-32" height="h-10" className="rounded-lg bg-dark-700/50" />
                </div>
            </div>
        </div>
    );
};

// Profile Card Skeleton
export const SkeletonProfile = () => {
    return (
        <div className="glass-card p-6 space-y-6 relative overflow-hidden">
            <ShimmerOverlay />
            <div className="flex items-center gap-4 relative z-0">
                <Skeleton width="w-20" height="h-20" variant="circular" className="bg-dark-700/50" />
                <div className="flex-1 space-y-2">
                    <Skeleton width="w-40" height="h-6" className="bg-dark-700/50" />
                    <Skeleton width="w-32" height="h-4" className="bg-dark-700/50" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 relative z-0">
                <Skeleton width="w-full" height="h-16" className="rounded-xl bg-dark-700/50" />
                <Skeleton width="w-full" height="h-16" className="rounded-xl bg-dark-700/50" />
                <Skeleton width="w-full" height="h-16" className="rounded-xl bg-dark-700/50" />
            </div>
            <Skeleton width="w-full" height="h-24" className="bg-dark-700/50" />
        </div>
    );
};

// List Item Skeleton
export const SkeletonListItem = () => {
    return (
        <div className="glass-card p-4 flex items-center gap-4 relative overflow-hidden">
            <ShimmerOverlay />
            <Skeleton width="w-10" height="h-10" variant="circular" className="bg-dark-700/50" />
            <div className="flex-1 space-y-2 relative z-0">
                <Skeleton width="w-3/4" height="h-4" className="bg-dark-700/50" />
                <Skeleton width="w-1/2" height="h-3" className="bg-dark-700/50" />
            </div>
            <Skeleton width="w-16" height="h-8" className="rounded-lg bg-dark-700/50" />
        </div>
    );
};

// List Skeleton Wrapper
export const SkeletonList = ({ count = 3 }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonListItem key={i} />
            ))}
        </div>
    );
};

// Table Row Skeleton
export const SkeletonTable = ({ rows = 5 }) => {
    return (
        <div className="space-y-2">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 glass-card relative overflow-hidden">
                    <ShimmerOverlay />
                    <Skeleton width="w-8" height="h-8" className="rounded bg-dark-700/50" />
                    <Skeleton width="w-1/4" height="h-8" className="bg-dark-700/50" />
                    <Skeleton width="w-1/3" height="h-8" className="bg-dark-700/50" />
                    <Skeleton width="w-1/5" height="h-8" className="bg-dark-700/50" />
                    <Skeleton width="w-16" height="h-8" className="rounded-lg bg-dark-700/50" />
                </div>
            ))}
        </div>
    );
};

// Dashboard Stats Skeleton
export const SkeletonStats = () => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card p-6 space-y-2 relative overflow-hidden">
                    <ShimmerOverlay />
                    <Skeleton width="w-12" height="h-12" className="rounded-xl bg-dark-700/50" />
                    <Skeleton width="w-full" height="h-8" className="bg-dark-700/50" />
                    <Skeleton width="w-3/4" height="h-4" className="bg-dark-700/50" />
                </div>
            ))}
        </div>
    );
};

// Message Skeleton
export const SkeletonMessage = () => {
    return (
        <div className="space-y-4 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                    <Skeleton width="w-8" height="h-8" variant="circular" className="bg-dark-700/50 flex-shrink-0" />
                    <div className={`space-y-2 flex-1 max-w-[70%] ${i % 2 === 0 ? '' : 'items-end flex flex-col'}`}>
                        <Skeleton width="w-full" height="h-16" className={`rounded-2xl bg-dark-700/50 ${i % 2 === 0 ? 'rounded-bl-md' : 'rounded-br-md'}`} />
                        <Skeleton width="w-20" height="h-3" className="bg-dark-700/50" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Skeleton;
