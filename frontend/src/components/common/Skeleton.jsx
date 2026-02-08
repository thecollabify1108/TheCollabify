import React from 'react';

/**
 * Skeleton - Reusable loading placeholder component
 * Shows animated placeholder while content loads
 */

// Base Skeleton
export const Skeleton = ({ className = '', width = 'w-full', height = 'h-4' }) => {
    return (
        <div className={`skeleton ${width} ${height} ${className}`}></div>
    );
};

// Card Skeleton
export const SkeletonCard = () => {
    return (
        <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton width="w-12" height="h-12" className="rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton width="w-3/4" height="h-4" />
                    <Skeleton width="w-1/2" height="h-3" />
                </div>
            </div>
            <Skeleton width="w-full" height="h-20" />
            <div className="flex gap-2">
                <Skeleton width="w-20" height="h-8" className="rounded-lg" />
                <Skeleton width="w-20" height="h-8" className="rounded-lg" />
            </div>
        </div>
    );
};

// Profile Card Skeleton
export const SkeletonProfile = () => {
    return (
        <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton width="w-20" height="h-20" className="rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton width="w-40" height="h-6" />
                    <Skeleton width="w-32" height="h-4" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <Skeleton width="w-full" height="h-16" className="rounded-xl" />
                <Skeleton width="w-full" height="h-16" className="rounded-xl" />
                <Skeleton width="w-full" height="h-16" className="rounded-xl" />
            </div>
            <Skeleton width="w-full" height="h-24" />
        </div>
    );
};

// List Item Skeleton
export const SkeletonListItem = () => {
    return (
        <div className="glass-card p-4 flex items-center gap-4">
            <Skeleton width="w-10" height="h-10" className="rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton width="w-3/4" height="h-4" />
                <Skeleton width="w-1/2" height="h-3" />
            </div>
            <Skeleton width="w-16" height="h-8" className="rounded-lg" />
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
                <div key={i} className="flex gap-4 p-4 glass-card">
                    <Skeleton width="w-8" height="h-8" className="rounded" />
                    <Skeleton width="w-1/4" height="h-8" />
                    <Skeleton width="w-1/3" height="h-8" />
                    <Skeleton width="w-1/5" height="h-8" />
                    <Skeleton width="w-16" height="h-8" className="rounded-lg" />
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
                <div key={i} className="glass-card p-6 space-y-2">
                    <Skeleton width="w-12" height="h-12" className="rounded-xl" />
                    <Skeleton width="w-full" height="h-8" />
                    <Skeleton width="w-3/4" height="h-4" />
                </div>
            ))}
        </div>
    );
};

// Message Skeleton
export const SkeletonMessage = () => {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                    <Skeleton width="w-8" height="h-8" className="rounded-full flex-shrink-0" />
                    <div className="space-y-2 flex-1 max-w-xs">
                        <Skeleton width="w-full" height="h-16" className="rounded-xl" />
                        <Skeleton width="w-20" height="h-3" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Skeleton;
