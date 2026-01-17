import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiRefresh } from 'react-icons/hi';

/**
 * PullToRefresh - Pull-to-refresh functionality for mobile
 * @param {Function} onRefresh - Callback when refresh is triggered
 * @param {ReactNode} children - Content to wrap
 */
const PullToRefresh = ({ onRefresh, children }) => {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const containerRef = useRef(null);

    const PULL_THRESHOLD = 80; // Pixels to pull before refresh
    const MAX_PULL = 120;

    const handleTouchStart = (e) => {
        // Only trigger if at top of container
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            setTouchStart(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e) => {
        if (!touchStart || isRefreshing) return;

        const currentTouch = e.touches[0].clientY;
        const distance = currentTouch - touchStart;

        // Only allow pull down
        if (distance > 0 && containerRef.current?.scrollTop === 0) {
            // Add resistance - gets harder to pull
            const resistance = Math.min(distance * 0.5, MAX_PULL);
            setPullDistance(resistance);

            // Prevent default scroll on iOS
            if (distance > 10) {
                e.preventDefault();
            }
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
            setIsRefreshing(true);
            setPullDistance(PULL_THRESHOLD);

            // Haptic feedback
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }

            try {
                await onRefresh();
            } catch (error) {
                console.error('Refresh failed:', error);
            } finally {
                setTimeout(() => {
                    setIsRefreshing(false);
                    setPullDistance(0);
                }, 500);
            }
        } else {
            setPullDistance(0);
        }
        setTouchStart(0);
    };

    const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
    const spinnerRotation = pullProgress * 360;

    return (
        <div
            ref={containerRef}
            className="relative overflow-auto h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull indicator */}
            <motion.div
                className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none"
                style={{
                    height: pullDistance,
                    opacity: pullProgress
                }}
            >
                <div className="bg-primary-500/10 backdrop-blur-md rounded-full p-3 border border-primary-500/20">
                    <HiRefresh
                        className="w-6 h-6 text-primary-400"
                        style={{
                            transform: `rotate(${isRefreshing ? 0 : spinnerRotation}deg)`,
                            transition: isRefreshing ? 'none' : 'transform 0.1s'
                        }}
                    />
                </div>
            </motion.div>

            {/* Content */}
            <div style={{ paddingTop: pullDistance }}>
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;
